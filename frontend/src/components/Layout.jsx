import { Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase' // Kept for future use if needed, though logout is not in new nav yet
import Player from './Player'
import TopNavbar from './TopNavbar'
import SocialStrip from './SocialStrip'

export default function Layout({ theme, toggleTheme }) {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden relative bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-neutral-300 transition-colors duration-300">
            {/* Background Overlay for "Concert Feel" - subtle texture or noise could be added here */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>

            <TopNavbar theme={theme} toggleTheme={toggleTheme} />
            <SocialStrip />

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto z-10 relative scroll-smooth no-scrollbar md:custom-scrollbar">
                <div className="max-w-7xl mx-auto w-full pb-32 pt-6"> {/* Added padding-bottom for player, padding-top for spacing */}
                    <Outlet />
                </div>
            </main>

            {/* Player Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <Player />
            </div>
        </div>
    )
}
