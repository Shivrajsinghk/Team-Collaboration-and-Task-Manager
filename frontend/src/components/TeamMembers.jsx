import MemberCard from './MemberCard'

function TeamMembers({ filteredMembers = [], setSelectedMember = () => {}, setIsMemberOpen = () => {} }) {
    if (filteredMembers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
                <p className="text-sm font-medium text-zinc-400">No members found</p>
            </div>
        )
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {filteredMembers.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    onManage={() => {
                        setSelectedMember(member)
                        setIsMemberOpen(true)
                    }}
                />
            ))}
        </div>
    )
}

export default TeamMembers