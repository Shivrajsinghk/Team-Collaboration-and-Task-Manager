import React, { useContext, useEffect } from 'react'
import { Clock3 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import ActivityMessage from './ActivityMessage'
import { TeamActivityContext } from '../context/TeamActivityContext'

const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true
    })
}
function TeamActivity() {
    const { team_id } = useParams()
    const { activities, fetchTeamActivities } = useContext(TeamActivityContext)

    useEffect(() => {
        fetchTeamActivities(team_id)
    }, [fetchTeamActivities, team_id])

    return (
        <div className="bg-[#071717] border border-green-500/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.03)]">
            <div className="flex items-center gap-3 mb-6">
                <Clock3 className="text-green-400" size={28} />
                <h2 className="text-2xl font-bold text-white">
                    Team Activity
                </h2>
            </div>
            <div className="relative max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-teal-500/40 hover:scrollbar-thumb-teal-400/60">
                <div className="relative">
                    {activities.length > 0 &&
                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-cyan-500/20"></div>
                    }
                    {/* Activities */}
                    <div className="space-y-8">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="relative flex gap-4 group"
                                >
                                    <div className="relative z-10 mt-8">
                                        <div className="w-4 h-4 rounded-full bg-green-400 border-4 border-[#071717]"></div>
                                    </div>
                                    <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.05] hover:border-cyan-500/20">
                                        <p className="text-[15px] text-gray-200 leading-relaxed">
                                            <ActivityMessage activity={activity} />
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock3 size={14} className="text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                {formatTime(activity.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className='text-red-400 font-medium'>No Activity till now</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamActivity
