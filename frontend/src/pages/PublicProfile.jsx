import React, { useEffect, useState } from 'react'
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
import api from '../api/axios'

function PublicProfile() {
    const { username } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

    useEffect(() => {
        const fetchProfile = async () => {
            try{
                const response = await getPublicUserProfile(username)
                setUser(response.data)
                console.log("user", response.data)
            } 
            catch(err){
                console.log(err)
            } 
            finally{
                setLoading(false)
            }
        }
        fetchProfile()
    }, [username])

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
        try{
            const response = await api.get(`sockets/user/${user.id}/chats/`)
            navigate(`/messages/${response.data.id}`)
        }
        catch (err) {
            console.log(err)
        }
    }

    const skills = user['skills']
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
                                            src={`${BASE_URL}${user.profile_picture}`}
                                            alt={user.full_name}
                                            className="h-24 w-24 rounded-2xl border-2 border-zinc-900 object-cover shadow-xl"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-400 to-indigo-500 text-7xl font-bold text-white">
                                            {(user.full_name || user.username).slice(0,1)}
                                        </div>
                                    )}
                                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-zinc-950 ${user?.is_online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                </div>
                                <div className="pb-1">
                                    <h1 className="text-2xl font-semibold capitalize text-white leading-tight">
                                        {user.full_name || user.username}
                                    </h1>
                                    <p className="text-sm text-zinc-500 mt-0.5">@{user.username}</p>
                                    {user.job_title && (
                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                                            <Briefcase size={13} className="text-zinc-600" />
                                            {user.job_title}
                                        </div>
                                    )}
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600">
                                        {user?.is_online ? (
                                            <>
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                <span className="text-emerald-600">Active now</span>
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
                                    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                                        <MapPin size={11} className="text-zinc-600" />
                                        {user.location}
                                    </div>
                                )}
                                <div 
                                onClick={() =>
                                    handleMessageClick()
                                }
                                className="flex items-center gap-1.5 cursor-pointer rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400"
                                >
                                    <Send size={12} className="text-zinc-600" />
                                    <span className="text-sm">Message</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                                    <Calendar size={12} className="text-zinc-600" />
                                    Joined {new Date(user.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        {user.bio ? (
                            <p className="mt-5 max-w-xl text-sm text-zinc-400 leading-relaxed">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="mt-5 text-sm text-zinc-700 italic">No bio yet.</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Tasks', value: user.total_tasks ?? 0, color: 'text-cyan-400' },
                        { label: 'Status', value: user.is_online ? 'Active' : 'Offline' },
                        { label: 'Skills', value: skills.length || '—', color: 'text-violet-400' },
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
                                <p className="text-sm text-zinc-700 italic">This user hasn't written anything yet.</p>
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
                                <p className="text-sm text-zinc-700 italic">No skills listed.</p>
                            )}
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
                                        <ExternalLink size={11} className="ml-auto text-zinc-700" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-sm text-zinc-700">
                                        <GitBranch size={15} />
                                        GitHub not linked
                                    </div>
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
                                        <ExternalLink size={11} className="ml-auto text-zinc-700" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-sm text-zinc-700">
                                        <Link size={15} />
                                        LinkedIn not linked
                                    </div>
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
                                    { label: 'Full name', value: user.full_name || '—' },
                                    { label: 'Username', value: `@${user.username}` },
                                    { label: 'Job title', value: user.job_title || '—' },
                                    { label: 'Location', value: user.location || '—' },
                                    { label: 'Status', value: user.is_online ? 'Active' : 'Offline' }
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex capitalize items-start justify-between gap-4 text-sm">
                                        <span className="text-zinc-600 flex-shrink-0">{label}</span>
                                        <span className="text-zinc-400 text-right truncate">{value}</span>
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
