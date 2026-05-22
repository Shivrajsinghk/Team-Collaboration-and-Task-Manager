import { useNavigate, useParams } from 'react-router-dom'
import Modal from './Modal'
import api from '../api/axios'
import { useEffect, useState } from 'react'
import UserProfilePfp from '../components/UserProfilePfp'
import { Plus, UserPlus } from 'lucide-react'

function AddMemberToTask({
    isAddMemberOpen,
    setIsAddMemberOpen,
    fetchtask,
}) {
    const navigate = useNavigate()
    const { id, task_id } = useParams()   
    const [members, setMembers] = useState(null)     
    const [confirmAddId, setConfirmAddId] = useState(null)
    const [selectedMember, setSelectedMember] = useState("")

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try{
                const response = await api.get(
                    `api/teams/${id}/members`
                )  
                setMembers(response.data)
            }   
            catch(err){
                console.log(err?.response || err)
            }
        }
        fetchTeamMembers()
    }, [])

    const handleSubmit = async (e) => {
        try{
            await api.post(
                `api/teams/${id}/tasks/${task_id}/members/${selectedMember.id}/add/`
            )  
            setIsAddMemberOpen(false)
            fetchtask()
        }   
        catch(err){
            alert(err?.response?.data?.error || err)
            console.log(err?.response || err)
        }
    } 

    return (
        <Modal
            isOpen={isAddMemberOpen}
            onClose={setIsAddMemberOpen}
        >
            <div className="w-full max-w-lg p-4">
                <div className="text-center">
                    <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                        <UserPlus className="size-6 text-cyan-300" strokeWidth={1.8} />
                    </div>
                    <h2 className="text-xl font-semibold tracking-wide text-white">
                        Add Member
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        Select a team member to add them to this task.
                    </p>
                </div>
                <div className="mt-6 w-[400px] flex max-h-[275px] flex-col gap-3 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-500/2 hover:scrollbar-thumb-cyan-500/30">
                    {members?.map((member) => (
                        <div
                            onClick={()=>setSelectedMember(member)}
                            key={member.id}
                            className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-cyan-500/10 hover:bg-white/[0.035]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <UserProfilePfp memberUser={member} />
                                    <div>
                                        <p className="font-medium text-[var(--color-mint-cream)]">
                                            {member.first_name} {member.last_name}
                                        </p>
                                        <p className="text-sm text-[var(--color-cool-steel)]">
                                            @{member.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-4 py-2 rounded-full text-xs font-medium capitalize bg-cyan-400/8 text-cyan-300 border border-cyan-500/20">
                                        {member.role}
                                    </span>
                                    <button
                                        onClick={() => setConfirmAddId(member.id)}
                                        className="flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-400/8 px-4 py-2 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-400/12"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                            </div>
                            {confirmAddId === member.id && (
                                <div className="mt-4 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.05] p-4">
                                    <p className="text-sm text-center text-cyan-100">
                                        Add this member to the task?
                                    </p>
                                    <div className="mt-3 flex items-center px-12 justify-evenly">
                                        <button
                                            onClick={() => setConfirmAddId(null)}
                                            className="rounded-xl border  border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white transition-all hover:bg-white/[0.06]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                        onClick={()=>{handleSubmit()}}
                                            className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    )
}

export default AddMemberToTask