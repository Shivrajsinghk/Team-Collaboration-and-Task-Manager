import React from 'react'
import {Info, CalendarDays, UserCircle2} from 'lucide-react'

function TeamInfo({team}) {
    return (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
                <Info className="text-cyan-300" size={22} />
                <h2 className="text-2xl font-bold text-white">
                    Team Info
                </h2>
            </div>
            <div className="space-y-5">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-cool-steel)]">
                        Team ID
                    </p>
                    <p className="mt-2 text-sm text-white">
                        {team?.team_id}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-[var(--color-cool-steel)]">
                        <CalendarDays size={16} />
                        <p className="text-xs uppercase tracking-[0.2em]">
                            Created At
                        </p>
                    </div>
                    <p className="mt-3 text-sm text-white">
                        {new Date(team?.team?.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-[var(--color-cool-steel)]">
                        <UserCircle2 size={16} />
                        <p className="text-xs uppercase tracking-[0.2em]">
                            Joined At
                        </p>
                    </div>
                    <p className="mt-3 text-sm text-white">
                        {new Date(team?.joined_at).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TeamInfo