# App Requirements: CloudBeat Music Player

## Overview
A personalized, ad-free music streaming web application similar to Spotify. Users utilize Supabase Storage for audio files and Supabase Auth for identity management.

## Tech Stack
- **Backend**: Python (Flask)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React.js with Tailwind CSS
- **Storage**: Supabase Storage Buckets
- **Authentication**: Supabase Auth

## Core Features
1.  **Music Playback**:
    -   Stream audio files from Supabase Storage.
    -   Basic controls: Play, Pause, Next, Previous, Volume, Seek.
2.  **Library Management**:
    -   Upload music files (Frontend -> Supabase Storage).
    -   Sync metadata (Backend triggers or Frontend hooks).
    -   Organize by Artist, Album, Song.
3.  **Playlists**:
    -   Create, edit, delete playlists.
    -   Add songs to playlists.
4.  **Search**:
    -   Search library by song title, artist, or album.

## Phases
### Phase 1: Backend & Database (Flask + Supabase)
-   Setup Flask project structure.
-   Connect to Supabase database.
-   Verify User Authentication (Middleware for Supabase JWT).
-   Create API endpoints for:
    -   Songs (CRUD - Sync with Storage)
    -   Playlists (CRUD)
    -   Streaming (Direct Storage URL)

### Phase 2: Frontend (React + Tailwind)
-   Setup React project (Vite).
-   Configure Tailwind CSS.
-   Implement UI Components:
    -   Player Bar
    -   Sidebar Navigation
    -   Song List/Grid
    -   Upload Modal
-   Connect Frontend to Flask API.
