import { Search, Sun, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../lib/store'
import { supabase } from '../lib/supabase'

export default function TopNavbar({ theme, toggleTheme, user }) {
    const { searchQuery, setSearchQuery } = usePlayerStore()

    return (
        <div className="flex items-center justify-between px-8 py-6 w-full z-50 relative">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center bg-transparent dark:bg-transparent">
                    <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full"></div>
                </div>
                <span className="text-slate-900 dark:text-white font-bold text-xl tracking-wider transition-colors">CloudBeat</span>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex items-center gap-12">
                <Link to="/" className="text-slate-500 hover:text-slate-900 text-xs font-bold tracking-widest transition-colors dark:text-gray-400 dark:hover:text-white dark:text-opacity-80">
                    HOME
                </Link>
                <Link to="/#new" className="text-slate-500 hover:text-slate-900 text-xs font-bold tracking-widest transition-colors dark:text-gray-400 dark:hover:text-white dark:text-opacity-80">
                    NEW
                </Link>
                <Link to="/library?filter=favorites" className="text-slate-500 hover:text-slate-900 text-xs font-bold tracking-widest transition-colors dark:text-gray-400 dark:hover:text-white dark:text-opacity-80">
                    FAVOURITE
                </Link>
                <Link to="/library" className="text-slate-500 hover:text-slate-900 text-xs font-bold tracking-widest transition-colors dark:text-gray-400 dark:hover:text-white dark:text-opacity-80">
                    LIBRARY
                </Link>
                <Link to="/#artist" className="text-slate-500 hover:text-slate-900 text-xs font-bold tracking-widest transition-colors dark:text-gray-400 dark:hover:text-white dark:text-opacity-80">
                    ARTIST
                </Link>
            </nav>

            {/* Right: Search, Theme Toggle, Profile */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm rounded-full pl-6 pr-12 py-2 placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:bg-white/50 dark:focus:bg-white/20 transition-all w-48 focus:w-64 border border-slate-200 dark:border-transparent focus:border-slate-300 dark:focus:border-white/10"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" size={16} />
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {!user ? (
                    <Link to="/login" className="bg-slate-900 dark:bg-amber-400 text-white dark:text-neutral-950 font-bold px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-amber-500 transition shadow-md">
                        Log In
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full bg-gray-600 overflow-hidden border-2 border-transparent hover:border-amber-400 transition-all cursor-pointer shadow-sm">
                            <img src={`https://ui-avatars.com/api/?name=${user.email}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e1e2e]"></div>
                        </div>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
