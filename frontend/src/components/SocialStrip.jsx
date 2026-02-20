export default function SocialStrip() {
    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 w-16 z-40 hidden lg:flex">
            {['YouTube', 'Instagram', 'Facebook'].map((social) => (
                <div key={social} className="-rotate-90 text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white text-xs font-bold tracking-widest cursor-pointer transition-colors whitespace-nowrap origin-center w-4">
                    {social}
                </div>
            ))}
            <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-slate-300 dark:via-gray-700 to-transparent mt-4"></div>
        </div>
    )
}
