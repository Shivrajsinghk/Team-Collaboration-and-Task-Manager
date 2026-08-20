import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Trash2, LogOut, Barcode } from 'lucide-react'
import Loading from '../components/Loading'
import TeamInfo from '../components/TeamInfo'
import LeaveTeam from '../Modal/LeaveTeam'
import DeleteTeam from '../Modal/DeleteTeam'
import TeamInviteCode from '../Modal/TeamInviteCode'
import PreviousPageButton from '../components/PreviousPageButton'
import { getTeam, updateTeam } from '../api/teams'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'

const getFormData = (team) => ({
    name: team?.team?.name || '',
    description: team?.team?.description || '',
})

function UpdateTeam() {
    const { team_id } = useParams()
    const navigate = useNavigate()
    const [isLeaveOpen, setIsLeaveOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data: team = null, isLoading: loading } = useQuery({
        queryKey: teamKeys.detail(team_id),
        queryFn: async () => {
            const response = await getTeam(team_id)
            return response.data
        },
        enabled: !!team_id,
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    })
    const [formData, setFormData] = useState(() => getFormData(team))
    const [formDataTeam, setFormDataTeam] = useState(team)

    if (team !== formDataTeam) {
        setFormDataTeam(team)
        setFormData(getFormData(team))
    }
    const updateTeamMutation = useMutation({
        mutationFn: (payload) => updateTeam(team_id, payload),
        onSuccess: (response) => {
            queryClient.setQueryData(teamKeys.detail(team_id), (previous) => {
                if (!previous) {
                    return { team: response.data }
                }
                return { ...previous, team: response.data }
            })
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(team_id) })
            queryClient.invalidateQueries({ queryKey: teamKeys.list })
            navigate(`/team/${team_id}`)
        }
    })
    const isAdmin = team?.team?.is_admin

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = () => {
        updateTeamMutation.mutate(formData)
    }

    return (
        <>
            {loading && (
                <div className="absolute top-4 right-4">
                    <Loading />
                </div>
            )}
            <div className="min-h-screen ml-2 bg-base text-ink">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="relative flex flex-row justify-center items-center gap-4">
                            <PreviousPageButton className="" />
                            <h1 className="text-center pb-3 text-4xl font-bold">Update Team</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                    <div className="flex flex-col space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <section className="rounded-xl border border-border bg-surface p-7">
                                <h2 className="mb-5 text-xl font-semibold text-ink">General Settings</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-muted">Team Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-xl border border-border bg-surface-alt px-5 py-4 text-lg font-semibold text-ink outline-none transition-colors focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted">Team Description</label>
                                        <textarea
                                            rows={5}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-xl border border-border bg-surface-alt p-5 text-sm text-muted outline-none resize-none transition-colors focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </section>
                            <div>
                                <TeamInfo team={team} />
                            </div>
                            <section className="rounded-xl border border-border bg-surface p-6">
                                <h3 className="text-lg font-semibold text-ink">Invite Members</h3>
                                <p className="mt-1 text-sm text-muted">Share your invite code with teammates.</p>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent px-4 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover hover:border-accent-hover"
                                >
                                    <Barcode size={18} />
                                    View Invite Code
                                </button>
                            </section>
                            <section className="rounded-xl border border-danger/20 bg-surface p-6">
                                <h3 className="text-lg font-semibold text-ink">Danger Zone</h3>
                                <p className="mt-1 text-sm text-muted">Sensitive actions for this workspace.</p>
                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={() => setIsLeaveOpen(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-5 py-3 font-semibold text-danger transition-colors duration-150 hover:border-danger hover:bg-danger/20"
                                    >
                                        <LogOut size={18} />
                                        Leave Team
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setIsDeleteOpen(true)}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-danger transition-colors hover:bg-danger/20"
                                        >
                                            <Trash2 size={18} />
                                            Delete Team
                                        </button>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <TeamInviteCode isInviteOpen={isInviteOpen} setIsInviteOpen={setIsInviteOpen} team={team} />
            <LeaveTeam isLeaveOpen={isLeaveOpen} setIsLeaveOpen={setIsLeaveOpen} />
            <DeleteTeam isDeleteOpen={isDeleteOpen} setIsDeleteOpen={setIsDeleteOpen} team={team} />
        </>
    )
}

export default UpdateTeam
