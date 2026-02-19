from supabase import create_client, Client
from backend.config import Config

class DBService:
    _client: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            url = Config.SUPABASE_URL
            key = Config.SUPABASE_KEY
            if not url or not key:
                raise ValueError("Supabase URL and Key must be set in environment variables.")
            cls._client = create_client(url, key)
        return cls._client

# Initialize client to fail early if config is missing (optional, but good for debugging)
# try:
#     DBService.get_client()
# except ValueError as e:
#     print(f"Warning: {e}")
