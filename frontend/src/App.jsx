import React, { useEffect } from 'react'	
import Navbar from './components/Navbar'
import Profile from './pages/Profile' 
import ProtectedRoute from './components/ProtectedRoute'
import EditProfile from './pages/EditProfile'
import Dashboard from './pages/Dashboard'
import { Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginSuccess, logout, setAuthResolved } from './Features/authslice'
import { getUserProfile, refreshToken } from './api/auth'
import { PublicRoutes } from './routes/PublicRoutes'
import { TeamRoutes } from './routes/TeamRoutes'
import { ChatRoutes } from './routes/ChatRoutes'
import { ProfileRoutes } from './routes/ProfileRoutes'
import { NotificationRoutes } from './routes/NotificationRoutes'

function App() {
	const dispatch = useDispatch()
	const { isAuthenticated } = useSelector(state => state.auth);
	
	useEffect(() => {
		const initializeAuth = async () => {
			const storedRefresh = localStorage.getItem("refresh")
			if (!storedRefresh) {
				dispatch(logout())
				dispatch(setAuthResolved(true)) 
				return
			}
			try {
				const refreshResponse = await refreshToken({
					refresh: storedRefresh,
				})
				const access = refreshResponse.data.access
				localStorage.setItem("access", access)
				const profileResponse = await getUserProfile()
				dispatch(loginSuccess({
					user: profileResponse.data,
					access,
					refresh: storedRefresh,
				}))
			} catch (error) {
				console.log("Session restore failed", error)
				dispatch(logout())
			} finally {
				dispatch(setAuthResolved(true))
			}
		}
		initializeAuth()
	}, [dispatch])

	return (
		<div>
			{isAuthenticated && <Navbar />}
			<Routes>
				{ChatRoutes()}
				{NotificationRoutes()}
				{PublicRoutes()}
				<Route element={<ProtectedRoute />}>
					<Route path='/dashboard' element={<Dashboard />} />
					<Route path='/profile' element={<Profile />} />
					<Route path='/edit-profile' element={<EditProfile />} />
					{ProfileRoutes()}
					{TeamRoutes()}
				</Route>
			</Routes>
		</div>
	)
}

export default App