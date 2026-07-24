import React from 'react'

function Logo() {
    return (
        <div className="group flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 border-black bg-[#2CFF05] shadow-lg shadow-accent/20 transition duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative flex flex-col items-center justify-center">
                    <span className="text-sm font-extrabold tracking-wider text-black leading-none origin-center transition-transform duration-150 group-hover:scale-y-[0.1]">
                        OO
                    </span>
                    <span className="text-[10px] mt-[0.1rem] text-black font-extrabold leading-none">
                        ⌣
                    </span>
                </div>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-ink">
                    oobbaiyekkaa
                </h1>
                <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                    Team Workspace
                </p>
            </div>
        </div>
    )
}

export default Logo