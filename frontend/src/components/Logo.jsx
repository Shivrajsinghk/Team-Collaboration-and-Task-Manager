import React from 'react'

function Logo() {
    return (
        <div className="group flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#2dd4bf,#06b6d4,#6366f1)] shadow-lg shadow-cyan-500/20 transition duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative flex flex-col items-center justify-center">
                    <span className="text-sm font-black tracking-wider leading-none text-white">
                        OO
                    </span>
                    <span className="text-[10px] leading-none text-white/90">
                        ⌣
                    </span>
                </div>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-white">
                    OObbaiyekkaa
                </h1>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                    Team Workspace
                </p>
            </div>
        </div>
    )
}

export default Logo