import React from 'react'
import UserProfilePfp from './UserProfilePfp'
import { EllipsisVertical } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { isPresenceOnline } from '../utils/presence'

function MemberCard({ onManage, member, isAdmin }) {
    const navigate = useNavigate()
    const { team_id } = useParams()
    const location = useLocation()
    const isMembersPage = location.pathname.includes('/members')
    const isOnline = isPresenceOnline(
        member.user__profile__is_online,
        member.user__profile__last_seen
    )
    return (
        <div
            onClick={() => navigate(`/team/${team_id}/members/${member.user__id}`)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-black p-4 transition-colors duration-150 hover:border-accent cursor-pointer"
        >
            <div className="flex items-center gap-4 min-w-0">
                <UserProfilePfp memberUser={member} isOnline={isOnline} />
                <div className="min-w-0">
                    <p className="font-medium text-ink capitalize truncate">
                        {member.user__first_name} {member.user__last_name}
                    </p>
                    <p className="text-sm text-muted truncate">
                        @{member.user__username}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-accent' : 'bg-muted'}`} />
                        <span className={`text-xs ${isOnline ? 'text-accent' : 'text-muted'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-accent/10 text-accent border border-accent/20">
                    {member.role}
                </span>
                {isMembersPage && isAdmin && (
                    <span className="group/btn relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onManage()
                            }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-alt text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                        >
                            <EllipsisVertical size={15} />
                        </button>
                        <span className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs whitespace-nowrap text-ink opacity-0 shadow-xl transition-all duration-200 group-hover/btn:-translate-y-1 group-hover/btn:opacity-100">
                            Manage
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

export default MemberCard