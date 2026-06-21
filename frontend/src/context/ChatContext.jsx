import { createContext, useContext, useState, useEffect } from 'react'
import { listConversations } from '../api/chat'
import { useSelector } from 'react-redux'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([])
    const currentUser = useSelector((state) => state.auth.user)

    useEffect(() => {
        listConversations().then(res => setConversations(res.data))
    }, [])

    const unreadMessages = conversations.filter(c => 
        c.last_message && 
        !c.last_message.is_read && 
        c.last_message.sender !== currentUser.username
    ).length

    return (
        <ChatContext.Provider value={{ conversations, setConversations, unreadMessages }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => useContext(ChatContext)