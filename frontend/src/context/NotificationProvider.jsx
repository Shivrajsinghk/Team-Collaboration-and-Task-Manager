import { useEffect, useMemo, useRef, useState } from "react";
import { list_notifications } from "../api/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../api/queryKeys";
import { useSelector } from "react-redux";
import { NotificationContext } from "./NotificationContext";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;

export function NotificationProvider({ children }) {
	const WS_URL = import.meta.env.VITE_DJANGO_WS_URL;
	const socketRef = useRef(null);
	const [isConnected, setIsConnected] = useState(false);
	const queryClient = useQueryClient();
	const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

	const { data: notifications = [], isLoading: loading } = useQuery({
		queryKey: notificationKeys.list,
		queryFn: async () => {
			const response = await list_notifications();
			return response.data;
		},
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		let intentionallyClosed = false;
		let reconnectTimer;

		if (!isAuthenticated) {
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}
			return;
		}
		const token = localStorage.getItem("access");
		let reconnectAttempts = 0;

		const connect = () => {
			const socket = new WebSocket(
				`${WS_URL}notifications/?token=${encodeURIComponent(token)}`,
			);
			socketRef.current = socket;

			socket.onopen = () => {
				reconnectAttempts = 0;
				setIsConnected(true);
			};
			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				queryClient.setQueryData(notificationKeys.list, (prev = []) =>
					prev.some((n) => n.id === data.id) ? prev : [data, ...prev],
				);
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
		const heartbeatInterval = setInterval(() => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify({ type: "heartbeat" }));
		}
		}, 30 * 1000);
		return () => {
			intentionallyClosed = true;
			clearTimeout(reconnectTimer);
			clearInterval(heartbeatInterval);
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
			setIsConnected(false);
		};
	}, [queryClient, isAuthenticated, WS_URL]);

	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.is_read).length,
		[notifications],
	);

	const setNotifications = (updater) => {
		queryClient.setQueryData(notificationKeys.list, (prev = []) =>
			typeof updater === "function" ? updater(prev) : updater,
		);
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				setNotifications,
				unreadCount,
				loading,
				isConnected,
			}}
		>
		{children}
		</NotificationContext.Provider>
	);
}
