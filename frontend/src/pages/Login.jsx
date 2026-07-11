import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserProfile, login } from '../api/auth'
import { useDispatch } from 'react-redux'
import { loginSuccess, logout } from '../Features/authslice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '../api/queryKeys'
import { Lock, User, ArrowRight, ShieldCheck, Users, Layers3 } from "lucide-react"

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const tokenResponse = await login(credentials)
            const access = tokenResponse.data.access
            const refresh = tokenResponse.data.refresh
            localStorage.setItem("access", access)
            localStorage.setItem("refresh", refresh)
            const profile = await queryClient.fetchQuery({
                queryKey: authKeys.me,
                queryFn: async () => {
                    const response = await getUserProfile(access)
                    return response.data
                },
                staleTime: 5 * 60 * 1000,
            })
            return {
                access,
                refresh,
                profile,
            }
        },
        onSuccess: ({ access, refresh, profile }) => {
            dispatch(loginSuccess({
                user: profile,
                access,
                refresh,
            }))
            navigate("/dashboard")
        },
        onError: (error) => {
            console.log("Login Failed", error.response?.data || error.message)
            dispatch(logout())
            setError("Invalid username or password")
        },
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        loginMutation.mutate({
            username: formData.username,
            password: formData.password
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
            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1fr]">
                <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl"></div>
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-medium text-accent">
                            <div className="relative flex flex-col items-center justify-center">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#2CFF05] leading-none origin-center transition-transform duration-150 group-hover:scale-y-[0.1]">
                                    OO
                                </span>
                                <span className="text-[6px] mt-[0.1rem] text-[#2CFF05] font-extrabold leading-none">
                                    ⌣
                                </span>
                            </div>
                            Welcome Back
                        </div>
                        <h1 className="mt-8 text-5xl font-bold leading-tight text-ink">
                            Continue your
                            collaboration journey.
                        </h1>
                        <p className="mt-6 max-w-md text-base leading-8 text-muted">
                            Access your workspace, manage teams,
                            track projects, and stay productive with your team.
                        </p>
                        <div className="mt-12 space-y-5">
                            <div className="rounded-[2rem] border border-border bg-surface-alt p-5 backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-ink">
                                            Team Progress
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
                                            Track assignments, activity, and collaboration in one place.
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
                                            Secure Access
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
                                            Protected authentication and secure team collaboration.
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
                                            Minimal Workspace
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">
                                            Clean modern UI focused on productivity and clarity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-medium text-accent">
                        <Lock size={14} />
                        Login
                    </div>
                    <h2 className="mt-6 text-4xl font-bold tracking-tight text-ink">
                        Sign in to your workspace
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                        Continue managing teams, projects, and collaboration from your dashboard.
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
                                className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-ink transition duration-300 hover:bg-accent-hover hover:scale-[1.01] hover:shadow-xl hover:shadow-accent/20 disabled:opacity-60"
                        >
                            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                    <p className="mt-8 text-sm text-muted">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-accent transition hover:text-ink"
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
