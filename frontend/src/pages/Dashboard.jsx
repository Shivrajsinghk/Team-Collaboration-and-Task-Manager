import React, { useEffect, useState } from 'react'
import Teams from './Teams'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom';
import UserProfilePfp from '../components/UserProfilePfp';
import {
    LayoutDashboard,
    Users,
    PlusCircle,
    UserPlus,
    Sparkles,
    ArrowRight,
    Plus,
    Hash,
    CirclePlus,
} from "lucide-react"
import CreateTeam from '../Modal/CreateTeam';
import JoinTeam from '../Modal/JoinTeam';
import AddTeam from '../Modal/AddTeam';

function Dashboard() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const [profile, setProfile] = useState('')
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isJoinOpen, setIsJoinOpen] = useState(false)
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchapi()
    }, [])

    async function fetchapi() {
        try {
            const response = await api.get('teams/')
            setTeams(response.data)
        } catch (err) {
            console.log(err)
            setTeams([])
        }
    }

    useEffect(() => {
        const fetchprofile = async () => {
            try {
                const response = await api.get("user_profile/")
                setProfile(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchprofile()
    }, [])

    const sidebarBtn =
    "flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-[var(--color-cool-steel)] transition-all duration-300 hover:bg-white/[0.05] hover:text-white"

    return (
        <>
            <div className="flex">    
                {/* Side Bar */}
                <aside className="bg-white mt-3 dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 w-full h-full flex flex-col fixed top-0 left-0 max-w-[240px] py-6 px-3 overflow-auto bg-[linear-gradient(180deg,var(--color-onyx),var(--color-jet-black))] border-r border-[var(--color-cool-steel)]/15">
                    <hr className="my-5 border-slate-300 dark:border-neutral-700" />
                    {/* Side Bar Fields */}
                    <nav className="mt-6 flex-1 px-4">
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={sidebarBtn}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        document.getElementById("teams")?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start"
                                        })
                                    }}
                                    className={sidebarBtn}
                                >
                                    <Users size={18} />
                                    Teams
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {setIsAddTeamOpen(true)}}
                                    className={sidebarBtn}
                                >
                                    <CirclePlus size={18} />
                                    Add a Team
                                </button>
                            </li>
                        </ul>
                    </nav>
                    {/* Profile */}
                    <div
                        onClick={() => navigate("/profile")}
                        className="mx-4 mt-6 flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:bg-white/[0.05]"
                    >
                        <UserProfilePfp />
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-semibold text-white">
                                {profile?.full_name}
                            </p>
                            <p className="truncate text-xs text-[var(--color-cool-steel)]">
                                {profile?.status}
                            </p>
                        </div>
                    </div>
                </aside>
                <div className="ml-[240px] w-full min-h-screen text-white">
                    <div className="mx-auto max-w-7xl xl:max-w-[1400px] px-6 py-6">
                        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#112826_0%,#081312_45%,#020404_100%)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/[0.05] blur-3xl" />
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Welcome back
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                                        {profile?.first_name}
                                    </h1>
                                </div>
                                <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                                            Teams
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">
                                            {teams.length}
                                        </h2>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                                            Tasks
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">
                                            12
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <Teams teams={teams} />
                    </div>
                </div>
            </div>

            {/* Add Team Modal */}
            <AddTeam 
            isAddTeamOpen={isAddTeamOpen}
            setIsAddTeamOpen={setIsAddTeamOpen}
            setIsCreateOpen={setIsCreateOpen}
            setIsJoinOpen={setIsJoinOpen}
            />

            {/* Create Team Modal */}
            <CreateTeam 
            loading={loading}
            setLoading={setLoading}
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            fetchapi={fetchapi}
            setIsAddTeamOpen={setIsAddTeamOpen}
            />

            {/* Join Team Modal */}
            <JoinTeam 
            loading={loading}
            setLoading={setLoading}
            fetchapi={fetchapi}
            isJoinOpen={isJoinOpen}
            setIsJoinOpen={setIsJoinOpen}
            setIsAddTeamOpen={setIsAddTeamOpen}
            />
        </>
    )
}

export default Dashboard