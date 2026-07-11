import React from 'react'
import {Users, Crown, ShieldCheck, ListTodo} from 'lucide-react'

function TeamStats({team}) {
    const admin = team?.team?.all_members?.filter((member) => {
        return member.role === 'admin'  
    })

    return (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-accent">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-muted">
                            Total Members
                        </p>
                        <h2 className="mt-3 text-4xl font-bold text-ink">
                            {team?.team?.member_count || 0}
                        </h2>
                    </div>
                    <div className="rounded-xl bg-accent/10 p-4 text-accent">
                        <Users size={28} />
                    </div>
                </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-accent">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-muted">
                            Total Tasks
                        </p>
                        <h2 className="mt-3 text-4xl font-bold capitalize text-ink">
                            {team?.team?.task_count}
                        </h2>
                    </div>
                    <div className="rounded-xl bg-accent/10 p-4 text-accent">
                        <ListTodo size={28} />
                    </div>
                </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-accent">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-muted">
                            {admin?.length === 1 ? "Team Admin" : "Team Admins"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {admin?.map((member) => (
                                <span
                                    key={member.id}
                                    className="rounded-full capitalize bg-accent/10 px-3 py-1 text-sm text-accent"
                                >
                                    {member.user__username}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl bg-accent/10 p-4 text-accent">
                        <Crown size={28} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamStats