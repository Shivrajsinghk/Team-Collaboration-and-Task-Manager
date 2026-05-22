import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'

function PromoteMember({
    isPromoteAYSOpen,
    setIsPromoteAYSOpen, 
    loading,
    setLoading,
    selectedMember,
    setSelectedMember,
    setIsMemberOpen,
    fetchapi,
}) {

    const {id} = useParams()

    const handlePromoteSubmit = async () => {
        if (loading) return
        setLoading(true)
        try {
            const response = await api.patch(
                `api/teams/${id}/promote/${selectedMember.user__id}`
            )
            console.log(response.data)
            setIsMemberOpen(false)
            setSelectedMember(null)
        }
        catch (error) {
            console.log(
                "ERROR",
                error.response?.data || error
            )
            alert(
                error.response?.data?.error ||
                "Something went wrong"
            )
        }
        finally {
            setLoading(false)
            setIsPromoteAYSOpen(false);
            setIsMemberOpen(false)
            fetchapi()
        }
    }

    return (
        <Modal isOpen={isPromoteAYSOpen} onClose={setIsPromoteAYSOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                    <UserProfilePfp memberUser={selectedMember} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                    Promote Member
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                    This member will gain admin permissions for this workspace.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={handlePromoteSubmit}
                        disabled={loading}
                        className="
                        px-4 py-2 rounded-xl
                        bg-cyan-500/90
                        hover:bg-cyan-500
                        text-white
                        transition
                        font-medium
                        "
                    >
                        {loading ? "Promoting..." : "Promote to Admin"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPromoteAYSOpen(false)}
                        className="
                        px-4 py-2 rounded-xl
                        bg-white/[0.05]
                        hover:bg-white/[0.08]
                        text-gray-300
                        transition
                        "
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default PromoteMember