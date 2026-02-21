import { Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase' // Kept for future use if needed, though logout is not in new nav yet
import Player from './Player'
import TopNavbar from './TopNavbar'
import SocialStrip from './SocialStrip'
import Spline from '@splinetool/react-spline'

export default function Layout({ theme, toggleTheme, user }) {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden relative bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-neutral-300 transition-colors duration-300">
            {/* 3D Spline Background */}
            <div className={`fixed inset-0 w-full h-full z-0 pointer-events-none transition-all duration-700 ${theme === 'dark' ? 'filter-none' : 'invert hue-rotate-180'}`}>
                <Spline scene="https://prod.spline.design/xX9fLGe93i989Kox/scene.splinecode" />
            </div>

            {/* Background Overlay for "Concert Feel" - subtle texture or noise could be added here */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>

            <TopNavbar theme={theme} toggleTheme={toggleTheme} user={user} />
            <SocialStrip />

            {/* Main Content Area - Static */}
            <main className="flex-1 overflow-hidden flex flex-col z-10 relative">
                <div className="max-w-7xl mx-auto w-full h-full pb-32 pt-6 px-4 md:px-12">
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
