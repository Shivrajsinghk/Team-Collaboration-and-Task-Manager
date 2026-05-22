import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

function CreateTeam({isCreateOpen, setIsCreateOpen, fetchapi, loading, setLoading, setIsAddTeamOpen}) {

    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("team_name"),   
            description: formData.get("team_description")    
        }
        if(!data.name || !data.name.trim()){
            alert("Team name is required");
            setLoading(false)
            return
        }
        try{
            const response = await api.post('api/teams/create/', data)
            fetchapi()
        }
        catch(error){
            console.log("ERROR", error.response || error);
        }
        finally {
            setLoading(false)
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
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Description (optional)</label>
                    <input
                        type="text"
                        name="team_description"
                        placeholder="Enter team description"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                    />
                </div>
                <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl py-3 text-sm font-semibold transition duration-300 ${
                loading
                ? "cursor-not-allowed bg-gray-500"
                : "bg-gradient-to-r from-teal-400 to-cyan-500 text-black hover:scale-[1.01]"
                }`}
                >
                    {loading ? "Creating..." : "Create Team"}
                </button>
            </form>
        </Modal>
    )
}

export default CreateTeam