import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import SongRow from '../components/SongRow'
import UploadModal from '../components/UploadModal'
import HeroSection from '../components/HeroSection'
import { usePlayerStore } from '../lib/store'
import { useSearchParams } from 'react-router-dom'

export default function Library({ session, songs = [], isAdmin, onToggleFavorite }) { // Accept songs from props
    // const [songs, setSongs] = useState([]) // Removed internal state
    const [loading, setLoading] = useState(false) // Loading handled by parent mostly, but can keep for local filtering/processing if needed
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [searchParams] = useSearchParams()

    // Get Search Query from Store
    const { setPlaylist, playSong, searchQuery, favoriteIds } = usePlayerStore()

    // Removed internal fetchSongs logic

    // Logic to refresh songs if upload happens? 
    // If we upload, we need to tell App.jsx to re-fetch.
    // Ideally, we pass an `onUploadSuccess` callback prop.

    // For now, let's assume the parent handles data, but we need a way to trigger refresh.
    // Let's add onRefresh prop.


    // Filtering Logic
    const showFavoritesOnly = searchParams.get('filter') === 'favorites'

    const filteredSongs = songs.filter(song => {
        // 1. Filter by Favourite
        if (showFavoritesOnly && !favoriteIds.includes(song.id)) return false

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                song.title.toLowerCase().includes(query) ||
                (song.artist && song.artist.toLowerCase().includes(query)) ||
                (song.album && song.album.toLowerCase().includes(query))
            )
        }

        return true
    })

    // Update Global Playlist when filter changes to ensure "Next" button follows the visible list
    useEffect(() => {
        if (filteredSongs.length > 0) {
            setPlaylist(filteredSongs)
        }
    }, [JSON.stringify(filteredSongs), setPlaylist])
    // JSON.stringify to avoid deep check issues or infinite loop, though simplistic. 
    // Better: just depend on searchQuery/showFavoritesOnly and re-calc. 
    // Actually, setting playlist on every render is bad. 
    // Let's set playlist ONLY when playing a song from this filtered list.
    // However, if I hit "Next" it uses the store's playlist. 
    // So store playlist MUST match visible list for "Next" to make sense.
    // But this causes a loop if `fetchSongs` sets it too.
    // Let's remove `setPlaylist` from fetchSongs and rely on the effect? 
    // No, initial load needs it.

    // Refined approach:
    // When user clicks Play on a filtered song, we might want to sets the playlist to `filteredSongs` text.
    // But for now, let's keep it simple: The `onPlay` handler will set the playlist to `filteredSongs`.

    const handlePlay = (song) => {
        // Update playlist to match current view so "Next" works as expected
        setPlaylist(filteredSongs)
        playSong(song)
    }

    return (
        <div className="relative min-h-screen">

            <div className="px-8 lg:px-16 mt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-400 tracking-wide transition-colors duration-300">
                        {showFavoritesOnly ? 'Your Favourites' : 'Your Library'}
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-transparent border border-gray-300 dark:border-neutral-700 hover:border-gray-900 dark:hover:border-amber-400 text-gray-900 dark:text-neutral-300 dark:hover:text-amber-400 rounded-full px-6 py-2 flex items-center gap-2 transition text-sm font-medium"
                        >
                            <Plus size={16} />
                            Add Song
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl min-h-[400px] border border-slate-200 dark:border-neutral-800/50 shadow-sm dark:shadow-none transition-colors duration-300">
                    {loading ? (
                        <div className="text-gray-400 dark:text-neutral-500 text-center py-10">Loading library...</div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-xl mb-4">No songs found.</p>
                            {showFavoritesOnly ? (
                                <p className="text-gray-500">Mark songs with the heart icon to see them here.</p>
                            ) : (
                                <p className="text-gray-500">Upload your favorite tracks to get started!</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="grid grid-cols-[50%_35%_1fr] gap-4 px-6 pb-2 text-slate-500 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800 mb-4 text-xs uppercase tracking-wider font-semibold transition-colors duration-300">
                                <span>Title</span>
                                <span className="hidden md:block">Artist</span>
                                <span className="text-right">Time</span>
                            </div>
                            {filteredSongs.map((song, i) => (
                                <SongRow key={song.id} song={song} index={i} onPlay={handlePlay} onToggleFavorite={onToggleFavorite} isFavorite={favoriteIds.includes(song.id)} />
                            ))}
                        </div>
                    )}
                </div>

                {isUploadModalOpen && (
                    <UploadModal
                        isOpen={isUploadModalOpen}
                        onClose={() => setIsUploadModalOpen(false)}
                        onUploadSuccess={() => window.location.reload()} // Simple reload for now to re-fetch in App.jsx, or pass onRefresh prop
                    />
                )}
            </div>
        </div>
    )
}
