import React, { useState } from 'react'
import Column from '../components/Column'
import { useParams } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { ClipboardList, Plus } from 'lucide-react'
import CreateTask from '../Modal/CreateTask'
import Loading from '../components/Loading'
import { getTeam } from '../api/teams'
import { listTasks, updateTaskStatus } from '../api/tasks'
import { taskKeys, teamKeys } from '../api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function TeamTasks() {
    const { team_id } = useParams()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const queryClient = useQueryClient()
    
    const {
        data: tasks = [],
        isLoading: isTasksLoading,
        isError: isTasksError,
    } = useQuery({
        queryKey: taskKeys.list(team_id),
        queryFn: async () => {
            const response = await listTasks(team_id)            
            return response.data
        },
        staleTime: 30 * 1000,
    })
    
    const {
        data: team = null,
        isLoading: isTeamLoading,
    } = useQuery({
        queryKey: teamKeys.detail(team_id),
        queryFn: async () => {
            const response = await getTeam(team_id)
            return response.data
        },
        staleTime: 5 * 60 * 1000,
    })

    const isAdmin = team?.role === 'admin'
    
    const updateTaskStatusMutation = useMutation({
        mutationFn: ({ taskId, status }) =>
            updateTaskStatus(team_id, taskId, { status }),
        onMutate: async ({ taskId, status }) => {
            await queryClient.cancelQueries({
                queryKey: taskKeys.list(team_id),
            })
            const previousTasks = queryClient.getQueryData(taskKeys.list(team_id)) || []
            queryClient.setQueryData(taskKeys.list(team_id), (currentTasks = []) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, status }
                        : task
                )
            )
            return { previousTasks }
        },
        onError: (error, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    taskKeys.list(team_id),
                    context.previousTasks
                )
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.list(team_id),
            })
        },
    })

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
        const currentTask = tasks.find((task) => task.id === taskId)

        if (!currentTask || currentTask.status === newStatus) {
            return
        }

        updateTaskStatusMutation.mutate({
            taskId,
            status: newStatus,
        })
    }

    if (isTasksLoading || isTeamLoading) {
        return <Loading />
    }

    if (isTasksError) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-danger">
                Unable to load tasks right now.
            </div>
        )
    }

    return (
        <>
            <div className="min-w-0 ml-5 my-5 px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex mt-1 h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                            <ClipboardList size={28} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-ink">
                                Team Tasks
                            </h1>
                        </div>
                    </div>
                    <button
                        disabled={!isAdmin}
                        onClick={() => {
                            setIsCreateOpen(true)
                        }}
                        className="flex items-center gap-2 rounded-xl border border-accent bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:border-border disabled:bg-surface-alt disabled:text-muted"
                    >
                        <Plus size={19} />
                        Create Task
                    </button>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid min-h-[calc(100vh-220px)] min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
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
            team={team}
            />
        </>
    )
}

export default TeamTasks