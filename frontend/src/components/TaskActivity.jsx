import React, { useContext, useEffect } from 'react'
import { Clock3 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { TaskActivityContext } from '../context/TaskActivityContext' 
import { ArrowRightLeft, Flag, Pencil, CalendarDays, UserPlus, UserMinus } from 'lucide-react'

const formatActivityMessage = (activity) => {
    const actor = activity.actor.username
    const metadata = activity.metadata || {}
    const activityIcons = {
        TASK_STATUS_CHANGED: <ArrowRightLeft size={18} className="text-cyan-400 mt-0.5" />,
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
            <p className="text-gray-200 leading-relaxed">
                {message}
            </p>
        </div>
    )
    switch(activity.activity_type){
        case 'TASK_STATUS_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    updated the status from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_status?.replace("_"," ")}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize font-medium">
                        {metadata.new_status?.replace("_"," ")}
                    </span>
                </>
            )
        case 'TASK_PRIORITY_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-cyan-400">
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
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    changed the title from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_title}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize font-medium">
                        {metadata.new_title}
                    </span>
                </>
            )
        case 'TASK_DUE_DATE_CHANGED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    {metadata.old_due_date > metadata.new_due_date ? (
                        <span className='font-semibold text-orange-400'>
                            reduced
                        </span>
                    ) : (
                        <span className='font-semibold text-green-400'>
                            extended
                        </span>
                    )}{" "}
                    the deadline from{" "}
                    <span className="text-yellow-400 capitalize font-medium">
                        {metadata.old_due_date?.split(" ")[0]}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize font-medium">
                        {metadata.new_due_date?.split(" ")[0]}
                    </span>
                </>
            )
        case 'TASK_ASSIGNED':
            return messageWrapper(
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    assigned{" "}
                    <span className="capitalize text-purple-400 font-medium">
                        {metadata.assigned_member?.username}
                    </span>
                    to this task
                </>
            )
        case 'TASK_UNASSIGNED':
            return messageWrapper(
                <>
                    <span className="capitalize font-semibold text-cyan-400">
                        {actor}
                    </span>{" "}
                    removed{" "}
                    <span className="text-pink-400 capitalize font-medium">
                        {metadata.unassigned_member?.username}
                    </span>
                    from this task
                </>
            )
        default:
            return (
                <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                        📍
                    </span>
                    <span className="text-gray-300">
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
    const { activities, fetchTaskActivities } = useContext(TaskActivityContext)

    useEffect(() => {
        fetchTaskActivities(team_id, task_id)
    }, [fetchTaskActivities, team_id, task_id])

    return (
        <div className="bg-[#071717] border border-green-500/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.03)]">
            <div className="flex items-center gap-3 mb-6">
                <Clock3 className="text-green-400" size={28} />
                <h2 className="text-2xl font-bold text-white">
                    Task Activity
                </h2>
            </div>
            <div className="relative max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
                <div className="relative">
                    {activities.length > 0 &&
                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-cyan-500/20"></div>
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
                                        <div className="w-4 h-4 rounded-full bg-green-400 border-4 border-[#071717]"></div>
                                    </div>
                                    <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.05] hover:border-cyan-500/20">
                                        <div className="text-[15px] text-gray-200 leading-relaxed">
                                            {formatActivityMessage(activity)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock3 size={14} className="text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                {formatTime(activity.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className='text-red-400 font-medium'>No Activity till now</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskActivity
