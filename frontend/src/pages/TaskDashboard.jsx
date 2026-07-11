import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTask } from '../api/tasks'
import Loading from '../components/Loading'
import UserProfilePfp from '../components/UserProfilePfp'
import PreviousPageButton from '../components/PreviousPageButton'
import RightSlideDrawer from '../components/RightSlideDrawer'
import TaskActivity from '../components/TaskActivity'
import { Crown, SquareCheckBig, Users, CircleDot, LoaderCircle, BadgeCheck, Flame, AlertTriangle, ChevronDown, Settings } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { taskKeys } from '../api/queryKeys'

const STATUS_STYLES = {
    todo: { badge: 'border-border bg-surface-alt text-muted', icon: <CircleDot className="h-4 w-4" /> },
    in_progress: { badge: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300', icon: <LoaderCircle className="h-4 w-4 animate-spin" /> },
    done: { badge: 'border-accent/20 bg-accent/10 text-accent', icon: <BadgeCheck className="h-4 w-4" /> },
}

const PRIORITY_STYLES = {
    low: { badge: 'border-border bg-surface-alt text-muted', icon: <ChevronDown className="h-4 w-4" /> },
    medium: { badge: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300', icon: <Flame className="h-4 w-4" /> },
    high: { badge: 'border-danger/20 bg-danger/10 text-danger', icon: <AlertTriangle className="h-4 w-4" /> },
}

function TaskDashboard() {
    const { team_id, task_id } = useParams()
    const [isSlideDrawerOpen, setIsSlideDrawerOpen] = useState(false)
    const navigate = useNavigate()
    const { data: task = null, isLoading: loading } = useQuery({
        queryKey: taskKeys.detail(team_id, task_id),
        queryFn: async () => {
            const response = await getTask(team_id, task_id)
            return response.data
        },
        enabled: !!team_id && !!task_id,
        staleTime: 30 * 1000,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    })

    useEffect(() => {
        if (isSlideDrawerOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isSlideDrawerOpen])

    if (loading) {
        return (
            <Loading />
        )
    }

    if (!task) {
        return (
            <div className="flex h-full items-center justify-center text-danger">
                Task not found
            </div>
        )
    }

    const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.todo
    const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low

    return (
        <>
            <div className="relative min-h-screen ml-3 bg-base p-6 text-ink">
                <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                    <div className="flex items-start justify-between">
                        <div className='flex flex-col gap-6'>
                            <div>
                                <div className='flex flex-row gap-4'>
                                    <div className="mb-4">
                                        <PreviousPageButton className="text-ink" />
                                    </div>
                                    <h1 className="flex items-center gap-3 mb-4 text-4xl font-bold tracking-tight">
                                        <SquareCheckBig size={32} className="text-accent" />
                                        {task.title?.slice(0,1).toUpperCase()}{task.title?.slice(1,)}
                                    </h1> 
                                </div>
                                <p className="mt-2 text-muted first-letter:capitalize">
                                    {task.description || "No description provided"}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-6 text-sm text-muted">
                                <div>
                                    Team:
                                    <span className="ml-2 text-ink">
                                        {task.team}
                                    </span>
                                </div>
                                <div>
                                    Due:
                                    <span className="ml-2 text-ink">
                                        {task.due_date
                                            ? new Date(task.due_date).toLocaleDateString()
                                            : "No due date"}
                                    </span>
                                </div>
                                <div>
                                    Created:
                                    <span className="ml-2 text-ink">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-col">
                            <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${statusStyle.badge}`}>
                                {statusStyle.icon}
                                {task.status?.toUpperCase()}
                            </div>
                            <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${priorityStyle.badge}`}>
                                {priorityStyle.icon}
                                {task.priority?.toUpperCase()}
                            </div>
                            <button
                                onClick={()=>setIsSlideDrawerOpen(true)}
                                disabled={!task.can_edit}
                                className="
                                flex items-center gap-2
                                rounded-xl
                                border border-border
                                bg-surface-alt
                                px-4 py-2
                                text-sm font-medium
                                cursor-pointer
                                text-ink
                                transition-colors duration-150
                                hover:border-accent
                                hover:text-accent
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                disabled:hover:border-border
                                disabled:hover:text-muted
                                "
                            >
                                <Settings size={18} />
                                Task Settings
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex mb-6 gap-6">
                    <div className="flex-1">
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Users className="text-accent" size={24} />
                                <h2 className="text-2xl font-bold text-ink">
                                    Assigned Members
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {task.assigned_to?.map((member) => (
                                    <div
                                        onClick={()=>{navigate(`/team/${team_id}/members/${member.id}`)}}
                                        key={member.id}
                                        className="cursor-pointer rounded-2xl
                                            flex items-center justify-between
                                            border border-border
                                            bg-black hover:border-accent p-4 
                                            transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <UserProfilePfp memberUser={member}/>
                                            <div>
                                                <p className="font-medium text-ink">
                                                    {member.first_name}{' '}
                                                    {member.last_name}
                                                </p>
                                                <p className="text-sm text-muted">
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
                                            bg-accent/10
                                            text-accent
                                            border border-accent/20
                                            "
                                        >
                                            {member.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-48 space-y-6 shrink-0">
                        <div className="rounded-2xl border min-h-28 border-border bg-surface p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <Crown className="h-6 w-6 text-accent" />
                                <h2 className="text-lg font-semibold text-ink">
                                    Created By
                                </h2>
                            </div>                        
                            <div className="flex items-center gap-4">
                                <div className="
                                    flex h-12 w-12 items-center justify-center
                                    rounded-xl bg-gradient-to-br
                                    from-accent to-accent-hover
                                    font-bold text-accent-ink
                                ">
                                    <UserProfilePfp memberUser={task.created_by ?? undefined}/>
                                </div>
                                <div>
                                    <p className="font-medium text-ink first-letter:capitalize">
                                        {task.created_by?.username || 'Deleted User'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl overflow-auto border border-dashed border-border bg-surface p-6">
                    <TaskActivity />
                </div>
            </div>

            {isSlideDrawerOpen && 
                <RightSlideDrawer
                isSlideDrawerOpen={isSlideDrawerOpen}
                setIsSlideDrawerOpen={setIsSlideDrawerOpen}
                />
            }
        </>
    )
}

export default TaskDashboard