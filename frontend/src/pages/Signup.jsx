import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Users,
    Layers3
} from "lucide-react"

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError("")
            setSuccessMessage("")
            localStorage.clear()
            await api.post('user_register/', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword,
            })
            setSuccessMessage('Account created successfully. You can log in now.')
            navigate('/login')
        } catch (error) {
            const apiError = error.response?.data
            if (typeof apiError === 'string') {
                setError(apiError)
                return
            }
            if (apiError && typeof apiError === 'object') {
                const firstError = Object.values(apiError).flat()[0]
                setError(firstError || 'Unable to create your account')
                return
            }
            setError('Unable to create your account')
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
            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.95fr]">
                <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs font-medium text-teal-300">
                        <Sparkles size={14} />
                        Create Account
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
                        Join the workspace.
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
                        Create your account and start collaborating with your team in a clean modern workspace.
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
                        {successMessage && (
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                {successMessage}
                            </div>
                        )}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <User size={16} />
                                    First Name
                                </label>
                                <input
                                    name="first_name"
                                    type="text"
                                    placeholder="John"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <User size={16} />
                                    Last Name
                                </label>
                                <input
                                    name="last_name"
                                    type="text"
                                    placeholder="Doe"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                        </div>
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
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="example@email.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                            />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <Lock size={16} />
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Create password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <Lock size={16} />
                                    Confirm Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Repeat password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-4 text-sm font-semibold text-black transition duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/20"
                        >
                            Create Account
                            <ArrowRight size={18} />
                        </button>
                    </form>
                    <p className="mt-8 text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-teal-300 transition hover:text-white"
                        >
                            Sign in
                        </Link>
                    </p>
                </section>
                <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,#112826_0%,#071714_45%,#020404_100%)] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="relative">
                        <p className="text-sm uppercase tracking-[0.3em] text-teal-300">
                            MODERN WORKSPACE
                        </p>
                        <h2 className="mt-6 text-5xl font-bold leading-tight text-white">
                            Build calmer
                            workflows with
                            your team.
                        </h2>
                        <p className="mt-6 max-w-md text-base leading-8 text-gray-400">
                            Organize projects, invite teammates, manage tasks,
                            and collaborate in one elegant platform.
                        </p>
                        <div className="mt-12 space-y-5">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-300">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Team Collaboration
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Invite members and manage workspaces together.
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
                                            Secure Workspace
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Protected collaboration using secure invite systems.
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
                                            Clean Interface
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-400">
                                            Minimal modern UI focused on productivity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Signup
