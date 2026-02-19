import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
    isPlaying: false,
    currentSong: null,
    playlist: [],
    currentIndex: -1,

    setPlaylist: (songs) => set({ playlist: songs }),

    playSong: (song) => set((state) => {
        const index = state.playlist.findIndex((s) => s.id === song.id)
        return { currentSong: song, isPlaying: true, currentIndex: index !== -1 ? index : state.currentIndex }
    }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    playNext: () => set((state) => {
        if (state.currentIndex < state.playlist.length - 1) {
            const nextIndex = state.currentIndex + 1
            return {
                currentSong: state.playlist[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true
            }
        }
        return {}
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
