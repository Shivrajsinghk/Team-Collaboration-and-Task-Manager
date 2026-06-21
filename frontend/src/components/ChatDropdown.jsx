import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listConversations } from '../api/chat'
import { useSelector } from 'react-redux'
import { useChat } from '../context/ChatContext'

const ChatDropdown = ({open, setOpen}) => {
    const dropdownRef = useRef(null)
    const { conversations } = useChat()
    const [loading, setLoading] = useState(true)
    const currentUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open])

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-14 z-50 flex h-[80vh] max-h-[800px] w-96 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#081312] shadow-2xl backdrop-blur-xl"
        >
            <div className="border-b border-white/10 p-5">
                <h3 className="text-lg font-semibold text-[var(--color-mint-cream)]">
                    Messages
                </h3>
                <p className="mt-1 text-sm text-[var(--color-cool-steel)]">
                    Recent conversations
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-500/30">
                <div className="space-y-2">
                    {conversations.map((convo) => {
                        const otherParticipant = convo.participant.find(
                            (participant) => participant.id !== currentUser.id
                        )
                        return (
                            <button
                                key={convo.id}
                                onClick={() => {
                                    navigate(`/messages/${convo.id}`)
                                    setOpen(false)
                                }}
                                className={`
                                    flex w-full items-center gap-4
                                    rounded-2xl border p-4 text-left
                                    transition-all duration-200
                                    hover:scale-[1.01]
                                    hover:border-cyan-500/20
                                    hover:bg-white/[0.035]
                                    ${!convo.last_message.is_read && convo.last_message.sender !== currentUser.username
                                        ? 'border-cyan-500/20 bg-cyan-500/[0.06]'
                                        : 'border-white/5 bg-white/[0.02]'
                                    }
                                `}
                            >
                                <img
                                    src={otherParticipant.profile_picture}
                                    alt={otherParticipant.full_name}
                                    className="h-12 w-12 rounded-2xl object-cover border border-white/10"
                                />
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate font-medium text-[var(--color-mint-cream)]">
                                        {otherParticipant.full_name}
                                    </h4>
                                    <p className={`truncate text-sm ${
                                        !convo.last_message.is_read && convo.last_message.sender !== currentUser.username
                                            ? 'text-white font-medium'
                                            : 'text-[var(--color-cool-steel)]'
                                    }`}>
                                        {convo.last_message.message}
                                    </p>
                                </div>
                                {!convo.last_message.is_read && convo.last_message.sender !== currentUser.username && (
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="border-t border-white/10 p-4">
                <button
                    className="
                        w-full rounded-2xl
                        border border-white/10
                        bg-white/[0.03]
                        py-3
                        text-sm font-medium
                        text-[var(--color-mint-cream)]
                        transition-all duration-200
                        hover:border-cyan-400/30
                        hover:bg-cyan-500/10
                        hover:text-cyan-300
                    "
                    onClick={
                        () => {
                            navigate('/messages')
                            setOpen(false)
                        }
                    }
                >
                    View All Chats
                </button>
            </div>
        </div>
    )
}

export default ChatDropdown