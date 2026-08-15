import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import MessageList from './MessageList'
import { list_personal_messages, uploadPersonalChatAttachment } from '../api/chat'
import { format, isToday, isYesterday } from 'date-fns'
import Loading from './Loading'
import MessageSendingBox from './MessageSendingBox'
import DMHeader from './DMHeader'
import { useMutation, useQuery } from '@tanstack/react-query'
import { chatKeys } from '../api/queryKeys'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']

function DM({
    selectedConversationId,
    setSelectedConversationId
}) {
    const WS_URL = import.meta.env.VITE_DJANGO_WS_URL
    const bottomRef = useRef(null)
    const socketRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const isAuthResolved = useSelector((state) => state.auth.isAuthResolved)
    const accessToken = useSelector((state) => state.auth.access)
    const [liveChats, setLiveChats] = useState([])
    const [message, setMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    
    const { data: initialChats = [], isLoading: loading } = useQuery({
        queryKey: chatKeys.personalMessages(selectedConversationId),
        queryFn: async () => {
            const response = await list_personal_messages(selectedConversationId)
            return response.data
        },
        enabled: isAuthResolved && isAuthenticated && !!accessToken && !!selectedConversationId,
        staleTime: 15 * 1000,
        refetchOnWindowFocus: true,
    })
    const chats = liveChats.length > 0 ? liveChats : initialChats
    const uploadAttachmentMutation = useMutation({
        mutationFn: (formData) => uploadPersonalChatAttachment(selectedConversationId, formData),
    })

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chats])

    useEffect(() => {
        setLiveChats(initialChats)
    }, [initialChats, selectedConversationId])

    useEffect(() => {
        if (!isAuthResolved || !isAuthenticated || !accessToken || !selectedConversationId) {
            return
        }
        socketRef.current = new WebSocket(
            `${WS_URL}personal-chats/${selectedConversationId}/?token=${encodeURIComponent(accessToken)}`
        )
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)  
            if (data.type === 'typing') {
                if (String(data.user_id) !== String(currentUser.id)) {
                    setIsTyping(data.is_typing)
                }
                return
            }         
            if (data.type === 'seen') {
                setLiveChats(prev => {
                    return prev.map(m =>
                        data.message_ids.includes(m.id)
                            ? { ...m, is_read: true }
                            : m
                    )
                })
                return
            }
            if (data.id) {
                setLiveChats(prev => {
                    const updated = [...prev, data]
                    if (
                        String(data.sender?.id) !== String(currentUser?.id) &&
                        socketRef.current?.readyState === WebSocket.OPEN
                    ) {
                        socketRef.current.send(
                            JSON.stringify({ type: 'seen' })
                        )
                    }
                    return updated
                })
                return
            }
        }
        socketRef.current.onerror = (error) => {
            console.log(error)
        }
        return () => {
            clearTimeout(typingTimeoutRef.current)
            socketRef.current?.close()
        }
    }, [selectedConversationId, currentUser?.id, isAuthResolved, isAuthenticated, accessToken, WS_URL])

    useEffect(() => {
        if (!selectedConversationId || !initialChats.length) return
        const timer = setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'seen' }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [initialChats, selectedConversationId])

    if(loading){
        return <Loading />
    }

    const getAttachmentUrl = (chat) => {
        if (!chat?.attachment_url && !chat?.attachments) {
            return null
        }
        return chat.attachment_url || chat.attachments
    }

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

    const isAttachmentImage = (chat) => {
        if (chat?.attachment_is_image !== undefined) {
            return chat.attachment_is_image
        }
        const fileName = getAttachmentName(chat)?.toLowerCase() || ''
        return IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension))
    }

    const getAttachmentName = (chat) => {
        return chat?.attachment_name || chat?.attachments?.split('/').pop() || 'Attachment'
    }

    const handleSend = () => {
        if (selectedFile) {
            sendAttachment()
            return
        }
        sendMessage()
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

    const resetSelectedFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
    }
    
    const handleTyping = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }))
        }
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }))
            }
        }, 2000)
    }

    return (
        <section className="flex relative h-full w-full flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <DMHeader 
                selectedConversationId={selectedConversationId}
                setSelectedConversationId={setSelectedConversationId}
                isTyping={isTyping}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <MessageList
                    variant="dm"
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
                    />
            </div>
            <MessageSendingBox
                variant="dm"
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
                onTyping={handleTyping}
            />
        </section>
    )
}

export default DM
