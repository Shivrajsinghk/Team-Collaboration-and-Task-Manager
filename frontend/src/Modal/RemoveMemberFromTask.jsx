import { useNavigate, useParams } from 'react-router-dom'
import Modal from './Modal'
import api from '../api/axios'
import { useState } from 'react'
import { UserMinus } from 'lucide-react'

function RemoveMemberFromTask({
    isRemoveMemberOpen,
    setIsRemoveMemberOpen,
    selectedMember,
    fetchtask
}) {
    
    const navigate = useNavigate()
    const { id, task_id, member_id } = useParams()    

    const handleClick = async (e) => {
        try{
            await api.delete(
                `teams/${id}/tasks/${task_id}/members/${selectedMember.id}/remove`
            )  
            fetchtask()
            setIsRemoveMemberOpen(false)
        }   
        catch(err){
            console.log(err?.response || err)
        }
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