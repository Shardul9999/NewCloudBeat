import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Library from './pages/Library'
import Layout from './components/Layout'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { usePlayerStore } from './lib/store'
import HomePage from './pages/HomePage'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')

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
      if (!isHash || session) {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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
  const { songs, setSongs, setPlaylist, playSong } = usePlayerStore()

  useEffect(() => {
    if (session) {
      const fetchSongs = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (token) {
          try {
            const response = await fetch('http://localhost:5000/api/songs/', { // Using fetch directly or axios
              headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setSongs(data)
            // Don't auto-set playlist on load unless desired, but user might want to see something?
            // Actually, Library page handles its own list. HomePage needs "songs".

            // Let's set the initial playlist so the player isn't empty?
            // Or just let individual pages handle "play" events which set playlist.
          } catch (error) {
            console.error('Error fetching songs:', error)
          }
        }
      }
      fetchSongs()
    }
  }, [session])

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

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={session ? <Layout theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" replace />}>
          <Route index element={<HomePage songs={songs} onPlay={handlePlay} />} />
          <Route path="library" element={<Library session={session} songs={songs} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
