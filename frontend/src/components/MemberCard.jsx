import React from 'react'
import UserProfilePfp from './UserProfilePfp'
import { EllipsisVertical } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function MemberCard({onClick, member}) {
    const navigate = useNavigate()
    const { id, member_id } = useParams()
    const location = useLocation()
    const isMembersPage = location.pathname.includes("/members")

    return (
        <div
        onClick={()=>{navigate(`/team/${id}/members/${member.user__id}`)}}
        className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.035] hover:border-cyan-500/10 transition-all"
        >
            <div 
            className="flex items-center gap-4"
            >
                <UserProfilePfp memberUser={member}/>
                <div>
                    <p className="font-medium text-[var(--color-mint-cream)]">
                        {member.user__first_name}{' '}
                        {member.user__last_name}
                    </p>
                    <p className="text-sm text-[var(--color-cool-steel)]">
                        @{member.user__username}
                    </p>
                </div>
            </div>
            <div className='flex gap-2'>
                <span
                    className="
                    px-4 py-2
                    rounded-full
                    text-xs
                    font-medium
                    capitalize
                    bg-cyan-400/8
                    text-cyan-300
                    border border-cyan-500/20
                    "
                >
                    {member.role}
                </span>
                { isMembersPage && (
                    <span className="group relative">
                        <span
                            onClick={(e)=>{
                                e.stopPropagation()
                                onClick()
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                        >
                            <EllipsisVertical size={16} />
                        </span>
                        <span className="pointer-events-none absolute -top-11 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b1110] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                            Manage Member
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

export default MemberCard