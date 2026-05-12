import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Loading from '../components/Loading'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser as setAuthUser } from '../Features/authslice'
import {
    ArrowLeft,
    Camera,
    Mail,
    User,
    BadgeInfo,
    PencilLine,
    ImagePlus,
    Trash2,
    Save,
    X
} from "lucide-react"
import PreviousPageButton from '../components/PreviousPageButton'

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

function getMediaUrl(baseUrl, path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function EditProfile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [user, setLocalUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        full_name: "",
        bio: "",
        status: "active"
    })

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleSubmit = (async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setErrorMessage('')
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("first_name", formData.first_name)
            formDataToSend.append("last_name", formData.last_name)
            formDataToSend.append("bio", formData.bio)
            formDataToSend.append("status", formData.status)
            formDataToSend.append("remove_profile_picture", String(removeProfilePicture))
            if (selectedFile) {
                formDataToSend.append("profile_picture", selectedFile)
            }
            const response = await api.patch("user_profile/update/", formDataToSend)
            setLocalUser(response.data)
            dispatch(setAuthUser(response.data))
            navigate("/profile")
        }
        catch (error) {
            console.log(error)
            console.log(error.response?.data)
            setErrorMessage("We couldn't save your profile right now. Please try again.")
        }
        finally {
            setSubmitting(false)
        }
    })

    const handleChange = ((e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name] : e.target.value
        }))
    })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null
        setSelectedFile(file)
        setRemoveProfilePicture(false)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        if (file) {
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            setPreviewUrl('')
        }
    }

    const handleRemoveProfilePicture = () => {
        setSelectedFile(null)
        setRemoveProfilePicture(true)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl('')
        setLocalUser((prev) => prev ? { ...prev, profile_picture: null } : prev)
    }

    useEffect(() => {
        const fetchprofile = async () => {
            try {
                const response = await api.get("user_profile/")
                setFormData({
                    username: response.data.username || "",
                    email: response.data.email || "",
                    first_name: response.data.first_name || "",
                    last_name: response.data.last_name || "",
                    full_name: `${response.data.first_name || ""} ${response.data.last_name || ""}`.trim(),
                    bio: response.data.bio || "",
                    status: response.data.status || "active"
                })
                setLocalUser(response.data)
            } 
            catch (error) {
                console.log(error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchprofile()
    }, [])

    if (loading) return <Loading />

    const currentPreview = removeProfilePicture ? '' : (previewUrl || getMediaUrl(BASE_URL, user?.profile_picture))
    const displayName = formData.full_name || formData.username || "User"

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,#163532_0%,#071714_40%,#020404_100%)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-cool-steel)]">
                            Profile Settings
                        </p>
                        <h1 className="mt-3 text-4xl font-bold text-[var(--color-mint-cream)]">
                            Edit Profile
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-[var(--color-cool-steel)]">
                            Manage your personal information and customize your profile.
                        </p>
                    </div>
                    <PreviousPageButton />
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]"
                >
                    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                        <div className="flex flex-col items-center text-center">
                            {currentPreview ? (
                                <img
                                    src={currentPreview}
                                    alt={displayName}
                                    className="h-36 w-36 rounded-[2rem] border border-white/10 object-cover shadow-2xl transition duration-300 hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-indigo-500 text-5xl font-bold text-white shadow-2xl">
                                    {displayName.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <h2 className="mt-5 text-3xl font-bold text-white">
                                {displayName}
                            </h2>
                            <p className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.25em] text-teal-300">
                                {formData.status}
                            </p>
                        </div>
                        <div className="mt-8">
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                <Camera size={16} />
                                Profile Picture
                            </label>
                            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center transition hover:border-teal-400 hover:bg-white/[0.05]">
                                <div className="mb-4 rounded-2xl bg-white/5 p-4">
                                    <ImagePlus className="text-teal-300" size={28} />
                                </div>
                                <span className="text-sm font-semibold text-white">
                                    {selectedFile ? selectedFile.name : "Upload Profile Picture"}
                                </span>
                                <span className="mt-2 text-xs text-gray-400">
                                    PNG, JPG, JPEG or WEBP
                                </span>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {(user?.profile_picture || selectedFile) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveProfilePicture}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                                >
                                    <Trash2 size={16} />
                                    Remove Picture
                                </button>
                            )}
                        </div>
                        <div className="mt-8 grid gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="flex items-center gap-2 text-teal-300">
                                    <User size={16} />
                                    <p className="text-xs uppercase tracking-[0.2em]">
                                        Username
                                    </p>
                                </div>
                                <p className="mt-3 text-sm text-white">
                                    @{formData.username}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="flex items-center gap-2 text-indigo-300">
                                    <Mail size={16} />
                                    <p className="text-xs uppercase tracking-[0.2em]">
                                        Email
                                    </p>
                                </div>
                                <p className="mt-3 break-all text-sm text-white">
                                    {formData.email}
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="rounded-[2rem] border border-white/10 bg-[#071714]/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <User size={16} />
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <User size={16} />
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <PencilLine size={16} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={`${formData.first_name} ${formData.last_name}`.trim()}
                                    className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <BadgeInfo size={16} />
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    rows="5"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell your team a bit about yourself..."
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-teal-400 focus:outline-none"
                                />
                            </div>
                        </div>
                        {errorMessage && (
                            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                {errorMessage}
                            </div>
                        )}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-black transition duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <Save size={18} />
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </main>
    )
}

export default EditProfile
