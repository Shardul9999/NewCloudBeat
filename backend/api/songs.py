from flask import Blueprint, jsonify, request, g
from backend.services.db_service import DBService
from backend.api.middleware import require_auth
import traceback

songs_bp = Blueprint('songs', __name__, url_prefix='/api/songs')

@songs_bp.route('/', methods=['GET'])
@require_auth
def list_songs():
    """Lists songs from Supabase."""
    try:
        supabase = DBService.get_client()
        # Ensure we filter by user to respect privacy, although RLS should handle it.
        # But for now, let's just list everything or filter by user_id if we have it in table.
        # The schema definition has user_id, so let's use it.
        response = supabase.table('songs').select('*').eq('user_id', g.user_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@songs_bp.route('/', methods=['POST'])
@require_auth
def add_song():
    """Adds a song metadata after uploading to Storage."""
    data = request.json
    # Expected: title, artist, album, storage_path, duration, mime_type
    
    required_fields = ['title', 'storage_path']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
            
    try:
        supabase = DBService.get_client()
        
        song_data = {
            "title": data.get('title'),
            "artist": data.get('artist'),
            "album": data.get('album'),
            "drive_id": data.get('storage_path'), # Reusing drive_id column for storage_path or Rename it? Let's keep it simple for now, but better rename.
            # Actually, let's refrain from renaming config/schema right now to avoid migration steps, 
            # I will use 'drive_id' to store 'storage_path' for now.
            "duration": data.get('duration'),
            "mime_type": data.get('mime_type'),
            "user_id": g.user_id
        }
        
        response = supabase.table('songs').insert(song_data).execute()
        return jsonify(response.data)
        
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@songs_bp.route('/<song_id>/url', methods=['GET'])
@require_auth
def get_song_url(song_id):
    """Gets a signed URL for the song from Supabase Storage."""
    try:
        print(f"1. Fetching song record for ID: {song_id}")
        
        # Using authenticated client logic from before which is correct for RLS
        # We need the user's token from the request
        token = request.headers.get('Authorization').split(' ')[1]
        
        from supabase import create_client, ClientOptions
        from backend.config import Config
        
        # Authenticate with the user's token
        client_options = ClientOptions(headers={'Authorization': f'Bearer {token}'})
        supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY, options=client_options)
        
        # 2. Extract file path
        res = supabase.table('songs').select('drive_id').eq('id', song_id).execute()
        
        if not res.data:
            print("Error: Song not found in DB")
            return jsonify({"error": "Song not found"}), 404
            
        file_path = res.data[0]['drive_id']
        print(f"2. Found file path: {file_path}")
        
        # 3. Generate signed URL strictly using strict Python syntax
        print("3. Generating signed URL...")
        signed_url_response = supabase.storage.from_('music').create_signed_url(file_path, 3600)
        
        # 4. Extract the actual URL string
        # The Python SDK usually returns a dictionary or string. 
        # User says: "Extract the actual URL string from it (it is typically under the key 'signedURL')"
        print(f"4. Signed URL Response: {signed_url_response}")
        
        if isinstance(signed_url_response, dict):
            actual_url_string = signed_url_response.get('signedURL')
            # Fallback if key is different (just in case, though user was specific)
            if not actual_url_string:
                # Some versions might return just the URL string? Or different key?
                # User said "typically under 'signedURL'".
                # If response is error dict:
                if 'error' in signed_url_response:
                     print(f"Error in signed_url_response: {signed_url_response}")
                     return jsonify({"error": signed_url_response}), 500
        else:
            # It might be a string directly
            actual_url_string = signed_url_response

        print(f"5. Extracted URL: {actual_url_string}")
        
        # 5. Return it to the React frontend as JSON
        return jsonify({"url": actual_url_string}), 200

    except Exception as e:
        print(f"CRASH in get_song_url: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
