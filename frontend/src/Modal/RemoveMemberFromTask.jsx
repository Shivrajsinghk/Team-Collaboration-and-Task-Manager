import { useParams } from 'react-router-dom'
import Modal from './Modal'
import { useContext } from 'react'
import { UserMinus } from 'lucide-react'
import { TaskActivityContext } from '../context/TaskActivityContext'
import { removeMemberFromTask } from '../api/tasks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '../api/queryKeys'

function RemoveMemberFromTask({
    isRemoveMemberOpen,
    setIsRemoveMemberOpen,
    selectedMember,
}) {
    
    const { team_id, task_id } = useParams()
    const { fetchTaskActivities } = useContext(TaskActivityContext)
    const queryClient = useQueryClient()
    const removeMemberMutation = useMutation({
        mutationFn: () => removeMemberFromTask(team_id, task_id, selectedMember.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(team_id, task_id),
            })
            queryClient.invalidateQueries({
                queryKey: taskKeys.list(team_id),
            })
            fetchTaskActivities(team_id, task_id)
            setIsRemoveMemberOpen(false)
        },
        onError: (err) => {
            console.log(err?.response || err)
        },
    })

    const handleClick = async () => {
        removeMemberMutation.mutate()
    } 

    return (
        <Modal
            isOpen={isRemoveMemberOpen}
            onClose={setIsRemoveMemberOpen}
        >
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <UserMinus className="size-6 text-red-300" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl font-semibold tracking-wide text-white">
                    Remove Member
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Are you sure you want to remove{" "}
                    <span className="font-medium text-cyan-300">
                        {selectedMember.username}
                    </span>{" "}
                    from this task?
                </p>
                <div className="mt-6 rounded-2xl border border-red-500/10 bg-red-500/[0.04] px-5 py-4 backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-red-200">
                        This member will lose access to this task and its updates.
                    </p>
                </div>
                <div className="mt-5 flex items-center gap-3">
                    <button
                        onClick={handleClick}
                        className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20"
                    >
                        Yes, Remove
                    </button>
                    <button
                        onClick={() => setIsRemoveMemberOpen(false)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default RemoveMemberFromTask