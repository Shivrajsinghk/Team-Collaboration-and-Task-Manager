import React from 'react'
import { Clock3 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import ActivityMessage from './ActivityMessage'
import { useQuery } from '@tanstack/react-query'
import { listTeamActivities } from '../api/activity'
import { teamKeys } from '../api/queryKeys'

const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true
    })
}
function TeamActivity() {
    const { team_id } = useParams()
    const { data: activities = [] } = useQuery({
        queryKey: teamKeys.activities(team_id),
        queryFn: async () => {
            const response = await listTeamActivities(team_id)
            return response.data
        },
        enabled: !!team_id,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    return (
        <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Clock3 className="text-accent" size={28} />
                <h2 className="text-2xl font-bold text-ink">
                    Team Activity
                </h2>
            </div>
            <div className="relative max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/40 hover:scrollbar-thumb-accent-hover/60">
                <div className="relative">
                    {activities.length > 0 &&
                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-border"></div>
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
                                        <div className="w-4 h-4 rounded-full bg-accent border-4 border-surface"></div>
                                    </div>
                                    <div className="flex-1 bg-surface-alt border border-border rounded-xl p-4 transition-colors duration-150 hover:border-accent/30">
                                        <div className="text-[15px] text-muted leading-relaxed">
                                            <ActivityMessage activity={activity} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock3 size={14} className="text-muted" />
                                            <p className="text-xs text-muted">
                                                {formatTime(activity.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className='text-danger font-medium'>No Activity till now</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamActivity