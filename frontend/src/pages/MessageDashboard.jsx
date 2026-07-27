import React from 'react'
import { MessageCircle, Search } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import DM from '../components/DM'
import { useChat } from '../context/ChatContext'
import { isPresenceOnline } from '../utils/presence'
import NoProfilePhoto from '../components/NoProfilePhoto'

function MessageDashboard() {
    const { conversation_id } = useParams()
    const { conversations } = useChat()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedConversationId, setSelectedConversationId] = useState(null)
    const currentUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate()

    useEffect(() => {
        if (conversation_id) {
            setSelectedConversationId(Number(conversation_id))
        }
    }, [conversation_id])

    const filteredConversations = conversations.filter((convo) => {
        const otherParticipant = convo.participant.find(
            (participant) => participant.id !== currentUser.id
        )
        return (
            otherParticipant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const formatLastSeen = (iso) => {
        if (!iso) return null
        const date = new Date(iso)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000)
        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getPreviewText = (convo) => {
        const lastMessage = convo.last_message
        if (!lastMessage) return 'No messages yet'
        if (lastMessage.message?.trim()) {
            return lastMessage.message
        }
        if (lastMessage.attachment_url) {
            return lastMessage.attachment_is_image
                ? '🖼️ Photo'
                : `📎 ${lastMessage.attachment_name || 'Attachment'}`
        }
        return 'No messages yet'
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-base text-ink">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
                    {/* LHS */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                        <div className="flex flex-col md:flex-row md:items-center pt-3 px-4 md:justify-between">
                            <div>
                                <h1 className="text-xl py-1 font-bold tracking-tight text-ink">
                                    Direct Messages
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="border-b border-border p-4">
                            <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-2 transition-colors duration-150 focus-within:border-accent">
                                <Search
                                    size={18}
                                    className="text-muted transition-colors duration-150 group-focus-within:text-accent"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search chats..."
                                    className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* DM's */}
                        <div className="p-3">
                            <div className="space-y-2">
                                {filteredConversations.length > 0 ? (
                                    filteredConversations.map((convo) => {
                                        const otherParticipant = convo.participant.find(
                                            (participant) => participant.id !== currentUser.id
                                        )
                                        const isOtherParticipantOnline = isPresenceOnline(
                                            otherParticipant?.is_online,
                                            otherParticipant?.last_seen
                                        )
                                        return (
                                            <button
                                                key={convo.id}
                                                onClick={() => setSelectedConversationId(convo.id)}
                                                className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-alt p-3 hover:border-accent text-left transition-colors duration-150"
                                            >
                                                {otherParticipant?.profile_picture ? (
                                                    <img
                                                        src={otherParticipant.profile_picture}
                                                        alt={otherParticipant.full_name}
                                                        onClick={() => navigate(`/profile/${otherParticipant.username}`)}
                                                        className="h-12 w-12 rounded-xl object-cover border border-border cursor-pointer"
                                                    />
                                                ) : (
                                                    <div onClick={() => navigate(`/profile/${otherParticipant.username}`)}>
                                                        <NoProfilePhoto size={48} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate capitalize font-medium text-ink">
                                                        {otherParticipant?.full_name}
                                                    </h4>
                                                    <p className="truncate text-sm text-muted">
                                                        {getPreviewText(convo)}
                                                    </p>
                                                </div>
                                                <div className="px-2 text-right">
                                                    {isOtherParticipantOnline ? (
                                                        <p className="text-[0.7rem] text-accent">Online</p>
                                                    ) : (
                                                        <p className="text-[0.7rem] text-muted">
                                                            {otherParticipant?.last_seen
                                                                ? `${formatLastSeen(otherParticipant.last_seen)}`
                                                                : 'Offline'}
                                                        </p>
                                                    )}
                                                </div>
                                                {!convo.last_message?.is_read && convo.last_message?.sender !== currentUser.username && (
                                                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                                                )}
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="py-6 text-center text-muted">
                                        No recent chats
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RHS */}
                    <div className="flex h-[650px] flex-1 rounded-2xl border border-border bg-surface">
                        {!selectedConversationId ? (
                            <div className="w-full h-full flex justify-center items-center">
                                <div className="text-center pb-24">
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-accent bg-base">
                                        <MessageCircle className="h-12 w-12 text-accent" />
                                    </div>
                                    <h2 className="mt-6 text-2xl font-bold text-ink">
                                        Select a conversation
                                    </h2>
                                </div>
                            </div>
                        ) : (
                            <DM
                                selectedConversationId={selectedConversationId}
                                setSelectedConversationId={setSelectedConversationId}
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default MessageDashboard
