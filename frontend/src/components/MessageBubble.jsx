import React from 'react'
import { Download, FileText } from 'lucide-react'
import UserProfilePfp from './UserProfilePfp'
import { format, isToday, isYesterday } from 'date-fns'

const MessageBubble = ({
    variant = "team",
    chat,
    currentUser,
    getAttachmentUrl,
    isAttachmentImage,
    getAttachmentName,
    getSenderName,
    formatMessageTime,
    navigate,
    teamId
}) => {
    const isMine = chat?.sender?.id === currentUser?.id
    const attachmentUrl = getAttachmentUrl(chat)
    const hasAttachment = Boolean(attachmentUrl)
    const showImageAttachment =
        hasAttachment &&
        isAttachmentImage(chat)

    return (
        <article
            className={`group flex gap-3 ${isMine ? 'justify-end' : ''}`}
        >
            {!isMine && (
                <div
                    className="shrink-0 cursor-pointer"
                    onClick={() =>
                        navigate(
                            `/team/${teamId}/members/${chat.sender?.id}`
                        )
                    }
                >
                    <UserProfilePfp
                        memberUser={chat.sender}
                    />
                </div>
            )}
            <div
                className={`min-w-0 ${
                    isMine
                        ? 'flex max-w-[85%] flex-col items-end'
                        : 'flex-1'
                }`}
            >
                <div
                    className={`mb-1 flex flex-wrap items-center gap-2 ${
                        isMine
                            ? 'justify-end'
                            : 'justify-between'
                    }`}
                >
                    {!isMine && (
                        <span className="font-bold text-white capitalize">
                            {getSenderName(chat)}
                        </span>
                    )}
                </div>
                <div
                    className={`inline-block bg-neutral-900 border border-emerald-400/20 max-w-full min-w-[120px] overflow-hidden rounded-[1.4rem] px-4 py-3 text-sm leading-6 text-white shadow-lg backdrop-blur-md transition-all duration-200 group-hover:scale-[1.02]`}
                >
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
                    {hasAttachment &&
                        !showImageAttachment && (
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
                                <Download
                                    size={18}
                                    className="text-slate-300"
                                />
                            </a>
                        )}
                    {chat.message && (
                        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
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
}

export default MessageBubble