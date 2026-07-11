import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, ShieldCheck, UserPlus, Search } from 'lucide-react'
import TeamMembers from '../components/TeamMembers'
import TeamInviteCode from '../Modal/TeamInviteCode'
import KickFromTeam from '../Modal/KickFromTeam'
import TeamMember from '../Modal/TeamMember'
import PromoteMember from '../Modal/PromoteMember'
import DemoteMember from '../Modal/DemoteMember'
import { getTeam, teamMembersPresence } from '../api/teams'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

function Members() {
    const { team_id } = useParams()
    const [isMemberOpen, setIsMemberOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isPromoteAYSOpen, setIsPromoteAYSOpen] = useState(false)
    const [isDemoteAYSOpen, setIsDemoteAYSOpen] = useState(false)
    const [isKickAYSOpen, setIsKickAYSOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { data: team = null } = useQuery({
        queryKey: teamKeys.detail(team_id),
        queryFn: async () => {
            const response = await getTeam(team_id)
            return response.data
        },
        enabled: !!team_id,
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    })
    const { data: presenceMembers = [] } = useQuery({
        queryKey: teamKeys.membersPresence(team_id),
        queryFn: async () => {
            const response = await teamMembersPresence(team_id)
            return response.data
        },
        enabled: !!team_id,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    })
    const isAdmin = team?.team?.is_admin

    const presenceByUserId = new Map(presenceMembers.map((member) => [member.id, member]))

    const membersWithPresence = (team?.team?.all_members || []).map((member) => ({
        ...member,
        user__profile__is_online: presenceByUserId.has(member.user__id)
            ? presenceByUserId.get(member.user__id).is_online
            : member.user__profile__is_online,
        user__profile__last_seen: presenceByUserId.has(member.user__id)
            ? presenceByUserId.get(member.user__id).last_seen
            : member.user__profile__last_seen,
    }))

    const filteredMembers = membersWithPresence.filter(member => {
        const name = `${member.user__first_name} ${member.user__last_name}`.toLowerCase()
        const username = member.user__username?.toLowerCase()
        const query = searchQuery.toLowerCase()
        return name.includes(query) || username?.includes(query)
    })

    return (
        <>
            <div className="ml-2 min-h-screen bg-base text-ink">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-accent/10 p-3 text-accent">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                                <ShieldCheck size={16} />
                                Admin Access
                            </div>
                        )}
                    </div>
                    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="p-3 min-w-[500px]">
                            <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-2 transition-colors duration-150 focus-within:border-accent">
                                <Search size={18} className="text-muted transition-colors duration-150 group-focus-within:text-accent" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search members..."
                                    className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="flex items-center gap-2 rounded-xl border border-accent bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover hover:border-accent-hover"
                                >
                                    <UserPlus size={18} />
                                    Invite Member
                                </button>
                            )}
                        </div>
                    </div>
                    <section className="rounded-xl border border-border bg-surface p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-ink">Members</h2>
                                <p className="mt-1 text-sm text-muted">
                                    {searchQuery ? `${filteredMembers.length} of ${membersWithPresence.length} members` : `${membersWithPresence.length} total members`}
                                </p>
                            </div>
                        </div>
                        <TeamMembers
                            team={team}
                            filteredMembers={filteredMembers}
                            setSelectedMember={setSelectedMember}
                            setIsMemberOpen={setIsMemberOpen}
                            isAdmin={isAdmin}
                        />
                    </section>
                </div>
            </div>

            <TeamInviteCode
                isInviteOpen={isInviteOpen}
                setIsInviteOpen={setIsInviteOpen}
                team={team}
            />

            <TeamMember
                isMemberOpen={isMemberOpen}
                setIsMemberOpen={setIsMemberOpen}
                team={team}
                setIsKickAYSOpen={setIsKickAYSOpen}
                setIsPromoteAYSOpen={setIsPromoteAYSOpen}
                setIsDemoteAYSOpen={setIsDemoteAYSOpen}
                selectedMember={selectedMember}
            />

            <PromoteMember
                isPromoteAYSOpen={isPromoteAYSOpen}
                setIsPromoteAYSOpen={setIsPromoteAYSOpen}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                setIsMemberOpen={setIsMemberOpen}
            />

            <DemoteMember
                isDemoteAYSOpen={isDemoteAYSOpen}
                setIsDemoteAYSOpen={setIsDemoteAYSOpen}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                setIsMemberOpen={setIsMemberOpen}
            />

            <KickFromTeam
                isKickAYSOpen={isKickAYSOpen}
                setIsKickAYSOpen={setIsKickAYSOpen}
                selectedMember={selectedMember}
                setIsMemberOpen={setIsMemberOpen}
            />
        </>
    )
}

export default Members