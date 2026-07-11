import MemberCard from './MemberCard'

function TeamMembers({ 
    filteredMembers = [], 
    setSelectedMember = () => {}, 
    setIsMemberOpen = () => {},
    isAdmin
}) {
    if (filteredMembers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-alt py-16 text-center">
                <p className="text-sm font-medium text-muted">No members found</p>
            </div>
        )
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {filteredMembers.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    isAdmin={isAdmin}
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