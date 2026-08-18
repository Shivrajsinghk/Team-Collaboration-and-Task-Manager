import React from 'react'
import Modal from './Modal'
import { joinTeam } from '../api/teams'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function JoinTeam({isJoinOpen, setIsJoinOpen, setIsAddTeamOpen}) {
    const queryClient = useQueryClient()
    const joinTeamMutation = useMutation({
        mutationFn: (payload) => joinTeam(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.list })
        },
    })

    const handleJoinSubmit = async (e) => {
        e.preventDefault()
        if (joinTeamMutation.isPending) return
        const formData = new FormData(e.target);
        const data = {
            invite_code: formData.get("team_invite_code"),   
        }
        if(!data.invite_code || !data.invite_code.trim()){
            alert("Team's Invite Code is required");
            return
        }
        try{
            await joinTeamMutation.mutateAsync(data)
        }
        catch(error){
            const message = error.response || error
            alert(message)
        }
        finally {
            setIsJoinOpen(false);
            setIsAddTeamOpen(false)
        }
    }

    return (
        <Modal isOpen={isJoinOpen} onClose={setIsJoinOpen}>
            <form 
            onSubmit={handleJoinSubmit}
            className="space-y-5"
            >
                <h2 className="text-2xl font-bold text-white">
                    Join Team
                </h2>
                <div>
                    <label className="text-sm text-gray-400">Invite Code</label>
                    <input
                        type="text"
                        required
                        name="team_invite_code"
                        placeholder="Enter team's invite code"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#25D604] focus:outline-none"
                    />
                </div>
                <button
                type="submit"
                disabled={joinTeamMutation.isPending}
                className={`w-full rounded-2xl py-3 text-sm font-semibold transition duration-300 ${
                joinTeamMutation.isPending
                ? "cursor-not-allowed bg-gray-500"
                : "bg-[#2CFF05] text-black hover:scale-[1.01]"
                }`}
                >
                    {joinTeamMutation.isPending ? "Joining..." : "Join Team"}
                </button>
            </form>
        </Modal>
    )
}

export default JoinTeam
