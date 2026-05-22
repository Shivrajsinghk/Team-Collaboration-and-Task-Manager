import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'

function DeleteTeam({isDeleteOpen, setIsDeleteOpen, loading, setLoading, team}) {
    const { id } = useParams()
    const navigate = useNavigate()

    const handleDeleteSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        try{
            const response = await api.delete(`api/teams/${id}/delete/`)
            navigate('/dashboard')
        }
        catch(error){
            console.log("ERROR", error.response?.data?.error || error);
            alert(error.response?.data?.error)
        }
        finally {
            setLoading(false)
            setIsDeleteOpen(false);
        }
    }

    return (
        <Modal isOpen={isDeleteOpen} onClose={setIsDeleteOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-[18px] fill-current overflow-visible"
                        viewBox="0 0 640 640"
                        aria-hidden="true"
                    >
                        <path
                            d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                            data-original="#000000"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                    Delete Team?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    This action cannot be undone. All team data, members,
                    and resources will be permanently deleted.
                </p>
                <div className="mt-7 flex justify-center gap-4">
                    <button
                        onClick={handleDeleteSubmit}
                        disabled={loading && !team?.team?.is_admin}
                        className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Deleting..." : "Delete Team"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDeleteOpen(false)}
                        className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default DeleteTeam