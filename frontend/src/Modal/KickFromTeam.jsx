import React from 'react'
import Modal from './Modal'
import { useParams } from 'react-router-dom'
import UserProfilePfp from '../components/UserProfilePfp'
import { removeUserFromTeam } from '../api/teams'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function KickFromTeam({
    isKickAYSOpen, 
    setIsKickAYSOpen, 
    selectedMember,
    setIsMemberOpen,
}) {

    const { team_id } = useParams()
    const queryClient = useQueryClient()
    const kickMutation = useMutation({
        mutationFn: () => removeUserFromTeam(team_id, selectedMember.user__id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(team_id) })
            queryClient.invalidateQueries({ queryKey: teamKeys.list })
            setIsMemberOpen(false)
        },
        onError: (error) => {
            const message = error.response?.data?.error || error
            alert(message)
        },
        onSettled: () => {
            setIsKickAYSOpen(false);
        },
    })

    const handleKickSubmit = async (e) => {
        e.preventDefault()
        if (kickMutation.isPending) return
        kickMutation.mutate()
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
                        disabled={kickMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
                    >
                        {kickMutation.isPending ? "Kicking..." : "Kick Member"}
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