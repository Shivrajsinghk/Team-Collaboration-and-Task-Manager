import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Users, ShieldCheck, Layers3 } from "lucide-react";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function Home() {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    const members = [
        { x: 60, y: 40, online: true },
        { x: 200, y: 20, online: true },
        { x: 320, y: 70, online: false },
        { x: 90, y: 160, online: true },
        { x: 260, y: 190, online: true },
        { x: 370, y: 180, online: false },
    ];

    return (
        <div className="min-h-screen bg-[#060807] text-[#EDF5EF]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <section className="mx-auto max-w-7xl px-6 pt-8 pb-24 lg:px-10">
                <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
                    <div>
                        <h1 className="text-5xl leading-[1.05] tracking-tight sm:text-6xl" style={display}>
                            Build teams.
                            <br />
                            <span className="text-[#2CFF05]">Collaborate smarter.</span>
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-[#8FA396]">
                            Create workspaces, manage projects, invite members, and see who's
                            online right now — all in one clean, connected platform.
                        </p>
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="flex items-center justify-center gap-2 rounded-full bg-[#2CFF05] px-7 py-3.5 text-sm font-medium text-[#0A1A08] transition hover:bg-[#25D604]"
                                >
                                    Go to dashboard
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("/signup")}
                                        className="flex items-center justify-center gap-2 rounded-full bg-[#2CFF05] px-7 py-3.5 text-sm font-medium text-[#0A1A08] transition hover:bg-[#25D604]"
                                    >
                                        Get started
                                        <ArrowRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="rounded-full border border-[#1E2621] px-7 py-3.5 text-sm font-medium text-[#EDF5EF] transition hover:border-[#2E5A2A]"
                                    >
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative rounded-2xl border border-[#1E2621] bg-[#0D110E] p-6">
                        <p className="text-xs tracking-[0.15em] text-[#8FA396]" style={mono}>
                            WORKSPACE.ONLINE_NOW
                        </p>
                        <svg viewBox="0 0 420 260" className="mt-4 w-full">
                            <g stroke="#182D15" strokeWidth="1">
                                <line x1="60" y1="40" x2="200" y2="20" />
                                <line x1="200" y1="20" x2="90" y2="160" />
                                <line x1="90" y1="160" x2="260" y2="190" />
                                <line x1="260" y1="190" x2="320" y2="70" />
                                <line x1="320" y1="70" x2="370" y2="180" />
                            </g>
                            {members.map((m, i) => (
                                <g key={i}>
                                    {m.online && (
                                        /* Pulsing outer aura updated to your neon green #2CFF05 */
                                        <circle cx={m.x} cy={m.y} r="14" fill="none" stroke="#2CFF05" strokeOpacity="0.35">
                                            <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                                            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                                        </circle>
                                    )}
                                    {/* Core node: Uses #2CFF05 for online, and dark slate green for offline */}
                                    <circle
                                        cx={m.x}
                                        cy={m.y}
                                        r="9"
                                        fill={m.online ? "#2CFF05" : "#0E170C"}
                                        stroke={m.online ? "#2CFF05" : "#1A3317"}
                                        strokeWidth="1.5"
                                    />
                                </g>
                            ))}
                        </svg>
                        <div className="mt-2 flex items-center justify-between border-t border-[#1E2621] pt-4">
                            <span className="text-sm text-[#8FA396]">4 members online</span>
                            <span className="flex items-center gap-1.5 text-xs text-[#2CFF05]" style={mono}>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#2CFF05]" />
                                SYNCED
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-24 grid gap-6 sm:grid-cols-3">
                    {[
                        { icon: Users, title: "Team management", copy: "Create and organize teams with clarity and ownership." },
                        { icon: ShieldCheck, title: "Secure collaboration", copy: "Invite members safely using scoped invite codes." },
                        { icon: Layers3, title: "Clean workspace", copy: "Focus on the work with a distraction-free interface." },
                    ].map((f) => (
                        <div key={f.title} className="rounded-2xl border border-[#1E2621] bg-[#0D110E] p-7">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7BFA6E]/10 text-[#2CFF05]">
                                <f.icon size={20} />
                            </div>
                            <h3 className="mt-5 text-lg" style={display}>{f.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-[#8FA396]">{f.copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
                <div className="grid gap-10 rounded-2xl border border-[#1E2621] bg-[#0D110E] p-10 lg:grid-cols-2 lg:items-center lg:p-16">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-[#2CFF05]" style={mono}>
                            TEAM WORKSPACES
                        </p>
                        <h2 className="mt-6 text-4xl leading-tight" style={display}>
                            Built for clarity, ownership and modern collaboration.
                        </h2>
                        <p className="mt-6 max-w-xl text-base leading-7 text-[#8FA396]">
                            Everything you need to create teams, collaborate with members, and
                            manage workspaces — in one connected dashboard.
                        </p>
                        <button
                            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
                            className="mt-10 flex items-center gap-2 rounded-full bg-[#2CFF05] px-6 py-3.5 text-sm font-medium text-[#0A1A08] transition hover:bg-[#25D604]"
                        >
                            {isAuthenticated ? "Go to dashboard" : "Start building"}
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="rounded-xl border border-[#1E2621] bg-[#060807] p-5">
                        <div className="space-y-3">
                            {[
                                { name: "Product design", status: "Active" },
                                { name: "Backend sprint", status: "Active" },
                                { name: "Q3 review", status: "Idle" },
                            ].map((row) => (
                                <div
                                    key={row.name}
                                    className="flex items-center justify-between rounded-lg border border-[#1E2621] px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`h-2 w-2 rounded-full ${row.status === "Active" ? "bg-[#2CFF05]" : "bg-[#2E332E]"}`}
                                        />
                                        <span className="text-sm text-[#EDF5EF]">{row.name}</span>
                                    </div>
                                    <span className="text-[10px] tracking-[0.1em] text-[#8FA396]" style={mono}>
                                        {row.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;