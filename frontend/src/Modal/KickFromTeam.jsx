import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'

function KickFromTeam({
    isKickAYSOpen, 
    setIsKickAYSOpen, 
    loading, 
    setLoading, 
    selectedMember, 
    setSelectedMember,
    setIsMemberOpen,
    fetchapi
}) {

    const {id} = useParams()

    const handleKickSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        try{
            const response = await api.delete(`teams/${id}/remove-user/${selectedMember.user__id}`)
        }
        catch(error){
            console.log(error.response?.data?.error || error)
            alert(error.response?.data?.error || error)
        }
        finally {
            setLoading(false)
            setIsKickAYSOpen(false);
            setIsMemberOpen(false)
            fetchapi()
        }
    }

    return (
        <Modal isOpen={isKickAYSOpen} onClose={setIsKickAYSOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <UserProfilePfp memberUser={selectedMember} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                    Are you sure?
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                    {selectedMember?.user__username || 'User'} will no longer be the part of this team.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleKickSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
                    >
                        {loading ? "Kicking..." : "Kick Member"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsKickAYSOpen(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default KickFromTeam