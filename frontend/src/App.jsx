import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Library from './pages/Library'
import Layout from './components/Layout'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={session ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/library" replace />} />
          <Route path="library" element={<Library session={session} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
