import React, { useState, useEffect, useRef } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { search } from '../api/auth'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { authKeys, taskKeys, teamKeys } from '../api/queryKeys'
import { getTeam } from '../api/teams'
import { getTask } from '../api/tasks'

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'todo', label: 'To do' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS = [
    { value: '', label: 'All priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
]

const TASK_SORT_OPTIONS = [
    { value: '-created_at', label: 'Newest first' },
    { value: 'created_at', label: 'Oldest first' },
    { value: 'due_date', label: 'Due date (soonest)' },
    { value: '-due_date', label: 'Due date (latest)' },
    { value: 'title', label: 'Title A-Z' },
    { value: '-title', label: 'Title Z-A' },
    { value: 'priority', label: 'Priority high-low' },
    { value: '-priority', label: 'Priority low-high' },
]

const TEAM_SORT_OPTIONS = [
    { value: '-created_at', label: 'Newest first' },
    { value: 'created_at', label: 'Oldest first' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
]

const DEFAULT_FILTERS = {
    status: '',
    priority: '',
    sort_tasks: '-created_at',
    sort_teams: '-created_at',
}

function Searchbar() {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const debounceRef = useRef(null)
    const wrapperRef = useRef(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const activeFilterCount = Object.keys(DEFAULT_FILTERS).filter(
        (key) => filters[key] !== DEFAULT_FILTERS[key]
    ).length

    const { data: results = { users: [], teams: [], tasks: [] }, isFetching: loading } = useQuery({
        queryKey: authKeys.search(debouncedQuery, filters),
        queryFn: async () => {
            const response = await search(debouncedQuery, filters)
            return response.data
        },
        enabled: !!debouncedQuery.trim(),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
        select: (data) => ({
            users: data.users || [],
            teams: data.teams || [],
            tasks: data.tasks || [],
        }),
    })

    useEffect(() => {
        if (!query.trim()) {
            setDebouncedQuery('')
            setOpen(false)
            return
        }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(query.trim())
            setOpen(true)
        }, 250)
        return () => clearTimeout(debounceRef.current)
    }, [query])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
                setFocused(false)
                setFilterOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => setFilters(DEFAULT_FILTERS)

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`)
        setOpen(false)
        setQuery('')
    }

    const handleTeamClick = (teamId) => {
        navigate(`/team/${teamId}`)
        clearSearch()
    }

    const handleTaskClick = (teamId, taskId) => {
        navigate(`/team/${teamId}/tasks/${taskId}`)
        clearSearch()
    }

    const clearSearch = () => {
        setQuery('')
        setDebouncedQuery('')
        setOpen(false)
        setFilterOpen(false)
    }

    const prefetchTeam = (teamId) => {
        queryClient.prefetchQuery({
            queryKey: teamKeys.detail(teamId),
            queryFn: async () => {
                const response = await getTeam(teamId)
                return response.data
            },
            staleTime: 2 * 60 * 1000,
        })
    }

    const prefetchTask = (teamId, taskId) => {
        queryClient.prefetchQuery({
            queryKey: taskKeys.detail(teamId, taskId),
            queryFn: async () => {
                const response = await getTask(teamId, taskId)
                return response.data
            },
            staleTime: 30 * 1000,
        })
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
                {query && (
                    <button
                        onClick={() => setFilterOpen((v) => !v)}
                        className={`relative flex-shrink-0 transition-colors ${
                            filterOpen || activeFilterCount > 0 ? 'text-teal-400' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                    >
                        <SlidersHorizontal size={14} />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-[9px] font-medium text-black">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {filterOpen && query && (
                <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-xl border border-white/[0.06] bg-[#0d1512] p-3.5 shadow-xl shadow-black/40">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                Task status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className="w-full rounded-lg border border-white/[0.06] bg-[#0a100e] px-2.5 py-1.5 text-[12px] text-zinc-300 focus:border-teal-500/30 focus:outline-none"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                Task priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => updateFilter('priority', e.target.value)}
                                className="w-full rounded-lg border border-white/[0.06] bg-[#0a100e] px-2.5 py-1.5 text-[12px] text-zinc-300 focus:border-teal-500/30 focus:outline-none"
                            >
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                Sort tasks
                            </label>
                            <select
                                value={filters.sort_tasks}
                                onChange={(e) => updateFilter('sort_tasks', e.target.value)}
                                className="w-full rounded-lg border border-white/[0.06] bg-[#0a100e] px-2.5 py-1.5 text-[12px] text-zinc-300 focus:border-teal-500/30 focus:outline-none"
                            >
                                {TASK_SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                Sort teams
                            </label>
                            <select
                                value={filters.sort_teams}
                                onChange={(e) => updateFilter('sort_teams', e.target.value)}
                                className="w-full rounded-lg border border-white/[0.06] bg-[#0a100e] px-2.5 py-1.5 text-[12px] text-zinc-300 focus:border-teal-500/30 focus:outline-none"
                            >
                                {TEAM_SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="mt-2.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            )}

            {open && !filterOpen && (
                <div className="absolute top-full left-0 z-50 mt-1.5 w-full max-h-[75vh] overflow-y-auto overflow-x-hidden rounded-xl border border-white/[0.06] bg-[#0d1512] shadow-xl shadow-black/40 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
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
                            onMouseEnter={() => prefetchTeam(team.id)}
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
                            onMouseEnter={() => prefetchTask(task.team_id, task.id)}
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