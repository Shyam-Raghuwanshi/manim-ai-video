from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    
    # Basic validation
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Check if user already exists
    if User.find_by_email(email):
        return jsonify({"error": "Email already registered"}), 409
    
    # Create new user
    user = User(email=email, password=password, name=name)
    user.save()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    # Basic validation
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Find user by email
    user = User.find_by_email(email)
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def profile():
    """Get user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Update user fields
    if 'name' in data:
        user.name = data['name']
    
    # Save updated user
    user.save()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200