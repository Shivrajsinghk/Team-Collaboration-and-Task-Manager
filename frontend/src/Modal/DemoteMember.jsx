import React from 'react'
import Modal from './Modal'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'
import { demoteMember } from '../api/teams'

function DemoteMember({
    isDemoteAYSOpen,
    setIsDemoteAYSOpen, 
    loading,
    setLoading,
    selectedMember,
    setSelectedMember,
    setIsMemberOpen,
    fetchapi,
}) {
    const { team_id } = useParams()

    const handleDemoteSubmit = async () => {
        if (loading) return
        setLoading(true)
        try {
            await demoteMember(team_id, selectedMember.user__id)
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
            setIsDemoteAYSOpen(false);
            setIsMemberOpen(false)
            fetchapi()
        }
    }

    return (
        <Modal isOpen={isDemoteAYSOpen} onClose={setIsDemoteAYSOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                    <UserProfilePfp memberUser={selectedMember} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                    Demote Admin
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                    This admin will lose admin permissions for this workspace.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={handleDemoteSubmit}
                        disabled={loading}
                        className="
                        w-full
                        rounded-2xl
                        bg-amber-500/90
                        px-4 py-3
                        font-medium
                        text-black
                        transition
                        hover:bg-amber-500
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        "
                    >
                        {loading ? "Demoting..." : "Demote to Member"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDemoteAYSOpen(false)}
                        className="
                        w-full
                        rounded-2xl
                        border border-white/10
                        bg-white/[0.04]
                        px-4 py-3
                        text-gray-300
                        transition
                        hover:bg-white/[0.08]
                        "
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default DemoteMember
