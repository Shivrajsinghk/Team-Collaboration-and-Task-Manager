import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserProfilePfp from './UserProfilePfp'
import { LayoutDashboard, CheckSquare, Users, MessageCircle } from "lucide-react"
import { getUserProfile } from '../api/auth'

function Sidebar() {
    const { team_id } = useParams()
    const [profile, setProfile] = useState('')
    const navigate = useNavigate()

    const sidebarBtn =
    "flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-[var(--color-cool-steel)] transition-all duration-300 hover:bg-white/[0.05] hover:text-white"

    useEffect(() => {
        const fetchprofile = async () => {
            try {
                const response = await getUserProfile()
                setProfile(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchprofile()
    }, [])

    return (
        <>
            <aside className="bg-white mt-3 dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 w-full h-full flex flex-col fixed top-0 left-0 max-w-[240px] py-6 px-3 overflow-auto bg-[linear-gradient(180deg,var(--color-onyx),var(--color-jet-black))] border-r border-[var(--color-cool-steel)]/15">
                <hr className="my-5 border-slate-300 dark:border-neutral-700" />
                <nav className="mt-4 flex-1 px-4">
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => navigate(`/team/${team_id}`)}
                                className={sidebarBtn}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate(`/team/${team_id}/tasks`)}
                                className={sidebarBtn}
                            >
                                <CheckSquare size={18} />
                                Tasks
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate(`/team/${team_id}/members`)}
                                className={sidebarBtn}
                            >
                                <Users size={18} />
                                Members
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate(`/team/${team_id}/chats`)}
                                className={sidebarBtn}
                            >
                                <MessageCircle size={18} />
                                Chats
                            </button>
                        </li>
                    </ul>
                </nav>
                {/* Profile */}
                <div
                    onClick={() => navigate("/profile")}
                    className="mx-4 mt-2 flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:bg-white/[0.05]"
                >
                    <UserProfilePfp />
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-white">
                            {profile?.full_name}
                        </p>
                        <p className="truncate text-xs text-[var(--color-cool-steel)]">
                            {profile?.status}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar
