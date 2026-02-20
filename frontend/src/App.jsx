import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import UpdatePassword from './pages/UpdatePassword'
import Library from './pages/Library'
import Layout from './components/Layout'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { usePlayerStore } from './lib/store'
import HomePage from './pages/HomePage'

function AppRoutes() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const navigate = useNavigate()

  const isAdmin = user?.email === 'shardulhingane16@gmail.com'

  useEffect(() => {
    // 1. Check localStorage for Theme
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 2. Auth Logic
    // Check if there is a hash that needs parsing
    const isHash = window.location.hash && window.location.hash.includes('access_token')

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      if (!isHash || session) {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 3. Fetch Songs for Global State
  const { songs, setSongs, setPlaylist, playSong, favoriteIds, setFavoriteIds, toggleFavoriteId } = usePlayerStore()

  useEffect(() => {
    if (session) {
      const fetchInitialData = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (token) {
          try {
            // Fetch Global Songs
            const songsResponse = await fetch('http://localhost:5000/api/songs/', {
              headers: { Authorization: `Bearer ${token}` }
            })
            const songsData = await songsResponse.json()
            if (!songsData.error) {
              setSongs(songsData)
            }

            // Fetch User Favorites directly from Supabase
            const { data: favData, error: favError } = await supabase
              .from('user_favorites')
              .select('song_id')
              .eq('user_id', session.user.id)

            if (favData && !favError) {
              setFavoriteIds(favData.map(f => f.song_id))
            }
          } catch (error) {
            console.error('Error fetching initial data:', error)
          }
        }
      }
      fetchInitialData()
    }
  }, [session, setSongs, setFavoriteIds])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-amber-400">
        Loading...
      </div>
    )
  }

  // Handler for playing a song from Home Page
  const handlePlay = (song) => {
    setPlaylist(songs) // Set full list when playing from Home
    playSong(song)
  }

  // Global handler for toggling favorites
  const handleToggleFavorite = async (songId) => {
    if (!user) return

    const isFav = favoriteIds.includes(songId)

    // Optimsitic UI update
    toggleFavoriteId(songId)

    try {
      if (isFav) {
        // Remove from favorites
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', songId)
      } else {
        // Add to favorites
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, song_id: songId })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revert UI on failure
      toggleFavoriteId(songId)
    }
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/" replace />} />
      <Route path="/update-password" element={session ? <UpdatePassword /> : <Navigate to="/login" replace />} />
      <Route path="/" element={session ? <Layout theme={theme} toggleTheme={toggleTheme} user={user} /> : <Navigate to="/login" replace />}>
        <Route index element={<HomePage songs={songs} onPlay={handlePlay} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="library" element={<Library session={session} songs={songs} isAdmin={isAdmin} onToggleFavorite={handleToggleFavorite} />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
