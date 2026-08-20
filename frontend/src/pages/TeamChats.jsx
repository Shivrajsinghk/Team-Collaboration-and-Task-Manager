import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { useSelector } from "react-redux";
import {
	teamChats,
	teamMembersPresence,
	uploadTeamChatAttachment,
} from "../api/teams";
import Loading from "../components/Loading";
import MessageSendingBox from "../components/MessageSendingBox";
import MessageList from "../components/MessageList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { teamKeys } from "../api/queryKeys";
import { isPresenceOnline } from "../utils/presence";

const IMAGE_EXTENSIONS = [
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".bmp",
	".svg",
];
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function TeamChats() {
	const WS_URL = import.meta.env.VITE_DJANGO_WS_URL;
	const { team_id } = useParams();
	const [liveChats, setLiveChats] = useState([]);
	const [message, setMessage] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [uploadError, setUploadError] = useState(null);
	const socketRef = useRef(null);
	const bottomRef = useRef(null);
	const fileInputRef = useRef(null);
	const currentUser = useSelector((state) => state.auth.user);
	const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
	const isAuthResolved = useSelector((state) => state.auth.isAuthResolved);
	const accessToken = useSelector((state) => state.auth.access);
	const navigate = useNavigate();

	const { data: initialChats = [], isLoading: loading } = useQuery({
		queryKey: teamKeys.chats(team_id),
		queryFn: async () => {
			const response = await teamChats(team_id);
			return response.data;
		},
		enabled: isAuthResolved && isAuthenticated && !!accessToken && !!team_id,
		staleTime: 15 * 1000,
		refetchOnWindowFocus: true,
	});

	const { data: members = [] } = useQuery({
		queryKey: teamKeys.membersPresence(team_id),
		queryFn: async () => {
			const response = await teamMembersPresence(team_id);
			return response.data;
		},
		enabled: isAuthResolved && isAuthenticated && !!accessToken && !!team_id,
		refetchInterval: 30000,
	});

	const onlineCount = members.filter((member) =>
		isPresenceOnline(member.is_online, member.last_seen),
	).length;

	const chats = useMemo(() => {
		const merged = [...initialChats, ...liveChats];
		const seen = new Set();
		return merged.filter((c) =>
			seen.has(c.id) ? false : (seen.add(c.id), true),
		);
	}, [initialChats, liveChats]);

	const uploadAttachmentMutation = useMutation({
		mutationFn: (formData) => uploadTeamChatAttachment(team_id, formData),
	});

	useEffect(() => {
		if (!isAuthResolved || !isAuthenticated || !accessToken || !team_id) {
			return;
		}

		let intentionallyClosed = false;
		let reconnectTimer;
		let reconnectAttempts = 0;

		const connect = () => {
			const socket = new WebSocket(
				`${WS_URL}team-chats/${team_id}/?token=${encodeURIComponent(accessToken)}`,
			);
			socketRef.current = socket;

			socket.onopen = () => {
				reconnectAttempts = 0;
				setIsConnected(true);
			};
			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				setLiveChats((prev) => [...prev, data]);
			};
			socket.onerror = () => {
				socket.close();
			};
			socket.onclose = () => {
				if (socketRef.current === socket) {
					socketRef.current = null;
				}
				setIsConnected(false);

				if (intentionallyClosed || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS)
				return;

				const delay = Math.min(
					RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts,
					10000,
				);
				reconnectAttempts += 1;
				reconnectTimer = setTimeout(connect, delay);
			};
		};

		connect();
		return () => {
			intentionallyClosed = true;
			clearTimeout(reconnectTimer);
			socketRef.current?.close();
			socketRef.current = null;
			setIsConnected(false);
		};
	}, [team_id, WS_URL, isAuthResolved, isAuthenticated, accessToken]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chats]);

	const formatMessageTime = (timestamp) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		if (Number.isNaN(date.getTime())) return "";
		if (isToday(date)) {
			return format(date, "h:mm a");
		}
		if (isYesterday(date)) {
			return `Yesterday, ${format(date, "h:mm a")}`;
		}
		return format(date, "dd MMM yyyy, h:mm a");
	};

	const getSenderName = (chat) => {
		return chat?.sender?.full_name || chat?.sender?.username || "Team member";
	};

	const getAttachmentUrl = (chat) => {
		if (!chat?.attachment_url && !chat?.attachments) {
			return null;
		}
		return chat.attachment_url || chat.attachments;
	};

	const getAttachmentName = (chat) => {
		return (
			chat?.attachment_name ||
			chat?.attachments?.split("/").pop() ||
			"Attachment"
		);
	};

	const isAttachmentImage = (chat) => {
		if (chat?.attachment_is_image !== undefined) {
			return chat.attachment_is_image;
		}
		const fileName = getAttachmentName(chat)?.toLowerCase() || "";
		return IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
	};

	const resetSelectedFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const sendMessage = (mentionIds = []) => {
		if (!message.trim() || socketRef.current?.readyState !== WebSocket.OPEN)
			return;
		socketRef.current.send(
			JSON.stringify({ message, mention_ids: mentionIds }),
		);
		setMessage("");
	};

	const sendAttachment = async () => {
		if (!selectedFile) return;
		setUploadError(null);
		const formData = new FormData();
		formData.append("file", selectedFile);
		formData.append("message", message.trim());
		try {
			await uploadAttachmentMutation.mutateAsync(formData);
			setMessage("");
			resetSelectedFile();
		}
		catch (error) {
			const msg =
				error?.response?.data?.message ||
				error?.response?.data?.detail ||
				"Failed to send attachment.";
			setUploadError(msg);
		}
	};

	const handleSend = (mentionIds = []) => {
		if (selectedFile) {
			sendAttachment();
			return;
		}
		sendMessage(mentionIds);
	};

	const handleFileChange = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (file.size > MAX_FILE_SIZE_BYTES) {
			setUploadError("File size cannot exceed 10 MB.");
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return;
		}
		setUploadError(null);
		setSelectedFile(file);
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="min-h-screen overflow-x-hidden overflow-y-auto bg-base text-ink">
			<div className="mx-auto ml-4 flex max-w-7xl flex-col px-2 py-4 sm:px-6 lg:px-8">
				
				{/* Chat Section */}
				<section className="mt-4 flex h-screen min-h-screen flex-col overflow-hidden rounded-2xl border border-border bg-surface">
				
					{/* Header */}
					<div className="sticky top-0 z-20 flex shrink-0 flex-col gap-4 border-b border-border bg-surface px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-2xl font-bold capitalize text-ink">
								{chats[0]?.team_name
								? `${chats[0].team_name}'s GC`
								: "Team's GC"}
							</h2>
							<p className="mt-1 text-sm text-muted">
								{chats.length} {chats.length === 1 ? "message" : "messages"}
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 text-sm text-muted">
							<span className="h-2 w-2 rounded-full bg-accent"></span>
							<span>{onlineCount} Online</span>
						</div>
					</div>
					{!isConnected && (
						<p className="border-b border-border bg-amber-500/10 px-6 py-1.5 text-center text-xs text-amber-300">
							Reconnecting…
						</p>
					)}
					{uploadError && (
						<p className="border-b border-border bg-red-500/10 px-6 py-1.5 text-center text-xs text-red-400">
							{uploadError}
						</p>
					)}

					{/* Message Area */}
					<MessageList
						variant="team"
						chats={chats}
						members={members}
						setChats={setLiveChats}
						currentUser={currentUser}
						bottomRef={bottomRef}
						getAttachmentUrl={getAttachmentUrl}
						isAttachmentImage={isAttachmentImage}
						getAttachmentName={getAttachmentName}
						getSenderName={getSenderName}
						formatMessageTime={formatMessageTime}
						navigate={navigate}
						teamId={team_id}
					/>

					{/* Message Sending Box */}
					<MessageSendingBox
						variant="team"
						message={message}
						members={members}
						currentUserId={currentUser?.id}
						setMessage={setMessage}
						handleSend={handleSend}
						selectedFile={selectedFile}
						resetSelectedFile={resetSelectedFile}
						handleFileChange={handleFileChange}
						fileInputRef={fileInputRef}
						showEmojiPicker={showEmojiPicker}
						setShowEmojiPicker={setShowEmojiPicker}
						uploadingFile={uploadAttachmentMutation.isPending}
					/>
				</section>
			</div>
		</div>
	);
}

export default TeamChats;