-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Songs Table
create table if not exists songs (
    id uuid default uuid_generate_v4() primary key,
    title text,
    artist text,
    album text,
    drive_id text unique not null,
    duration float,
    mime_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    user_id uuid, -- For later when we link to auth.users
    metadata jsonb -- Store full Drive metadata
);

-- Playlists Table
create table if not exists playlists (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    user_id uuid
);

-- Playlist Songs (Many-to-Many)
create table if not exists playlist_songs (
    playlist_id uuid references playlists(id) on delete cascade,
    song_id uuid references songs(id) on delete cascade,
    added_at timestamp with time zone default timezone('utc'::text, now()),
    primary key (playlist_id, song_id)
);

-- Enable RLS (Optional for Phase 1 but good practice)
alter table songs enable row level security;
alter table playlists enable row level security;
alter table playlist_songs enable row level security;

-- Policies (Allow all for anon for Phase 1 for simplicity, or based on user_id later)
create policy "Public access" on songs for all using (true);
create policy "Public access" on playlists for all using (true);
create policy "Public access" on playlist_songs for all using (true);
