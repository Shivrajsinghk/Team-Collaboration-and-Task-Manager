import React from "react"
import { useSelector } from 'react-redux'

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL 

function getMediaUrl(baseUrl, path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function UserProfilePfp({ memberUser }) {
    const reduxUser = useSelector((state) => state.auth.user)
    const user = memberUser || reduxUser

    if (!user) return null

    const profilePicture =
        memberUser
            ? `media/${user.user__profile__profile_picture}`
            : user.profile_picture

    const fullName =
        memberUser
            ? user.user__first_name
            : user.full_name
            
    return (
        <div className="relative">
            <div
                className="
                group relative flex h-12 w-12
                items-center justify-center
                overflow-hidden rounded-2xl
                border border-white/10
                bg-[linear-gradient(135deg,#0f1f1d,#081312)]
                shadow-lg transition duration-300
                hover:scale-125
                hover:shadow-cyan-500/20
                "
            >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                {profilePicture ? (
                    <img
                        src={getMediaUrl(BASE_URL, profilePicture)}
                        alt={fullName}
                        className="relative h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className="
                        relative flex h-full w-full
                        items-center justify-center
                        bg-gradient-to-br
                        from-teal-400 to-cyan-500
                        text-sm font-bold uppercase text-white
                        "
                    >
                        {(fullName || 'U').slice(0, 1)}
                    </div>
                )}
            </div>
            <div
                className="
                absolute -bottom-1 -right-1
                h-4 w-4 rounded-full
                border-2 border-[#020404]
                bg-emerald-400
                shadow-[0_0_15px_rgba(74,222,128,0.4)]
                "
            />
        </div>
    )
}

export default UserProfilePfp