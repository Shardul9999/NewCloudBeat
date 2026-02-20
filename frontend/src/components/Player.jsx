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
        <div className="h-32 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800/50 p-4 flex items-center justify-center text-slate-500 dark:text-neutral-400 transition-colors duration-300">
            Select a song to play
        </div>
    )

    return (
        <div className="h-32 bg-white dark:bg-neutral-950/90 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800/50 px-4 md:px-8 flex items-center justify-between z-50 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-2xl transition-colors duration-300">

            {/* Left: Controls */}
            <div className="flex items-center gap-4 lg:gap-6 w-1/4 min-w-[200px]">
                <button
                    onClick={toggleShuffle}
                    className={`transition ${isShuffle ? 'text-cyan-600 dark:text-amber-400' : 'text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-amber-400'}`}
                >
                    <Shuffle size={18} />
                </button>

                <button
                    onClick={playPrev}
                    className="text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-amber-400 transition"
                >
                    <SkipBack size={22} fill="currentColor" />
                </button>

                <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-slate-100 dark:bg-amber-400 border border-slate-300 dark:border-transparent flex items-center justify-center hover:scale-105 transition text-slate-900 dark:text-neutral-950 shadow-md"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={playNext}
                    className="text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-amber-400 transition"
                >
                    <SkipForward size={22} fill="currentColor" />
                </button>

                <button
                    onClick={toggleRepeat}
                    className={`transition ${isRepeat ? 'text-cyan-600 dark:text-amber-400' : 'text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-amber-400'}`}
                >
                    <Repeat size={18} />
                </button>
            </div>

            {/* Center: Waveform / Progress */}
            <div className="flex flex-col items-center w-2/4 px-4 relative group justify-center gap-1">
                <div className="w-full flex items-end justify-between h-20 gap-[2.5px] cursor-pointer relative"
                    onClick={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - bounds.left;
                        const width = bounds.width;
                        const percent = Math.min(Math.max(0, x / width), 1);

                        if (audioRef.current && duration) {
                            const newTime = percent * duration;
                            audioRef.current.currentTime = newTime;
                            setCurrentTime(newTime);
                        }
                    }}
                >
                    {waveformBars.map((bar, index) => {
                        const height = Math.max(15, Math.sin(index * 0.2) * 30 + Math.random() * 20 + 5);
                        const barLimit = (index / waveformBars.length) * 100;
                        const isPlayed = progressPercent > barLimit;

                        return (
                            <div
                                key={index}
                                className={`flex-1 rounded-full transition-all duration-300 ease-linear ${isPlayed ? 'bg-cyan-500 dark:bg-amber-400 opacity-90' : 'bg-slate-300 dark:bg-neutral-800'}`}
                                style={{ height: `${height}%` }}
                            ></div>
                        )
                    })}
                </div>

                {/* Time Display */}
                <div className="w-full flex justify-between text-[10px] font-medium text-slate-400 dark:text-neutral-500 tracking-wider">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Song Info & Volume */}
            <div className="flex items-center justify-end gap-6 w-1/4 min-w-[250px]">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-neutral-900 overflow-hidden relative shadow-md flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-purple-900 opacity-50 dark:from-amber-900 dark:to-neutral-900 dark:opacity-40"></div>
                        <img
                            src={`https://i.pravatar.cc/150?u=${currentSong.title}`}
                            alt="Album Art"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                    <div className="flex flex-col overflow-hidden text-right">
                        <span className="text-slate-900 dark:text-amber-400 font-bold text-sm truncate max-w-[150px] transition-colors duration-300">{currentSong.title}</span>
                        <span className="text-slate-600 dark:text-neutral-400 text-xs truncate max-w-[150px] transition-colors duration-300">{currentSong.artist}</span>
                    </div>
                </div>

                <button onClick={handleToggleFavourite} className="hover:scale-110 transition flex-shrink-0">
                    <Heart size={20} className={`${currentSong.is_favourite ? 'fill-pink-500 text-pink-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-amber-400'}`} />
                </button>

                <div className="hidden lg:flex items-center gap-2 group ml-2">
                    <Volume2 size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-amber-400 transition" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1.5 bg-slate-300 dark:bg-neutral-700 rounded-lg accent-cyan-600 dark:accent-amber-400 cursor-pointer"
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
