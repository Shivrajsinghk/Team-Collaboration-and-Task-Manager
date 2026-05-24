import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserProfile, login } from '../api/auth'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../Features/authslice'
import { Lock, User, ArrowRight, Sparkles, ShieldCheck, Users, Layers3 } from "lucide-react"

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            const tokenResponse = await login({
                username: formData.username,
                password: formData.password
            })
            localStorage.setItem("access", tokenResponse.data.access)
            localStorage.setItem("refresh", tokenResponse.data.refresh)
            const profileResponse = await getUserProfile()
            dispatch(loginSuccess({
                user: profileResponse.data,
                access: tokenResponse.data.access,
                refresh: tokenResponse.data.refresh,
            }))
            navigate("/dashboard")
        }   
        catch(error){
            console.log("Login Failed", error.response?.data || error.message)
            setError("Invalid username or password")
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    return (
        <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#071714_0%,#020404_100%)] px-6 py-12">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl"></div>
                <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl"></div>
            </div>
            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1fr]">
                <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,#112826_0%,#071714_45%,#020404_100%)] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs font-medium text-teal-300">
                            <Sparkles size={14} />
                            Welcome Back
                        </div>
                        <h1 className="mt-8 text-5xl font-bold leading-tight text-white">
                            Continue your
                            collaboration journey.
                        </h1>
                        <p className="mt-6 max-w-md text-base leading-8 text-gray-400">
                            Access your workspace, manage teams,
                            track projects, and stay productive with your team.
                        </p>
                        <div className="mt-12 space-y-5">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-300">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Team Progress
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Track assignments, activity, and collaboration in one place.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Secure Access
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Protected authentication and secure team collaboration.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-300">
                                        <Layers3 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Minimal Workspace
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Clean modern UI focused on productivity and clarity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-300">
                        <Lock size={14} />
                        Login
                    </div>
                    <h2 className="mt-6 text-4xl font-bold tracking-tight text-white">
                        Sign in to your workspace
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
                        Continue managing teams, projects, and collaboration from your dashboard.
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="mt-10 space-y-5"
                    >
                        {error && (
                            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                <User size={16} />
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                placeholder="@username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-4 text-sm font-semibold text-black transition duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/20"
                        >
                            Sign In
                            <ArrowRight size={18} />
                        </button>
                    </form>
                    <p className="mt-8 text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-teal-300 transition hover:text-white"
                        >
                            Create one
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    )
}

export default Login
