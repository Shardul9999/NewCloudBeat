Create a production-level web app using:

# Project: CloudBeat (Web-Based Music Player)

## Core Features
* **Playback:** Play, pause, skip forward, skip backward, and a functional volume slider.
* **User Interface:** A dark theme with a persistent playback bar at the bottom and a sidebar for navigation.
* **Data Management:** A main view displaying a grid of albums or a list of songs.
* **Interactions:** Clicking a song immediately updates the playback bar and starts the audio.

## Tech Stack Constraints
* **Frontend:** React.js, styled with Tailwind CSS.
* **Backend:** Python using the Flask framework. Keep the architecture lightweight.
* **Database & Auth:** Supabase (PostgreSQL for user data and song metadata).
* **File Storage:** Supabase Storage Buckets (for hosting .mp3 audio files and album art).

## Security & Authentication Requirements
* **Auth Provider:** Use Supabase Auth for all user management (Email/Password login).
* **Frontend Handling:** Store the Supabase session token securely in the React client.
* **Backend Protection:** All Flask API routes must require a valid Supabase bearer token in the authorization header.
* **Database Security:** Enable Row Level Security (RLS) on all Supabase tables so users can only access their own data.

## Execution Rules
1. Follow a strict production folder structure (separate `/frontend` and `/backend` folders).
2. Phase 1: Create the backend with Flask and establish the Supabase connection first.
3. Phase 2: Create the React frontend and connect it to the backend.
4. Explain each step before writing the code, and wait for my approval to proceed.
 
