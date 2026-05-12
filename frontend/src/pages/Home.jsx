import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Sparkles,
    Users,
    ShieldCheck,
    Layers3
} from "lucide-react";

function Home() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] text-white">
            <section className="relative isolate px-6 pt-28 pb-24">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl"></div>
                    <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-teal-500/10 blur-3xl"></div>
                </div>
                <div className="relative mx-auto max-w-7xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-5 py-2 text-sm text-teal-300 backdrop-blur-xl">
                        <Sparkles size={16} />
                        Modern Team Collaboration Platform
                    </div>
                    <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
                        Build teams.
                        <br />
                        <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            Collaborate smarter.
                        </span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
                        Create workspaces, manage projects, invite members,
                        and organize collaboration in one clean modern platform.
                    </p>
                    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => navigate("/signup")}
                            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-7 py-4 text-sm font-semibold text-black transition duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-500/20"
                        >
                            Get Started
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.06]"
                        >
                            Login
                        </button>
                    </div>
                    <div className="mt-20 grid gap-6 sm:grid-cols-3">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-300">
                                <Users size={28} />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold">
                                Team Management
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-gray-400">
                                Create and organize teams with clarity and ownership.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold">
                                Secure Collaboration
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-gray-400">
                                Invite members safely using secure invite codes.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                                <Layers3 size={28} />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold">
                                Clean Workspace
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-gray-400">
                                Focus on productivity with a distraction-free UI.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="px-6 pb-28">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,#112826_0%,#071714_45%,#020404_100%)] p-10 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-16">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-teal-300">
                                TEAM WORKSPACES
                            </p>
                            <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
                                Built for clarity,
                                ownership & modern collaboration.
                            </h2>
                            <p className="mt-6 max-w-xl text-base leading-8 text-gray-400">
                                Everything you need to create teams,
                                collaborate with members, and manage workspaces —
                                all in one elegant dashboard.
                            </p>
                            <button
                                onClick={() => navigate("/signup")}
                                className="mt-10 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-6 py-4 text-sm font-semibold text-black transition hover:scale-[1.02]"
                            >
                                Start Building
                                <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">
                            <div className="space-y-4">
                                {[1,2,3].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500"></div>
                                            <div>
                                                <div className="h-3 w-28 rounded-full bg-white/20"></div>
                                                <div className="mt-3 h-2 w-20 rounded-full bg-white/10"></div>
                                            </div>
                                        </div>
                                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs text-gray-300">
                                            Active
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home;