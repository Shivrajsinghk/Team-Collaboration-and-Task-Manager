import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import UserProfilePfp from './UserProfilePfp'
import TeamMembers from './TeamMembers'
import { Crown, ListTodo, MessagesSquare, SquareCheckBig, Users, CircleDot, LoaderCircle, BadgeCheck, Flame, Minus, ArrowDown, AlertTriangle, ChevronDown } from 'lucide-react'

function getStatusIcon(status) {
    switch(status) {
        case 'todo':
            return (
                <CircleDot className="h-4 w-4 text-cyan-400" />
            )
        case 'in_progress':
            return (
                <LoaderCircle className="h-4 w-4 animate-spin text-yellow-400" />
            )
        case 'done':
            return (
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
            )
        default:
            return null
    }
}
function getPriorityIcon(priority) {
    switch(priority) {
        case 'low':
            return (
                <ChevronDown className="h-4 w-4 text-blue-400" />
            )
        case 'medium':
            return (
                <Flame className="h-4 w-4 text-yellow-400" />
            )
        case 'high':
            return (
                <AlertTriangle className="h-4 w-4 text-red-400" />
            )
        default:
            return null
    }
}

function TaskDashboard() {
    const { id, task_id } = useParams()
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTask() {
            try {
                const response = await api.get(
                    `teams/${id}/tasks/${task_id}`
                )
                setTask(response.data)
            } 
            catch (err) {
                console.log(err?.response || err)
            }
            finally {
                setLoading(false)
            }
        }
        fetchTask()
    }, [id, task_id])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-400">
                Loading task...
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex h-full items-center justify-center text-red-400">
                Task not found
            </div>
        )
    }

    return (
        <div className="min-h-screen ml-3 bg-[#020404] p-6 text-white">
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#081312] p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight">
                            <SquareCheckBig size={32} className="text-cyan-400" />
                            {task.title.slice(0,1).toUpperCase()}{task.title.slice(1,)}
                        </h1>
                        <p className="mt-2 text-zinc-400 first-letter:capitalize">
                            {task.description || "No description provided"}
                        </p>
                    </div>
                    <div className="flex gap-3 flex-col">
                        <div className="
                            flex items-center gap-2
                            rounded-xl border border-cyan-500/20
                            bg-cyan-500/10 px-4 py-2
                            text-sm font-medium text-cyan-300
                        ">
                            {getStatusIcon(task.status)}
                            {task.status.toUpperCase()}
                        </div>
                        <div className="
                            flex items-center gap-2
                            rounded-xl border border-indigo-500/20
                            bg-indigo-500/10 px-4 py-2
                            text-sm font-medium text-indigo-300
                        ">
                            {getPriorityIcon(task.priority)}
                            {task.priority.toUpperCase()}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
                    <div>
                        Team:
                        <span className="ml-2 text-white">
                            {task.team}
                        </span>
                    </div>
                    <div>
                        Due:
                        <span className="ml-2 text-white">
                            {task.due_date
                                ? new Date(task.due_date).toLocaleDateString()
                                : "No due date"}
                        </span>
                    </div>
                    <div>
                        Created:
                        <span className="ml-2 text-white">
                            {new Date(task.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-3xl border border-white/10 bg-[#081312] p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <Users className="text-teal-300" size={24} />
                            <h2 className="text-2xl font-bold text-white">
                                Assigned Members
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {task.assigned_to.map((member) => (
                                <div
                                    key={member.id}
                                    className="
                                        flex items-center justify-between
                                        rounded-2xl border border-white/5
                                        bg-white/[0.02] hover:bg-white/[0.035] p-4 
                                        hover:border-cyan-500/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <UserProfilePfp memberUser={member}/>
                                        <div>
                                            <p className="font-medium text-[var(--color-mint-cream)]">
                                                {member.first_name}{' '}
                                                {member.last_name}
                                            </p>
                                            <p className="text-sm text-[var(--color-cool-steel)]">
                                                @{member.username}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="
                                        px-4 py-2
                                        rounded-full
                                        text-xs
                                        font-medium
                                        capitalize
                                        bg-cyan-400/8
                                        text-cyan-300
                                        border border-cyan-500/20
                                        "
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-[#081312] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <Crown className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-lg font-semibold">
                                Created By
                            </h2>
                        </div>                        
                        <div className="flex items-center gap-4">
                            <div className="
                                flex h-12 w-12 items-center justify-center
                                rounded-2xl bg-gradient-to-br
                                from-cyan-400 to-indigo-500
                                font-bold text-white
                            ">
                                <UserProfilePfp memberUser={task.created_by}/>
                            </div>
                            <div>
                                <p className="font-medium first-letter:capitalize">
                                    {task.created_by.username}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-dashed border-white/10 bg-[#081312] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <ListTodo className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold">
                                Subtasks / Checklist
                            </h2>
                        </div>
                        <p className="text-zinc-500">
                            You can add subtasks here later.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-dashed border-white/10 bg-[#081312] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <MessagesSquare className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold">
                                Comments & Activity
                            </h2>
                        </div>
                        <p className="text-zinc-500">
                            Team discussions will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDashboard