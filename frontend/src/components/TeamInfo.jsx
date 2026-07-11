import React from 'react'
import {Info, CalendarDays, UserCircle2} from 'lucide-react'

function TeamInfo({team}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-6 flex items-center gap-3">
                <Info className="text-accent" size={22} />
                <h2 className="text-2xl font-bold text-ink">
                    Team Info
                </h2>
            </div>
            <div className="space-y-5">
                <div className="rounded-xl border border-border bg-surface-alt p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        Team ID
                    </p>
                    <p className="mt-2 text-sm text-ink">
                        {team?.team_id}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-alt p-4">
                    <div className="flex items-center gap-2 text-muted">
                        <CalendarDays size={16} />
                        <p className="text-xs uppercase tracking-[0.2em]">
                            Created At
                        </p>
                    </div>
                    <p className="mt-3 text-sm text-ink">
                        {new Date(team?.team?.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-alt p-4">
                    <div className="flex items-center gap-2 text-muted">
                        <UserCircle2 size={16} />
                        <p className="text-xs uppercase tracking-[0.2em]">
                            Joined At
                        </p>
                    </div>
                    <p className="mt-3 text-sm text-ink">
                        {new Date(team?.joined_at).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TeamInfo