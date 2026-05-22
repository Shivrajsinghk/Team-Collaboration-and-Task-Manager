import React, { use, useEffect, useState } from 'react'
import Column from '../components/Column'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { ClipboardList, Plus } from 'lucide-react'
import CreateTask from '../Modal/CreateTask'

function TeamTasks() {
    const { id } = useParams()
    const [tasks, setTasks] = useState([])
    const [team, setTeam] = useState([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchTask = async () => {
        try {
            const response = await api.get(`api/teams/${id}/tasks`)
            setTasks(response.data)
        }
        catch (error) {
            console.log(error?.response?.data || error)
        }
    }

    const fetchTeam = async () => {
        try {
            const response = await api.get(`api/teams/${id}`)
            setTeam(response.data)
        }
        catch (error) {
            console.log(error?.response?.data || error)
        }
    }

    useEffect(() => {
        fetchTask()
        fetchTeam()
    }, [id])

    const todoTasks = tasks.filter(
        (task) => task.status === 'todo'
    )
    const inProgressTasks = tasks.filter(
        (task) => task.status === 'in_progress'
    )
    const doneTasks = tasks.filter(
        (task) => task.status === 'done'
    )
    const handleDragEnd = async (result) => {
        if (!result.destination) return
        const taskId = Number(result.draggableId)
        const newStatus = result.destination.droppableId
        const updatedTasks = tasks.map((task) =>
            task.id === taskId
                ? { ...task, status: newStatus }
                : task
        )
        setTasks(updatedTasks)
        try {
            await api.patch(
                `api/teams/${id}/tasks/${taskId}/update/status/`,
                {
                    status: newStatus
                }
            )
        }
        catch (error) {
            console.log(error?.response?.data || error)
        }
    }

    return (
        <>
            <div className="min-w-0 ml-5 my-5 px-4">
                <div
                className="
                    mb-8
                    flex
                    items-center
                    justify-between
                "
                >
                    <div className="flex items-center gap-5">
                        <div
                            className="
                                flex
                                mt-1
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-teal-400/20
                                bg-teal-500/10
                            "
                        >
                            <ClipboardList
                                size={28}
                                className="text-teal-300"
                            />
                        </div>
                        <div>
                            <h1
                                className="
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-white
                                "
                            >
                                Team Tasks
                            </h1>
                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-400
                                "
                            >
                                Organize, manage, and track your
                                team's progress.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={()=>{setIsCreateOpen(true)}}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-2xl
                            border
                            border-teal-400/20
                            bg-teal-500/10
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-teal-300
                            transition-all
                            duration-200
                            hover:bg-teal-500/20
                        "
                    >
                        <Plus size={19} /> 
                        Create Task
                    </button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div
                        className="
                            grid
                            min-h-[calc(100vh-220px)]
                            min-w-0
                            grid-cols-1
                            gap-6
                            lg:grid-cols-3
                        "
                    >
                        <Column
                            title="Todo"
                            status="todo"
                            tasks={todoTasks}
                        />
                        <Column
                            title="In Progress"
                            status="in_progress"
                            tasks={inProgressTasks}
                        />
                        <Column
                            title="Done"
                            status="done"
                            tasks={doneTasks}
                        />
                    </div>
                </DragDropContext>
            </div>

            <CreateTask 
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            fetchTask={fetchTask}
            loading={loading}
            setLoading={setLoading}
            team={team}
            />
        </>
    )
}

export default TeamTasks