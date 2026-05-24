import React from 'react'
import Modal from './Modal'
import { joinTeam } from '../api/teams'

function JoinTeam({isJoinOpen, setIsJoinOpen, fetchapi, loading, setLoading, setIsAddTeamOpen}) {

    const handleJoinSubmit = async (e) => {
        e.preventDefault()
        if (loading) return; 
        setLoading(true);
        const formData = new FormData(e.target);
        const data = {
            invite_code: formData.get("team_invite_code"),   
        }
        if(!data.invite_code || !data.invite_code.trim()){
            alert("Team's Invite Code is required");
            setLoading(false)
            return
        }
        try{
            await joinTeam(data)
            fetchapi()
        }
        catch(error){
            console.log("ERROR", error.response || error);
            alert(error.response.data.error)
        }
        finally {
            setLoading(false)
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
                    {loading ? "Joining..." : "Join Team"}
                </button>
            </form>
        </Modal>
    )
}

export default JoinTeam
