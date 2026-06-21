import React, { useEffect, useState, useMemo } from 'react'
import { list_notifications, mark_notification_read } from '../api/chat'
import { useNotifications } from '../context/NotificationContext'

const TYPE_META = {
    task_assigned: { icon: 'ti-clipboard-plus', label: 'Task assigned' },
    task_updated: { icon: 'ti-clipboard-text', label: 'Task updated' },
    team_new_message_received: { icon: 'ti-message-circle-2', label: 'New message' },
}

function getTypeMeta(type) {
    return TYPE_META[type?.toLowerCase()] || { icon: 'ti-bell', label: 'Notification' }
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
            await mark_notification_read(notification.id)
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
                    .map((n) => mark_notification_read(n.id))
            )
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            )
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0C0F] text-[#E7E8EA]">
            <div className="mx-auto max-w-2xl px-6 py-10">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-[#5B8DEF] hover:text-[#7AA3F2] transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <p className="text-sm text-[#86888F] mb-6">
                    {unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                        : 'You\u2019re all caught up.'}
                </p>

                <div className="flex items-center gap-1 mb-4 border-b border-[#23252D]">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: 'Unread' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                                filter === tab.key
                                    ? 'text-[#E7E8EA]'
                                    : 'text-[#86888F] hover:text-[#E7E8EA]'
                            }`}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 text-xs text-[#5B8DEF]">
                                    {unreadCount}
                                </span>
                            )}
                            {filter === tab.key && (
                                <span className="absolute left-0 right-0 -bottom-px h-px bg-[#5B8DEF]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-[#23252D] overflow-hidden">
                    {loading ? (
                        <div>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 px-4 py-4 border-b border-[#23252D] last:border-b-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#1A1B21] animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2 pt-0.5">
                                        <div className="h-3 w-2/5 rounded bg-[#1A1B21] animate-pulse" />
                                        <div className="h-3 w-4/5 rounded bg-[#1A1B21] animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : visibleNotifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <i className="ti ti-bell-off text-3xl text-[#3A3C45] block mb-3" aria-hidden="true" />
                            <p className="text-sm font-medium text-[#E7E8EA] mb-1">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-xs text-[#86888F]">
                                {filter === 'unread'
                                    ? 'New activity will appear here as it happens.'
                                    : 'Task assignments and updates will show up here.'}
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {visibleNotifications.map((notification) => {
                                const meta = getTypeMeta(notification.notification_type)
                                const isRemoving = removingIds.has(notification.id)
                                return (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleMarkRead(notification)}
                                        className={`group flex gap-3 px-4 py-4 border-b border-[#23252D] last:border-b-0 border-l-2 cursor-pointer transition-colors duration-200 ${
                                            !notification.is_read
                                                ? 'border-l-[#5B8DEF] bg-[#5B8DEF]/[0.06] hover:bg-[#5B8DEF]/[0.1]'
                                                : 'border-l-transparent hover:bg-[#14151A]'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                !notification.is_read
                                                    ? 'bg-[#5B8DEF]/15 text-[#5B8DEF]'
                                                    : 'bg-[#1A1B21] text-[#86888F]'
                                            }`}
                                        >
                                            <i className={`ti ${meta.icon} text-[15px]`} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-medium text-[#E7E8EA] leading-snug">
                                                    {notification.title}
                                                </p>
                                                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                                                    <span className="text-xs text-[#86888F]">
                                                        {timeAgo(notification.created_at)}
                                                    </span>
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full bg-[#5B8DEF] transition-opacity duration-200 ${
                                                            !notification.is_read && !isRemoving
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-[#86888F] leading-snug mt-0.5">
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