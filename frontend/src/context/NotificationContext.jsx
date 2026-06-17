import { createContext, useContext, useEffect, useState } from 'react'
import { list_notifications } from '../api/chat'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

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