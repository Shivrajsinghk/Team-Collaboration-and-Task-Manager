import api from "./axios";

export function registerUser(data) {
    return api.post("api/user_register/", data);
}

export function login(credentials) {
    return api.post("api/token/", credentials);
}

export function refreshToken(payload) {
    return api.post("api/token/refresh/", payload);
}

export function getUserProfile(accessToken) {
    const config = accessToken
        ? {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
        : undefined

    return api.get("api/user_profile/", config);
}

export function updateUserProfile(data) {
    return api.patch("api/user_profile/update/", data);
}

export function getPublicUserProfile(username) {
    return api.get(`api/profile/${username}/`);
}

export function search(query, filters = {}) {
    const params = new URLSearchParams({ query })
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
    })
    return api.get(`api/search/?${params.toString()}`)
}
