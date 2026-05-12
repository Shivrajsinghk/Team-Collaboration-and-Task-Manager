import React from 'react'
import { ShieldCheck, UserX } from 'lucide-react'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import Modal from './Modal'
import UserProfilePfp from '../components/UserProfilePfp'

function TeamMember({
    isMemberOpen,
    setIsMemberOpen,
    team,
    loading,
    setLoading,
    setIsKickAYSOpen,
    setIsPromoteAYSOpen,
    setIsDemoteAYSOpen,
    selectedMember,
    setSelectedMember
}) {

    const { id } = useParams()

    return (
        <Modal
            isOpen={isMemberOpen}
            onClose={setIsMemberOpen}
        >
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 overflow-hidden">
                    <UserProfilePfp memberUser={selectedMember} />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                    Member Actions
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                    Manage{" "}
                    <span className="font-medium text-white">
                        {selectedMember?.user__username}
                    </span>
                </p>
                <div className="mt-7 flex flex-col gap-3">
                    {selectedMember?.role !== 'admin' && (
                        <button
                            onClick={() => {
                                setIsPromoteAYSOpen(true)
                            }}
                            disabled={
                                loading ||
                                !team?.team?.is_admin
                            }
                            className="
                            flex items-center justify-center gap-2
                            rounded-2xl
                            border border-cyan-500/20
                            bg-cyan-500/10
                            px-4 py-3
                            font-medium
                            text-cyan-300
                            transition
                            hover:bg-cyan-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            "
                        >
                            <ShieldCheck className="h-5 w-5" />
                            Promote to Admin
                        </button>
                    )}
                    {selectedMember?.role === 'admin' && (
                        <button
                            onClick={() => {
                                setIsDemoteAYSOpen(true)
                            }}
                            disabled={
                                loading ||
                                !team?.team?.is_admin
                            }
                            className="
                            flex items-center justify-center gap-2
                            rounded-2xl
                            border border-amber-500/20
                            bg-amber-500/10
                            px-4 py-3
                            font-medium
                            text-amber-300
                            transition
                            hover:bg-amber-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            "
                        >
                            <UserX className="h-5 w-5" />
                            Demote to Member
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsKickAYSOpen(true)
                        }}
                        disabled={
                            loading ||
                            !team?.team?.is_admin
                        }
                        className="
                        flex items-center justify-center gap-2
                        rounded-2xl
                        border border-red-500/20
                        bg-red-500/10
                        px-4 py-3
                        font-medium
                        text-red-300
                        transition
                        hover:bg-red-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        "
                    >
                        <UserX className="h-5 w-5" />
                        Kick Member
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default TeamMember