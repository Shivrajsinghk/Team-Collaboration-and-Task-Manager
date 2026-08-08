import TeamCard from '../components/TeamCard'

function Teams({teams}) {
    return (
        <>
            {teams.length ? (
                <section id="teams" className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {teams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </section>
            ) : (
                <section className="mt-10 flex min-h-[320px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border bg-surface px-8 text-center backdrop-blur-xl">
                    <h2 className="mt-8 text-3xl font-bold text-ink">
                        No teams yet
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                        Create your first team and start collaborating with your team members.
                    </p>
                </section>
            )}
        </>
    )
}

export default Teams