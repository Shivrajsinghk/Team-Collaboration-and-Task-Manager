import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { Sparkles, Send, Loader2, Bot, User as UserIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AIAssistant() {
    const { team_id } = useParams()
    const [messages, setMessages] = useState([]) 
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const sendMessage = async () => {
        const trimmed = input.trim()
        if (!trimmed || loading) return
        setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
        setInput('')
        setLoading(true)
        try {
            const res = await api.post('/ai/query/', {
                message: trimmed,
                team_id: Number(team_id),
            })
            setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer ?? "I couldn't generate a response. Please try again." }])
        } catch (err) {
            const errMsg =
                err.response?.status === 429
                    ? "You've hit the AI usage limit. Try again in a bit."
                    : "Something went wrong. Try again."
            setMessages((prev) => [...prev, { role: 'assistant', text: errMsg, isError: true }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex h-screen ml-5 flex-col bg-base p-6 text-ink">
            <div className="mb-6 ml-1 flex items-center gap-3">
                <div className="relative flex flex-col items-center justify-center">
                    <span className="text-sm font-extrabold tracking-wider text-[#2CFF05]  leading-none origin-center transition-transform duration-150 group-hover:scale-y-[0.1]">
                        OO
                    </span>
                    <span className="text-[10px] mt-[0.1rem] text-[#2CFF05] font-extrabold leading-none">
                        ⌣
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-ink">AI Assistant</h1>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl border border-border bg-surface">
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {messages.length === 0 && (
                        <div className="flex h-[95%] flex-col items-center justify-center text-center text-muted">
                            <Sparkles size={32} className="mb-3 text-accent/50" />
                            <p className="text-sm">
                                Ask about tasks, deadlines, or team activity.
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    m.role === 'user'
                                        ? 'bg-accent/10 text-accent'
                                        : 'bg-surface-alt text-muted'
                                }`}
                            >
                                {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                                m.role === 'user'
                                    ? 'bg-accent text-accent-ink'
                                    : m.isError
                                    ? 'border border-danger/30 bg-danger/10 text-danger'
                                    : 'border border-border bg-surface-alt text-ink'
                            }`}>
                                {m.role === 'assistant' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                            strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                                            ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                            code: ({ children }) => (
                                                <code className="rounded bg-black px-1.5 py-0.5 text-xs text-accent">{children}</code>
                                            ),
                                        }}
                                    >
                                        {m.text}
                                    </ReactMarkdown>
                                ) : (
                                    <span className="whitespace-pre-wrap">{m.text}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-muted">
                                <Bot size={16} />
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-muted">
                                <Loader2 size={14} className="animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>

                <div className="border-t border-border p-4">
                    <div className="flex items-end gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about team..."
                            rows={1}
                            className="flex-1 resize-none rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIAssistant