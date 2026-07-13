import { useParams } from 'react-router-dom'
import Modal from './Modal'
import { useContext, useEffect, useState } from 'react'
import UserProfilePfp from '../components/UserProfilePfp'
import { Plus, UserPlus } from 'lucide-react'
import { TaskActivityContext } from '../context/TaskActivityContext'
import { listMembers } from '../api/teams'
import { addMemberToTask } from '../api/tasks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskKeys, teamKeys } from '../api/queryKeys'

function AddMemberToTask({
    isAddMemberOpen,
    setIsAddMemberOpen,
    isAssigned
}) {
    const { team_id, task_id } = useParams()
    const { fetchTaskActivities } = useContext(TaskActivityContext)
    const [confirmAddId, setConfirmAddId] = useState(null)
    const [selectedMember, setSelectedMember] = useState("")
    const queryClient = useQueryClient()
    const { data: members = [] } = useQuery({
        queryKey: teamKeys.members(team_id),
        queryFn: async () => {
            const response = await listMembers(team_id)
            return response.data
        },
        enabled: isAddMemberOpen && !!team_id,
        staleTime: 2 * 60 * 1000,
    })
    const addMemberMutation = useMutation({
        mutationFn: (memberId) => addMemberToTask(team_id, task_id, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(team_id, task_id),
            })
            queryClient.invalidateQueries({
                queryKey: taskKeys.list(team_id),
            })
            fetchTaskActivities(team_id, task_id)
            setIsAddMemberOpen(false)
            setConfirmAddId(null)
            setSelectedMember("")
        },
        onError: (err) => {
            alert(err?.response?.data?.error || err)
            console.log(err?.response || err)
        },
    })

    const handleSubmit = async () => {
        if (!selectedMember?.id) return
        addMemberMutation.mutate(selectedMember.id)
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
                <div className="mt-6 w-[400px] flex max-h-[275px] flex-col gap-3 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
                    {members?.map((member) => {
                        const alreadyAssigned = isAssigned.some(
                            (assignedMember) => assignedMember.id === member.id
                        )
                        return (
                            <div
                                onClick={()=> {
                                    setSelectedMember(member)
                                }}
                                key={member.id}
                                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-cyan-500/10 hover:bg-white/[0.035]">
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
                                        <span className="px-4 py-2 rounded-full text-xs font-medium capitalize bg-black text-[#2CFF05] border-[#25D604] border">
                                            {member.role}
                                        </span>
                                        <button
                                            disabled={alreadyAssigned}
                                            onClick={() => setConfirmAddId(member.id)}
                                            className="flex items-center gap-1 rounded-full border bg-black text-[#2CFF05] border-[#25D604] px-4 py-2 text-xs font-medium transition-all hover:bg-cyan-400/12
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                            disabled:hover:border-white/5
                                            disabled:hover:bg-white/[0.02]"
                                        >
                                            {!alreadyAssigned && <Plus size={16} />}
                                            {alreadyAssigned ? 'Assigned' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                                {confirmAddId === member.id && (
                                    <div className="mt-4 rounded-2xl border border-[#25D604] bg-[#25D604]/1 p-4">
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
                                                className="rounded-xl border border-[#25D604] text-[#2CFF05] px-4 py-2 text-sm font-medium transition-all hover:bg-[#25D604]/20"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </Modal>
    )
}

export default AddMemberToTask
