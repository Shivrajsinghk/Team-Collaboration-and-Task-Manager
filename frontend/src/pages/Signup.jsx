import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Lock, ArrowRight, ShieldCheck, Users, Layers3 } from "lucide-react"

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
    const signupMutation = useMutation({
        mutationFn: (payload) => registerUser(payload),
        onSuccess: () => {
            localStorage.clear()
            setSuccessMessage('Account created successfully. You can log in now.')
            navigate('/login')
        },
        onError: (error) => {
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
        },
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccessMessage("")

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        signupMutation.mutate({
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <main className="min-h-screen overflow-hidden bg-base px-6 py-12">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl"></div>
                <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl"></div>
            </div>
            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.95fr]">
                <section className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-medium text-accent">
                        <div className="relative flex flex-col items-center justify-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-[#2CFF05] leading-none origin-center transition-transform duration-150 group-hover:scale-y-[0.1]">
                                OO
                            </span>
                            <span className="text-[6px] mt-[0.1rem] text-[#2CFF05] font-extrabold leading-none">
                                ⌣
                            </span>
                        </div>
                        Create Account
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">
                        Join the workspace.
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                        Create your account and start collaborating with your team in a clean modern workspace.
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="mt-10 space-y-5"
                    >
                        {error && (
                            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                                {successMessage}
                            </div>
                        )}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                    className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                    className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                    className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
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
                                    className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-ink transition duration-300 hover:bg-accent-hover hover:scale-[1.01] hover:shadow-xl hover:shadow-accent/20 disabled:opacity-60"
                        >
                            {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                    <p className="mt-8 text-sm text-muted">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-accent transition hover:text-ink"
                        >
                            Sign in
                        </Link>
                    </p>
                </section>
                <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl"></div>
                    <div className="relative">
                        <p className="text-sm uppercase tracking-[0.3em] text-accent">
                            MODERN WORKSPACE
                        </p>
                        <h2 className="mt-6 text-5xl font-bold leading-tight text-ink">
                            Build calmer
                            workflows with
                            your team.
                        </h2>
                        <p className="mt-6 max-w-md text-base leading-8 text-muted">
                            Organize projects, invite teammates, manage tasks,
                            and collaborate in one elegant platform.
                        </p>
                        <div className="mt-12 space-y-5">
                            <div className="rounded-[2rem] border border-border bg-surface-alt p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-ink">
                                            Team Collaboration
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
                                            Invite members and manage workspaces together.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-border bg-surface-alt p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-ink">
                                            Secure Workspace
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
                                            Protected collaboration using secure invite systems.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-border bg-surface-alt p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                                        <Layers3 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-ink">
                                            Clean Interface
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
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