import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useChat } from '../context/useChat'
import NoProfilePhoto from './NoProfilePhoto'

const ChatDropdown = ({ open, setOpen }) => {
    const dropdownRef = useRef(null)
    const { conversations } = useChat()
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
    }, [open, setOpen])

    const recentConversations = conversations.slice(0, 10)

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
        <div
            ref={dropdownRef}
            className="absolute right-0 top-14 z-50 flex h-[80vh] max-h-[800px] w-96 flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
        >
            <div className="border-b border-white/10 bg-black p-5">
                <h3 className="text-lg font-semibold text-[var(--color-mint-cream)]">
                    Messages
                </h3>

                <p className="mt-1 text-sm text-[var(--color-cool-steel)]">
                    Recent conversations
                </p>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#090909ea] p-3">
                <div className="space-y-2">
                    {recentConversations.length > 0 ? (
                        recentConversations.map((convo) => {
                            const otherParticipant = convo.participant.find(
                                (participant) => participant.id !== currentUser.id
                            )

                            const hasUnread =
                                convo.last_message &&
                                !convo.last_message.is_read &&
                                convo.last_message.sender !== currentUser.username

                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => {
                                        navigate(`/messages/${convo.id}`)
                                        setOpen(false)
                                    }}
                                    className="flex w-full items-center gap-4 rounded-2xl border border-gray-800 bg-black p-4 text-left transition-all duration-200 hover:scale-[1.01] hover:border-[#25D604] hover:bg-white/[0.035]"
                                >
                                    {otherParticipant?.profile_picture ? (
                                        <img
                                            src={otherParticipant?.profile_picture}
                                            alt={otherParticipant?.full_name}
                                            className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                                        />
                                    ) : (
                                        <NoProfilePhoto size={48} />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-medium capitalize text-[var(--color-mint-cream)]">
                                            {otherParticipant?.full_name}
                                        </h4>
                                        <p
                                            className={`truncate text-sm ${
                                                hasUnread ? 'font-medium text-ink' : 'text-muted'
                                            }`}
                                        >
                                            {getPreviewText(convo)}
                                        </p>
                                    </div>
                                    {hasUnread && (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#25D604]" />
                                    )}
                                </button>
                            )
                        })
                    ) : (
                        <div className="py-6 text-center text-zinc-500">
                            No recent chats
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-white/10 bg-black p-4">
                <button
                    className="w-full rounded-2xl border border-white/10 bg-accent py-3 text-sm font-medium text-black transition-all duration-200 hover:border-[#25D604] hover:bg-[#25D604]/70"
                    onClick={() => {
                        navigate('/messages')
                        setOpen(false)
                    }}
                >
                    View All Chats
                </button>
            </div>
        </div>
    )
}

export default ChatDropdown
