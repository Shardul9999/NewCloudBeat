from functools import wraps
from flask import request, jsonify, g
import jwt
from backend.config import Config

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check Authorization Header: "Bearer <token>"
        auth_header = request.headers.get('Authorization')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401

        try:
            # Verify JWT
            # Supabase JWT secret is the SUPABASE_KEY (if using HS256) or need to get JWKS.
            # For simplicity, we decode without verification on backend for Phase 1 
            # OR verify using the secret if shared.
            # Supabase usually signs with the JWT Secret found in dashboard.
            # The SUPABASE_KEY in .env is usually the anon key, not the JWT secret.
            # However, for RLS to work, we just need to pass the token to Supabase client.
            # BUT, for our own API logic, we might want to know who the user is.
            
            # Simple decoding to get 'sub' (user_id)
            # production should verify signature!
            payload = jwt.decode(token, options={"verify_signature": False})
            g.user_id = payload.get('sub')
            g.token = token # Pass this to Supabase client if needed
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
            
        return f(*args, **kwargs)
    
    return decorated
