import { Play } from 'lucide-react'

export default function SongRow({ song, onPlay }) {
    return (
        <div
            className="grid grid-cols-[50%_35%_1fr] gap-4 items-center px-6 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800/50 group transition duration-300 cursor-pointer"
            onClick={() => onPlay(song)}
        >
            <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-neutral-300 truncate pr-4 transition-colors duration-300">{song.title}</span>
                <span className="text-sm text-slate-500 dark:text-neutral-400 md:hidden truncate">{song.artist}</span>
            </div>

            <span className="text-slate-500 dark:text-neutral-400 hidden md:block text-sm hover:text-slate-800 dark:hover:text-amber-400 hover:underline cursor-pointer truncate pr-4 transition-colors duration-300">
                {song.artist}
            </span>

            <span className="text-slate-500 dark:text-neutral-400 text-sm text-right font-mono transition-colors duration-300">
                {song.duration || '--:--'}
            </span>
        </div>
    )
}
