export default function SocialStrip() {
    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 w-16 z-40 hidden lg:flex">
            {['YouTube', 'Instagram', 'Facebook'].map((social) => (
                <a
                    key={social}
                    href={`#${social.toLowerCase()}`}
                    className="text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white text-xs font-bold tracking-widest transition-colors whitespace-nowrap rotate-180"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    {social}
                </a>
            ))}
            <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-slate-300 dark:via-gray-700 to-transparent mt-4"></div>
        </div>
    )
}
