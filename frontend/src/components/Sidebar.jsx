import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import UserProfilePfp from './UserProfilePfp'
import { LayoutDashboard, CheckSquare, Users, MessageCircle, Sparkles } from "lucide-react"
import { useCurrentUserQuery } from '../hooks/useCurrentUserQuery'

function Sidebar() {
    const { team_id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { data: profile } = useCurrentUserQuery()

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: `/team/${team_id}` },
        { label: 'Tasks', icon: CheckSquare, path: `/team/${team_id}/tasks` },
        { label: 'Members', icon: Users, path: `/team/${team_id}/members` },
        { label: 'Chats', icon: MessageCircle, path: `/team/${team_id}/chats` },
        { label: 'AI Assistant', icon: Sparkles, path: `/team/${team_id}/assistant`},
    ]

    return (
        <>
            <aside className="mt-3 w-full h-full flex flex-col fixed top-0 left-0 max-w-[240px] py-6 px-3 overflow-auto bg-surface border-r border-border">
                <hr className="my-5 border-border" />
                <nav className="mt-4 flex-1 px-4">
                    <ul className="space-y-2">
                        {navItems.map(({ label, icon: Icon, path }) => {
                            const isActive = location.pathname === path
                            return (
                                <li key={label}>
                                    <button
                                        onClick={() => navigate(path)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-colors duration-150 ${
                                            isActive
                                                ? 'bg-accent/10 text-accent border border-accent/20'
                                                : 'text-muted border border-transparent hover:bg-surface-alt hover:text-ink'
                                        }`}
                                    >
                                        {React.createElement(Icon, { size: 18 })}
                                        {label}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
                {/* Profile */}
                <div
                    onClick={() => navigate("/profile")}
                    className="mx-4 mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-alt p-4 transition-colors duration-150 hover:border-border-strong"
                >
                    <UserProfilePfp />
                    <div className="overflow-hidden">
                        <p className="truncate text-sm capitalize font-semibold text-ink">
                            {profile?.full_name}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar
