import React from 'react'
import {Users, Crown, ShieldCheck, ListTodo} from 'lucide-react'

function TeamStats({team}) {
    const admin = team?.team?.all_members.filter((member) => {
        return member.role === 'admin'  
    })
    console.log(team);
    

    return (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-teal-400/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[var(--color-cool-steel)]">
                            Total Members
                        </p>
                        <h2 className="mt-3 text-4xl font-bold text-white">
                            {team?.team?.member_count || 0}
                        </h2>
                    </div>
                    <div className="rounded-2xl bg-teal-500/10 p-4 text-teal-300">
                        <Users size={28} />
                    </div>
                </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[var(--color-cool-steel)]">
                            Total Tasks
                        </p>
                        <h2 className="mt-3 text-4xl font-bold capitalize text-white">
                            {team?.team?.task_count}
                        </h2>
                    </div>
                    <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-300">
                        <ListTodo size={28} 
                        className="text-emerald-400"
                        />
                    </div>
                </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[var(--color-cool-steel)]">
                            Team Admins
                        </p>
                        <h2 className="mt-3 text-xl font-semibold text-white">
                            {admin?.map((member) => member.user__username).join(', ')}
                        </h2>
                    </div>
                    <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-300">
                        <Crown size={28} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamStats