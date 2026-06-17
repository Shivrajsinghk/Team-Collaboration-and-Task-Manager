import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, isToday, isYesterday } from 'date-fns'
import { useSelector } from 'react-redux'
import { teamChats, uploadTeamChatAttachment } from '../api/teams'
import Loading from '../components/Loading'
import UserProfilePfp from '../components/UserProfilePfp'
import EmojiPickerComp from '../components/EmojiPickerComp'
import { Download, FileImage, FileText, Loader2, MessageCircle, Mic, Paperclip, Radio, SendHorizontal, Smile, X } from 'lucide-react'
import MessageSendingBox from '../components/MessageSendingBox'
import MessageList from '../components/MessageList'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']

function TeamChats() {
    const { team_id } = useParams()
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [loading, setLoading] = useState(true)
    const [uploadingFile, setUploadingFile] = useState(false)
    const socketRef = useRef(null)
    const bottomRef = useRef(null)
    const fileInputRef = useRef(null)
    const currentUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('access')
        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/team-chats/${team_id}/?token=${token}`
        )
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setChats((prev) => [...prev, data])
        }
        socketRef.current.onerror = (error) => {
            console.log(error)
        }
        return () => socketRef.current?.close()
    }, [team_id])

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await teamChats(team_id)
                setChats(response.data)
                console.log(response.data)
            }
            catch (error) {
                console.log(error?.response?.data || error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchChats()
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
        return `http://127.0.0.1:8000${path.startsWith('/') ? path : `/${path}`}`
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
            setUploadingFile(true)
            await uploadTeamChatAttachment(team_id, formData)
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
                {/* Team Header */}
                <section className="sticky top-4 z-30 shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 p-5 backdrop-blur-xl">
                    <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10">
                                <MessageCircle className="h-7 w-7 text-cyan-300" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                                    Team Chat
                                </p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-mint-cream)]">
                                    {chats[0]?.team_name || 'General Chat'}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-cool-steel)]">
                                    {chats[0]?.team_description || 'Share updates, files, and quick conversations with your team.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                                <Radio size={15} />
                                Live room
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[var(--color-cool-steel)]">
                                Managed by <span className="font-semibold text-white">{chats[0]?.team_creator || 'Team admin'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Chat Section */}
                <section className="mt-4 flex h-screen min-h-screen flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
                    {/* Header */}
                    <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-4 border-b border-white/10 bg-[#121a18]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Team Conversation
                            </h2>
                            <p className="mt-1 text-sm text-[var(--color-cool-steel)]">
                                {chats.length} {chats.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-cool-steel)]">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span>5 Online</span>
                        </div>
                    </div>

                    {/* Message Area */}
                    <MessageList
                        variant="team"
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
                        uploadingFile={uploadingFile}
                    />
                </section>
            </div>
        </div>
    )
}

export default TeamChats
