import React, { useEffect, useRef } from 'react'
import {
    FileImage,
    FileText,
    Loader2,
    Paperclip,
    SendHorizontal,
    Smile,
    X
} from 'lucide-react'
import EmojiPickerComp from './EmojiPickerComp'

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
    onTyping
}) => {
    const emojiRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                emojiRef.current &&
                !emojiRef.current.contains(e.target)
            ) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className={`sticky bottom-0 z-20 border-t border-white/10 bg-neutral-900/95 px-3 py-3 backdrop-blur-xl sm:px-6 ${
            variant === "dm"
                ? "bg-[#121a18]/95"
                : "bg-neutral-900/95"
        }`}>
            <div
                className={`rounded-[1.75rem] border border-white/10 bg-neutral-950 p-1 shadow-[0_-14px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5 ${
                    variant === "team"
                        ? "mx-auto max-w-5xl"
                        : "w-full"
                }`}
            >
                {selectedFile && (
                    <div className="mb-2 flex items-center justify-between gap-3 rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10 px-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                                {selectedFile.type.startsWith('image/')
                                    ? <FileImage size={18} />
                                    : <FileText size={18} />
                                }
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
                    <div ref={emojiRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(prev => !prev)}
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
                    <div className="flex flex-1 items-center rounded-[1.3rem] bg-black/20 px-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value) 
                                onTyping()
                            }}
                            placeholder={
                                selectedFile
                                    ? 'Add a caption or send the file directly...'
                                    : 'Type a message...'
                            }
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    (message?.trim() || selectedFile) &&
                                    !uploadingFile
                                ) {
                                    handleSend()
                                }
                            }}
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if(uploadingFile) return
                            return (
                                handleSend()
                            )
                        }}
                        disabled={
                            (!message?.trim() && !selectedFile) ||
                            uploadingFile
                        }
                        className="flex h-[38px] min-w-[38px] items-center justify-center rounded-[1.2rem] bg-emerald-500 text-[#08110f] transition hover:scale-[1.03] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40 disabled:text-black/50 disabled:hover:scale-100"
                    >
                        {uploadingFile
                            ? <Loader2 size={18} className="animate-spin" />
                            : <SendHorizontal size={18} />
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MessageSendingBox