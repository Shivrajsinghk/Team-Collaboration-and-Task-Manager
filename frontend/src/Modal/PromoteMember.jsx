import React from 'react'
import Modal from './Modal'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'
import { promoteMember } from '../api/teams'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function PromoteMember({
    isPromoteAYSOpen,
    setIsPromoteAYSOpen, 
    selectedMember,
    setSelectedMember,
    setIsMemberOpen,
}) {
    const { team_id } = useParams()
    const queryClient = useQueryClient()
    const promoteMutation = useMutation({
        mutationFn: () => promoteMember(team_id, selectedMember.user__id),
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
            setIsPromoteAYSOpen(false);
            setIsMemberOpen(false)
        },
    })

    const handlePromoteSubmit = async () => {
        if (promoteMutation.isPending) return
        promoteMutation.mutate()
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
                        disabled={promoteMutation.isPending}
                        className="
                        px-4 py-2 rounded-xl
                        bg-[#2CFF05]/70
                        hover:bg-[#25D604]
                        text-white
                        transition
                        font-medium
                        "
                    >
                        {promoteMutation.isPending ? "Promoting..." : "Promote to Admin"}
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
