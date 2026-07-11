import React from 'react'
import TaskCard from './TaskCard'
import { Droppable } from '@hello-pangea/dnd'
import { BadgeCheck, CircleDot, LoaderCircle } from 'lucide-react'

function getStatusIcon(status) {
    switch (status) {
        case 'todo':
            return <CircleDot className="h-4 w-4 text-muted" />

        case 'in_progress':
            return <LoaderCircle className="h-4 w-4 animate-spin text-yellow-400" />

        case 'done':
            return <BadgeCheck className="h-4 w-4 text-accent" />

        default:
            return null
    }
}

function Column({ title, tasks, status }) {
    return (
        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <h2 className="text-xl font-bold text-ink">
                        {title}
                    </h2>
                </div>

                <span className="rounded-full bg-surface-alt px-3 py-1 text-sm text-muted">
                    {tasks.length}
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-4 overflow-y-visible p-4 transition-colors duration-200 ${
                            snapshot.isDraggingOver ? 'bg-accent/5' : ''
                        }`}
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