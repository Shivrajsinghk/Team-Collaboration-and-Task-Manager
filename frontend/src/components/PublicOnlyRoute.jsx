import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"

export default function PublicOnlyRoute() {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}