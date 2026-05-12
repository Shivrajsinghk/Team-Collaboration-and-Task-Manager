import { Users } from 'lucide-react'
import MemberCard from './MemberCard'

function TeamMembers({
    team = null, 
    setSelectedMember = () => {}, 
    setIsMemberOpen = () => {}
}) {

    return (
        <div>
            <div className="mb-6 flex items-center gap-3">
                <Users className="text-teal-300" size={24} />
                <h2 className="text-2xl font-bold text-white">
                    Team Members
                </h2>
            </div>
            <div className="space-y-4">
                {team?.team?.all_members?.map((member) => (
                    <MemberCard
                    key={member.id}
                    member={member}
                    onClick={() => {
                        setSelectedMember(member)
                        setIsMemberOpen(true)
                    }}
                    />
                ))}
            </div>
        </div>
    )
}

export default TeamMembers