import React from 'react'
import Modal from './Modal'

function AddTeam({isAddTeamOpen, setIsAddTeamOpen, setIsCreateOpen, setIsJoinOpen}) {

    return (
        <Modal isOpen={isAddTeamOpen} onClose={setIsAddTeamOpen}>
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-center text-white">
                        Teams
                    </h2>
                    <p className="mt-1 text-sm text-center text-gray-400">
                        Create a new team or join using an invite code.
                    </p>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    Create Team
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Start a new workspace and invite members.
                                </p>
                            </div>
                            <div className="text-cyan-400 transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setIsJoinOpen(true)}
                        className="group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    Join Team
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Enter an invite code to join an existing team.
                                </p>
                            </div>
                            <div className="text-cyan-400 transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default AddTeam