import React from 'react'
import { MessageCircle, Plus, Search } from 'lucide-react'
import { useEffect } from 'react'
import { listConversations } from '../api/chat'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import DM from '../components/DM'
import { useChat } from '../context/ChatContext'

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
    console.log("saf", filteredConversations)
    
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

    return (
        <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
                    {/* LHS */}
                    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row md:items-center pt-3 px-4 md:justify-between">
                            <div>
                                <h1 className="text-xl py-1 font-bold tracking-tight text-[var(--color-mint-cream)]">
                                    Direct Messages
                                </h1>
                            </div>
                        </div>
    
                        {/* Search Bar */}
                        <div className="border-b border-white/10 p-4">
                            <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 transition duration-300 focus-within:border-cyan-400/40 focus-within:bg-white/[0.05]">
                                <Search
                                    size={18}
                                    className="text-gray-500 transition duration-300 group-focus-within:text-cyan-300"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search chats..."
                                    className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* DM's */}
                        <div className="p-3">
                            <div className="space-y-2">
                                {filteredConversations.map((convo) => {
                                    const otherParticipant = convo.participant.find(
                                        (participant) => participant.id !== currentUser.id
                                    )
                                    return (
                                        <button
                                            key={convo.id}
                                            onClick={() => setSelectedConversationId(convo.id)}
                                            className='
                                                flex w-full items-center gap-4
                                                rounded-2xl
                                                border-[1.2px] border-cyan-500/20
                                                bg-white/[0.01]
                                                p-3
                                                text-left
                                                transition-all duration-200
                                                hover:scale-[1.01]
                                                hover:border-cyan-500/40
                                                hover:bg-white/[0.035]
                                            '
                                        >
                                            <img
                                                src={otherParticipant?.profile_picture}
                                                alt={otherParticipant?.full_name}
                                                onClick={() =>
                                                    navigate(
                                                        `/profile/${otherParticipant.username}`
                                                    )
                                                }
                                                className="
                                                    h-12 w-12
                                                    rounded-2xl
                                                    object-cover
                                                    border border-white/10
                                                "
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate capitalize font-medium text-[var(--color-mint-cream)]">
                                                    {otherParticipant?.full_name}
                                                </h4>
                                                <p className="truncate text-sm text-[var(--color-cool-steel)]">
                                                    {convo.last_message?.message || ""}
                                                </p>
                                            </div>
                                            <div className="px-2 text-right">
                                                {otherParticipant?.is_online ? (
                                                    <p className="text-[0.7rem] text-emerald-400">Online</p>
                                                ) : (
                                                    <p className="text-[0.7rem] text-zinc-500">
                                                        {otherParticipant?.last_seen
                                                            ? `${formatLastSeen(otherParticipant.last_seen)}`
                                                            : 'Offline'}
                                                    </p>
                                                )}
                                            </div>
                                            {!convo.last_message.is_read && convo.last_message.sender !== currentUser.username && (
                                                <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RHS */}
                    <div className="flex h-[650px] flex-1 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                        {!selectedConversationId ? (
                            <div className='w-full h-full flex justify-center items-center'>
                                <div className="text-center">
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10">
                                        <MessageCircle className="h-12 w-12 text-cyan-300" />
                                    </div>
                                    <h2 className="mt-6 text-2xl font-bold text-[var(--color-mint-cream)]">
                                        Select a conversation
                                    </h2>
                                    <p className="mt-3 max-w-md text-[var(--color-cool-steel)]">
                                        Choose a conversation to continue chatting with your teammates.
                                    </p>
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