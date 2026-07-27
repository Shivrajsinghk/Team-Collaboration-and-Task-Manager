import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../Features/authslice'
import { useNavigate } from 'react-router-dom'
import {
    MapPin, Mail, Pencil, LogOut, ShieldCheck,
    Globe, GitBranch, Link, Code2, ClipboardList,
    Briefcase, Calendar, CheckCircle2, Clock, Activity, User2
} from 'lucide-react'
import Loading from '../components/Loading'
import { useCurrentUserQuery } from '../hooks/useCurrentUserQuery'
import { useQueryClient } from "@tanstack/react-query"
import NoProfilePhoto from '../components/NoProfilePhoto'

function Profile() {
    const navigate = useNavigate()
    const authUser = useSelector((state) => state.auth.user)
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { data: user } = useCurrentUserQuery({
        initialData: authUser || undefined,
    })

    const handleLogout = () => {
        dispatch(logout())
        queryClient.clear()
        navigate('/')
    }

    if (!user) return <Loading />

    const initials = (user.full_name || user.username || 'U').slice(0, 1).toUpperCase()

    const skills = user.skills
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
                                        <NoProfilePhoto size={96} />
                                    )}
                                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface ${user?.is_online ? 'bg-accent' : 'bg-muted'}`} />
                                </div>
                                <div className="pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-semibold capitalize text-ink leading-tight">
                                            {user.full_name || user.username}
                                        </h1>
                                        <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent uppercase tracking-wider">
                                            You
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted mt-0.5">@{user.username}</p>
                                    {user.job_title && (
                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                                            <Briefcase size={13} className="text-muted" />
                                            <span className="capitalize">{user.job_title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pb-1 items-end">
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {user.location && (
                                        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs text-muted capitalize">
                                            <MapPin size={11} className="text-muted" />
                                            {user.location}
                                        </div>
                                    )}
                                    {user.email && (
                                        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs text-muted">
                                            <Mail size={11} className="text-muted" />
                                            {user.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs text-muted">
                                        <Calendar size={11} className="text-muted" />
                                        Joined {user.joined_at}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-4 py-2 text-xs text-muted hover:border-border-strong hover:text-ink transition-all duration-150"
                                    >
                                        <Pencil size={12} />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/[0.07] px-4 py-2 text-xs text-danger hover:bg-danger/10 transition-all duration-150"
                                    >
                                        <LogOut size={12} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                        {user.bio ? (
                            <p className="mt-5 max-w-xl text-sm text-muted leading-relaxed">{user.bio}</p>
                        ) : (
                            <p className="mt-5 text-sm text-muted italic">
                                No bio yet.{' '}
                                <button onClick={() => navigate('/edit-profile')} className="text-muted underline underline-offset-2 hover:text-ink">
                                    Add one
                                </button>
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Tasks', value: user.total_tasks ?? 0, color: 'text-accent' },
                        { label: 'Status', value: user.is_online ? 'Active' : 'Offline', color: 'text-accent' },
                        { label: 'Skills', value: skills.length || 0, color: 'text-violet-400' },
                        { label: 'Links', value: [user.github_url, user.linkedin_url].filter(Boolean).length, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-2xl capitalize border border-border bg-surface p-4">
                            <p className="text-xs text-muted mb-2">{label}</p>
                            <p className={`text-xl font-semibold ${color}`}>{value}</p>
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
                                <p className="text-sm text-muted italic">
                                    You haven't written anything yet.{' '}
                                    <button onClick={() => navigate('/edit-profile')} className="text-muted underline underline-offset-2 hover:text-ink">
                                        Add one
                                    </button>
                                </p>
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
                                <p className="text-sm text-muted italic">
                                    No skills listed.{' '}
                                    <button onClick={() => navigate('/edit-profile')} className="text-muted underline underline-offset-2 hover:text-ink">
                                        Add some
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <ClipboardList size={16} className="text-muted" />
                                <h2 className="text-sm font-medium text-ink">Task activity</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-alt">
                                    <span className="text-2xl font-semibold text-accent">{user.total_tasks ?? 0}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-ink">
                                        {user.total_tasks === 1 ? '1 task assigned' : `${user.total_tasks ?? 0} tasks assigned`}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">Across all teams and projects</p>
                                </div>
                            </div>
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
                                        <span className="ml-auto text-xs text-muted truncate max-w-[100px]">
                                            {user.github_url.replace('https://', '')}
                                        </span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted hover:border-border-strong hover:text-ink transition-colors"
                                    >
                                        <GitBranch size={15} />
                                        Add GitHub
                                    </button>
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
                                        <span className="ml-auto text-xs text-muted truncate max-w-[100px]">
                                            {user.linkedin_url.replace('https://', '')}
                                        </span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted hover:border-border-strong hover:text-ink transition-colors"
                                    >
                                        <Link size={15} />
                                        Add LinkedIn
                                    </button>
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
                                    { label: 'Full name', value: user.full_name || '—', className: 'capitalize'},
                                    { label: 'Username', value: `@${user.username}` },
                                    { label: 'Email', value: user.email || '—' },
                                    { label: 'Job title', value: user.job_title || '—' },
                                    { label: 'Location', value: user.location || '—' },
                                    { label: 'Status', value: user.is_online ? 'Active': 'Offline', className: 'uppercase text-accent text-xs' },
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                                        <span className="text-muted flex-shrink-0">{label}</span>
                                        <span className={`text-muted text-right truncate ${className || ''}`}>{value}</span>
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

export default Profile
