import React, { useEffect, useState } from 'react'
import { Clock3, Circle } from 'lucide-react'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const formatActivityMessage = (activity) => {
    const actor = activity.actor.username
    const metadata = activity.metadata

    switch(activity.activity_type){
        case 'TASK_STATUS_CHANGED':
            return (
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    updated the status from{" "}
                    <span className="text-yellow-400 capitalize">
                        {metadata.old_status.replace("_"," ")}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize">
                        {metadata.new_status.replace("_"," ")}
                    </span>
                </>
            )
        case 'TASK_PRIORITY_CHANGED':
            return (
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    changed the priority from{" "}
                    <span className="text-orange-400 capitalize">
                        {metadata.old_priority}
                    </span>{" "}
                    to{" "}
                    <span className="text-red-400 capitalize">
                        {metadata.new_priority}
                    </span>
                </>
            )
        case 'TASK_TITLE_CHANGED':
            return (
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    changed the title from{" "}
                    <span className="text-yellow-400 capitalize">
                        {metadata.old_title}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize">
                        {metadata.new_title}
                    </span>
                </>
            )
        case 'TASK_DUE_DATE_CHANGED':
            return (
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    {metadata.old_due_date > metadata.new_due_date ? (
                        <span className='font-semibold'>reduced</span>
                    ) : (
                        <span className='font-semibold'>extended</span>
                    )
                    }{" "}
                    the date from{" "}
                    <span className="text-yellow-400 capitalize">
                        {metadata.old_due_date.split(" ")[0]}
                    </span>{" "}
                    to{" "}
                    <span className="text-green-400 capitalize">
                        {metadata.new_due_date.split(" ")[0]}
                    </span>
                </>
            )
        case 'TASK_ASSIGNED':
            return (
                <>
                    <span className="font-semibold capitalize text-cyan-400">
                        {actor}
                    </span>{" "}
                    assigned{" "}
                    <span className="capitalize text-purple-400">
                        {metadata.assigned_member.username}
                    </span>
                </>
            )
        case 'TASK_UNASSIGNED':
            return (
                <>
                    <span className="capitalize font-semibold text-cyan-400">
                        {actor}
                    </span>{" "}
                    removed{" "}
                    <span className="text-purple-400 capitalize">
                        {metadata.unassigned_member.username}
                    </span>
                </>
            )
        default:
            return (
                <span className="text-gray-300">
                    Unknown activity
                </span>
            )
    }
}
const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true
    })
}
function TaskActivity() {
    const { id, task_id } = useParams()
    const [taskActivity, setTaskActivity] = useState([])

    const fetchTaskActivity = async () => {
        try{
            const response = await api.get(`activity/teams/${id}/tasks/${task_id}/activities/`)
            console.log('Task Activity', response.data)
            setTaskActivity(response.data)
        }
        catch(err){
            console.log(err?.response || err)
        }
    } 
    useEffect(() => {
        fetchTaskActivity()
    }, []) 

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
                    {taskActivity.length > 0 &&
                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-cyan-500/20"></div>
                    }
                    {/* Activities */}
                    <div className="space-y-8">
                        {taskActivity.length > 0 ? (
                            taskActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="relative flex gap-4 group"
                                >
                                    <div className="relative z-10 mt-8">
                                        <div className="w-4 h-4 rounded-full bg-green-400 border-4 border-[#071717]"></div>
                                    </div>
                                    <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.05] hover:border-cyan-500/20">
                                        <p className="text-[15px] text-gray-200 leading-relaxed">
                                            {formatActivityMessage(activity)}
                                        </p>
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