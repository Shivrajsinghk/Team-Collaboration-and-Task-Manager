import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { search } from '../api/auth'

function Searchbar() {
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState([])
    const [results, setResults] = useState({
        users: [],
        teams: [],
        tasks: []
    })
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const debounceRef = useRef(null)
    const wrapperRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!query.trim()) {
            setResults({
                users: [],
                teams: [],
                tasks: []
            })
            setOpen(false)
            return
        }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await search(query)
                setResults({
                    users: response.data.users || [],
                    teams: response.data.teams || [],
                    tasks: response.data.tasks || []
                })
                console.log('Search results:', response.data)
                setOpen(true)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 250)
        return () => clearTimeout(debounceRef.current)
    }, [query])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
                setFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`)
        setOpen(false)
        setQuery('')
        setUsers([])
    }

    const handleTeamClick = (teamId) => {
        navigate(`/team/${teamId}`)
        clearSearch()
    }

    const handleTaskClick = (teamId, taskId) => {
        navigate(`team/${teamId}/tasks/${taskId}`)
        clearSearch()
    }

    const clearSearch = () => {
        setQuery('')
        setResults({
            users: [],
            teams: [],
            tasks: []
        })
        setOpen(false)
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-200 ${
                focused
                    ? 'border-teal-500/30 bg-[#0d1512]'
                    : 'border-white/[0.06] bg-[#0a100e]'
            }`}>
                {loading ? (
                    <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-400" />
                ) : (
                    <Search size={15} className={`flex-shrink-0 transition-colors duration-200 ${focused ? 'text-teal-500' : 'text-zinc-600'}`} />
                )}
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    type="text"
                    placeholder="Search people, teams, tasks..."
                    className="w-full bg-transparent text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                />
                {query && (
                    <button onClick={clearSearch} className="flex-shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors">
                        <X size={13} />
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d1512] shadow-xl shadow-black/40">
                    {results.users.length > 0 && (
                    <>
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.04]">
                            People
                        </div>
                        {results.users.map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => handleUserClick(user.username)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors duration-100 ${
                            index !== results.users.length - 1
                                ? "border-b border-white/[0.04]"
                                : ""
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                {user.profile_picture ? (
                                <img src={`http://localhost:8000${user.profile_picture}`} alt={user.username}
                                    className="h-9 w-9 rounded-lg object-cover" />
                                ) : (
                                <div
                                    className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-sm font-medium text-white">
                                    {(user.first_name || user.username)
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </div>
                                )}

                                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#0d1512]
                                    ${ user.status==="active" ? "bg-emerald-400" : "bg-zinc-600" }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-zinc-200 capitalize truncate">
                                    {user.full_name ||
                                    user.first_name ||
                                    user.username}
                                </p>
                                <p className="text-[11px] text-zinc-600 truncate">
                                    @{user.username}
                                </p>
                            </div>
                            {user.location && (
                            <span className="flex-shrink-0 text-[11px] text-zinc-700 hidden sm:block">
                                {user.job_title
                                ? `• ${user.job_title} at ${user.location}`
                                : user.location}
                            </span>
                            )}
                        </button>
                        ))}
                    </>
                    )}
                    {results.teams.length > 0 && (
                    <>
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.04]">
                            Teams
                        </div>
                        {results.teams.map((team, index) => (
                        <button
                            key={team.id}
                            onClick={() => handleTeamClick(team.id)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors duration-100 ${
                            index !== results.teams.length - 1
                                ? "border-b border-white/[0.04]"
                                : ""
                            }`}
                        >
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center text-sm font-medium text-white">
                                {team.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-zinc-200 truncate">
                                    {team.name}
                                </p>
                                <p className="text-[11px] text-zinc-600 truncate">
                                    {team.member_count} members
                                </p>
                            </div>
                            <span className="text-[11px] text-zinc-700">
                                {team.task_count} tasks
                            </span>
                        </button>
                        ))}
                    </>
                    )}
                    {results.tasks.length > 0 && (
                    <>
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.04]">
                            Tasks
                        </div>
                        {results.tasks.map((task, index) => (
                        <button
                            key={task.id}
                            onClick={() => handleTaskClick(task.team_id, task.id)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors duration-100 ${
                            index !== results.tasks.length - 1
                                ? "border-b border-white/[0.04]"
                                : ""
                            }`}
                        >
                            <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium text-white ${
                                task.status === "done"
                                ? "bg-emerald-400"
                                : task.status === "in_progress"
                                ? "bg-amber-400"
                                : task.status === "todo"
                                ? "bg-blue-400"
                                : "bg-zinc-500"
                            }`}
                            >
                                ✓
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-[13px] font-medium text-zinc-200">
                                    {task.title}
                                </p>
                                <p className="text-[11px] text-zinc-600 truncate">
                                    {task.team || "Team"}
                                </p>
                            </div>
                            <span
                            className={`text-[11px] capitalize ${
                            task.status === "done"
                                ? "text-emerald-400"
                                : task.status === "in_progress"
                                ? "text-amber-400"
                                : task.status === "todo"
                                ? "text-blue-400"
                                : "text-zinc-500"
                            }`}
                            >
                                {task.status.replace("_", " ")}
                            </span>
                        </button>
                        ))}
                    </>
                    )}
                    {!loading &&
                    query.trim() &&
                    results.users.length === 0 &&
                    results.teams.length === 0 &&
                    results.tasks.length === 0 && (
                        <div className="px-4 py-5 text-center text-[13px] text-zinc-600">
                            No results for{" "}
                            <span className="text-zinc-500">"{query}"</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Searchbar