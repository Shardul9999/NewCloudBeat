from flask import Blueprint, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/', methods=['GET'])
def auth_status():
    return jsonify({"message": "Auth is handled by Supabase on the frontend. Backend verifies JWT tokens."})
