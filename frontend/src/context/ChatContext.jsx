import { createContext, useContext } from 'react'
import { listConversations } from '../api/chat'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { chatKeys } from '../api/queryKeys'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const currentUser = useSelector((state) => state.auth.user)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const isAuthResolved = useSelector((state) => state.auth.isAuthResolved)
    const accessToken = useSelector((state) => state.auth.access)

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: chatKeys.conversations,
        queryFn: async () => {
            const response = await listConversations()
            return response.data
        },
        enabled: isAuthResolved && isAuthenticated && !!accessToken,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    const unreadMessages = conversations.filter(c => 
        c.last_message && 
        !c.last_message.is_read && 
        c.last_message.sender !== currentUser?.username
    ).length

    return (
        <ChatContext.Provider value={{ conversations, unreadMessages, isLoading }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => useContext(ChatContext)
