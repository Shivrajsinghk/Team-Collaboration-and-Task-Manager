import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser as setAuthUser } from '../Features/authslice'
import {
    Camera, Mail, User, BadgeInfo, PencilLine,
    ImagePlus, Trash2, Save, X, MapPin, GitBranch,
    Link, Briefcase, Code2, ArrowLeft
} from "lucide-react"
import { getUserProfile, updateUserProfile } from '../api/auth'

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
        bio: "",
        status: "active",
        job_title: "",
        location: "",
        github_url: "",
        linkedin_url: "",
        skills: "",
    })

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setErrorMessage('')
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("first_name", formData.first_name)
            formDataToSend.append("last_name", formData.last_name)
            formDataToSend.append("bio", formData.bio)
            formDataToSend.append("status", formData.status)
            formDataToSend.append("job_title", formData.job_title)
            formDataToSend.append("location", formData.location)
            formDataToSend.append("github_url", formData.github_url)
            formDataToSend.append("linkedin_url", formData.linkedin_url)
            formDataToSend.append("skills", formData.skills)
            formDataToSend.append("remove_profile_picture", String(removeProfilePicture))
            if (selectedFile) formDataToSend.append("profile_picture", selectedFile)
            const response = await updateUserProfile(formDataToSend)
            setLocalUser(response.data)
            dispatch(setAuthUser(response.data))
            navigate("/profile")
        } catch (error) {
            console.log(error.response?.data)
            setErrorMessage("Couldn't save your profile. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null
        setSelectedFile(file)
        setRemoveProfilePicture(false)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(file ? URL.createObjectURL(file) : '')
    }

    const handleRemoveProfilePicture = () => {
        setSelectedFile(null)
        setRemoveProfilePicture(true)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl('')
        setLocalUser((prev) => prev ? { ...prev, profile_picture: null } : prev)
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile()
                const d = response.data
                setFormData({
                    username: d.username || "",
                    email: d.email || "",
                    first_name: d.first_name || "",
                    last_name: d.last_name || "",
                    bio: d.bio || "",
                    status: d.status || "active",
                    job_title: d.job_title || "",
                    location: d.location || "",
                    github_url: d.github_url || "",
                    linkedin_url: d.linkedin_url || "",
                    skills: d.skills || "",
                })
                setLocalUser(d)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) return <Loading />

    const currentPreview = removeProfilePicture ? '' : (previewUrl || getMediaUrl(BASE_URL, user?.profile_picture))
    const displayName = `${formData.first_name} ${formData.last_name}`.trim() || formData.username || "User"

    return (
        <div className="min-h-screen bg-black p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-zinc-600">Profile Settings</p>
                        <h1 className="mt-1 text-2xl font-semibold text-white">Edit Profile</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-950 px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Back
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 flex flex-col items-center text-center">
                            {currentPreview ? (
                                <img
                                    src={currentPreview}
                                    alt={displayName}
                                    className="h-24 w-24 rounded-2xl border-2 border-zinc-900 object-cover shadow-xl"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-2xl border-2 border-zinc-900 bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-3xl font-semibold text-white shadow-xl">
                                    {displayName.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <h2 className="mt-4 text-base font-semibold capitalize text-white">{displayName}</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">@{formData.username}</p>
                            <span className="mt-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">
                                {formData.status}
                            </span>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Camera size={14} className="text-zinc-600" />
                                <p className="text-[12px] uppercase tracking-wider text-zinc-600">Profile Picture</p>
                            </div>
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center hover:border-teal-500/30 hover:bg-white/[0.03] transition-all">
                                <ImagePlus size={22} className="text-zinc-600 mb-2" />
                                <span className="text-xs font-medium text-zinc-400">
                                    {selectedFile ? selectedFile.name : "Click to upload"}
                                </span>
                                <span className="mt-1 text-[11px] text-zinc-700">PNG, JPG, WEBP</span>
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
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={13} />
                                    Remove Picture
                                </button>
                            )}
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-5 space-y-3">
                            <div className="flex items-center justify-between text-[12px]">
                                <div className="flex items-center gap-1.5 text-zinc-600">
                                    <User size={12} />
                                    Username
                                </div>
                                <span className="text-zinc-400">@{formData.username}</span>
                            </div>
                            <div className="border-t border-white/[0.04]" />
                            <div className="flex items-center justify-between text-[12px]">
                                <div className="flex items-center gap-1.5 text-zinc-600">
                                    <Mail size={12} />
                                    Email
                                </div>
                                <span className="text-zinc-400 truncate max-w-[160px]">{formData.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-zinc-600 mb-5">Basic Info</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <User size={12} /> First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <User size={12} /> Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <PencilLine size={12} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={`${formData.first_name} ${formData.last_name}`.trim()}
                                        className="w-full cursor-not-allowed rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-2.5 text-sm text-zinc-600 focus:outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <BadgeInfo size={12} /> Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell your team a bit about yourself..."
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-zinc-600 mb-5">Professional</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <Briefcase size={12} /> Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="job_title"
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        placeholder="e.g. Backend Developer"
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <MapPin size={12} /> Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Indore, India"
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <Code2 size={12} /> Skills
                                        <span className="text-zinc-700">(comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="Python, Django, React, JavaScript..."
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                    {formData.skills && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill) => (
                                                <span key={skill} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-zinc-400">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-zinc-600 mb-5">Links</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <GitBranch size={12} /> GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        name="github_url"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                                        <Link size={12} /> LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:border-teal-500/40 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        {errorMessage && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                                {errorMessage}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-950 px-5 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/10 px-5 py-2.5 text-sm font-medium text-teal-400 hover:bg-teal-500/15 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={14} />
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfile