import React, { useState } from 'react'
import Teams from './Teams'
import { useNavigate } from 'react-router-dom';
import UserProfilePfp from '../components/UserProfilePfp';
import { LayoutDashboard, Users, CirclePlus } from "lucide-react"
import CreateTeam from '../Modal/CreateTeam';
import JoinTeam from '../Modal/JoinTeam';
import AddTeam from '../Modal/AddTeam';
import { listTeams } from '../api/teams';
import { useCurrentUserQuery } from '../hooks/useCurrentUserQuery';
import { useQuery } from '@tanstack/react-query';
import { teamKeys } from '../api/queryKeys';

function Dashboard() {
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isJoinOpen, setIsJoinOpen] = useState(false)
    const navigate = useNavigate()
    const { data: profile } = useCurrentUserQuery()
    const { data: teams = [] } = useQuery({
        queryKey: teamKeys.list,
        queryFn: async () => {
            const response = await listTeams()
            return response.data
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    })

    const sidebarBtn = "flex w-full items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-alt hover:text-ink"
    const sidebarBtnActive = "flex w-full items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium bg-accent/10 text-accent border border-accent/20 transition-colors duration-150"

    return (
        <>
            <div className="flex">    
                {/* Side Bar */}
                <aside className="mt-3 w-full h-full flex flex-col fixed top-0 left-0 max-w-[240px] py-6 px-3 overflow-auto bg-gradient-to-b from-surface to-base border-r border-border">
                    <hr className="my-5 border-border" />
                    {/* Side Bar Fields */}
                    <nav className="mt-6 flex-1 px-4">
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={sidebarBtnActive}
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
                        className="mx-4 mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition duration-300 hover:bg-surface-alt"
                    >
                        <UserProfilePfp />
                        <div className="overflow-hidden">
                            <p className="truncate text-sm capitalize font-semibold text-ink">
                                {profile?.full_name}
                            </p>
                        </div>
                    </div>
                </aside>
                
                {/* Main Section */}
                <div className="ml-[240px] w-full min-h-screen text-ink">
                    <div className="mx-auto max-w-7xl xl:max-w-[1400px] px-6 py-6">
                        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/[0.06] blur-3xl" />
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm text-muted">
                                        Welcome back 👋
                                    </p>
                                    <h1 className="mt-1 text-3xl capitalize font-bold tracking-tight text-ink">
                                        {profile?.first_name}
                                    </h1>
                                </div>
                                <div className="grid grid-cols-2 gap-5 lg:w-[320px]">
                                    <div className="rounded-2xl border border-border bg-surface-alt p-4">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                                            Teams
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-ink">
                                            {teams.length}
                                        </h2>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-surface-alt p-4">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                                            Tasks
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-ink">
                                            {profile?.total_tasks ?? 0}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <Teams teams={teams} />
                    </div>
                </div>
            </div>

            <AddTeam 
            isAddTeamOpen={isAddTeamOpen}
            setIsAddTeamOpen={setIsAddTeamOpen}
            setIsCreateOpen={setIsCreateOpen}
            setIsJoinOpen={setIsJoinOpen}
            />

            <CreateTeam 
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            setIsAddTeamOpen={setIsAddTeamOpen}
            />

            <JoinTeam 
            isJoinOpen={isJoinOpen}
            setIsJoinOpen={setIsJoinOpen}
            setIsAddTeamOpen={setIsAddTeamOpen}
            />
        </>
    )
}

export default Dashboard