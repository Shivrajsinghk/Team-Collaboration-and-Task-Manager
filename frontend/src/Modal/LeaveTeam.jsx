import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'

function LeaveTeam({isLeaveOpen, setIsLeaveOpen, loading, setLoading}) {
    const { id } = useParams()
    const navigate = useNavigate()

    const handleLeaveSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        try{
            const response = await api.delete(`teams/${id}/leave/`)
            navigate('/dashboard')
        }
        catch(error){
            console.log("ERROR", error.response?.data?.error || error);
            alert(error.response?.data?.error)
        }
        finally {
            setLoading(false)
            setIsLeaveOpen(false);
        }
    }

    return (
        <Modal isOpen={isLeaveOpen} onClose={setIsLeaveOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-[18px] fill-current overflow-visible"
                    viewBox="0 0 640 640"
                    aria-hidden="true"
                    >
                    <path
                        d="M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z"
                        data-original="#000000"
                    />
                    <path
                        d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z"
                        data-original="#000000"
                    />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                Are you sure?
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                You will leave this team and lose access to its data.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleLeaveSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                    >
                        {loading ? "Leaving..." : "Yes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLeaveOpen(false)}
                        className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-300 transition"
                    >
                        No
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default LeaveTeam