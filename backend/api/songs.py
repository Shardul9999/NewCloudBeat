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
        # Fetch ALL songs for the global catalog
        response = supabase.table('songs').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@songs_bp.route('/<song_id>/favourite', methods=['POST'])
@require_auth
def toggle_favourite(song_id):
    """Toggles the is_favourite status of a song."""
    try:
        supabase = DBService.get_client()
        
        # 1. Get current status
        res = supabase.table('songs').select('is_favourite').eq('id', song_id).eq('user_id', g.user_id).execute()
        
        if not res.data:
            return jsonify({"error": "Song not found"}), 404
            
        current_status = res.data[0].get('is_favourite', False)
        new_status = not current_status
        
        # 2. Update status
        update_res = supabase.table('songs').update({'is_favourite': new_status}).eq('id', song_id).eq('user_id', g.user_id).execute()
        
        if update_res.data:
            return jsonify(update_res.data[0])
        else:
            return jsonify({"error": "Failed to update"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@songs_bp.route('/', methods=['POST'])
@require_auth
def add_song():
    """Adds a song: Uploads to Supabase via Backend, extracts duration, saves metadata."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Form Data
        title = request.form.get('title') or file.filename
        artist = request.form.get('artist') or "Unknown Artist"
        album = request.form.get('album') or "Unknown Album"
        
        # 1. Save to Temp File
        import os
        from werkzeug.utils import secure_filename
        
        filename = secure_filename(file.filename)
        # Unique ID for storage path
        storage_filename = f"{g.user_id}/{filename}"
        
        # Ensure temp dir exists
        temp_dir = '/tmp'
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
            
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)
        print(f"Saved temp file to {temp_path}")
        
        # 2. Extract Duration
        duration_formatted = "0:00"
        try:
            from mutagen.mp3 import MP3
            
            # Read from valid file path
            audio = MP3(temp_path)
            length = audio.info.length
            
            minutes = int(length // 60)
            seconds = int(length % 60)
            duration_formatted = f"{minutes}:{seconds:02d}"
            print(f"Extracted duration: {duration_formatted}")
            
        except Exception as e:
            print(f"Mutagen error: {e}")
            # Non-fatal, continue with 0:00
            
        # 3. Upload to Supabase Storage
        # Authenticate with the user's token for RLS
        token = request.headers.get('Authorization').split(' ')[1]
        from supabase import create_client, ClientOptions
        from backend.config import Config
        
        client_options = ClientOptions(headers={'Authorization': f'Bearer {token}'})
        supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY, options=client_options)

        try:
            with open(temp_path, 'rb') as f:
                # Read file content
                file_content = f.read()
                
            # Upload (overwrite if exists or handle naming collisions? Supabase usually errors on collision without upsert)
            # Use 'upsert': 'true' if needed, or unique names. Timestamps suggested.
            import time
            timestamp = int(time.time())
            final_storage_path = f"{g.user_id}/{timestamp}_{filename}"
            
            # The python upload method takes the path and the file body (bytes)
            # file_options = {"content-type": file.mimetype} # Optional
            
            res = supabase.storage.from_('music').upload(
                path=final_storage_path,
                file=file_content,
                file_options={"content-type": file.mimetype}
            )
            print(f"Uploaded to Supabase: {final_storage_path}")
            
        except Exception as e:
            # Clean up temp file before returning error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

        # 4. Save Metadata to DB
        song_data = {
            "title": title,
            "artist": artist,
            "album": album,
            "drive_id": final_storage_path, 
            "duration": duration_formatted,
            "mime_type": file.mimetype,
            "user_id": g.user_id,
            "is_favourite": False
        }
        
        response = supabase.table('songs').insert(song_data).execute()
        
        # 5. Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"Deleted temp file {temp_path}")
            
        return jsonify(response.data)
        
    except Exception as e:
        print(f"CRASH in add_song: {e}")
        traceback.print_exc()
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
