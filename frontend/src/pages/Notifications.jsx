import React, { useState, useMemo } from 'react'
import { mark_notification_read } from '../api/chat'
import { useNotifications } from '../context/NotificationContext'
import { useMutation } from '@tanstack/react-query'
import { ClipboardPlus, ClipboardEdit, MessageCircle, Bell, BellOff } from 'lucide-react'

const TYPE_META = {
    task_assigned: { icon: ClipboardPlus, label: 'Task assigned' },
    task_updated: { icon: ClipboardEdit, label: 'Task updated' },
    team_new_message_received: { icon: MessageCircle, label: 'New message' },
}

function getTypeMeta(type) {
    return TYPE_META[type?.toLowerCase()] || { icon: Bell, label: 'Notification' }
}

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateString).toLocaleDateString()
}

function Notifications() {
    const { notifications, setNotifications, loading } = useNotifications()
    const [filter, setFilter] = useState('all')
    const [removingIds, setRemovingIds] = useState(new Set())
    const markReadMutation = useMutation({
        mutationFn: (notificationId) => mark_notification_read(notificationId),
    })

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications]
    )

    const visibleNotifications = useMemo(() => {
        if (filter === 'unread') return notifications.filter((n) => !n.is_read)
        return notifications
    }, [notifications, filter])

    const handleMarkRead = async (notification) => {
        if (notification.is_read) return
        setRemovingIds((prev) => new Set(prev).add(notification.id))
        try {
            await markReadMutation.mutateAsync(notification.id)
            setTimeout(() => {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, is_read: true } : n
                    )
                )
                setRemovingIds((prev) => {
                    const next = new Set(prev)
                    next.delete(notification.id)
                    return next
                })
            }, 200)
        } catch (error) {
            console.log(error)
            setRemovingIds((prev) => {
                const next = new Set(prev)
                next.delete(notification.id)
                return next
            })
        }
    }

    const handleMarkAllRead = async () => {
        console.log("clicked")
        try {
            await Promise.all(
                notifications
                    .filter((n) => !n.is_read)
                    .map((n) => markReadMutation.mutateAsync(n.id))
            )
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            )
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-base text-ink">
            <div className="mx-auto max-w-2xl px-6 py-10">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <p className="text-sm text-muted mb-6">
                    {unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                        : 'You\u2019re all caught up.'}
                </p>

                <div className="flex items-center gap-1 mb-4 border-b border-border">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: 'Unread' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                                filter === tab.key
                                    ? 'text-ink'
                                    : 'text-muted hover:text-ink'
                            }`}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 text-xs text-accent">
                                    {unreadCount}
                                </span>
                            )}
                            {filter === tab.key && (
                                <span className="absolute left-0 right-0 -bottom-px h-px bg-accent" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                    {loading ? (
                        <div>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 px-4 py-4 border-b border-border last:border-b-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-surface-alt animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2 pt-0.5">
                                        <div className="h-3 w-2/5 rounded bg-surface-alt animate-pulse" />
                                        <div className="h-3 w-4/5 rounded bg-surface-alt animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : visibleNotifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <BellOff className="mx-auto mb-3 text-muted" size={28} aria-hidden="true" />
                            <p className="text-sm font-medium text-ink mb-1">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-xs text-muted">
                                {filter === 'unread'
                                    ? 'New activity will appear here as it happens.'
                                    : 'Task assignments and updates will show up here.'}
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {visibleNotifications.map((notification) => {
                                const meta = getTypeMeta(notification.notification_type)
                                const Icon = meta.icon
                                const isRemoving = removingIds.has(notification.id)
                                return (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleMarkRead(notification)}
                                        className={`group flex gap-3 px-4 py-4 border-b border-border last:border-b-0 border-l-2 cursor-pointer transition-colors duration-200 ${
                                            !notification.is_read
                                                ? 'border-l-accent bg-accent/[0.06] hover:bg-accent/[0.1]'
                                                : 'border-l-transparent hover:bg-surface-alt'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                !notification.is_read
                                                    ? 'bg-accent/15 text-accent'
                                                    : 'bg-surface-alt text-muted'
                                            }`}
                                        >
                                            <Icon size={15} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-medium text-ink leading-snug">
                                                    {notification.title}
                                                </p>
                                                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                                                    <span className="text-xs text-muted">
                                                        {timeAgo(notification.created_at)}
                                                    </span>
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full bg-accent transition-opacity duration-200 ${
                                                            !notification.is_read && !isRemoving
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted leading-snug mt-0.5">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Notifications