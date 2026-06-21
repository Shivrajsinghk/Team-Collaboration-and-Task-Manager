import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { list_notifications } from '../api/chat'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const socketRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('access')
        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/?token=${encodeURIComponent(token)}`
        )
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setNotifications((prev) =>
                prev.some((n) => n.id === data.id) ? prev : [data, ...prev]
            )
        }
        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await list_notifications()
                setNotifications(response.data)
            } 
            catch (error) {
                console.log(error)
            }
            finally{
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const unreadCount = notifications.filter(
        (n) => !n.is_read
    ).length

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