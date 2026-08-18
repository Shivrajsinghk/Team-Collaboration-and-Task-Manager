import React, { useContext } from 'react'
import Modal from './Modal'
import { TeamActivityContext } from '../context/TeamActivityContext'
import { createTeam } from '../api/teams'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function CreateTeam({isCreateOpen, setIsCreateOpen, setIsAddTeamOpen}) {

    const { fetchTeamActivities } = useContext(TeamActivityContext)
    const queryClient = useQueryClient()
    const createTeamMutation = useMutation({
        mutationFn: (payload) => createTeam(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.list })
        },
    })
    
    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        if (createTeamMutation.isPending) return
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("team_name"),   
            description: formData.get("team_description")    
        }
        if(!data.name || !data.name.trim()){
            alert("Team name is required");
            return
        }
        try{
            await createTeamMutation.mutateAsync(data)
        }
        finally {
            setIsCreateOpen(false);
            setIsAddTeamOpen(false)
        }
    }

    return (
        <Modal isOpen={isCreateOpen} onClose={setIsCreateOpen}>
            <form 
            onSubmit={handleCreateSubmit}
            className="space-y-5"
            >
                <h2 className="text-2xl font-bold text-white">
                    Create Team
                </h2>
                <div>
                    <label className="text-sm text-gray-400">Team Name</label>
                    <input
                        type="text"
                        name="team_name"
                        required
                        placeholder="Enter team name"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#25D604] focus:outline-none"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Description (optional)</label>
                    <input
                        type="text"
                        name="team_description"
                        placeholder="Enter team description"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#25D604] focus:outline-none"
                    />
                </div>
                <button
                type="submit"
                disabled={createTeamMutation.isPending}
                className={`w-full rounded-2xl py-3 text-sm font-semibold transition duration-300 ${
                createTeamMutation.isPending
                ? "cursor-not-allowed bg-gray-500"
                : "bg-[#2CFF05] text-black hover:scale-[1.01]"
                }`}
                >
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </button>
            </form>
        </Modal>
    )
}

export default CreateTeam
