import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import SongRow from '../components/SongRow'
import UploadModal from '../components/UploadModal'
import { usePlayerStore } from '../lib/store'

export default function Library({ session }) {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    const { setPlaylist, playSong } = usePlayerStore()

    const fetchSongs = async () => {
        try {
            setLoading(true)
            const token = session?.access_token
            if (!token) return

            const response = await axios.get('/api/songs/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setSongs(response.data)
            setPlaylist(response.data)
        } catch (error) {
            console.error("Error fetching songs:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchSongs()
        }
    }, [session])

    const handlePlay = (song) => {
        playSong(song)
    }

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Your Library</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full flex items-center gap-2 transition transform hover:scale-105"
                >
                    <Plus size={20} />
                    Add Song
                </button>
            </div>

            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 p-6 rounded-lg min-h-[500px]">
                {loading ? (
                    <div className="text-gray-400 text-center py-10">Loading library...</div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl mb-4">No songs found.</p>
                        <p className="text-gray-500">Upload your favorite tracks to get started!</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-3 pb-2 text-gray-400 border-b border-gray-800 mb-4 text-sm uppercase tracking-wider">
                            <span className="w-8 text-center">#</span>
                            <span>Title</span>
                            <span className="hidden md:block">Artist</span>
                            <span className="hidden md:block">Album</span>
                            <span className="mr-8">Time</span>
                        </div>
                        {songs.map(song => (
                            <SongRow key={song.id} song={song} onPlay={handlePlay} />
                        ))}
                    </div>
                )}
            </div>

            {isUploadModalOpen && (
                <UploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={fetchSongs}
                />
            )}
        </div>
    )
}
