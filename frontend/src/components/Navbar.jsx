import React, { useState } from 'react'
import Logo from './Logo'
import Searchbar from './Searchbar'
import UserProfilePfp from './UserProfilePfp'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Settings, MessageCircle } from 'lucide-react'
import ChatDropdown from './ChatDropDown'
import { useNotifications } from '../context/NotificationContext'
import { useChat } from '../context/ChatContext'

function Navbar() {
    const { unreadMessages } = useChat()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { unreadCount } = useNotifications() 

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020404]/70 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.03),transparent,rgba(99,102,241,0.03))]" />
            <div className="relative mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6">
                <div className="flex items-center gap-10">
                    <Link to="/dashboard" className="transition duration-300 hover:opacity-90">
                        <Logo />
                    </Link>
                </div>
                <div className="hidden w-full max-w-xl lg:block">
                    <Searchbar />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(!open)}
                        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-300 transition duration-300 hover:bg-white/[0.06] hover:text-white"
                    >
                        <MessageCircle size={18} />
                        {unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                                {unreadMessages > 99 ? '99+' : unreadMessages}
                            </span>
                        )}
                    </button>
                    {open && <ChatDropdown open={open} setOpen={setOpen} />}
                    <button
                        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-300 transition duration-300 hover:bg-white/[0.06] hover:text-white"
                        onClick={() => navigate('notifications/')}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <Link
                        to="/profile"
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 transition duration-300 hover:bg-white/[0.06]"
                    >
                        <UserProfilePfp />
                        <div className="hidden text-left xl:block">
                            <p className="text-sm font-semibold text-white">Workspace</p>
                            <p className="text-xs text-gray-400">Manage Account</p>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar