import React from 'react'

import { CheckCircle2, Trash2, Flag, UserPlus, UserMinus, Pencil, CalendarDays, Rocket, BadgePlus, LogOut, ShieldCheck, ShieldX, FolderKanban, ArrowRightLeft } from 'lucide-react'

const activityIcons = {
    TASK_CREATED: <FolderKanban size={18} className="text-green-400 mt-0.5" />,
    TASK_DELETED: <Trash2 size={18} className="text-red-400 mt-0.5" />,
    TASK_STATUS_CHANGED: <ArrowRightLeft size={18} className="text-cyan-400 mt-0.5" />,
    TASK_PRIORITY_CHANGED: <Flag size={18} className="text-orange-400 mt-0.5" />,
    TASK_ASSIGNED: <UserPlus size={18} className="text-purple-400 mt-0.5" />,
    TASK_UNASSIGNED: <UserMinus size={18} className="text-pink-400 mt-0.5" />,
    TASK_TITLE_CHANGED: <Pencil size={18} className="text-yellow-400 mt-0.5" />,
    TASK_DUE_DATE_CHANGED: <CalendarDays size={18} className="text-blue-400 mt-0.5" />,
    TEAM_CREATED: <Rocket size={18} className="text-green-400 mt-0.5" />,
    TEAM_NAME_CHANGED: <Pencil size={18} className="text-cyan-400 mt-0.5" />,
    NEW_MEMBER_JOINED_TEAM: <BadgePlus size={18} className="text-emerald-400 mt-0.5" />,
    MEMBER_LEFT_TEAM: <LogOut size={18} className="text-gray-400 mt-0.5" />,
    MEMBER_REMOVED_FROM_TEAM: <UserMinus size={18} className="text-red-400 mt-0.5" />,
    MEMBER_PROMOTED_IN_TEAM: <ShieldCheck size={18} className="text-green-400 mt-0.5" />,
    MEMBER_DEMOTED_IN_TEAM: <ShieldX size={18} className="text-yellow-400 mt-0.5" />,
}

const Actor = ({ children }) => (
    <span className="font-semibold capitalize text-cyan-400">
        {children}
    </span>
)

const Task = ({ children }) => (
    <span className="font-bold text-white capitalize">
        "{children}"
    </span>
)

const Highlight = ({ children, color = "text-green-400" }) => (
    <span className={`${color} capitalize font-medium`}>
        {children}
    </span>
)

function ActivityMessage({ activity }) {

    const actor = activity.actor.username
    const metadata = activity.metadata || {}

    const taskTitle =
        activity.task?.title ||
        metadata.task_title

    const icon = activityIcons[activity.activity_type] || "📍"

    switch (activity.activity_type) {
        case 'TASK_STATUS_CHANGED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        moved{" "}
                        <Task>{taskTitle}</Task>{" "}
                        from{" "}
                        <Highlight color="text-yellow-400">
                            {metadata.old_status?.replace("_", " ")}
                        </Highlight>{" "}
                        to{" "}
                        <Highlight color="text-green-400">
                            {metadata.new_status?.replace("_", " ")}
                        </Highlight>
                    </p>
                </div>
            )
        case 'TASK_PRIORITY_CHANGED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        changed priority of{" "}
                        <Task>{taskTitle}</Task>{" "}
                        from{" "}
                        <Highlight color="text-orange-400">
                            {metadata.old_priority}
                        </Highlight>{" "}
                        to{" "}
                        <Highlight color="text-red-400">
                            {metadata.new_priority}
                        </Highlight>
                    </p>
                </div>
            )
        case 'TASK_TITLE_CHANGED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        renamed task from{" "}
                        <Highlight color="text-yellow-400">
                            {metadata.old_title}
                        </Highlight>{" "}
                        to{" "}
                        <Highlight color="text-green-400">
                            {metadata.new_title}
                        </Highlight>
                    </p>
                </div>
            )
        case 'TASK_DUE_DATE_CHANGED':
            const oldDate = new Date(metadata.old_due_date)
            const newDate = new Date(metadata.new_due_date)
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        {oldDate > newDate ? (
                            <span>shortened deadline for </span>
                        ) : (
                            <span>extended deadline for </span>
                        )}
                        <Task>{taskTitle}</Task>{" "}
                        from{" "}
                        <Highlight color="text-yellow-400">
                            {metadata.old_due_date?.split(" ")[0]}
                        </Highlight>{" "}
                        to{" "}
                        <Highlight color="text-green-400">
                            {metadata.new_due_date?.split(" ")[0]}
                        </Highlight>
                    </p>
                </div>
            )
        case 'TASK_ASSIGNED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        assigned{" "}
                        <Highlight color="text-purple-400">
                            {metadata.assigned_member?.username}
                        </Highlight>{" "}
                        to{" "}
                        <Task>{taskTitle}</Task>
                    </p>
                </div>
            )
        case 'TASK_UNASSIGNED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        removed{" "}
                        <Highlight color="text-purple-400">
                            {metadata.unassigned_member?.username}
                        </Highlight>{" "}
                        from{" "}
                        <Task>{taskTitle}</Task>
                    </p>
                </div>
            )
        case 'TASK_CREATED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        created{" "}
                        <Task>{metadata.task_title}</Task>
                    </p>
                </div>
            )
        case 'TASK_DELETED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        deleted{" "}
                        <Task>{metadata.task_title}</Task>
                    </p>
                </div>
            )
        case 'TEAM_NAME_CHANGED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        renamed team from{" "}
                        <Highlight color="text-yellow-400">
                            {metadata.old_name}
                        </Highlight>{" "}
                        to{" "}
                        <Highlight color="text-green-400">
                            {metadata.new_name}
                        </Highlight>
                    </p>
                </div>
            )
        case 'NEW_MEMBER_JOINED_TEAM':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        joined the team
                    </p>
                </div>
            )
        case 'MEMBER_LEFT_TEAM':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        left the team
                    </p>
                </div>
            )
        case 'MEMBER_REMOVED_FROM_TEAM':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        removed{" "}
                        <Highlight color="text-purple-400">
                            {metadata.removed_member?.username}
                        </Highlight>{" "}
                        from the team
                    </p>
                </div>
            )
        case 'MEMBER_PROMOTED_IN_TEAM':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        promoted{" "}
                        <Highlight color="text-purple-400">
                            {metadata.removed_member.username}
                        </Highlight>{" "}
                        to admin
                    </p>
                </div>
            )
        case 'MEMBER_DEMOTED_IN_TEAM':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        demoted{" "}
                        <Highlight color="text-purple-400">
                            {metadata.removed_member.username}
                        </Highlight>{" "}
                        to member
                    </p>
                </div>
            )
        case 'TEAM_CREATED':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-lg">{icon}</span>
                    <p className="text-gray-200 leading-relaxed">
                        <Actor>{actor}</Actor>{" "}
                        created the team{" "}
                        <Highlight color="text-green-400">
                            {metadata.team_name}
                        </Highlight>
                    </p>
                </div>
            )
        default:
            return (
                <div className="flex items-center gap-3">
                    <span className="text-lg">📍</span>
                    <span className="text-gray-400">
                        Unknown activity
                    </span>
                </div>
            )
    }
}

export default ActivityMessage