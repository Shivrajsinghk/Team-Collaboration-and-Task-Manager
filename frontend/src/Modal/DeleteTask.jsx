import React from 'react'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import { UserMinus } from 'lucide-react'
import Modal from './Modal'

function DeleteTask({isDeleteTaskOpen, setIsDeleteTaskOpen, setIsSlideDrawerOpen}) {
    const { id, task_id } = useParams()
    const navigate = useNavigate()

    const handleDeleteTask = async () => {
        try{
            await api.delete(
                `api/teams/${id}/tasks/${task_id}/delete/`
            )  
            navigate(`/team/${id}/tasks`)
            setIsSlideDrawerOpen(false)
        }   
        catch(err){
            alert(err?.response?.data?.error || err)
            console.log(err?.response || err)
        }
    }

    return (
        <Modal isOpen={isDeleteTaskOpen} onClose={setIsDeleteTaskOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <UserMinus className="size-6 text-red-300" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl font-semibold tracking-wide text-white">
                    Delete Task
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Are you sure you want to delete this task?
                </p>
                <div className="mt-5 flex items-center gap-3">
                    <button
                        onClick={handleDeleteTask}
                        className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setIsDeleteTaskOpen(false)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
                    >
                        No
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default DeleteTask