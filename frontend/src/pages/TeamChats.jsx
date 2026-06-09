import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Download, FileImage, FileText, Loader2, MessageCircle, Mic, Paperclip, Radio, SendHorizontal, Smile, X } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useSelector } from 'react-redux'
import { teamChats, uploadTeamChatAttachment } from '../api/teams'
import Loading from '../components/Loading'
import UserProfilePfp from '../components/UserProfilePfp'
import EmojiPickerComp from '../components/EmojiPickerComp'

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

        const fileName = getAttachmentName(chat).toLowerCase()
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
                    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#07110f] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
                        <div className="relative bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.4),rgba(0,0,0,0.3)),url(assets/download.jpg)] bg-repeat px-6 py-6 pb-32">
                            {chats.length === 0 ? (
                                <div className="flex h-full min-h-[350px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/10 px-6 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-cyan-500/20 to-teal-500/20">
                                        <MessageCircle className="h-8 w-8 text-cyan-300" />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-semibold text-white">
                                        No Messages Yet
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Start the conversation with your team.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {chats.map((chat, index) => {
                                        const isMine = chat?.sender?.id === currentUser?.id
                                        const attachmentUrl = getAttachmentUrl(chat)
                                        const hasAttachment = Boolean(attachmentUrl)
                                        const showImageAttachment = hasAttachment && isAttachmentImage(chat)
                                        return (
                                            <article
                                                key={index}
                                                className={`group flex gap-3 ${isMine ? 'justify-end' : ''}`}
                                            >
                                                {!isMine && (
                                                    <div className="shrink-0" onClick={() => navigate(`/team/${team_id}/members/${chat.sender?.id}`)}>
                                                        <UserProfilePfp memberUser={chat.sender} />
                                                    </div>
                                                )}
                                                <div className={`min-w-0 ${isMine ? 'flex max-w-[85%] flex-col items-end' : 'flex-1'}`}>
                                                    <div className={`mb-1 flex flex-wrap items-center gap-2 ${isMine ? 'justify-end' : 'justify-between'}`}>
                                                        {!isMine && (
                                                            <span className="font-semibold text-white capitalize">
                                                                {getSenderName(chat)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="inline-block max-w-full min-w-[120px] overflow-hidden rounded-[1.4rem] border border-emerald-400/20 bg-neutral-900 px-4 py-3 text-sm leading-6 text-white shadow-lg backdrop-blur-md transition-all duration-200 group-hover:scale-[1.02]">
                                                        {showImageAttachment && (
                                                            <a
                                                                href={attachmentUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mb-3 block overflow-hidden rounded-[1rem] border border-white/10"
                                                            >
                                                                <img
                                                                    src={attachmentUrl}
                                                                    alt={getAttachmentName(chat)}
                                                                    className="max-h-[320px] w-full object-cover"
                                                                />
                                                            </a>
                                                        )}
                                                        {hasAttachment && !showImageAttachment && (
                                                            <a
                                                                href={attachmentUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mb-3 flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 px-3 py-3 transition hover:bg-white/10"
                                                            >
                                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate font-medium text-white">
                                                                        {getAttachmentName(chat)}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        Click to open attachment
                                                                    </p>
                                                                </div>
                                                                <Download size={18} className="text-slate-300" />
                                                            </a>
                                                        )}
                                                        {chat.message && (
                                                            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                                                {chat.message}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex justify-end">
                                                            <span className="whitespace-nowrap text-[11px] text-slate-400">
                                                                {formatMessageTime(chat.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                            <div ref={bottomRef}></div>
                        </div>
                    </div>
                    
                    {/* Message Sending Box */}
                    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-neutral-900 px-4 py-4 backdrop-blur-xl sm:px-6">
                        <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-white/10 bg-neutral-950 p-2 shadow-[0_-14px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5">
                            {selectedFile && (
                                <div className="mb-2 flex items-center justify-between gap-3 rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                                            {selectedFile.type.startsWith('image/') ? <FileImage size={18} /> : <FileText size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-white">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={resetSelectedFile}
                                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-2xl p-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
                                >
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                        className="rounded-2xl p-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
                                    >
                                        <Smile size={18} />
                                    </button>
                                    <EmojiPickerComp
                                        showEmojiPicker={showEmojiPicker}
                                        setShowEmojiPicker={setShowEmojiPicker}
                                        setMessage={setMessage}
                                    />
                                </div>
                                <div className="flex flex-1 items-center rounded-[1.3rem] px-4">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                        placeholder={selectedFile ? 'Add a caption or send the file directly...' : 'Type a message...'}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && (message.trim() || selectedFile) && !uploadingFile) {
                                                handleSend()
                                            }
                                        }}
                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={(!message.trim() && !selectedFile) || uploadingFile}
                                    className="flex h-10 min-w-10 items-center justify-center rounded-[1.2rem] bg-emerald-500 text-[#08110f] transition hover:scale-[1.03] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40 disabled:text-black/50 disabled:hover:scale-100"
                                >
                                    {uploadingFile ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <SendHorizontal size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default TeamChats
