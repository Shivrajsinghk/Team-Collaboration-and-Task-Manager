import React, { useState } from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, User } from 'lucide-react'

function CreateTask({
    isCreateOpen, 
    setIsCreateOpen, 
    fetchTask, 
    loading, 
    setLoading,
    team,
}) {

    const { id } = useParams()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState([])
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        const formData = new FormData(e.target);
        console.log(selectedMembers)
        const data = {
            title: formData.get("task_title"),   
            description: formData.get("task_description"),    
            assigned_to_ids: selectedMembers.map((member) => member.user__id)
        }
        if(!data.title || !data.title.trim()){
            alert("Task title is required");
            setLoading(false)
            return
        }
        try{
            const response = await api.post(`/teams/${id}/tasks/create/`, data)
            fetchTask()
        }
        catch(error){
            console.log("ERROR", error.response || error);
        }
        finally {
            setLoading(false)
            setIsCreateOpen(false);
        }
    }

    return (
        <Modal isOpen={isCreateOpen} onClose={setIsCreateOpen}>
            <form 
            onSubmit={handleCreateSubmit}
            // style={{ scrollbarWidth: 'thin' }}
            className="space-y-5"
            >
                <h2 className="text-2xl font-bold text-white">
                    Create Task
                </h2>
                <div>
                    <label className="text-sm text-gray-400">Task Title</label>
                    <input
                        type="text"
                        name="task_title"
                        required
                        placeholder="Enter task title"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Description (optional)</label>
                    <input
                        type="text"
                        name="task_description"
                        placeholder="Enter task description"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                    />
                </div>
                <div className="relative">
                    <label className="text-sm text-gray-400">
                        Assign to?
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                            setIsDropdownOpen(!isDropdownOpen)
                        }
                        className="mt-2 flex w-full items-start justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                        <div className="flex flex-wrap gap-3">
                            {selectedMembers.length > 0 ? ( 
                                selectedMembers.map((selectedMember) => (
                                    <div className="flex items-center gap-3" key={selectedMember.id}>
                                        <div className="flex h-10 w-10 overflow-hidden rounded-full">
                                            <img
                                                src={`${BASE_URL}/media/${selectedMember.user__profile__profile_picture}`}
                                                alt={selectedMember.user__first_name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">
                                                {selectedMember.user__first_name}{' '}
                                                {selectedMember.user__last_name}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                @{selectedMember.user__username}
                                            </p>
                                        </div>
                                    </div>
                                )) 
                            ) : (
                                <p className="text-gray-400">
                                    Select a member
                                </p>
                            )}
                        </div>
                        <span className="text-gray-400">
                            ▼
                        </span>
                    </button>
                    {isDropdownOpen && (
                        <div
                            onWheel={(e) => e.stopPropagation()}
                            className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-32 overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1120] p-2 shadow-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60"
                        >
                            {team?.team?.all_members?.map((member) => (
                                <button
                                    type="button"
                                    key={member.user__id}
                                    onClick={() => {
                                        setSelectedMembers((prev) => {
                                            const alreadySelected = prev.find(
                                                (m) => m.id === member.user__id
                                            )
                                            if (alreadySelected) {
                                                return prev.filter(
                                                    (m) => m.id !== member.user__id
                                                )
                                            }
                                            return [...prev, member]
                                        })
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                                        selectedMembers.some((m) => m.id === member.user__id)
                                            ? 'bg-teal-500/10 border border-teal-400/30'
                                            : 'hover:bg-white/10'
                                    }`}
                                    >
                                    <div className="flex h-10 w-10 overflow-hidden rounded-full">
                                        {member.user__profile__profile_picture ? (
                                            <img
                                                src={`${BASE_URL}/media/${member.user__profile__profile_picture}`}
                                                alt={member.user__first_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ):(
                                            <div className="flex h-full w-full items-center pb-1 justify-center rounded-full border-2 border-[#061414] bg-gradient-to-br from-teal-400 to-indigo-500 text-2xl font-bold text-white shadow-2xl">
                                                {(member.user__first_name || "U").slice(0,1)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">
                                            {member.user__first_name}{' '}
                                            {member.user__last_name}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            @{member.user__username}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl py-3 text-sm font-semibold transition duration-300 ${
                loading
                ? "cursor-not-allowed bg-gray-500"
                : "bg-gradient-to-r from-teal-400 to-cyan-500 text-black hover:scale-[1.01]"
                }`}
                >
                    {loading ? "Creating..." : "Create Task"}
                </button>
            </form>
        </Modal>
    )
}

export default CreateTask