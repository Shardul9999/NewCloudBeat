import { Play, Pause, ArrowRight, ArrowLeft } from 'lucide-react'
import { usePlayerStore } from '../lib/store'

export default function HeroSection({ songs = [], onPlay }) {
    const { isPlaying, currentSong, togglePlay } = usePlayerStore()

    // Determine the "featured" song for the big hero display
    // If a song is playing, show that. 
    // If not, show the first song in the current filtered list.
    const featuredSong = currentSong || (songs.length > 0 ? songs[0] : null)

    // For the carousel, show songs from the list.
    const carouselSongs = songs

    const handleHeroPlay = () => {
        if (currentSong && isPlaying) {
            if (featuredSong && currentSong.id === featuredSong.id) {
                togglePlay()
            } else if (featuredSong) {
                onPlay(featuredSong)
            }
        } else if (featuredSong) {
            onPlay(featuredSong)
        }
    }

    const isFeaturedPlaying = currentSong && featuredSong && currentSong.id === featuredSong.id && isPlaying

    if (!featuredSong) {
        return (
            <div className="flex flex-col items-center justify-center px-8 lg:px-16 py-24 text-slate-900 dark:text-white transition-colors duration-300">
                <h1 className="text-4xl font-bold mb-4">Your Library is Empty</h1>
                <p className="text-slate-500 dark:text-gray-400">Upload songs to get started.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row items-end justify-between px-8 lg:px-16 py-12 gap-12 text-slate-900 dark:text-white transition-colors duration-300">

            {/* Left Side: Title and Big Play Button */}
            <div className="flex-1 space-y-8 z-10">
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight line-clamp-2 max-w-4xl">
                        {featuredSong.title}
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-gray-300">
                        <div className="w-8 h-[1px] bg-gray-400"></div>
                        <span className="uppercase tracking-widest text-sm font-semibold truncate max-w-md">
                            {featuredSong.artist || 'Unknown Artist'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleHeroPlay}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform cursor-pointer group"
                >
                    {isFeaturedPlaying ? (
                        <Pause size={32} fill="white" className="text-white" />
                    ) : (
                        <Play size={32} fill="white" className="ml-1 text-white" />
                    )}
                </button>
            </div>

            {/* Right Side: Next Carousel */}
            <div className="w-full lg:w-1/2 flex flex-col items-end z-10">
                <div className="flex items-center justify-between w-full mb-6">
                    <span className="text-xl font-light">Up Next</span>
                    <div className="flex items-center gap-4 text-cyan-600 dark:text-cyan-400">
                        <button className="hover:text-slate-900 dark:hover:text-white transition"><ArrowLeft size={20} /></button>
                        <button className="hover:text-slate-900 dark:hover:text-white transition"><ArrowRight size={20} /></button>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide w-full mask-image-gradient">
                    {carouselSongs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => onPlay(song)}
                            className={`flex-shrink-0 relative group cursor-pointer transition-all duration-300 ${index === 0 ? 'w-48' : 'w-40 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3 shadow-lg relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-purple-900"></div>
                                {/* Use real image if available later */}
                                <img src={`https://i.pravatar.cc/150?u=${song.title}`} alt={song.title} className="w-full h-full object-cover opacity-80" />

                                {currentSong?.id === song.id && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                                            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                                        </div>
                                    </div>
                                )}

                                <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-xs rounded backdrop-blur-sm">
                                    {song.duration || "3:00"}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate transition-colors duration-300">{song.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate transition-colors duration-300"><span className="text-slate-400 dark:text-gray-300">{song.artist}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
