function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex rounded-[2rem] items-center justify-center overflow-hidden bg-[#020404]/80 backdrop-blur-xl">
            {/* <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl"></div>
                <div className="absolute left-[40%] top-[45%] h-[250px] w-[250px] rounded-full bg-indigo-500/10 blur-3xl"></div>
            </div> */}
            <div className="relative flex flex-col items-center px-8 py-8">
    <div className="relative flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border border-white/10"></div>
        <div className="absolute h-24 w-24 animate-spin rounded-full border-[3px] border-transparent border-t-cyan-400 border-r-indigo-500"></div>
        <div className="absolute h-16 w-16 rounded-full border border-white/5"></div>
        <div className="absolute h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.8)]"></div>
        <div className="absolute h-4 w-4 animate-ping rounded-full bg-cyan-400/70"></div>
    </div>

    <div className="relative mt-6 text-center">
        <h2 className="text-lg font-semibold tracking-wide text-white">
            Loading Workspace
        </h2>
    </div>
</div>
        </div>
    )
}

export default Loading