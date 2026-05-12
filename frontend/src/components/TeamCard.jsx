import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowUpRight,
    CalendarDays,
    Users,
    Sparkles
} from "lucide-react"

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

    const handleClick = (e) => {
        navigate(`/team/${team.team_id}`)
    }

    return (
        <div onClick={handleClick}>
            <article
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#112826_0%,#081312_45%,#020404_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-[0_25px_80px_rgba(34,211,238,0.12)]"
            >
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/[0.03] blur-3xl transition duration-500 group-hover:bg-cyan-500/[0.05]"></div>
                <div className="relative flex items-start justify-between gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2dd4bf,#06b6d4,#6366f1)] shadow-lg shadow-cyan-500/10 transition duration-300 group-hover:scale-105">
                        {initials}
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
                        <Sparkles size={12} />
                        Workspace
                    </div>
                </div>
                <div className="relative mt-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white transition duration-300 group-hover:text-cyan-100">
                        {teamName}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-gray-400">
                        Created by{" "}
                        <span className="font-semibold text-white">
                            {createdBy}
                        </span>
                    </p>
                </div>
                <div className="relative mt-8 flex items-center justify-between rounded-[1.5rem] border border-white/5 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays size={15} />
                            <p className="text-[11px] uppercase tracking-[0.25em]">
                                Created
                            </p>
                        </div>
                        <p className="mt-2 text-sm font-medium text-white">
                            {createdAt}
                        </p>
                    </div>
                    <button
                        className="group/button flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition duration-300 hover:border-cyan-300/40 hover:bg-cyan-400/20"
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
