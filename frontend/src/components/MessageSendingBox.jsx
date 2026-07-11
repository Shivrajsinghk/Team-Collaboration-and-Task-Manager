import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { FileImage, FileText, Loader2, Paperclip, SendHorizontal, Smile, X } from 'lucide-react'
import EmojiPickerComp from './EmojiPickerComp'

function getActiveMentionQuery(text, cursor) {
    const uptoCursor = text.slice(0, cursor)
    const match = uptoCursor.match(/(?:^|\s)@(\w*)$/)
    return match ? { query: match[1], start: cursor - match[1].length - 1 } : null
}

function revalidateSpans(text, spans) {
    return spans.filter(s =>
        s.end <= text.length &&
        text.slice(s.start, s.end) === `@${s.displayName}` &&
        (s.start === 0 || /\s/.test(text[s.start - 1]))
    )
}

const MessageSendingBox = ({
    variant = "team",
    message,
    setMessage,
    handleSend,
    selectedFile,
    resetSelectedFile,
    handleFileChange,
    fileInputRef,
    showEmojiPicker,
    setShowEmojiPicker,
    uploadingFile,
    onTyping = () => {},
    members = [],
    currentUserId = null,
}) => {
    const emojiRef = useRef(null)
    const inputRef = useRef(null)
    const mentionSpansRef = useRef([])
    const [activeMention, setActiveMention] = useState(null)
    const [highlightIndex, setHighlightIndex] = useState(0)
    const supportsMentions = variant === "team"

    const suggestions = useMemo(() => {
        if (!supportsMentions || !activeMention) return []
        const q = activeMention.query.toLowerCase()
        return members
            .filter(m => m?.username && m.id !== currentUserId)
            .filter(m => m.username?.toLowerCase().startsWith(q))
            .slice(0, 8)
    }, [members, activeMention, currentUserId, supportsMentions])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (message === '') {
            mentionSpansRef.current = []
            setActiveMention(null)
        }
    }, [message])

    const handleChange = (e) => {
        const newText = e.target.value
        const cursor = e.target.selectionStart
        mentionSpansRef.current = revalidateSpans(newText, mentionSpansRef.current)
        setMessage(newText)
        onTyping()
        if (supportsMentions) {
            setActiveMention(getActiveMentionQuery(newText, cursor))
            setHighlightIndex(0)
        }
    }

    const insertMention = useCallback((member) => {
        if (!activeMention) return
        const { start, query } = activeMention
        const cursor = start + 1 + query.length
        const before = message.slice(0, start)
        const after = message.slice(cursor)
        const insertedName = `@${member.username}`
        const newText = `${before}${insertedName} ${after}`
        const delta = (insertedName.length + 1) - (cursor - start)

        mentionSpansRef.current = mentionSpansRef.current
            .map(s => s.start >= cursor ? { ...s, start: s.start + delta, end: s.end + delta } : s)
            .concat([{ start, end: start + insertedName.length, userId: member.id, displayName: member.username }])

        setMessage(newText)
        setActiveMention(null)

        requestAnimationFrame(() => {
            const newCursor = start + insertedName.length + 1
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(newCursor, newCursor)
        })
    }, [activeMention, message, setMessage])

    const triggerSend = () => {
        const mentionIds = [...new Set(mentionSpansRef.current.map(s => s.userId))]
        handleSend(mentionIds)
    }

    const handleKeyDown = (e) => {
        if (supportsMentions && activeMention && suggestions.length > 0) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(i => (i + 1) % suggestions.length); return }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(i => (i - 1 + suggestions.length) % suggestions.length); return }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(suggestions[highlightIndex]); return }
            if (e.key === 'Escape') { setActiveMention(null); return }
        }
        if (e.key === 'Enter' && (message?.trim() || selectedFile) && !uploadingFile) {
            triggerSend()
        }
    }

    return (
        <div className={`sticky bottom-0 z-20 border-t border-white/10 bg-black px-3 py-3 backdrop-blur-xl sm:px-6 ${variant === "dm" ? "bg-[#121a18]/95" : "bg-neutral-900/95"}`}>
            <div className={`relative rounded-[1.75rem] border border-white/10 bg-neutral-950/50 p-1 shadow-[0_-14px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5 ${variant === "team" ? "mx-auto max-w-5xl" : "w-full"}`}>
                {supportsMentions && activeMention && suggestions.length > 0 && (
                    <ul className="absolute bottom-full left-4 mb-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-xl z-30">
                        {suggestions.map((m, i) => (
                            <li
                                key={m.id}
                                onMouseDown={(e) => { e.preventDefault(); insertMention(m) }}
                                className={`cursor-pointer px-3 py-2 text-sm text-white ${i === highlightIndex ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}
                            >
                                {m.username}
                            </li>
                        ))}
                    </ul>
                )}
                {selectedFile && (
                    <div className="mb-2 flex items-center justify-between gap-3 rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10 px-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                                {selectedFile.type.startsWith('image/') ? <FileImage size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{selectedFile.name}</p>
                                <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button type="button" onClick={resetSelectedFile} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-2xl p-3 text-slate-400 transition hover:bg-white/5 hover:text-white">
                        <Paperclip size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <div ref={emojiRef} className="relative">
                        <button type="button" onClick={() => setShowEmojiPicker(prev => !prev)} className="rounded-2xl p-3 text-slate-400 transition hover:bg-white/5 hover:text-white">
                            <Smile size={18} />
                        </button>
                        <EmojiPickerComp showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker} setMessage={setMessage} />
                    </div>
                    <div className="flex flex-1 items-center rounded-[1.3rem] bg-black/20 px-4">
                        <input
                            ref={inputRef}
                            name="message"
                            id="team-chat-message-input"
                            type="text"
                            value={message}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedFile ? 'Add a caption or send the file directly...' : 'Type a message...'}
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => { if (!uploadingFile) triggerSend() }}
                        disabled={(!message?.trim() && !selectedFile) || uploadingFile}
                        className="flex h-[38px] min-w-[38px] items-center justify-center rounded-[1.2rem] bg-emerald-500 text-[#08110f] transition hover:scale-[1.03] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40 disabled:text-black/50 disabled:hover:scale-100"
                    >
                        {uploadingFile ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MessageSendingBox