import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { AlertTriangle, Flame, ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { getTask } from '../api/tasks'
import { taskKeys } from '../api/queryKeys'
import NoProfilePhoto from './NoProfilePhoto'

function getPriorityIcon(priority) {
    switch (priority) {
        case 'low':
            return (
                <ChevronDown className="h-4 w-4 shrink-0 fill-accent text-accent" />
            )

        case 'medium':
            return <Flame className="h-4 w-4 text-yellow-400" />

        case 'high':
            return <AlertTriangle className="h-4 w-4 text-danger" />

        default:
            return null
    }
}

function formatDate(date) {
    const daysLeft = differenceInDays(new Date(date), new Date())

    if (daysLeft < 0) {
        return 'Overdue'
    }

    if (daysLeft === 0) {
        return 'Due today'
    }

    return `${daysLeft} days left`
}

function TaskCard({ task, index }) {
    const navigate = useNavigate()
    const { team_id } = useParams()
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const queryClient = useQueryClient()

    const priorityStyles = {
        low: 'bg-accent/15 text-accent border-accent/20',
        medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
        high: 'bg-danger/15 text-danger border-danger/20',
    }

    const handleClick = () => {
        navigate(`/team/${team_id}/tasks/${task.id}`)
    }

    const handlePrefetch = () => {
        queryClient.prefetchQuery({
            queryKey: taskKeys.detail(team_id, task.id),
            queryFn: async () => {
                const response = await getTask(team_id, task.id)
                return response.data
            },
            staleTime: 30 * 1000,
        })
    }

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    onDoubleClick={handleClick}
                    onMouseEnter={handlePrefetch}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group relative cursor-grab overflow-hidden rounded-xl border border-border bg-surface-alt p-3 transition-colors duration-200 hover:border-accent/40 active:cursor-grabbing ${snapshot.isDragging ? 'z-[9999] rotate-1 scale-[1.02] shadow-2xl' : ''}`}
                >
                    <div className="relative flex items-start justify-between gap-3">
                        <h3 className="text-[15px] leading-snug font-semibold first-letter:capitalize text-ink">
                            {task.title}
                        </h3>

                        {getPriorityIcon(task.priority)}
                    </div>

                    {task.description && (
                        <p className="mt-1 line-clamp-3 text-sm leading-relaxed first-letter:capitalize text-muted">
                            {task.description}
                        </p>
                    )}

                    <div className="mt-2 mb-3 flex items-center justify-between gap-2">
                        <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                            {task.priority?.toUpperCase()}
                        </span>

                        {task.due_date && (
                            <div className="whitespace-nowrap rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-300">
                                {formatDate(task.due_date.split('T')[0])}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3">
                        <div className="flex min-w-0 items-center justify-between gap-4 text-xs text-muted">
                            <span className="whitespace-nowrap">
                                #{task.id}
                            </span>

                            <span className="whitespace-nowrap">
                                {task?.assigned_to?.length ?? 0}{' '}
                                {task?.assigned_to?.length > 1 ? 'members' : 'member'}
                            </span>
                        </div>

                        <div className="flex -space-x-3">
                            {task?.assigned_to?.slice(0, 3).map((assignee) => (
                                <div key={assignee.id}>
                                    {assignee.profile_picture ? (
                                        <img
                                            src={`${BASE_URL}${assignee.profile_picture}`}
                                            alt={assignee.username}
                                            title={assignee.username}
                                            className="h-8 w-8 rounded-full border-2 border-surface object-cover transition-transform duration-200 hover:z-20 hover:scale-110"
                                        />
                                    ) : (
                                        <NoProfilePhoto size={32} />
                                    )}
                                </div>
                            ))}

                            {task?.assigned_to?.length > 3 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface text-xs font-medium text-muted">
                                    +{task.assigned_to.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}

export default TaskCard