import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
    isPlaying: false,
    currentSong: null,
    playlist: [],
    currentIndex: -1,
    isShuffle: false,
    isRepeat: false,
    searchQuery: "",
    songs: [],
    favoriteIds: [],

    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
    toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

    setPlaylist: (songs) => set({ playlist: songs }),
    setSongs: (songs) => set({ songs }),
    setFavoriteIds: (ids) => set({ favoriteIds: ids }),

    toggleFavoriteId: (songId) => set((state) => {
        const isFav = state.favoriteIds.includes(songId);
        return {
            favoriteIds: isFav
                ? state.favoriteIds.filter(id => id !== songId)
                : [...state.favoriteIds, songId]
        };
    }),

    playSong: (song) => set((state) => {
        const index = state.playlist.findIndex((s) => s.id === song.id)
        return { currentSong: song, isPlaying: true, currentIndex: index !== -1 ? index : state.currentIndex }
    }),

    // To handle updates like Favourite toggle without reloading everything
    updateSong: (updatedSong) => set((state) => ({
        songs: state.songs.map(s => s.id === updatedSong.id ? updatedSong : s),
        playlist: state.playlist.map(s => s.id === updatedSong.id ? updatedSong : s),
        currentSong: state.currentSong?.id === updatedSong.id ? updatedSong : state.currentSong
    })),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    playNext: () => set((state) => {
        const { isRepeat, isShuffle, playlist, currentIndex } = state

        if (playlist.length === 0) return {}

        // Repeat Logic: handled by Component usually, but if called, we just keep current.
        if (isRepeat) {
            return { isPlaying: true }
        }

        if (isShuffle) {
            const nextIndex = Math.floor(Math.random() * playlist.length)
            return {
                currentSong: playlist[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true
            }
        }

        // Wrap around to start if at the end of the playlist
        const nextIndex = (currentIndex + 1) % playlist.length

        return {
            currentSong: playlist[nextIndex],
            currentIndex: nextIndex,
            isPlaying: true
        }
    }),

    playPrev: () => set((state) => {
        const { playlist, currentIndex } = state

        if (playlist.length === 0) return {}

        // Wrap around to the end if at the start of the playlist
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length

        return {
            currentSong: playlist[prevIndex],
            currentIndex: prevIndex,
            isPlaying: true
        }
    }),
}))
