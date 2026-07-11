import React from 'react'
import { Clock3 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRightLeft, Flag, Pencil, CalendarDays, UserPlus, UserMinus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listTaskActivities } from '../api/activity'
import { taskKeys } from '../api/queryKeys'

const formatActivityMessage = (activity) => {
    const actor = activity.actor?.username
    const metadata = activity.metadata || {}
    const activityIcons = {
        TASK_STATUS_CHANGED: <ArrowRightLeft size={18} className="text-accent mt-0.5" />,
        TASK_PRIORITY_CHANGED: <Flag size={18} className="text-orange-400 mt-0.5" />,
        TASK_TITLE_CHANGED: <Pencil size={18} className="text-yellow-400 mt-0.5" />,
        TASK_DUE_DATE_CHANGED: <CalendarDays size={18} className="text-blue-400 mt-0.5" />,
        TASK_ASSIGNED: <UserPlus size={18} className="text-purple-400 mt-0.5" />,
        TASK_UNASSIGNED: <UserMinus size={18} className="text-pink-400 mt-0.5" />,
    }
    const icon = activityIcons[activity.activity_type]
    const messageWrapper = (message) => (
        <div className="flex items-start gap-3">
            <span className="text-lg">
                {icon}
            </span>
            <p className="text-muted leading-relaxed">
                {message}
            </p>
        </div>
    )
    switch(activity.activity_type){
        case 'TASK_STATUS_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-accent">
                        {actor}
                    </span>{" "}
                    updated the status from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_status?.replace("_"," ")}
                    </span>{" "}
                    to{" "}
                    <span className="text-accent capitalize font-medium">
                        {metadata.new_status?.replace("_"," ")}
                    </span>
                </>
            )
        case 'TASK_PRIORITY_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-accent">
                        {actor}
                    </span>{" "}
                    changed the priority from{" "}
                    <span className="text-orange-400 capitalize font-medium">
                        {metadata.old_priority}
                    </span>{" "}
                    to{" "}
                    <span className="text-red-400 capitalize font-medium">
                        {metadata.new_priority}
                    </span>
                </>
            )
        case 'TASK_TITLE_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-accent">
                        {actor}
                    </span>{" "}
                    changed the title from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_title}
                    </span>{" "}
                    to{" "}
                    <span className="text-accent capitalize font-medium">
                        {metadata.new_title}
                    </span>
                </>
            )
        case 'TASK_DUE_DATE_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-accent">
                        {actor}
                    </span>{" "}
                    {metadata.old_due_date > metadata.new_due_date ? (
                        <span className='font-semibold text-orange-400'>
                            reduced
                        </span>
                    ) : (
                        <span className='font-semibold text-accent'>
                            extended
                        </span>
                    )}{" "}
                    the deadline from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_due_date?.split(" ")[0]}
                    </span>{" "}
                    to{" "}
                    <span className="text-accent capitalize font-medium">
                        {metadata.new_due_date?.split(" ")[0]}
                    </span>
                </>
            )
        case 'TASK_ASSIGNED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-accent">
                        {actor}
                    </span>{" "}
                    assigned{" "}
                    <span className="capitalize text-purple-400 font-medium">
                        {metadata.assigned_member?.username}
                    </span>{" "}
                    to this task
                </>
            )
        case 'TASK_UNASSIGNED':
            return messageWrapper(
                <>
                    <span className="capitalize font-semibold text-accent">
                        {actor}
                    </span>{" "}
                    removed{" "}
                    <span className="text-pink-400 capitalize font-medium">
                        {metadata.unassigned_member?.username}
                    </span>{" "}
                    from this task
                </>
            )
        default:
            return (
                <div className="flex items-center gap-3">
                    <span className="text-muted">
                        📍
                    </span>
                    <span className="text-muted">
                        No Task Activity
                    </span>
                </div>
            )
    }
}

const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true
    })
}

function TaskActivity() {
    const { team_id, task_id } = useParams()
    const { data: activities = [] } = useQuery({
        queryKey: taskKeys.activities(team_id, task_id),
        queryFn: async () => {
            const response = await listTaskActivities(team_id, task_id)
            return response.data
        },
        enabled: !!team_id && !!task_id,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    return (
        <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Clock3 className="text-accent" size={28} />
                <h2 className="text-2xl font-bold text-ink">
                    Task Activity
                </h2>
            </div>
            <div className="relative max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/40 hover:scrollbar-thumb-accent-hover/60">
                <div className="relative">
                    {activities.length > 0 &&
                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-border"></div>
                    }
                    {/* Activities */}
                    <div className="space-y-8">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="relative flex gap-4 group"
                                >
                                    <div className="relative z-10 mt-8">
                                        <div className="w-4 h-4 rounded-full bg-accent border-4 border-surface"></div>
                                    </div>
                                    <div className="flex-1 bg-surface-alt border border-border rounded-xl p-4 transition-colors duration-150 hover:border-accent/30">
                                        <div className="text-[15px] text-muted leading-relaxed">
                                            {formatActivityMessage(activity)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock3 size={14} className="text-muted" />
                                            <p className="text-xs text-muted">
                                                {formatTime(activity.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className='text-danger font-medium'>No Activity till now</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskActivity