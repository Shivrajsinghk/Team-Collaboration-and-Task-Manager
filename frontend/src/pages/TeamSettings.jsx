import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2, LogOut, Barcode } from 'lucide-react'
import Loading from '../components/Loading'
import TeamInfo from '../components/TeamInfo'
import LeaveTeam from '../Modal/LeaveTeam'
import DeleteTeam from '../Modal/DeleteTeam'
import TeamInviteCode from '../Modal/TeamInviteCode'
import PreviousPageButton from '../components/PreviousPageButton'
import { getTeam, updateTeam } from '../api/teams'

function UpdateTeam() {
    const { team_id } = useParams()
    const [team, setTeam] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [isLeaveOpen, setIsLeaveOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    })
    const isAdmin = team?.team?.is_admin
    
    useEffect(() => {
        const fetchTeam = async () => {
            try{
                const response = await getTeam(team_id)
                setTeam(response.data)
                setFormData({
                    name: response.data?.team?.name || '',
                    description: response.data?.team?.description || '',
                })
            }
            catch (err) {
                console.log(err.response?.data || err)
            }
            finally {
                setLoading(false)
            }
        }
        fetchTeam()
    }, [team_id])

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSave = () => {
        async function fetchsave(){
            try{
                const response = await updateTeam(team_id, formData)
                setTeam(response.data)
                navigate(`/team/${team_id}`)
            }
            catch(error){
                console.log(error.response?.data || error)
            }
        }
        fetchsave()
    }

    return (
        <>
            {loading && (
                <div className="absolute top-4 right-4">
                    <Loading />
                </div>
            )}
            <div className="min-h-screen ml-2 bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div className='relative flex flex-row justify-center items-center gap-4'>
                            <PreviousPageButton className=''/>
                            <h1 className='text-center pb-3 text-4xl font-bold'>Update Team</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            className="
                            flex items-center gap-2
                            rounded-2xl
                            bg-cyan-500
                            px-5 py-3
                            font-medium
                            text-black
                            transition
                            hover:bg-cyan-400
                            "
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                    <div className="flex flex-col space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-7">
                                <h2 className="mb-5 text-xl font-semibold text-white">
                                    General Settings
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">
                                            Team Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="
                                            mt-2
                                            w-full
                                            rounded-2xl
                                            border border-white/[0.08]
                                            bg-black/20
                                            px-5 py-4
                                            text-lg
                                            font-semibold
                                            text-white
                                            outline-none
                                            transition
                                            focus:border-cyan-500/40
                                            "
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">
                                            Team Description
                                        </label>
                                        <textarea
                                            rows={5}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="
                                            mt-2
                                            w-full
                                            rounded-2xl
                                            border border-white/[0.08]
                                            bg-black/20
                                            p-5
                                            text-sm
                                            text-gray-300
                                            outline-none
                                            resize-none
                                            transition
                                            focus:border-cyan-500/40
                                            "
                                        />
                                    </div>
                                </div>
                            </section>
                            <div>
                                <TeamInfo team={team} />
                            </div>
                            <section className="rounded-[2rem] border border-cyan-500/10 bg-cyan-500/[0.03] p-6">
                                <h3 className="text-lg font-semibold text-white">
                                    Invite Members
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Share your invite code with teammates.
                                </p>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="
                                    mt-5
                                    flex w-full items-center justify-center gap-2
                                    rounded-2xl
                                    border border-cyan-500/20
                                    bg-cyan-500/10
                                    px-4 py-3
                                    font-medium
                                    text-cyan-300
                                    transition
                                    hover:bg-cyan-500/20
                                    "
                                >
                                    <Barcode size={18} />
                                    View Invite Code
                                </button>
                            </section>
                            <section className="rounded-[2rem] border border-red-500/15 bg-red-500/[0.03] p-6">
                                <h3 className="text-lg font-semibold text-white">
                                    Danger Zone
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Sensitive actions for this workspace.
                                </p>
                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={() => setIsLeaveOpen(true)}
                                        className="
                                        flex w-full items-center justify-center gap-2
                                        rounded-2xl
                                        border border-white/[0.08]
                                        px-4 py-3
                                        transition
                                        hover:bg-white/[0.04]
                                        "
                                    >
                                        <LogOut size={18} />
                                        Leave Team
                                    </button>
                                    {isAdmin &&
                                        <button
                                            onClick={() => setIsDeleteOpen(true)}
                                            className="
                                            flex w-full items-center justify-center gap-2
                                            rounded-2xl
                                            border border-red-500/20
                                            bg-red-500/10
                                            px-4 py-3
                                            text-red-300
                                            transition
                                            hover:bg-red-500/20
                                            "
                                        >
                                            <Trash2 size={18} />
                                            Delete Team
                                        </button>
                                    }
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <TeamInviteCode 
            isInviteOpen={isInviteOpen}
            setIsInviteOpen={setIsInviteOpen}
            team={team}
            />

            <LeaveTeam 
            isLeaveOpen={isLeaveOpen}
            setIsLeaveOpen={setIsLeaveOpen}
            loading={loading} 
            setLoading={setLoading}
            />

            <DeleteTeam 
            isDeleteOpen={isDeleteOpen}
            setIsDeleteOpen={setIsDeleteOpen}
            loading={loading} 
            setLoading={setLoading}
            team={team}
            />
        </>
    )
}

export default UpdateTeam
