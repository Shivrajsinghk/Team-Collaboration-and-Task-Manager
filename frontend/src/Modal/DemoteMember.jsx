import React from 'react'
import Modal from './Modal'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'
import { demoteMember } from '../api/teams'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function DemoteMember({
    isDemoteAYSOpen,
    setIsDemoteAYSOpen, 
    selectedMember,
    setSelectedMember,
    setIsMemberOpen,
}) {
    const { team_id } = useParams()
    const queryClient = useQueryClient()
    const demoteMutation = useMutation({
        mutationFn: () => demoteMember(team_id, selectedMember.user__id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(team_id) })
            queryClient.invalidateQueries({ queryKey: teamKeys.list })
            setIsMemberOpen(false)
            setSelectedMember(null)
        },
        onError: (error) => {
            console.log(
                "ERROR",
                error.response?.data || error
            )
            alert(
                error.response?.data?.error ||
                "Something went wrong"
            )
        },
        onSettled: () => {
            setIsDemoteAYSOpen(false);
            setIsMemberOpen(false)
        },
    })

    const handleDemoteSubmit = async () => {
        if (demoteMutation.isPending) return
        demoteMutation.mutate()
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
                        disabled={demoteMutation.isPending}
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
                        {demoteMutation.isPending ? "Demoting..." : "Demote to Member"}
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
