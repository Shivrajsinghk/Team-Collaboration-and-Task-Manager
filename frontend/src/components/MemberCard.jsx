import React from 'react'
import UserProfilePfp from './UserProfilePfp'

function MemberCard({onClick, member}) {

    return (
        <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.035] hover:border-cyan-500/10 transition-all"
        >
            <div className="flex items-center gap-4">
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
        </div>
    )
}

export default MemberCard