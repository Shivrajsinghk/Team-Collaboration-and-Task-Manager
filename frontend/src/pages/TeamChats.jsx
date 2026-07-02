import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, isToday, isYesterday } from 'date-fns'
import { useSelector } from 'react-redux'
import { teamChats, teamMembersPresence, uploadTeamChatAttachment } from '../api/teams'
import Loading from '../components/Loading'
import { MessageCircle, Radio } from 'lucide-react'
import MessageSendingBox from '../components/MessageSendingBox'
import MessageList from '../components/MessageList'
import { useMutation, useQuery } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'
import { isPresenceOnline } from '../utils/presence'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']

function TeamChats() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const { team_id } = useParams()
    const [liveChats, setLiveChats] = useState([])
    const [message, setMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const socketRef = useRef(null)
    const bottomRef = useRef(null)
    const fileInputRef = useRef(null)
    const currentUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate()
    const { data: initialChats = [], isLoading: loading } = useQuery({
        queryKey: teamKeys.chats(team_id),
        queryFn: async () => {
            const response = await teamChats(team_id)
            return response.data
        },
        enabled: !!team_id,
        staleTime: 15 * 1000,
        refetchOnWindowFocus: true,
    })
    const { data: members = [] } = useQuery({
        queryKey: teamKeys.membersPresence(team_id),
        queryFn: async () => {
            const response = await teamMembersPresence(team_id)
            return response.data
        },
        enabled: !!team_id,
        refetchInterval: 30000,
    })

    const onlineCount = members.filter((member) =>
        isPresenceOnline(member.is_online, member.last_seen)
    ).length
    const chats = liveChats.length > 0 ? liveChats : (initialChats ?? [])

    const uploadAttachmentMutation = useMutation({
        mutationFn: (formData) => uploadTeamChatAttachment(team_id, formData),
    })

    useEffect(() => {
        const token = localStorage.getItem('access')
        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/team-chats/${team_id}/?token=${token}`
        )
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setLiveChats((prev) => [...prev, data])
        }
        socketRef.current.onerror = (error) => {
            console.log(error)
        }
        return () => socketRef.current?.close()
    }, [team_id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chats])

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        if (Number.isNaN(date.getTime())) return ''
        if (isToday(date)) {
            return format(date, 'h:mm a')
        }
        if (isYesterday(date)) {
            return `Yesterday, ${format(date, 'h:mm a')}`
        }
        return format(date, 'dd MMM yyyy, h:mm a')
    }

    const getSenderName = (chat) => {
        return chat?.sender?.full_name || chat?.sender?.username || 'Team member'
    }

    const getAttachmentUrl = (chat) => {
        if (!chat?.attachment_url && !chat?.attachments) {
            return null
        }
        if (chat.attachment_url?.startsWith('http')) {
            return chat.attachment_url
        }
        const path = chat.attachment_url || chat.attachments
        return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
    }

    const getAttachmentName = (chat) => {
        return chat?.attachment_name || chat?.attachments?.split('/').pop() || 'Attachment'
    }

    const isAttachmentImage = (chat) => {
        if (chat?.attachment_is_image !== undefined) {
            return chat.attachment_is_image
        }
        const fileName = getAttachmentName(chat)?.toLowerCase() || ''
        return IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension))
    }

    const resetSelectedFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const sendMessage = () => {
        if (!message.trim() || socketRef.current?.readyState !== WebSocket.OPEN) return
        socketRef.current.send(JSON.stringify({ message }))
        setMessage('')
    }

    const sendAttachment = async () => {
        if (!selectedFile) return
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('message', message.trim())
        try {
            await uploadAttachmentMutation.mutateAsync(formData)
            setMessage('')
            resetSelectedFile()
        }
        catch (error) {
            console.log(error?.response?.data || error)
        }
    }

    const handleSend = () => {
        if (selectedFile) {
            sendAttachment()
            return
        }
        sendMessage()
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
            <div className="mx-auto ml-4 flex max-w-7xl flex-col px-2 py-4 sm:px-6 lg:px-8">
                {/* Chat Section */}
                <section className="mt-4 flex h-screen min-h-screen flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
                    {/* Header */}
                    <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-4 border-b border-white/10 bg-[#121a18]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold capitalize text-white">
                                {chats[0]?.team_name ? `${chats[0].team_name}'s GC` : "Team's GC"}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--color-cool-steel)]">
                                {chats.length} {chats.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-cool-steel)]">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span>{onlineCount} Online</span>
                        </div>
                    </div>

                    {/* Message Area */}
                    <MessageList
                        variant="team"
                        chats={chats}
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
    )
}

export default TeamChats
