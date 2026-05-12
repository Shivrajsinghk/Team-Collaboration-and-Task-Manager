import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loading from './Loading'

function ProtectedRoute() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const isAuthResolved = useSelector((state) => state.auth.isAuthResolved)
    if (!isAuthResolved) {
        return <Loading />
    }
    if(!isAuthenticated){
        return <Navigate to="/" replace />
    }  
    return (
        <Outlet />
    )
}

export default ProtectedRoute
