from flask import Blueprint, jsonify, request
from backend.services.db_service import DBService

playlists_bp = Blueprint('playlists', __name__, url_prefix='/api/playlists')

@playlists_bp.route('/', methods=['GET'])
def list_playlists():
    try:
        supabase = DBService.get_client()
        response = supabase.table('playlists').select('*').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@playlists_bp.route('/', methods=['POST'])
def create_playlist():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    try:
        supabase = DBService.get_client()
        response = supabase.table('playlists').insert({"name": name}).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add song to playlist
@playlists_bp.route('/<playlist_id>/songs', methods=['POST'])
def add_song_to_playlist(playlist_id):
    data = request.json
    song_id = data.get('song_id')
    if not song_id:
        return jsonify({"error": "song_id is required"}), 400
        
    try:
        supabase = DBService.get_client()
        response = supabase.table('playlist_songs').insert({
            "playlist_id": playlist_id,
            "song_id": song_id
        }).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@playlists_bp.route('/<playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    try:
        supabase = DBService.get_client()
        # Join query (Supabase style)
        response = supabase.table('playlists').select('*, playlist_songs(song:songs(*))').eq('id', playlist_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
