import React from 'react'
import { Search } from 'lucide-react'

function Searchbar() {
    return (
        <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition duration-300 focus-within:border-cyan-400/40 focus-within:bg-white/[0.05]">
            <Search
                size={18}
                className="text-gray-500 transition duration-300 group-focus-within:text-cyan-300"
            />
            <input
                type="text"
                placeholder="Search teams, tasks, or members..."
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
        </div>
    )
}

export default Searchbar