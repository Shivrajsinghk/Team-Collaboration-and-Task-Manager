import React, { useEffect, useState } from 'react'
import { MoreVertical, Phone, Video } from 'lucide-react'
import { listConversations } from '../api/chat'
import Loading from './Loading'
import { useSelector } from 'react-redux'

function DMHeader({ selectedConversationId, setSelectedConversationId }) {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const currentUser = useSelector((state) => state.auth.user)

    useEffect(() => {
        const fetchConversations = async () => {
            try{
                const response = await listConversations()
                setConversations(response.data)
            }
            catch(err){
                console.log(err)
            }
            finally{
                setLoading(false)
            }
        }
        fetchConversations()
    }, [])

    if(loading){
        return <Loading />
    }

    const convo = conversations.find(
        convo => convo.id === selectedConversationId
    ) 
    if (!convo) {
        return (
            <header className="flex items-center px-5 py-3">
                Select a conversation
            </header>
        )
    }
    const other_user = convo?.participant.find(
        user => user?.id !== currentUser?.id
    )

    return (
        <header className="flex items-center justify-between border-b border-white/10 bg-[#121a18]/95 px-5 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <img
                    src={other_user?.profile_picture}
                    alt={other_user?.full_name}
                    className="
                        h-12 w-12
                        rounded-full
                        object-cover
                        border border-white/10
                    "
                />
                <div>
                    <h2 className="font-semibold capitalize text-white">
                        {other_user?.full_name}
                    </h2>
                <p className="truncate text-sm text-[var(--color-cool-steel)]">
                        {other_user?.username}
                    </p>
                </div>
            </div>
            <div className="px-3">
                <p className='text-sm text-emerald-400'>
                    Online
                </p>
            </div>
        </header>
    )
}

export default DMHeader