import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Users } from "lucide-react"
import { useQueryClient } from '@tanstack/react-query'
import { getTeam } from '../api/teams'
import { teamKeys } from '../api/queryKeys'

function formatCreatedAt(value) {
    if (!value) return 'Recently created'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

function TeamCard({ team }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const teamInfo = team?.team ?? {}
    const teamName = teamInfo.name || 'Untitled Team'
    const createdBy = teamInfo.created_by || 'Unknown creator'
    const createdAt = formatCreatedAt(teamInfo.created_at)
    const initials = teamName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'TM'

    const handleClick = () => {
        navigate(`/team/${team.team_id}`)
    }

    const handlePrefetch = () => {
        queryClient.prefetchQuery({
            queryKey: teamKeys.detail(team.team_id),
            queryFn: async () => {
                const response = await getTeam(team.team_id)
                return response.data
            },
            staleTime: 2 * 60 * 1000,
        })
    }

    return (
        <div onClick={handleClick} onMouseEnter={handlePrefetch}>
            <article
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-[0_25px_80px_rgba(44,255,5,0.10)]"
            >
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/[0.03] blur-3xl transition duration-500 group-hover:bg-accent/[0.05]"></div>
                <div className="relative flex items-start justify-between gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-hover text-accent-ink font-bold shadow-lg shadow-accent/10 transition duration-300 group-hover:scale-105">
                        {initials}
                    </div>
                    <div className="relative flex flex-col items-center justify-center">
                        <span className="text-sm font-extrabold tracking-wider text-[#2CFF05] leading-none origin-center transition-transform duration-150 group-hover:scale-y-[0.1]">
                            OO
                        </span>
                        <span className="text-[10px] mt-[0.1rem] text-[#2CFF05] font-extrabold leading-none">
                            ⌣
                        </span>
                    </div>
                </div>
                <div className="relative mt-8">
                    <h2 className="text-2xl capitalize font-bold tracking-tight text-ink transition duration-300 group-hover:text-accent">
                        {teamName}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-muted">
                        Created by{" "}
                        <span className="font-semibold text-ink">
                            @{createdBy}
                        </span>
                    </p>
                </div>
                <div className="relative mt-8 flex items-center justify-between rounded-[1.5rem] border border-border bg-surface-alt px-5 py-4 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-2 text-muted">
                            <CalendarDays size={15} />
                            <p className="text-[11px] uppercase tracking-[0.25em]">
                                Created
                            </p>
                        </div>
                        <p className="mt-2 text-sm font-medium text-ink">
                            {createdAt}
                        </p>
                    </div>
                    <button
                        className="group/button flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition duration-300 hover:border-accent/40 hover:bg-accent/20"
                    >
                        Open
                        <ArrowUpRight
                            size={16}
                            className="transition duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                        />
                    </button>
                </div>
            </article>
        </div>
    )
}

export default TeamCard