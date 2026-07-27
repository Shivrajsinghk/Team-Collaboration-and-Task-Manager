import React, { useState } from "react"
import { useSelector } from 'react-redux'
import NoProfilePhoto from "./NoProfilePhoto"

function UserProfilePfp({ memberUser, isOnline }) {
    const reduxUser = useSelector((state) => state.auth.user)
    const user = memberUser || reduxUser
    const [imgError, setImgError] = useState(false)

    if (!user) return null

    const profilePicture = memberUser
        ? (
            user.profile_picture ||
            user.user__profile__profile_picture
        )
        : user.profile_picture

    const fullName = memberUser
        ? `${user.first_name || user.user__first_name || ''} ${user.last_name || user.user__last_name || ''}`.trim()
        : user.full_name

    return (
        <div className="relative">
            <div className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-lg transition duration-300 hover:scale-110">
                <div className="absolute inset-0 bg-accent/5 opacity-0 transition duration-300 group-hover:opacity-100" />

                {profilePicture && !imgError ? (
                    <img
                        src={profilePicture}
                        alt={fullName}
                        onError={() => setImgError(true)}
                        className="relative h-full w-full object-cover"
                    />
                ) : (
                    <NoProfilePhoto size={36} />
                )}
            </div>

            {memberUser && isOnline !== undefined && (
                <div
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface ${
                        isOnline ? 'bg-accent' : 'bg-muted'
                    }`}
                />
            )}
        </div>
    )
}

export default UserProfilePfp
