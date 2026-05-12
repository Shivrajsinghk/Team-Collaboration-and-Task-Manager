import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function Team() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-[222px] w-full min-h-screen text-white">
                <Outlet />
            </div>
        </div>
    )
}

export default Team