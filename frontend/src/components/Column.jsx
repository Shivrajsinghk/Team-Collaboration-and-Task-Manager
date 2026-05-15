import React from 'react'
import TaskCard from './TaskCard'
import { Droppable } from '@hello-pangea/dnd'
import { BadgeCheck, CircleDot, LoaderCircle, TicketPlus } from 'lucide-react'

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
function Column({ title, tasks, status }) {
    return (
        <div
            className="
                flex
                h-full
                min-w-0
                flex-col
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
            "
        >
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    px-5
                    py-4
                "
            >
                <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <h2 className="text-xl font-bold text-white">
                        {title}
                    </h2>
                </div>
                <span
                    className="
                        rounded-full
                        bg-white/10
                        px-3
                        py-1
                        text-sm
                        text-gray-300
                    "
                >
                    {tasks.length}
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                            flex-1
                            overflow-y-visible
                            p-4
                            transition-all
                            duration-200
                            space-y-4
                            ${
                                snapshot.isDraggingOver
                                    ? 'bg-white/5'
                                    : ''
                            }
                        `}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                            />
                        ))}

                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default Column