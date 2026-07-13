import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query'
import { generateSubtasks, createSubtasks } from '../api/ai'
import { Sparkles, Wand2, Check, Pencil, Loader2, ListChecks, CalendarDays } from 'lucide-react'

function getDefaultDueDate(index) {
    const date = new Date()
    date.setDate(date.getDate() + 3 + index * 2)
    return date.toISOString().split('T')[0]
}

function SubtaskGenerator({ parentTaskId, taskTitle, taskDescription, onCreated }) {
    const [subtasks, setSubtasks] = useState([])
    const [error, setError] = useState(null)
    const [retryAfter, setRetryAfter] = useState(0)
    const [retryTotal, setRetryTotal] = useState(0)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (retryAfter <= 0) return;
        intervalRef.current = setInterval(() => {
            setRetryAfter((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current);
    }, [retryAfter])

    const generateMutation = useMutation({
        mutationFn: ({ title, description }) =>
            generateSubtasks({ title, description }),
        onSuccess: ({ data }) => {
            setError(null)
            setRetryAfter(0)
            setRetryTotal(0)
            setSubtasks(
                data.subtasks.map((s, i) => ({
                    ...s,
                    selected: true,
                    due_date: getDefaultDueDate(i),
                }))
            )
        },
        onError: (err) => {
            if (err.response?.status === 429) {
                const seconds = parseInt(
                    err.response.headers['retry-after'] || '60',
                    10
                )
                setRetryAfter(seconds)
                setRetryTotal(seconds)
            } 
            else {
                setError('Could not generate subtasks. Try again.')
            }
        },
    })

    const generate = () => {
        setError(null)
        generateMutation.mutate({
            title: taskTitle,
            description: taskDescription,
        })
    }

    const toggleSelected = (index) => {
        setSubtasks((prev) =>
            prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
        )
    }

    const updateTitle = (index, newTitle) => {
        setSubtasks((prev) =>
            prev.map((s, i) => (i === index ? { ...s, title: newTitle } : s))
        )
    }

    const updateDueDate = (index, newDate) => {
        setSubtasks((prev) =>
            prev.map((s, i) => (i === index ? { ...s, due_date: newDate } : s))
        )
    }

    const createMutation = useMutation({
        mutationFn: (data) => createSubtasks(data),
        onSuccess: (res) => {
            setError(null)
            setRetryAfter(0)
            setRetryTotal(0)
            onCreated?.(res.data.created);
            setSubtasks([]);
        },
        onError: (err) => {
            if (err.response?.status === 429) {
                const seconds = parseInt(err.response.headers['retry-after'] || '60', 10);
                setRetryAfter(seconds);
                setRetryTotal(seconds);
            } else {
                setError('Could not create subtasks. Try again.');
            }
        },
    })
    const selected = subtasks.filter((s) => s.selected)
    const selectedCount = selected.length

    const handleCreate = () => {
        if (selectedCount === 0 || !parentTaskId) return
        setError(null)
        createMutation.mutate({
            parent_task_id: parentTaskId,
            subtasks: selected.map(({ title, description, due_date }) => ({
                title,
                description,
                due_date: due_date ? `${due_date}T00:00:00` : null,
            })),
        })
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-accent" size={24} />
                    <h2 className="text-2xl font-bold text-ink">AI Subtasks</h2>
                </div>

                {subtasks.length === 0 && (
                    retryAfter > 0 ? (
                        <div className="w-56">
                            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                                <span>AI limit reached</span>
                                <span>{retryAfter}s</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                                <div
                                    className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
                                    style={{
                                        width: `${((retryTotal - retryAfter) / retryTotal) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={generate}
                            disabled={generateMutation.isPending}
                            className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:border-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {generateMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Wand2 size={16} />
                            )}
                            {generateMutation.isPending ? 'Generating...' : 'Generate Subtasks'}
                        </button>
                    )
                )}
            </div>

            {error && <p className="mb-4 text-sm text-danger">{error}</p>}

            {subtasks.length === 0 && !generateMutation.isPending && !error && (
                <p className="text-sm text-muted">
                    Let AI break this task down into smaller, actionable steps.
                </p>
            )}

            {subtasks.length > 0 && (
                <div className="space-y-3">
                    {subtasks.map((s, i) => (
                        <label
                            key={i}
                            className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors duration-150 ${s.selected ? 'border-accent/30 bg-accent/5' : 'border-border bg-black opacity-50'}`}
                        >
                            <button
                                type="button"
                                onClick={() => toggleSelected(i)}
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${s.selected ? 'border-accent bg-accent text-accent-ink' : 'border-border bg-surface-alt'}`}
                            >
                                {s.selected && <Check size={14} strokeWidth={3} />}
                            </button>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={s.title}
                                        onChange={(e) => updateTitle(i, e.target.value)}
                                        className="w-full -ml-2 rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium text-ink transition-colors duration-150 hover:border-border focus:border-accent focus:bg-surface-alt focus:outline-none"
                                    />
                                    <Pencil size={14} className="shrink-0 text-muted" />
                                </div>

                                {s.description && (
                                    <p className="mt-1 px-2 text-sm text-muted">
                                        {s.description}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 px-2">
                                    <CalendarDays size={14} className="shrink-0 text-muted" />
                                    <input
                                        type="date"
                                        value={s.due_date}
                                        onChange={(e) => updateDueDate(i, e.target.value)}
                                        className="rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-ink transition-colors duration-150 focus:border-accent focus:outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </label>
                    ))}

                    <div className="flex items-center justify-between pt-2">
                        {retryAfter > 0 ? (
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <span>Limit reached — {retryAfter}s</span>
                                <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-alt">
                                    <div
                                        className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
                                        style={{ width: `${((retryTotal - retryAfter) / retryTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={generate}
                                disabled={generateMutation.isPending}
                                className="text-sm font-medium text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {generateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                            </button>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={createMutation.isPending || selectedCount === 0}
                            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <ListChecks size={16} />
                            )}

                            {createMutation.isPending
                                ? 'Creating...'
                                : `Create ${selectedCount} Subtask${selectedCount === 1 ? '' : 's'}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SubtaskGenerator
