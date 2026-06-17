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
    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)    
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)

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
            setChats((prev) => [...prev, data])
        }
        socketRef.current.onerror = (error) => {
            console.log(error)
        }
        return () => socketRef.current?.close()
    }, [selectedConversationId])

    useEffect(() => {
        if (!selectedConversationId) {
            setLoading(false)
            return
        } 
        const fetchChats = async () => {
            try {
                const response = await list_personal_messages(selectedConversationId)
                setChats(response.data)
            }
            catch (error) {
                console.log(error?.response?.data || error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchChats()
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

    return (
        <section className="flex relative h-full w-full flex-1 min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <DMHeader 
                selectedConversationId={selectedConversationId}
                setSelectedConversationId={setSelectedConversationId}
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
            />
        </section>
    )
}

export default DM