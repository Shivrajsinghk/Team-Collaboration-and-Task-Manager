import React from 'react'
import { MessageCircle } from 'lucide-react'
import MessageBubble from './MessageBubble'

const MessageList = ({
    variant = "team",
    chats,
    currentUser,
    bottomRef,
    getAttachmentUrl,
    isAttachmentImage,
    getAttachmentName,
    getSenderName,
    formatMessageTime,
    navigate,
    teamId
}) => {
    const isDM = variant === "dm"

    return (
        <div className="relative h-full flex-1 overflow-y-auto overflow-x-hidden bg-[#07110f] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
            <div
                className={`
                    relative px-6 py-6 
                    ${isDM
                        ? "flex min-h-full flex-col bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.3)),url(assets/download.jpg)] bg-repeat"
                        : "bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.4),rgba(0,0,0,0.3)),url(assets/download.jpg)] bg-repeat"
                    }
                `}
            >
                {chats.length === 0 ? (
                    <div className="flex flex-1 min-h-[350px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/10 px-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-cyan-500/20 to-teal-500/20">
                            <MessageCircle className="h-8 w-8 text-cyan-300" />
                        </div>

                        <h3 className="mt-6 text-2xl font-semibold text-white">
                            No Messages Yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Start the conversation.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {chats.map((chat) => (
                                <MessageBubble
                                    key={chat.id}
                                    variant={variant}
                                    chat={chat}
                                    currentUser={currentUser}
                                    getAttachmentUrl={getAttachmentUrl}
                                    isAttachmentImage={isAttachmentImage}
                                    getAttachmentName={getAttachmentName}
                                    getSenderName={getSenderName}
                                    formatMessageTime={formatMessageTime}
                                    navigate={navigate}
                                    teamId={teamId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    )
}

export default MessageList