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

        setUploading(true)
        try {
            const user = (await supabase.auth.getUser()).data.user
            if (!user) throw new Error("User not authenticated")

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const filePath = fileName

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('music')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Save Metadata to Backend
            // We need the session token for the backend request
            const session = (await supabase.auth.getSession()).data.session
            const token = session?.access_token

            await axios.post('/api/songs/', {
                title: title || file.name,
                artist: artist || 'Unknown Artist',
                album: 'Unknown Album', // Todo: Add album input
                storage_path: filePath,
                duration: 0, // Todo: Calculate duration
                mime_type: file.type
            }, {
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
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-4">Upload Music</h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Select File</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                            <p className="text-gray-400 text-sm">{file ? file.name : "Click or Drag to Upload"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
                            placeholder="Song Title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Artist</label>
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
                            placeholder="Artist Name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    )
}
