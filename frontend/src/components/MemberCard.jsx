import React from 'react'
import UserProfilePfp from './UserProfilePfp'
import { EllipsisVertical } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

function MemberCard({ onManage, member }) {
    const navigate = useNavigate()
    const { team_id } = useParams()
    const location = useLocation()
    const isMembersPage = location.pathname.includes('/members')

    const isOnline = member.user__profile__is_online

    return (
        <div
            onClick={() => navigate(`/team/${team_id}/members/${member.user__id}`)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-cyan-500/15 hover:bg-white/[0.04] cursor-pointer"
        >
            <div className="flex items-center gap-4 min-w-0">
                <UserProfilePfp memberUser={member} isOnline={member.user__profile__is_online} />
                <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                        {member.user__first_name} {member.user__last_name}
                    </p>
                    <p className="text-sm text-zinc-500 truncate">
                        @{member.user__username}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <span className={`text-xs ${isOnline ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-cyan-400/10 text-cyan-300 border border-cyan-500/20">
                    {member.role}
                </span>
                {isMembersPage && (
                    <span className="group/btn relative">
                        <span
                            onClick={(e) => {
                                e.stopPropagation()
                                onManage()
                            }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
                        >
                            <EllipsisVertical size={15} />
                        </span>
                        <span className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b1110] px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-200 group-hover/btn:-translate-y-1 group-hover/btn:opacity-100">
                            Manage
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

export default MemberCard