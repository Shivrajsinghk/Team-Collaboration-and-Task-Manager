import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { list_notifications } from '../api/chat'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from '../api/queryKeys'
import { useSelector } from 'react-redux'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
    const socketRef = useRef(null)
    const queryClient = useQueryClient()
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    const {
        data: notifications = [],
        isLoading: loading,
    } = useQuery({
        queryKey: notificationKeys.list,
        queryFn: async () => {
            const response = await list_notifications()
            return response.data
        },
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    useEffect(() => {
        if (!isAuthenticated) {
            if (socketRef.current) {
                socketRef.current.close()
                socketRef.current.onclose = () => {
                    console.log("Socket closed")
                    socketRef.current = null
                }
            }
            return
        }
        const token = localStorage.getItem('access')
        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/?token=${encodeURIComponent(token)}`
        )
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            queryClient.setQueryData(notificationKeys.list, (prev = []) =>
                prev.some((n) => n.id === data.id) ? prev : [data, ...prev]
            )
        }
        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
        const heartbeatInterval = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'heartbeat' }))
            }
        }, 30 * 1000)
        return () => {
            clearInterval(heartbeatInterval)
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [queryClient, isAuthenticated])

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications]
    )

    const setNotifications = (updater) => {
        queryClient.setQueryData(notificationKeys.list, (prev = []) =>
            typeof updater === 'function'
                ? updater(prev)
                : updater
        )
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                setNotifications,
                unreadCount,
                loading
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () =>
    useContext(NotificationContext)
