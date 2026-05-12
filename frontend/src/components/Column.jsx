import React from 'react'
import TaskCard from './TaskCard'
import { Droppable } from '@hello-pangea/dnd'
import TaskDashboard from './TaskDashboard'

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
                <h2 className="text-xl font-bold text-white">
                    {title}
                </h2>
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