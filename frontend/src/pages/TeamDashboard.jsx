import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import {
    ArrowLeft,
    Users,
    Crown,
    Shield,
    CalendarDays,
    UserCircle2,
    Info,
    Sparkles,
    ShieldCheck
} from 'lucide-react'
import TeamInfo from '../components/TeamInfo'
import TeamStats from '../components/TeamStats'
import UserProfilePfp from '../components/UserProfilePfp'
import TeamMembers from '../components/TeamMembers'
import PreviousPageButton from '../components/PreviousPageButton'

function TeamDashboard() {
    const { id } = useParams()
    const [team, setTeam] = useState(null)
    const navigate = useNavigate()
    
    async function fetchapi(){
        try{
            const response = await api.get(`/teams/${id}`)
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
        <div className="min-h-screen bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 p-7 backdrop-blur-xl">
                    <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <PreviousPageButton className="absolute left-8 top-8" />
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-mint-cream)]">
                            {team?.team?.name}
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--color-cool-steel)]">
                            {team?.team?.description || "Manage your team members, collaboration, and workflow in one place."}
                        </p>
                    </div>
                </div>
                <TeamStats team={team}/>
                <div 
                className="mt-8 grid gap-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
                    {/* Team Members */}
                    <TeamMembers team={team} />
                </div>
            </div>
        </div>
    )
}

export default TeamDashboard