import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    MapPin,
    Calendar,
    Globe,
    ExternalLink,
    User2,
    Activity,
    Briefcase,
    Code2,
    CheckCircle2,
    Clock,
    ClipboardList,
    GitBranch,
    Link, 
    Send,
    Beaker
} from 'lucide-react'
import Loading from '../components/Loading'
import { getPublicUserProfile } from '../api/auth'
import { getOrCreateDirectConversation } from '../api/chat'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { authKeys, chatKeys } from '../api/queryKeys'
import NoProfilePhoto from '../components/NoProfilePhoto'

function PublicProfile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: user, isLoading: loading } = useQuery({
        queryKey: authKeys.publicProfile(username),
        queryFn: async () => {
            const response = await getPublicUserProfile(username)
            return response.data
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    const startConversationMutation = useMutation({
        mutationFn: (userId) => getOrCreateDirectConversation(userId),
        onSuccess: (response, userId) => {
            queryClient.setQueryData(chatKeys.directConversation(userId), response.data)
            navigate(`/messages/${response.data.id}`)
        },
    })

    const formatLastSeen = (iso) => {
        if (!iso) return null
        const date = new Date(iso)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000)
        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    if (loading || !user) {
        return (
            <Loading />
        )
    }

    const handleMessageClick = async () => {
        if (!user?.id) return
        startConversationMutation.mutate(user.id)
    }

    const skills = user['skills']
        ? user.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

    return (
        <div className="min-h-screen bg-base p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
                    <div className="absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl pointer-events-none" />
                    <div className="h-28 bg-gradient-to-r from-surface-alt via-surface to-surface-alt" />
                    <div className="relative px-6 pb-6 md:px-8 md:pb-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between -mt-14">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="relative flex-shrink-0">
                                    {user.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.full_name}
                                            className="h-24 w-24 rounded-2xl border-2 border-surface object-cover shadow-xl"
                                        />
                                    ) : (
                                        <NoProfilePhoto size={108} />
                                    )}
                                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface ${user?.is_online ? 'bg-accent' : 'bg-muted'}`} />
                                </div>
                                <div className="pb-1">
                                    <h1 className="text-2xl font-semibold capitalize text-ink leading-tight">
                                        {user.full_name || user.username}
                                    </h1>
                                    <p className="text-sm text-muted mt-0.5">@{user.username}</p>
                                    {user.job_title && (
                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                                            <Briefcase size={13} className="text-muted" />
                                            {user.job_title}
                                        </div>
                                    )}
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                                        {user?.is_online ? (
                                            <>
                                                <CheckCircle2 size={12} className="text-accent" />
                                                <span className="text-accent">Active now</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={12} />
                                                Last seen {formatLastSeen(user.last_seen)}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pb-1">
                                {user.location && (
                                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs text-muted">
                                        <MapPin size={11} className="text-muted" />
                                        {user.location}
                                    </div>
                                )}
                                <div 
                                onClick={() =>
                                    handleMessageClick()
                                }
                                className="flex items-center gap-1.5 cursor-pointer rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs text-accent"
                                >
                                    <Send size={12} className="text-accent" />
                                    <span className="text-sm">Message</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs text-muted">
                                    <Calendar size={12} className="text-muted" />
                                    Joined {new Date(user.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        {user.bio ? (
                            <p className="mt-5 max-w-xl text-sm text-muted leading-relaxed">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="mt-5 text-sm text-muted italic">No bio yet.</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Tasks', value: user.total_tasks ?? 0, color: 'text-accent' },
                        { label: 'Status', value: user.is_online ? 'Active' : 'Offline' },
                        { label: 'Skills', value: skills.length || '—', color: 'text-violet-400' },
                        { label: 'Links', value: [user.github_url, user.linkedin_url].filter(Boolean).length, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-2xl capitalize border border-border bg-surface p-4">
                            <p className="text-xs text-muted mb-2">{label}</p>
                            <p className={`text-xl font-semibold ${color || 'text-ink'}`}>{value}</p>
                        </div>
                    ))}
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <User2 size={16} className="text-muted" />
                                <h2 className="text-sm font-medium text-ink">About</h2>
                            </div>
                            {user.about ? (
                                <p className="text-sm text-muted leading-relaxed">{user.about}</p>
                            ) : (
                                <p className="text-sm text-muted italic">This user hasn't written anything yet.</p>
                            )}
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Code2 size={16} className="text-muted" />
                                <h2 className="text-sm font-medium text-ink">Skills</h2>
                            </div>
                            {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-lg border border-border bg-surface-alt px-3 py-1 text-xs text-muted"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted italic">No skills listed.</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Globe size={16} className="text-muted" />
                                <h2 className="text-sm font-medium text-ink">Links</h2>
                            </div>
                            <div className="space-y-2">
                                {user.github_url ? (
                                    <a
                                        href={user.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-muted hover:border-border-strong hover:text-ink transition-colors"
                                    >
                                        <GitBranch size={15} className="text-muted" />
                                        GitHub
                                        <ExternalLink size={11} className="ml-auto text-muted" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                                        <GitBranch size={15} />
                                        GitHub not linked
                                    </div>
                                )}
                                {user.linkedin_url ? (
                                    <a
                                        href={user.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-muted hover:border-border-strong hover:text-ink transition-colors"
                                    >
                                        <Link size={15} className="text-muted" />
                                        LinkedIn
                                        <ExternalLink size={11} className="ml-auto text-muted" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                                        <Link size={15} />
                                        LinkedIn not linked
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Activity size={16} className="text-muted" />
                                <h2 className="text-sm font-medium text-ink">Info</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Full name', value: user.full_name || '—' },
                                    { label: 'Username', value: `@${user.username}` },
                                    { label: 'Job title', value: user.job_title || '—' },
                                    { label: 'Location', value: user.location || '—' },
                                    { label: 'Status', value: user.is_online ? 'Active' : 'Offline' }
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex capitalize items-start justify-between gap-4 text-sm">
                                        <span className="text-muted flex-shrink-0">{label}</span>
                                        <span className="text-muted text-right truncate">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicProfile
