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

export function getUserProfile() {
    return api.get("api/user_profile/");
}

export function updateUserProfile(data) {
    return api.patch("api/user_profile/update/", data);
}
