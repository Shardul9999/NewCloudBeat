import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)

    const handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })

        if (error) {
            let errorMsg = error.error_description || error.message
            if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
                errorMsg = 'Too many login attempts. Please wait a minute before trying again.'
            }
            setMessage({ type: 'error', text: errorMsg })
        } else {
            setMessage({ type: 'success', text: 'Check your email for the login link!' })
        }
        setLoading(false)
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">CloutBeat Login</h1>
                <p className="mb-4 text-gray-400 text-sm text-center">Sign in via Magic Link</p>
                {message && (
                    <div className={`mb-4 p-3 rounded text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-green-500"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        required={true}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Sending link...' : 'Send Magic Link'}
                    </button>
                </form>
            </div>
        </div>
    )
}
