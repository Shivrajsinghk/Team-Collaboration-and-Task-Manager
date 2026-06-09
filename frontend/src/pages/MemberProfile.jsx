import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Mail, ShieldCheck, Clock3, Activity, User2 } from 'lucide-react'
import PreviousPageButton from '../components/PreviousPageButton'
import { getMemberDetails } from '../api/teams'

function MemberProfile() {
    const { team_id, member_id } = useParams()
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMember() {
            try {
                const response = await getMemberDetails(team_id, member_id)
                setMember(response.data)
                console.log(response.data)
            }
            catch (err) {
                console.log(err?.response || err)
            }
            finally {
                setLoading(false)
            }
        }
        fetchMember()
    }, [team_id, member_id])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-400">
                Loading Profile...
            </div>
        )
    }

    if (!member) {
        return (
            <div className="flex h-full items-center justify-center text-red-400">
                Member not found
            </div>
        )
    }

    return (
        <div className="relative min-h-screen ml-5 bg-black p-6">
            <PreviousPageButton className="absolute left-12 top-12 text-white" />
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-[32px] border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.08] via-black to-black p-8 shadow-[0_0_50px_rgba(0,255,255,0.05)]">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative
                                h-36 w-36
                                overflow-hidden
                                rounded-3xl
                                border border-cyan-400/20
                                ring-1 ring-cyan-400/20
                                shadow-[0_0_40px_rgba(0,255,255,0.12)]">
                                    {member.profile.profile_picture ? (
                                        <img
                                            src={`http://127.0.0.1:8000${member.profile.profile_picture}`}
                                            alt={member.profile.full_name}
                                            className="h-full w-full object-cover hover:scale-110 transition-all"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-400 to-indigo-500 text-7xl font-bold text-white">
                                            {(member.profile.first_name || "U").slice(0,1)}
                                        </div>
                                    )}
                                <div
                                    className="
                                        absolute bottom-2 right-2
                                        h-5 w-5
                                        rounded-full
                                        border-2 border-black
                                        bg-emerald-400
                                    "
                                />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {member.profile.full_name}
                                    </h1>
                                    <p className="mt-1 text-lg text-zinc-400">
                                        @{member.profile.username}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                                        <ShieldCheck className="h-4 w-4" />
                                        {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                                        <Activity className="h-4 w-4" />
                                        {member.profile.status?.charAt(0).toUpperCase() + member.profile.status?.slice(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 lg:w-[420px]">
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                                <p className="text-sm text-zinc-500">
                                    Tasks Assigned
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-white">
                                    {member.assigned_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                                <p className="text-sm text-zinc-500">
                                    Tasks Completed
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                                    {member.completed_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                                <p className="text-sm text-zinc-500">
                                    Pending Tasks
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                                    {member.pending_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                                <p className="text-sm text-zinc-500">
                                    Completion Rate
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-cyan-400">
                                    {member.completion_rate}%
                                </h2>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                                    <div
                                        style={{
                                            width: `${member.completion_rate}%`
                                        }}
                                        className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <User2 className="h-6 w-6 text-cyan-400" />
                                <h2 className="text-2xl font-semibold text-white">
                                    About Member
                                </h2>
                            </div>
                            <p className="leading-relaxed text-zinc-400">
                                {member.profile.bio || 'No bio added yet.'}
                            </p>
                        </div>
                        <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Activity className="h-6 w-6 text-cyan-400" />
                                <h2 className="text-2xl font-semibold text-white">
                                    Recent Activity
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {member.recent_tasks.length > 0 ? (
                                    member?.recent_tasks?.map((task) => (
                                        <div
                                            key={task.id}
                                            className="
                                                rounded-2xl
                                                border border-white/5
                                                bg-white/[0.03]
                                                p-4
                                            "
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-white">
                                                        {task.status === 'done'
                                                            ? 'Completed task'
                                                            : task.status === 'in_progress'
                                                            ? 'Working on'
                                                            : 'Assigned task'
                                                        }
                                                        <span className="text-cyan-300">
                                                            {' '}{task.title}
                                                        </span>
                                                    </p>
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {new Date(task.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                {task.due_date && (
                                                    <div
                                                        className="
                                                            rounded-full
                                                            border border-yellow-500/20
                                                            bg-yellow-500/10
                                                            px-3 py-1
                                                            text-xs
                                                            font-medium
                                                            text-yellow-300
                                                            whitespace-nowrap
                                                        "
                                                    >
                                                        Due {' '}
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                ))) : (
                                    <div
                                        className="
                                        rounded-2xl
                                        border border-dashed border-white/10
                                        bg-white/[0.02]
                                        p-6 text-center
                                        text-zinc-500
                                        "
                                    >
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Mail className="h-6 w-6 text-cyan-400" />
                                <h2 className="text-2xl font-semibold text-white">
                                    Contact
                                </h2>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm text-zinc-500">
                                        Email
                                    </p>
                                    <p className="mt-1 break-all text-white">
                                        {member.profile.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">
                                        Username
                                    </p>
                                    <p className="mt-1 text-white">
                                        @{member.profile.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Clock3 className="h-6 w-6 text-cyan-400" />
                                <h2 className="text-2xl font-semibold text-white">
                                    Last Activity
                                </h2>
                            </div>
                            <div
                                className="
                                    rounded-2xl
                                    border border-white/5
                                    bg-white/[0.03]
                                    p-5
                                "
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-500">
                                            Last Seen
                                        </p>
                                        <p className="mt-2 text-white">
                                            {new Date(member.profile.last_seen).toLocaleString()}
                                        </p>
                                    </div>
                                    <div
                                        className={`
                                            rounded-full px-3 py-1 text-xs font-medium
                                            ${member.profile.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                                : 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20'
                                            }
                                        `}
                                    >
                                        {member.profile.status?.charAt(0).toUpperCase() +
                                            member.profile.status?.slice(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MemberProfile
