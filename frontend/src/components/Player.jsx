import { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { usePlayerStore } from '../lib/store'
import axios from 'axios'
import { supabase } from '../lib/supabase'

export default function Player() {
    const audioRef = useRef(null)
    const {
        currentSong,
        isPlaying,
        togglePlay,
        playNext,
        playPrev
    } = usePlayerStore()

    const [songUrl, setSongUrl] = useState(null)
    const [volume, setVolume] = useState(1)

    useEffect(() => {
        const fetchSongUrl = async () => {
            if (!currentSong) return

            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const response = await axios.get(`/api/songs/${currentSong.id}/url`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                })

                setSongUrl(response.data.url)

            } catch (error) {
                console.error("Error fetching song URL:", error)
            }
        }

        fetchSongUrl()
    }, [currentSong])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e))
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying, songUrl])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])


    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
            setDuration(audioRef.current.duration)
        }
    }

    const handleEnded = () => {
        playNext()
    }

    if (!currentSong) return (
        <div className="h-24 bg-black border-t border-gray-800 p-4 flex items-center justify-center text-gray-500">
            Select a song to play
        </div>
    )

    // return (
    return (
        <div className="h-24 bg-black border-t border-gray-800 px-4 flex items-center justify-between z-50 relative">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden group">
                    {/* Placeholder or Album Art */}
                    <span className="text-xs text-gray-500 group-hover:opacity-0 transition-opacity">Img</span>
                    {/* Equalizer Animation Overlay */}
                    {isPlaying && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1">
                            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-5 bg-green-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{currentSong.title}</span>
                        {isPlaying && (
                            <div className="flex gap-0.5 items-end h-3">
                                <div className="w-0.5 h-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-0.5 h-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-0.5 h-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                    </div>
                    <span className="text-gray-400 text-xs">{currentSong.artist}</span>
                </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="flex items-center gap-6">
                    <button
                        onClick={playPrev}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="bg-white rounded-full p-2 hover:scale-105 transition text-black"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>

                    <button
                        onClick={playNext}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Progress Bar & Time */}
                <div className="w-full mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-10 text-right">{formatTime(currentTime)}</span>

                    {/* Custom Progress Bar Container */}
                    <div className="relative w-full h-1 group flex items-center">
                        {/* Background Track */}
                        <div className="absolute inset-0 bg-gray-800 rounded-full"></div>

                        {/* Filled Track with smooth transition */}
                        <div
                            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-500 ease-linear group-hover:bg-green-500"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        ></div>

                        {/* Thumb (Visible on hover or always if requested, putting active state) */}
                        <div
                            className="absolute h-3 w-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
                        ></div>

                        {/* Invisible Input for Interaction */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => {
                                const time = parseFloat(e.target.value)
                                if (audioRef.current) audioRef.current.currentTime = time
                                setCurrentTime(time)
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>

                    <span className="w-10">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center justify-end gap-2 w-1/3">
                <Volume2 size={20} className="text-gray-400" />
                <div className="relative w-24 h-1 group flex items-center">
                    <div className="absolute inset-0 bg-gray-800 rounded-full"></div>
                    <div
                        className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-500 ease-linear group-hover:bg-green-500"
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                    <div
                        className="absolute h-3 w-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ left: `${volume * 100}%`, transform: 'translateX(-50%)' }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>
            </div>

            <audio
                ref={audioRef}
                src={songUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />
        </div>
    )
}
