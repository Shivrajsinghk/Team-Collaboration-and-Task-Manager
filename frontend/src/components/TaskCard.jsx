import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { CalendarDays, MessageCircleMore, Paperclip, Circle, CircleDashed, AlertTriangle, Flame, ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

function getPriorityIcon(priority) {
    switch(priority) {
        case 'low':
            return (
                <ChevronDown className="h-4 w-4 fill-emerald-400 text-emerald-400 shrink-0" />
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
function TaskCard({ task, index }) {
    const navigate = useNavigate()
    const { id } = useParams()
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

    const priorityStyles = {
        low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
        medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
        high: 'bg-red-500/15 text-red-300 border-red-500/20',
    }

    const handleClick = () =>{
        navigate(`/team/${id}/tasks/${task.id}`)
    }

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    onDoubleClick={handleClick}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-3 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-2xl z-[9999]' : ''}`}
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_45%)] pointer-events-none" /> 
                    <div className="relative flex items-start justify-between gap-3">
                        <h3 className="text-[15px] first-letter:capitalize font-semibold text-white leading-snug">
                            {task.title}
                        </h3>
                        {getPriorityIcon(task.priority)}
                    </div>
                    {task.description && (
                        <p className="mt-1 text-sm first-letter:capitalize leading-relaxed text-gray-400 line-clamp-3">
                            {task.description}
                        </p>
                    )}
                    <div className="mt-2 mb-3 flex gap-2 justify-between items-center">
                        <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                            {task.priority.toUpperCase()}
                        </span>
                        {task.due_date && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CalendarDays size={14} />
                                <span>
                                    {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/5 pt-3">
                        <div className="flex justify-between min-w-0 items-center gap-4 text-xs text-gray-500">
                            <span className='whitespace-nowrap'>
                                #{task.id}
                            </span>
                            <span className='whitespace-nowrap'>
                                {task.assigned_to.length} {task.assigned_to.length > 1 ? 'members' : 'member'}
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
                                            className="h-8 w-8 rounded-full border-2 border-[#0B1117] object-cover transition-transform duration-200 hover:z-20 hover:scale-110"
                                        /> 
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B1117] bg-gradient-to-br from-teal-400 to-indigo-500 text-xl font-semibold text-white shadow-2xl">
                                            {(assignee.username || "U").slice(0,1)}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {task.assigned_to.length > 3 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B1117] bg-[#1A2332] text-xs font-medium text-gray-300">
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