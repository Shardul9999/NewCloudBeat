import { Play } from 'lucide-react'

export default function SongRow({ song, onPlay }) {
    return (
        <div
            className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center p-3 rounded-md hover:bg-white/10 group transition cursor-pointer"
            onClick={() => onPlay(song)}
        >
            <div className="w-8 flex justify-center text-gray-400 group-hover:text-white">
                <Play size={16} className="hidden group-hover:block" />
                <span className="block group-hover:hidden text-sm">{song.track_number || '#'}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-white">{song.title}</span>
                <span className="text-sm text-gray-400 md:hidden">{song.artist}</span>
            </div>

            <span className="text-gray-400 hidden md:block text-sm hover:text-white hover:underline cursor-pointer">
                {song.artist}
            </span>

            <span className="text-gray-400 hidden md:block text-sm">
                {song.album}
            </span>

            <span className="text-gray-400 text-sm">
                {song.duration ? `${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}
            </span>
        </div>
    )
}
