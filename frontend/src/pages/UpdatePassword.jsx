import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function UpdatePassword() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error

            setMessage('Password updated successfully! Redirecting...')

            // Redirect to home after a short delay
            setTimeout(() => {
                navigate('/')
            }, 1500)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-slate-100 dark:bg-neutral-950 px-4 transition-colors duration-300">
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-neutral-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-amber-400 mb-2">Update Password</h1>
                    <p className="text-slate-500 dark:text-neutral-400">
                        Please enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-200 dark:border-red-900/50 text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-amber-400 p-3 rounded-lg text-sm mb-6 border border-green-200 dark:border-green-900/50 text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-amber-400 text-white dark:text-neutral-950 font-bold py-3 px-4 rounded-lg hover:bg-slate-800 dark:hover:bg-amber-500 transition-colors duration-200 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
