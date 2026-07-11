import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mail, ShieldCheck, Clock3, Activity, User2 } from 'lucide-react'
import PreviousPageButton from '../components/PreviousPageButton'
import { getMemberDetails } from '../api/teams'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'
import Loading from '../components/Loading'
import { isPresenceOnline } from '../utils/presence'
import NoProfilePhoto from '../components/NoProfilePhoto'

function MemberProfile() {
    const { team_id, member_id } = useParams()
    const navigate = useNavigate()
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const { data: member = null, isLoading: loading } = useQuery({
        queryKey: teamKeys.memberDetail(team_id, member_id),
        queryFn: async () => {
            const response = await getMemberDetails(team_id, member_id)
            return response.data
        },
        enabled: !!team_id && !!member_id,
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    if (loading) {
        return <Loading />
    }

    if (!member) {
        return (
            <div className="flex h-full items-center justify-center text-danger">
                Member not found
            </div>
        )
    }

    const isMemberOnline = isPresenceOnline(
        member.profile.is_online,
        member.profile.last_seen
    )

    return (
        <div className="relative min-h-screen ml-5 bg-base p-6">
            <PreviousPageButton className="absolute left-12 top-12 text-ink" />
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-2xl border border-border bg-surface p-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6">
                            <div
                                onClick={() => navigate(`/profile/${member.profile.username}`)}
                                className="relative h-36 w-36 overflow-hidden rounded-3xl border border-border cursor-pointer"
                            >
                                {member.profile.profile_picture ? (
                                    <img
                                        src={`${BASE_URL}${member.profile.profile_picture}`}
                                        alt={member.profile.full_name}
                                        className="h-full w-full object-cover hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <NoProfilePhoto size={112} className='left-2 top-4' />
                                )}
                                <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-surface ${isMemberOnline ? 'bg-accent' : 'bg-muted'}`} />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h1 className="text-3xl font-bold capitalize text-ink">
                                        {member.profile.full_name}
                                    </h1>
                                    <p className="mt-1 text-lg text-muted">
                                        @{member.profile.username}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm text-accent">
                                        <ShieldCheck className="h-4 w-4" />
                                        {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm text-accent">
                                        <Activity className="h-4 w-4" />
                                        {isMemberOnline ? 'Active' : 'Offline'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 lg:w-[420px]">
                            <div className="rounded-xl border border-border bg-surface-alt p-5">
                                <p className="text-sm text-muted">Tasks Assigned</p>
                                <h2 className="mt-2 text-3xl font-bold text-ink">
                                    {member.assigned_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-xl border border-border bg-surface-alt p-5">
                                <p className="text-sm text-muted">Tasks Completed</p>
                                <h2 className="mt-2 text-3xl font-bold text-accent">
                                    {member.completed_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-xl border border-border bg-surface-alt p-5">
                                <p className="text-sm text-muted">Pending Tasks</p>
                                <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                                    {member.pending_tasks_count}
                                </h2>
                            </div>
                            <div className="rounded-xl border border-border bg-surface-alt p-5">
                                <p className="text-sm text-muted">Completion Rate</p>
                                <h2 className="mt-2 text-3xl font-bold text-accent">
                                    {member.completion_rate}%
                                </h2>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                                    <div
                                        style={{ width: `${member.completion_rate}%` }}
                                        className="h-full rounded-full bg-accent transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-surface p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <User2 className="h-6 w-6 text-accent" />
                                <h2 className="text-2xl font-semibold text-ink">About Member</h2>
                            </div>
                            <p className="leading-relaxed text-muted">
                                {member.profile.about || 'No about added yet.'}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Activity className="h-6 w-6 text-accent" />
                                <h2 className="text-2xl font-semibold text-ink">Recent Activity</h2>
                            </div>
                            <div className="space-y-4">
                                {member?.recent_tasks?.length > 0 ? (
                                    member?.recent_tasks?.map((task) => (
                                        <div key={task.id} className="rounded-xl border border-border bg-surface-alt p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-ink">
                                                        {task.status === 'done'
                                                            ? 'Completed task'
                                                            : task.status === 'in_progress'
                                                            ? 'Working on'
                                                            : 'Assigned task'}
                                                        <span className="text-accent"> {task.title}</span>
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted">
                                                        {new Date(task.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                {task.due_date && (
                                                    <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300 whitespace-nowrap">
                                                        Due {new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border bg-surface-alt p-6 text-center text-muted">
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-border bg-surface p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Mail className="h-6 w-6 text-accent" />
                                <h2 className="text-2xl font-semibold text-ink">Contact</h2>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm text-muted">Email</p>
                                    <p className="mt-1 break-all text-ink">{member.profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted">Username</p>
                                    <p className="mt-1 text-ink">@{member.profile.username}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <Clock3 className="h-6 w-6 text-accent" />
                                <h2 className="text-2xl font-semibold text-ink">Last Activity</h2>
                            </div>
                            <div className="rounded-xl border border-border bg-surface-alt p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted">Last Seen</p>
                                        {!isMemberOnline && (
                                            <p className="mt-2 text-ink">
                                                {new Date(member.profile.last_seen).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${isMemberOnline ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-surface-alt text-muted border border-border'}`}>
                                        {isMemberOnline ? 'Active' : 'Offline'}
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