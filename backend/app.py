from flask import Flask
from flask_cors import CORS
import sys
from dotenv import load_dotenv
import os

# Ensure backend package is resolvable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev_secret_key") # Needed for session
CORS(app)

from backend.api.auth import auth_bp
from backend.api.songs import songs_bp
from backend.api.playlists import playlists_bp

app.register_blueprint(auth_bp)
app.register_blueprint(songs_bp)
app.register_blueprint(playlists_bp)

@app.route('/')
def hello():
    return {"message": "CloudBeat Backend is running!"}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
