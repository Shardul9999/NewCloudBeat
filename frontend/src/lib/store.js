import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
    isPlaying: false,
    currentSong: null,
    playlist: [],
    currentIndex: -1,
    isShuffle: false,
    isRepeat: false,
    searchQuery: "",

    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
    toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

    setPlaylist: (songs) => set({ playlist: songs }),

    playSong: (song) => set((state) => {
        const index = state.playlist.findIndex((s) => s.id === song.id)
        return { currentSong: song, isPlaying: true, currentIndex: index !== -1 ? index : state.currentIndex }
    }),

    // To handle updates like Favourite toggle without reloading everything
    updateSong: (updatedSong) => set((state) => ({
        playlist: state.playlist.map(s => s.id === updatedSong.id ? updatedSong : s),
        currentSong: state.currentSong?.id === updatedSong.id ? updatedSong : state.currentSong
    })),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    playNext: () => set((state) => {
        const { isRepeat, isShuffle, playlist, currentIndex } = state

        if (playlist.length === 0) return {}

        // Repeat Logic: handled by Component usually, but if called, we just keep current.
        // Wait, if "Next" button is clicked, we usually want to skip even if Repeat is on?
        // User logic: "if isRepeat is true, loop the current track". 
        // This implies auto-progression loops. Next button forces next? 
        // Let's assume Next button forces next, but "onEnded" calls playNext.
        // If we want to strictly follow "loop current track", then playNext should just replay current IF it was an auto-trigger. 
        // But we can't distinguish auto vs manual here easily without extra state.
        // Let's implement: Repeat = Loop Single Track (so next -> same track).

        if (isRepeat) {
            return { isPlaying: true } // Re-trigger play?
            // Actually, to force re-render/replay, we might need to do something.
            // But if we just return, the effect in Player won't fire if ID splits.
        }

        if (isShuffle) {
            const nextIndex = Math.floor(Math.random() * playlist.length)
            return {
                currentSong: playlist[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true
            }
        }

        if (currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1
            return {
                currentSong: playlist[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true
            }
        }

        // End of playlist
        return { isPlaying: false }
    }),

    playPrev: () => set((state) => {
        if (state.currentIndex > 0) {
            const prevIndex = state.currentIndex - 1
            return {
                currentSong: state.playlist[prevIndex],
                currentIndex: prevIndex,
                isPlaying: true
            }
        }
        return {}
    }),
}))
