import { Outlet, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Home, Library, LogOut, Disc } from 'lucide-react'
import Player from './Player'

export default function Layout() {
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <div className="w-64 bg-black p-6 flex flex-col border-r border-gray-800">
                <div className="flex items-center gap-2 mb-8 text-green-500">
                    <Disc size={32} />
                    <h1 className="text-2xl font-bold text-white">CloudBeat</h1>
                </div>

                <nav className="flex-1 space-y-4">
                    <Link to="/library" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                        <Library size={20} />
                        Library
                    </Link>
                    {/* Add Playlist Links here later */}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-gray-400 hover:text-white mt-auto transition"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>

                {/* Player Bar Placeholder */}
                <div className="fixed bottom-0 left-0 right-0 z-50">
                    <Player />
                </div>
            </div>
        </div>
    )
}
