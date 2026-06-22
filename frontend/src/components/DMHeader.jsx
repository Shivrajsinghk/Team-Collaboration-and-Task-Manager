import React, { useEffect, useState } from 'react'
import { MoreVertical, Phone, Video } from 'lucide-react'
import { listConversations } from '../api/chat'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'


function DMHeader({ selectedConversationId, setSelectedConversationId, isTyping }) {
    const currentUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate()
    const { conversations } = useChat()

    const convo = conversations.find(
        convo => convo.id === selectedConversationId
    )
    
    if (!convo) {
        return (
            <header className="flex items-center px-5 py-3">
                Select a conversation
            </header>
        )
    }

    const other_user = convo?.participant.find(
        user => user?.id !== currentUser?.id
    )

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
        <header className="flex items-center justify-between border-b border-white/10 bg-[#121a18]/95 px-5 py-3 backdrop-blur-xl">
            <div 
            onClick={() =>
                navigate(
                    `/profile/${other_user.username}`
                )
            }
            className="flex items-center gap-3"
            >
                <img
                    src={other_user?.profile_picture}
                    alt={other_user?.full_name}
                    className="
                        h-12 w-12
                        rounded-full
                        object-cover
                        border border-white/10
                    "
                />
                <div>
                    <h2 className="font-semibold capitalize text-white">
                        {other_user?.full_name}
                    </h2>
                    {isTyping ? (
                        <div className="px-5 py-1 text-xs text-zinc-500 italic">
                            typing...
                        </div>
                    ) : ( 
                        <p className="truncate text-sm text-[var(--color-cool-steel)]">
                            @{other_user?.username}
                        </p>
                    )}
                </div>
            </div>
            <div className="px-3 text-right">
                {other_user?.is_online ? (
                    <p className="text-sm text-emerald-400">Online</p>
                ) : (
                    <p className="text-sm text-zinc-500">
                        {other_user?.last_seen
                            ? `Last seen ${formatLastSeen(other_user.last_seen)}`
                            : 'Offline'}
                    </p>
                )}
            </div>
        </header>
    )
}

export default DMHeader