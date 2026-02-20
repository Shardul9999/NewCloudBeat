import { useState } from 'react'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import { X, Upload } from 'lucide-react'

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')

    if (!isOpen) return null

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) return

        console.log("File being sent:", file)
        setUploading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) throw new Error("Not authenticated")

            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title || file.name)
            formData.append('artist', artist || 'Unknown Artist')
            formData.append('album', 'Unknown Album')

            // Post to backend
            // CRITICAL: Do NOT set Content-Type header manually for FormData
            // The browser will set it to multipart/form-data with the correct boundary
            await axios.post('/api/songs/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            onUploadSuccess()
            onClose()
            setFile(null)
            setTitle('')
            setArtist('')

        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed: ' + (error.response?.data?.error || error.message))
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative transition-colors duration-300 shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Upload Music</h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1 transition-colors">Select File</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-500 dark:hover:border-green-500 transition cursor-pointer relative bg-gray-50 dark:bg-transparent">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={32} />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{file ? file.name : "Click or Drag to Upload"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1 transition-colors">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="Song Title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1 transition-colors">Artist</label>
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="Artist Name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-lg"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    )
}
