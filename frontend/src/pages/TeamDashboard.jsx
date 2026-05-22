import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { ArrowLeft, Users, Crown, Shield, CalendarDays, UserCircle2, Info, Sparkles, ShieldCheck, Settings, Barcode } from 'lucide-react'
import TeamInfo from '../components/TeamInfo'
import TeamStats from '../components/TeamStats'
import UserProfilePfp from '../components/UserProfilePfp'
import TeamMembers from '../components/TeamMembers'
import PreviousPageButton from '../components/PreviousPageButton'
import TeamInviteCode from '../Modal/TeamInviteCode'
import TeamActivity from '../components/TeamActivity'

function TeamDashboard() {
    const { id } = useParams()
    const [team, setTeam] = useState(null)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const navigate = useNavigate()
    
    async function fetchapi(){
        try{
            const response = await api.get(`api/teams/${id}`)
            setTeam(response.data)
        }
        catch(error){
            console.log(error.response?.data)
        }
    }

    useEffect(() => {
        fetchapi()
    }, [id])

    return (
        <>
            <div className="min-h-screen bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 p-5 backdrop-blur-xl">
                        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-7">
                                <PreviousPageButton className="shrink-0" />
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-[var(--color-mint-cream)]">
                                        {team?.team?.name}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-cool-steel)]">
                                        {team?.team?.description || "Manage your team members, collaboration, and workflow in one place."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col relative z-10 items-center gap-2">
                                <button
                                    onClick={()=>navigate(`/team/${id}/settings`)}
                                    className="
                                    flex items-center gap-1
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/5
                                    px-3 py-2
                                    text-xs font-medium
                                    cursor-pointer
                                    text-[var(--color-mint-cream)]
                                    transition-all duration-200
                                    hover:border-cyan-400/30
                                    hover:bg-cyan-500/10
                                    hover:text-cyan-300
                                    "
                                >
                                    <Settings size={16} />
                                    Team Settings
                                </button>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="
                                    flex items-center gap-1
                                    rounded-2xl
                                    cursor-pointer
                                    text-xs
                                    border border-cyan-500/20
                                    bg-cyan-500/10
                                    px-3 py-2
                                    font-medium
                                    text-cyan-300
                                    transition-all duration-200
                                    hover:bg-cyan-500/20
                                    hover:border-cyan-400/30
                                    "
                                >
                                    <Barcode size={16} />
                                    View Invite Code
                                </button>
                            </div>
                        </div>
                    </div>
                    <TeamStats team={team}/>
                    <div 
                    className="mt-8 grid gap-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
                        {/* Team Members */}
                        <TeamMembers 
                        team={team} 
                        />
                    </div>
                    <div className='mt-8'>
                        <TeamActivity />
                    </div>
                </div>
            </div>

            <TeamInviteCode 
                isInviteOpen={isInviteOpen}
                setIsInviteOpen={setIsInviteOpen}
                team={team}
            />
        </>
    )
}

export default TeamDashboard