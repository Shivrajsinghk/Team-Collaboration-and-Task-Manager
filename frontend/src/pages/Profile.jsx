import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setUser } from '../Features/authslice'
import { useNavigate } from 'react-router-dom'
import {
    MapPin, Mail, Pencil, LogOut, ShieldCheck,
    Globe, GitBranch, Link, Code2, ClipboardList,
    Briefcase, Calendar, CheckCircle2, Clock, Activity, User2
} from 'lucide-react'
import Loading from '../components/Loading'
import { getUserProfile } from '../api/auth'

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

function getMediaUrl(baseUrl, path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function Profile() {
    const navigate = useNavigate()
    const authUser = useSelector((state) => state.auth.user)
    const [user, setLocalUser] = useState(authUser)
    const dispatch = useDispatch()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile()
                setLocalUser(response.data)
                console.log('Fetched user profile:', response.data)
                dispatch(setUser(response.data))
            } catch (error) {
                console.log(error)
                if (error.response?.status === 401) {
                    dispatch(logout())
                    navigate('/')
                }
            }
        }
        fetchProfile()
    }, [dispatch, navigate])

    if (!user) return <Loading />

    const initials = (user.full_name || user.username || 'U').slice(0, 1).toUpperCase()

    const skills = user.skills
        ? user.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

    return (
        <div className="min-h-screen bg-black p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-zinc-950">
                    <div className="absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-3xl pointer-events-none" />
                    <div className="h-28 bg-gradient-to-r from-zinc-900 via-zinc-800/60 to-zinc-900" />
                    <div className="relative px-6 pb-6 md:px-8 md:pb-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between -mt-14">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="relative flex-shrink-0">
                                    {user.profile_picture ? (
                                        <img
                                            src={getMediaUrl(BASE_URL, user.profile_picture)}
                                            alt={user.full_name}
                                            className="h-24 w-24 rounded-2xl border-2 border-zinc-900 object-cover shadow-xl"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 rounded-2xl border-2 border-zinc-900 bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-3xl font-semibold text-white shadow-xl">
                                            {initials}
                                        </div>
                                    )}
                                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-zinc-950 ${user?.is_online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                </div>
                                <div className="pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-semibold capitalize text-white leading-tight">
                                            {user.full_name || user.username}
                                        </h1>
                                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                                            You
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-0.5">@{user.username}</p>
                                    {user.job_title && (
                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                                            <Briefcase size={13} className="text-zinc-600" />
                                            <span className="capitalize">{user.job_title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pb-1 items-end">
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {user.location && (
                                        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 capitalize">
                                            <MapPin size={11} className="text-zinc-600" />
                                            {user.location}
                                        </div>
                                    )}
                                    {user.email && (
                                        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                                            <Mail size={11} className="text-zinc-600" />
                                            {user.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                                        <Calendar size={11} className="text-zinc-600" />
                                        Joined {user.joined_at}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-zinc-300 hover:border-white/[0.15] hover:text-white transition-all duration-150"
                                    >
                                        <Pencil size={12} />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all duration-150"
                                    >
                                        <LogOut size={12} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                        {user.bio ? (
                            <p className="mt-5 max-w-xl text-sm text-zinc-400 leading-relaxed">{user.bio}</p>
                        ) : (
                            <p className="mt-5 text-sm text-zinc-700 italic">
                                No bio yet.{' '}
                                <button onClick={() => navigate('/edit-profile')} className="text-zinc-600 underline underline-offset-2 hover:text-zinc-400">
                                    Add one
                                </button>
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Tasks', value: user.total_tasks ?? 0, color: 'text-cyan-400' },
                        { label: 'Status', value: user.is_online ? 'Active' : 'Offline', color: 'text-emerald-400' },
                        { label: 'Skills', value: skills.length || 0, color: 'text-violet-400' },
                        { label: 'Links', value: [user.github_url, user.linkedin_url].filter(Boolean).length, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-2xl capitalize border border-white/[0.06] bg-zinc-950 p-4">
                            <p className="text-xs text-zinc-600 mb-2">{label}</p>
                            <p className={`text-xl font-semibold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <User2 size={16} className="text-zinc-600" />
                                <h2 className="text-sm font-medium text-zinc-300">About</h2>
                            </div>
                            {user.about ? (
                                <p className="text-sm text-zinc-500 leading-relaxed">{user.about}</p>
                            ) : (
                                <p className="text-sm text-zinc-700 italic">
                                    You haven't written anything yet.{' '}
                                    <button onClick={() => navigate('/edit-profile')} className="text-zinc-600 underline underline-offset-2 hover:text-zinc-400">
                                        Add one
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Code2 size={16} className="text-zinc-600" />
                                <h2 className="text-sm font-medium text-zinc-300">Skills</h2>
                            </div>
                            {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-700 italic">
                                    No skills listed.{' '}
                                    <button onClick={() => navigate('/edit-profile')} className="text-zinc-600 underline underline-offset-2 hover:text-zinc-400">
                                        Add some
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <ClipboardList size={16} className="text-zinc-600" />
                                <h2 className="text-sm font-medium text-zinc-300">Task activity</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                    <span className="text-2xl font-semibold text-cyan-400">{user.total_tasks ?? 0}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">
                                        {user.total_tasks === 1 ? '1 task assigned' : `${user.total_tasks ?? 0} tasks assigned`}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-0.5">Across all teams and projects</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Globe size={16} className="text-zinc-600" />
                                <h2 className="text-sm font-medium text-zinc-300">Links</h2>
                            </div>
                            <div className="space-y-2">
                                {user.github_url ? (
                                    <a
                                        href={user.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400 hover:border-white/10 hover:text-zinc-300 transition-colors"
                                    >
                                        <GitBranch size={15} className="text-zinc-600" />
                                        GitHub
                                        <span className="ml-auto text-xs text-zinc-700 truncate max-w-[100px]">
                                            {user.github_url.replace('https://', '')}
                                        </span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/[0.06] px-4 py-3 text-sm text-zinc-700 hover:border-white/10 hover:text-zinc-500 transition-colors"
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
                                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400 hover:border-white/10 hover:text-zinc-300 transition-colors"
                                    >
                                        <Link size={15} className="text-zinc-600" />
                                        LinkedIn
                                        <span className="ml-auto text-xs text-zinc-700 truncate max-w-[100px]">
                                            {user.linkedin_url.replace('https://', '')}
                                        </span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/[0.06] px-4 py-3 text-sm text-zinc-700 hover:border-white/10 hover:text-zinc-500 transition-colors"
                                    >
                                        <Link size={15} />
                                        Add LinkedIn
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Activity size={16} className="text-zinc-600" />
                                <h2 className="text-sm font-medium text-zinc-300">Info</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Full name', value: user.full_name || '—', className: 'capitalize'},
                                    { label: 'Username', value: `@${user.username}` },
                                    { label: 'Email', value: user.email || '—' },
                                    { label: 'Job title', value: user.job_title || '—' },
                                    { label: 'Location', value: user.location || '—' },
                                    { label: 'Status', value: user.is_online ? 'Active': 'Offline', className: 'uppercase text-green-500 text-xs' },
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                                        <span className="text-zinc-600 flex-shrink-0">{label}</span>
                                        <span className={`text-zinc-400 text-right truncate ${className || ''}`}>{value}</span>
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