import { createSlice } from '@reduxjs/toolkit'

function getStoredAuth() {
    let user = null
    try {
        const storedUser = localStorage.getItem("user")
        user = storedUser ? JSON.parse(storedUser) : null
    } catch {
        user = null
    }
    return {
        user,
        access: localStorage.getItem("access"),
        refresh: localStorage.getItem("refresh"),
    }
}

function persistAuth({ user, access, refresh }) {
    if (access) {
        localStorage.setItem("access", access)
    } else {
        localStorage.removeItem("access")
    }
    if (refresh) {
        localStorage.setItem("refresh", refresh)
    } else {
        localStorage.removeItem("refresh")
    }
    if (user) {
        localStorage.setItem("user", JSON.stringify(user))
    } else {
        localStorage.removeItem("user")
    }
}

const storedAuth = getStoredAuth()

const initialState = {
    user: storedAuth.user || null,
    access: storedAuth.access || null,
    refresh: storedAuth.refresh || null,
    isAuthenticated: false,
    isAuthResolved: false,
}

const authSlice = createSlice({
    name: "auth", 
    initialState, 
    reducers:{
        loginSuccess: (state, action) => {
            const {user, access, refresh} = action.payload
            state.user = user
            state.access = access
            state.refresh = refresh
            state.isAuthenticated = true
            state.isAuthResolved = true
            persistAuth({ user, access, refresh })
        },
        setUser: (state, action) => {
            state.user = action.payload
            persistAuth({
                user: action.payload,
                access: state.access,
                refresh: state.refresh,
            })
        },
        setAuthResolved: (state, action) => {
            state.isAuthResolved = action.payload
        },
        updateAccessToken: (state, action) => {
            state.access = action.payload
            state.isAuthenticated = !!action.payload
            state.isAuthResolved = true
            persistAuth({
                user: state.user,
                access: action.payload,
                refresh: state.refresh,
            })
        }, 
        logout: (state) => {
            state.user = null
            state.access = null
            state.refresh = null
            state.isAuthenticated = false
            state.isAuthResolved = true
            persistAuth({
                user: null,
                access: null,
                refresh: null,
            })
        }
    }
})

export const {
    loginSuccess,
    setUser,
    setAuthResolved,
    updateAccessToken,
    logout,
} = authSlice.actions
export default authSlice.reducer
