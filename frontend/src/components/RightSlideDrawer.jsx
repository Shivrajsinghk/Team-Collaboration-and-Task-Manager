import { HeadphoneOff, Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import UserProfilePfp from './UserProfilePfp'
import RemoveMemberFromTask from '../Modal/RemoveMemberFromTask'
import AddMemberToTask from '../Modal/AddMemberToTask'
import DeleteTask from '../Modal/DeleteTask'

function RightSlideDrawer({isSlideDrawerOpen, setIsSlideDrawerOpen, taskfetch}) {
    const navigate = useNavigate()
    const { id, task_id } = useParams()
    const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Low",
        due_date: '',
        assigned_to: []
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

    async function fetchtask(){
        try{
            const response = await api.get(`api/teams/${id}/tasks/${task_id}`)
            setFormData({
                title: response.data.title,
                description: response.data.description,
                priority: response.data.priority,
                due_date: response.data.due_date
                ? response.data.due_date.split('T')[0]
                : '',
                assigned_to: response.data.assigned_to,
            })
            setIsInitialLoad(false)
        }   
        catch(error){
            console.log(error?.response || error)
        }
    }
    useEffect(() => {
        fetchtask()
    }, [])

    async function  updateTask(){
        try{
            setIsSaving(true)
            await api.patch(
                `api/teams/${id}/tasks/${task_id}/update/`,
                {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    due_date: formData.due_date
                }
            )
        }
        catch(error){
            console.log(error?.response || error)
        }
        finally{
            setIsSaving(false)
        }
    }
    useEffect(() => {
        if(isInitialLoad) return
        const timeout = setTimeout(() => {
            updateTask()
        }, 500)
        return () => clearTimeout(timeout)
    }, [
        formData.title,
        formData.description,
        formData.priority,
        formData.due_date
    ])

    const handleChange = async (e) => {
        setFormData((prev)=>({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <>
            <div className={`fixed inset-0 z-50 transition-transform duration-300 ease-out ${isSlideDrawerOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'}`}
            >
                <div
                    onClick={() => {
                        setIsSlideDrawerOpen(false)
                        taskfetch()
                    }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <div
                    className={`absolute right-0 top-0 flex h-full w-1/2 flex-col border-l border-white/10 bg-[#0B1517] shadow-2xl transition-transform duration-300 ease-out ${isSlideDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex relative items-start justify-between border-b border-white/10 px-8 py-6">
                        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-mint-cream)]">
                            Edit <span className='text-cyan-400/70'>Task</span>
                        </h2>
                        <div className="flex absolute bottom-2 right-1/2 items-center gap-2">
                            <span className="text-xs text-gray-300">
                                {isSaving ? 'Saving...' : 'Saved'}
                            </span>
                        </div>
                        <div className='flex gap-5'>
                            <button
                            onClick={()=>{setIsDeleteTaskOpen(true)}}
                                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-2 text-xs font-medium text-red-300 transition-all duration-200 hover:bg-red-500/20"
                            >
                                Delete Task
                            </button>
                            <button
                                onClick={() => {
                                    setIsSlideDrawerOpen(false)
                                    taskfetch()
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 py-7">
                        <div className="space-y-7">
                            <div>
                                <label className="mb-3 block text-sm font-medium text-[var(--color-mint-cream)]">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title"
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-cyan-400/40 focus:bg-white/[0.05]"
                                />
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-[var(--color-mint-cream)]">
                                    Description
                                </label>
                                <textarea
                                    rows={5}
                                    name="description"
                                    onChange={handleChange}
                                    value={formData.description}
                                    placeholder="Write task description..."
                                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-cyan-400/40 focus:bg-white/[0.05]"
                                />
                            </div>
                            <div className='flex gap-3'>
                                <div className='w-full'>
                                    <label className="mb-3 block text-sm font-medium text-[var(--color-mint-cream)]">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400/40 focus:bg-white/[0.05]"
                                    />
                                </div>
                                <div className='w-full'>
                                    <label className="mb-3 block text-sm font-medium text-[var(--color-mint-cream)]">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-white/10 bg-[#0F1B1D] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400/40"
                                    >
                                        <option className="bg-[#0F1B1D] text-white" value="low">
                                            Low
                                        </option>
                                        <option className="bg-[#0F1B1D] text-white" value="medium">
                                            Medium
                                        </option>
                                        <option className="bg-[#0F1B1D] text-white" value="high">
                                            High
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-[var(--color-mint-cream)]">
                                    Assigned Members
                                </label>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    {formData.assigned_to.map((member) => (
                                        <div
                                            key={member.id}
                                            className="cursor-pointer hover:scale-[1.01]
                                                flex items-center justify-between
                                                rounded-2xl border border-white/5
                                                bg-white/[0.02] hover:bg-white/[0.035] p-3 
                                                hover:border-cyan-500/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserProfilePfp memberUser={member}/>
                                                <div>
                                                    <p className="font-medium text-[var(--color-mint-cream)]">
                                                        {member.first_name}{' '}
                                                        {member.last_name}
                                                    </p>
                                                    <p className="text-sm text-[var(--color-cool-steel)]">
                                                        @{member.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className='flex gap-2'>
                                                <span className="px-4 py-2 rounded-full text-xs font-medium capitalize bg-cyan-400/8 text-cyan-300 border border-cyan-500/20">
                                                    {member.role}
                                                </span>
                                                <button 
                                                onClick={()=>{
                                                    setSelectedMember(member)
                                                    setIsRemoveMemberOpen(true)
                                                }}
                                                className="flex gap-1 px-4 py-2 rounded-full text-xs font-medium capitalize bg-cyan-400/8 border border-cyan-500/20"
                                                >
                                                    <X size={17} />
                                                    Remove
                                                </button>
                                            </span>
                                        </div>
                                    ))}
                                    <button
                                        onClick={()=>{setIsAddMemberOpen(true)}}
                                        className="
                                        mt-4
                                        flex w-full items-center justify-center gap-2
                                        rounded-2xl border border-dashed border-white/10
                                        bg-white/[0.02]
                                        px-4 py-3
                                        text-sm font-medium text-cyan-300
                                        transition-all duration-200
                                        hover:border-cyan-400/30
                                        hover:bg-cyan-500/5
                                        "
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
            fetchtask={fetchtask}
            />

            <AddMemberToTask 
            isAddMemberOpen={isAddMemberOpen}
            setIsAddMemberOpen={setIsAddMemberOpen}
            fetchtask={fetchtask}
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
