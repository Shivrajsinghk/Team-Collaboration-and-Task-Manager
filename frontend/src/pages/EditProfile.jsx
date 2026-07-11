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
import { updateUserProfile } from '../api/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '../api/queryKeys'
import { useCurrentUserQuery } from '../hooks/useCurrentUserQuery'
import NoProfilePhoto from '../components/NoProfilePhoto' 

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL

function getMediaUrl(baseUrl, path) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function EditProfile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
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
        about: "",
        job_title: "",
        location: "",
        github_url: "",
        linkedin_url: "",
        skills: "",
    })
    const queryClient = useQueryClient()
    const { data: user, isLoading: loading } = useCurrentUserQuery()

    const updateProfileMutation = useMutation({
        mutationFn: (payload) => updateUserProfile(payload),
        onSuccess: (response) => {
            queryClient.setQueryData(authKeys.me, response.data)
            dispatch(setAuthUser(response.data))
            navigate("/profile")
        },
        onError: (error) => {
            console.log(error.response?.data)
            setErrorMessage("Couldn't save your profile. Please try again.")
        },
    })

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        const formDataToSend = new FormData()
        formDataToSend.append("first_name", formData.first_name)
        formDataToSend.append("last_name", formData.last_name)
        formDataToSend.append("bio", formData.bio)
        formDataToSend.append("about", formData.about)
        formDataToSend.append("job_title", formData.job_title)
        formDataToSend.append("location", formData.location)
        formDataToSend.append("github_url", formData.github_url)
        formDataToSend.append("linkedin_url", formData.linkedin_url)
        formDataToSend.append("skills", formData.skills)
        formDataToSend.append("remove_profile_picture", String(removeProfilePicture))
        if (selectedFile) formDataToSend.append("profile_picture", selectedFile)
        updateProfileMutation.mutate(formDataToSend)
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
    }

    useEffect(() => {
        if (!user) return
        setFormData({
            username: user.username || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            bio: user.bio || "",
            about: user.about || "",
            job_title: user.job_title || "",
            location: user.location || "",
            github_url: user.github_url || "",
            linkedin_url: user.linkedin_url || "",
            skills: user.skills || "",
        })
    }, [user])

    if (loading) return <Loading />

    const currentPreview = removeProfilePicture ? '' : (previewUrl || getMediaUrl(BASE_URL, user?.profile_picture))
    const displayName = `${formData.first_name} ${formData.last_name}`.trim() || formData.username || "User"

    return (
        <div className="min-h-screen bg-base p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted">Profile Settings</p>
                        <h1 className="mt-1 text-2xl font-semibold text-ink">Edit Profile</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs text-muted hover:text-ink transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Back
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col items-center text-center">
                            {currentPreview ? (
                                <img
                                    src={currentPreview}
                                    alt={displayName}
                                    className="h-24 w-24 rounded-2xl border-2 border-surface object-cover shadow-xl"
                                />
                            ) : (
                                <NoProfilePhoto size={104} />
                            )}
                            <h2 className="mt-4 text-base font-semibold capitalize text-ink">{displayName}</h2>
                            <p className="text-xs text-muted mt-0.5">@{formData.username}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Camera size={14} className="text-muted" />
                                <p className="text-[12px] uppercase tracking-wider text-muted">Profile Picture</p>
                            </div>
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-alt px-4 py-6 text-center hover:border-accent/40 hover:bg-surface-alt transition-all">
                                <ImagePlus size={22} className="text-muted mb-2" />
                                <span className="text-xs font-medium text-muted">
                                    {selectedFile ? selectedFile.name : "Click to upload"}
                                </span>
                                <span className="mt-1 text-[11px] text-muted">PNG, JPG, WEBP</span>
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
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/[0.07] px-4 py-2.5 text-xs text-danger hover:bg-danger/10 transition-colors"
                                >
                                    <Trash2 size={13} />
                                    Remove Picture
                                </button>
                            )}
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                            <div className="flex items-center justify-between text-[12px]">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <User size={12} />
                                    Username
                                </div>
                                <span className="text-muted">@{formData.username}</span>
                            </div>
                            <div className="border-t border-border" />
                            <div className="flex items-center justify-between text-[12px]">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Mail size={12} />
                                    Email
                                </div>
                                <span className="text-muted truncate max-w-[160px]">{formData.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-5">Basic Info</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <User size={12} /> First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <User size={12} /> Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <PencilLine size={12} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={`${formData.first_name} ${formData.last_name}`.trim()}
                                        className="w-full cursor-not-allowed rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted focus:outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <BadgeInfo size={12} /> Short Bio
                                        <span className="text-muted">(max 100 characters)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bio"
                                        maxLength={100}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="A short tagline about yourself..."
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                    <p className="mt-1 text-right text-[11px] text-muted">{(formData.bio || '').length}/100</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <PencilLine size={12} /> About
                                    </label>
                                    <textarea
                                        name="about"
                                        rows="4"
                                        value={formData.about}
                                        onChange={handleChange}
                                        placeholder="Tell your team a bit about yourself..."
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                                </div>
                            </div>
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-5">Professional</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <Briefcase size={12} /> Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="job_title"
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        placeholder="e.g. Backend Developer"
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <MapPin size={12} /> Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Indore, India"
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <Code2 size={12} /> Skills
                                        <span className="text-muted">(comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="Python, Django, React, JavaScript..."
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                    {formData.skills && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill) => (
                                                <span key={skill} className="rounded-lg border border-border bg-surface-alt px-2.5 py-0.5 text-[11px] text-muted">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-5">Links</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <GitBranch size={12} /> GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        name="github_url"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                                        <Link size={12} /> LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        {errorMessage && (
                            <div className="rounded-xl border border-danger/20 bg-danger/[0.07] px-4 py-3 text-sm text-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm text-muted hover:text-ink transition-colors"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/15 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={14} />
                                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfile