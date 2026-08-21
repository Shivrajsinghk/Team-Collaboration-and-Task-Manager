import React, { useContext, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useParams } from 'react-router-dom'
import UserProfilePfp from './UserProfilePfp'
import RemoveMemberFromTask from '../Modal/RemoveMemberFromTask'
import AddMemberToTask from '../Modal/AddMemberToTask'
import DeleteTask from '../Modal/DeleteTask'
import { TaskActivityContext } from '../context/TaskActivityContext'
import { getTask, updateTask as saveTask } from '../api/tasks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '../api/queryKeys'

function RightSlideDrawer({ isSlideDrawerOpen, setIsSlideDrawerOpen }) {
    const { team_id, task_id } = useParams()
    const { fetchTaskActivities } = useContext(TaskActivityContext)
    const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const queryClient = useQueryClient()
    const [editedFields, setEditedFields] = useState({})
    const [isDirty, setIsDirty] = useState(false)

    const { data: task } = useQuery({
        queryKey: taskKeys.detail(team_id, task_id),
        queryFn: async () => {
            const response = await getTask(team_id, task_id)
            return response.data
        },
        enabled: isSlideDrawerOpen && !!team_id && !!task_id,
        staleTime: 30 * 1000,
    })

    const formData = {
        title: editedFields.title ?? task?.title ?? "",
        description: editedFields.description ?? task?.description ?? "",
        priority: editedFields.priority ?? task?.priority ?? "low",
        due_date:
            editedFields.due_date ??
            (task?.due_date ? task.due_date.split("T")[0] : ""),
        assigned_to: task?.assigned_to ?? [],
    }

    const updateTaskMutation = useMutation({
        mutationFn: (payload) => saveTask(team_id, task_id, payload),
        onSuccess: (response) => {
            queryClient.setQueryData(
                taskKeys.detail(team_id, task_id),
                response.data
            )
            queryClient.invalidateQueries({
                queryKey: taskKeys.list(team_id)
            })
            setEditedFields({})
            setIsDirty(false)
            fetchTaskActivities(team_id, task_id)
        },
        onSettled: () => {
            setIsSaving(false)
        },
    })

    useEffect(() => {
        if (isRemoveMemberOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isRemoveMemberOpen])

    useEffect(() => {
        if (!isDirty) return
        const timeout = setTimeout(() => {
            setIsSaving(true)
            updateTaskMutation.mutate({
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                due_date: formData.due_date,
            })
        }, 500)
        return () => clearTimeout(timeout)
    }, [
        isDirty,
        formData.title,
        formData.description,
        formData.priority,
        formData.due_date,
        updateTaskMutation,
    ])

    const handleChange = (e) => {
        const { name, value } = e.target
        setEditedFields((prev) => ({
            ...prev,
            [name]: value,
        }))
        setIsDirty(true)
    }

    return (
        <>
            <div className={`fixed inset-0 z-50 transition-transform duration-300 ease-out ${isSlideDrawerOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'}`}>
                <div onClick={() => { setIsSlideDrawerOpen(false) }} className="absolute inset-0 bg-black/60" />
                <div className={`absolute right-0 top-0 flex h-full w-1/2 flex-col border-l border-border bg-black shadow-2xl transition-transform duration-300 ease-out ${isSlideDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex relative items-start justify-between border-b border-border px-8 py-6">
                        <h2 className="text-3xl font-bold tracking-tight text-ink">
                            Edit <span className="text-accent/70">Task</span>
                        </h2>
                        <div className="flex absolute bottom-2 right-1/2 items-center gap-2">
                            <span className="text-xs text-muted">
                                {isSaving ? 'Saving...' : 'Saved'}
                            </span>
                        </div>
                        <div className="flex gap-5">
                            <button
                                onClick={() => { setIsDeleteTaskOpen(true) }}
                                className="rounded-xl border border-danger/20 bg-danger/10 px-2 text-xs font-medium text-danger transition-colors duration-150 hover:bg-danger/20"
                            >
                                Delete Task
                            </button>
                            <button
                                onClick={() => { setIsSlideDrawerOpen(false) }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-alt text-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 py-7">
                        <div className="space-y-7">
                            <div>
                                <label className="mb-3 block text-sm font-medium text-ink">Task Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title"
                                    className="w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-ink">Description</label>
                                <textarea
                                    rows={5}
                                    name="description"
                                    onChange={handleChange}
                                    value={formData.description}
                                    placeholder="Write task description..."
                                    className="w-full resize-none rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="w-full">
                                    <label className="mb-3 block text-sm font-medium text-ink">Due Date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="mb-3 block text-sm font-medium text-ink">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent"
                                    >
                                        <option className="bg-surface-alt text-ink" value="low">Low</option>
                                        <option className="bg-surface-alt text-ink" value="medium">Medium</option>
                                        <option className="bg-surface-alt text-ink" value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-ink">Assigned Members</label>
                                <div className="rounded-xl border border-border bg-surface-alt p-4">
                                    {formData.assigned_to.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between rounded-xl border border-border bg-surface hover:border-accent/30 p-3 transition-colors mb-2 last:mb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserProfilePfp memberUser={member} />
                                                <div>
                                                    <p className="font-medium text-ink">
                                                        {member.first_name} {member.last_name}
                                                    </p>
                                                    <p className="text-sm text-muted">@{member.username}</p>
                                                </div>
                                            </div>
                                            <span className="flex gap-2">
                                                <span className="px-4 py-2 rounded-full text-xs font-medium capitalize bg-accent/10 text-accent border border-accent/20">
                                                    {member.role}
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedMember(member); setIsRemoveMemberOpen(true) }}
                                                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium capitalize bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 transition-colors"
                                                >
                                                    <X size={17} />
                                                    Remove
                                                </button>
                                            </span>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => { setIsAddMemberOpen(true) }}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-accent transition-colors duration-150 hover:border-accent/50 hover:bg-accent/5"
                                    >
                                        <Plus size={18} />
                                        Add Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RemoveMemberFromTask
                isRemoveMemberOpen={isRemoveMemberOpen}
                setIsRemoveMemberOpen={setIsRemoveMemberOpen}
                selectedMember={selectedMember}
            />

            <AddMemberToTask
                isAddMemberOpen={isAddMemberOpen}
                setIsAddMemberOpen={setIsAddMemberOpen}
                isAssigned={task?.assigned_to}
            />

            <DeleteTask
                isDeleteTaskOpen={isDeleteTaskOpen}
                setIsDeleteTaskOpen={setIsDeleteTaskOpen}
                setIsSlideDrawerOpen={setIsSlideDrawerOpen}
            />
        </>
    )
}

export default RightSlideDrawer