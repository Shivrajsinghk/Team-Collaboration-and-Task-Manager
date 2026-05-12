import axios from 'axios'
import { store } from '../Features/store'
import { logout, updateAccessToken } from '../Features/authslice'

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/"
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access")
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback)
}

function onRefreshed(token) {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

function clearSession() {
    store.dispatch(logout())
    window.location.replace('/login')
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status
        const refreshToken = localStorage.getItem("refresh")

        if (status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error)
        }

        if (!refreshToken) {
            clearSession()
            return Promise.reject(error)
        }

        if (originalRequest.url === 'token/refresh/' || originalRequest.url?.endsWith('/token/refresh/')) {
            clearSession()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken) => {
                    if (!newToken) {
                        reject(error)
                        return
                    }

                    originalRequest.headers = originalRequest.headers || {}
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    resolve(api(originalRequest))
                })
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                refresh: refreshToken,
            })

            const newAccessToken = response.data.access
            store.dispatch(updateAccessToken(newAccessToken))
            onRefreshed(newAccessToken)

            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            onRefreshed(null)
            clearSession()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api


