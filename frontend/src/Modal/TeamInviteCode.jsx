import React from 'react'
import Modal from './Modal'
import api from '../api/axios'
import { Copy } from 'lucide-react'

function TeamInviteCode({isInviteOpen, setIsInviteOpen, team}) {
    return (
        <Modal isOpen={isInviteOpen} onClose={setIsInviteOpen}>
            <div className="p-7 text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-6 fill-current text-[var(--color-mint-cream)]"
                        viewBox="0 0 640 640"
                        aria-hidden="true"
                    >
                        <path d="M128 96C110.3 96 96 110.3 96 128L96 512C96 529.7 110.3 544 128 544C145.7 544 160 529.7 160 512L160 128C160 110.3 145.7 96 128 96zM216 96C202.7 96 192 106.7 192 120L192 520C192 533.3 202.7 544 216 544C229.3 544 240 533.3 240 520L240 120C240 106.7 229.3 96 216 96zM288 128L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128zM496 120L496 520C496 533.3 506.7 544 520 544C533.3 544 544 533.3 544 520L544 120C544 106.7 533.3 96 520 96C506.7 96 496 106.7 496 120zM400 120L400 520C400 533.3 410.7 544 424 544C437.3 544 448 533.3 448 520L448 120C448 106.7 437.3 96 424 96C410.7 96 400 106.7 400 120z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white tracking-wide">
                    Team Invite Code
                </h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    Share this code with your teammates so they can join your team.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold tracking-[0.35em] text-[var(--color-mint-cream)] uppercase">
                        {team?.team?.invite_code}
                    </p>
                </div>
                <button
                    onClick={() =>
                        navigator.clipboard.writeText(team?.team?.invite_code)
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
                >
                    <Copy size={16} />
                    Copy Invite Code
                </button>
            </div>
        </Modal>
    )
}

export default TeamInviteCode