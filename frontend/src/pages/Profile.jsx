import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setUser } from '../Features/authslice'
import { useNavigate } from 'react-router-dom'
import { User, Mail, AtSign, Pencil, LogOut, ShieldCheck } from "lucide-react"
import PreviousPageButton from '../components/PreviousPageButton'
import { getUserProfile } from '../api/auth'

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

function getMediaUrl(baseUrl, path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function Profile() {
    const navigate = useNavigate()
    const authUser = useSelector((state) => state.auth.user)
    const [user, setLocalUser] = useState(authUser)
    const dispatch = useDispatch()

    const handleClick = (() => {
        dispatch(logout())
        navigate('/')
    })

    const handleEditProfile = () => {
        navigate("/edit-profile")
    }

    useEffect(() => {
        const fetchprofile = async () => {
            try {
                const response = await getUserProfile()
                setLocalUser(response.data)
                dispatch(setUser(response.data))
            } catch (error) {
                console.log(error)
                if (error.response?.status === 401) {
                    dispatch(logout())
                    navigate("/")
                }
            }
        }
        fetchprofile()
    }, [dispatch, navigate])

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,var(--color-onyx),#061414)] px-6 py-12 flex items-center justify-center">
            {user ? (
                <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="relative justify-between h-36 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-indigo-500/20">                        
                        <PreviousPageButton className='absolute'/>
                        <button
                            onClick={handleEditProfile}
                            className="absolute right-6 top-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>
                    </div>
                    <div className="relative px-8 pb-8">
                        <div className="-mt-16 flex flex-col items-center">
                            {
                                user.profile_picture ?
                                <img
                                    src={getMediaUrl(BASE_URL, user.profile_picture)}
                                    alt={user.full_name}
                                    className="h-32 w-32 rounded-full border-4 border-[#061414] object-cover shadow-2xl transition duration-300 hover:scale-105"
                                />
                                :
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#061414] bg-gradient-to-br from-teal-400 to-indigo-500 text-4xl font-bold text-white shadow-2xl">
                                    {(user.full_name || "U").slice(0,1)}
                                </div>
                            }
                            <h1 className="mt-5 text-3xl font-bold text-white">
                                {user.full_name}
                            </h1>
                            <p className="mt-2 max-w-lg text-center text-sm leading-relaxed text-gray-400">
                                {user.bio || "No bio added yet."}
                            </p>
                        </div>
                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-3 flex items-center gap-2 text-teal-400">
                                    <User size={18} />
                                    <h3 className="font-medium">Username</h3>
                                </div>
                                <p className="text-sm text-gray-300">
                                    @{user.username}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-3 flex items-center gap-2 text-indigo-400">
                                    <Mail size={18} />
                                    <h3 className="font-medium">Email Address</h3>
                                </div>
                                <p className="text-sm text-gray-300 break-all">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-400" size={20} />
                                <div>
                                    <h3 className="text-sm font-semibold text-white">
                                        Account Status
                                    </h3>
                                    <p className="text-xs text-emerald-300">
                                        Your account is active and secured.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClick}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <Loading />
            )}
        </main>
    )
}

export default Profile
