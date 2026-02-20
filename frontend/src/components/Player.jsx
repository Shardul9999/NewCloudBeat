import { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react'
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
        playPrev,
        isShuffle,
        isRepeat,
        toggleShuffle,
        toggleRepeat,
        updateSong
    } = usePlayerStore()

    const [songUrl, setSongUrl] = useState(null)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

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
    }, [currentSong?.id])

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
        if (isRepeat && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
        } else {
            playNext()
        }
    }

    const handleToggleFavourite = async (e) => {
        e.stopPropagation()
        if (!currentSong) return

        // Optimistic update
        const newStatus = !currentSong.is_favourite
        updateSong({ ...currentSong, is_favourite: newStatus })

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await axios.post(`/api/songs/${currentSong.id}/favourite`, {}, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
        } catch (error) {
            console.error("Failed to toggle favourite", error)
            // Revert on error
            updateSong({ ...currentSong, is_favourite: !newStatus })
        }
    }

    // Waveform simulation
    // Generate bars for the waveform
    const waveformBars = Array.from({ length: 60 }, (_, i) => i);

    // Calculate progress percentage
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    if (!currentSong) return (
        <div className="h-32 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/50 p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Select a song to play
        </div>
    )

    return (
        <div className="h-32 bg-white dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/50 px-8 flex items-center justify-between z-50 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-2xl transition-colors duration-300">
            {/* Left: Controls */}
            <div className="flex items-center gap-6 w-1/4">
                <button
                    onClick={toggleShuffle}
                    className={`transition ${isShuffle ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Shuffle size={18} />
                </button>
                <button
                    onClick={playPrev}
                    className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                    <SkipBack size={24} fill="currentColor" />
                </button>

                <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center hover:scale-105 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-900 dark:hover:border-slate-400 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-white dark:bg-transparent"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={playNext}
                    className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                    <SkipForward size={24} fill="currentColor" />
                </button>
                <button
                    onClick={toggleRepeat}
                    className={`transition ${isRepeat ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Repeat size={18} />
                </button>
            </div>

            {/* Center: Waveform Visualization */}
            <div className="flex flex-col items-center w-2/4 px-12 relative group">
                <div className="w-full flex items-end justify-between h-12 gap-[2px] mb-2 cursor-pointer relative"
                    onClick={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - bounds.left;
                        const width = bounds.width;
                        const percent = Math.min(Math.max(0, x / width), 1); // Clamp between 0 and 1

                        if (audioRef.current && duration) {
                            const newTime = percent * duration;
                            audioRef.current.currentTime = newTime;
                            setCurrentTime(newTime);
                        }
                    }}
                >
                    {waveformBars.map((bar, index) => {
                        // Create a pattern that looks like a waveform
                        const height = Math.max(20, Math.sin(index * 0.2) * 40 + Math.random() * 30 + 10);
                        // Determine if this bar is "active" (played)
                        const barLimit = (index / waveformBars.length) * 100;
                        const isPlayed = progressPercent > barLimit;

                        return (
                            <div
                                key={index}
                                className={`flex-1 rounded-full transition-all duration-300 ease-linear ${isPlayed ? 'bg-cyan-600 dark:bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                style={{ height: `${height}%` }}
                            ></div>
                        )
                    })}

                    {/* Hover Time Indicator (Optional enhancement) */}
                </div>

                <div className="w-full flex justify-between text-xs font-medium text-cyan-700 dark:text-cyan-200 tracking-wider transition-colors duration-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Song Info */}
            <div className="flex items-center justify-end gap-6 w-1/4">
                <div className="text-right hidden xl:block">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1 transition-colors duration-300">DJ MAGAZINE</p>
                    <p className="text-xs text-slate-600 dark:text-slate-500 transition-colors duration-300">Global Top 50</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-2 pr-6 rounded-xl border border-slate-200 dark:border-slate-700/50 resize-none transition-colors duration-300">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative shadow-lg">
                        {/* Use real image if available later */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-purple-900 opacity-50 dark:opacity-100"></div>
                        <img
                            src={`https://i.pravatar.cc/150?u=${currentSong.title}`}
                            alt="Album Art"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-bold text-sm truncate max-w-[120px] transition-colors duration-300">{currentSong.title}</span>
                        <span className="text-slate-600 dark:text-slate-400 text-xs truncate max-w-[120px] transition-colors duration-300">{currentSong.artist}</span>
                    </div>
                    <button onClick={handleToggleFavourite} className="ml-2 hover:scale-110 transition">
                        <Heart size={18} className={`${currentSong.is_favourite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`} />
                    </button>
                </div>

                {/* Volume Mini - could be a popover or integrated, keeping simple for now */}
                <div className="hidden lg:flex items-center gap-2 group">
                    <Volume2 size={16} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
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
