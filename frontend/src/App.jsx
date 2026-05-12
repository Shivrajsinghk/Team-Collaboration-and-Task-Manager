import React, { useEffect } from 'react'	
import Navbar from './components/Navbar'
import Profile from './pages/Profile' 
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import EditProfile from './pages/EditProfile'
import Teams from './pages/Teams'
import Team from './pages/Team'
import Members from './pages/Members'
import Dashboard from './pages/Dashboard'
import { Route, Routes } from 'react-router-dom'
import api from './api/axios'
import { useDispatch, useSelector } from 'react-redux'
import { loginSuccess, logout, setAuthResolved } from './Features/authslice'
import TeamDashboard from './pages/TeamDashboard'
import TeamSettings from './pages/TeamSettings'
import TeamTasks from './pages/TeamTasks'

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
				const refreshResponse = await api.post("token/refresh/", {
					refresh: storedRefresh,
				})
				const access = refreshResponse.data.access
				localStorage.setItem("access", access)
				const profileResponse = await api.get("user_profile/")
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
					<Route path='/' element={<Home />} />
					<Route path='/signup' element={<Signup />} />
					<Route path='/login' element={<Login />} />
					<Route element={<ProtectedRoute />}>
						<Route path='/dashboard' element={<Dashboard />} />
						<Route path='/profile' element={<Profile />} />
						<Route path='/edit-profile' element={<EditProfile />} />
						<Route path='/teams' element={<Teams />} />
						<Route path='/team/:id' element={<Team />}>
							<Route index element={<TeamDashboard />} />
							<Route path='members' element={<Members />} />
							<Route path='settings' element={<TeamSettings />} />
							<Route path='tasks' element={<TeamTasks />} />
						</Route>
					</Route>
				</Routes>
		</div>
	)
}

export default App
