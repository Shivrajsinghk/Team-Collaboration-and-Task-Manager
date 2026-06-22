import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import MessageList from './MessageList'
import { list_personal_messages, uploadPersonalChatAttachment } from '../api/chat'
import { format, isToday, isYesterday } from 'date-fns'
import Loading from './Loading'
import MessageSendingBox from './MessageSendingBox'
import DMHeader from './DMHeader'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']

function DM({
    selectedConversationId,
    setSelectedConversationId
}) {
    const bottomRef = useRef(null)
    const socketRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)    
    const [loading, setLoading] = useState(true)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chats])

    useEffect(() => {
        const token = localStorage.getItem('access')
        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/personal-chats/${selectedConversationId}/?token=${token}`
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
                setChats(prev => {
                    return prev.map(m =>
                        data.message_ids.includes(m.id)
                            ? { ...m, is_read: true }
                            : m
                    )
                })
                return
            }
            if (data.id) {
                setChats(prev => {
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
    }, [selectedConversationId, currentUser?.id])

    useEffect(() => {
        if (!selectedConversationId) {
            setLoading(false)
            return
        } 
        let timer 
        const fetchChats = async () => {
            try {
                const response = await list_personal_messages(selectedConversationId)
                setChats(response.data)
                timer = setTimeout(() => {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({ type: 'seen' }))
                    }
                }, 300)
            }
            catch (error) {
                console.log(error?.response?.data || error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchChats()
        return () => clearTimeout(timer)
    }, [selectedConversationId])

    if(loading){
        return <Loading />
    }

    const getAttachmentUrl = (chat) => {
        if (!chat?.attachment_url && !chat?.attachments) {
            return null
        }
        if (chat.attachment_url?.startsWith('http')) {
            return chat.attachment_url
        }
        const path = chat.attachment_url || chat.attachments
        return `http://127.0.0.1:8000${path.startsWith('/') ? path : `/${path}`}`
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
            setUploadingFile(true)
            await uploadPersonalChatAttachment(selectedConversationId, formData)
            setMessage('')
            resetSelectedFile()
        }
        catch (error) {
            console.log(error?.response?.data || error)
        }
        finally {
            setUploadingFile(false)
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
        <section className="flex relative h-full w-full flex-1 min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <DMHeader 
                selectedConversationId={selectedConversationId}
                setSelectedConversationId={setSelectedConversationId}
                isTyping={isTyping}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <MessageList
                    variant="dm"
                    chats={chats}
                    setChats={setChats}
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
                uploadingFile={uploadingFile}
                onTyping={handleTyping}
            />
        </section>
    )
}

export default DM