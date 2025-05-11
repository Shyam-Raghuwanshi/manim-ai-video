import os
import stat
import sys
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from datetime import timedelta
import json
import uuid
import traceback
from src.services.openai_service import generate_manim_code
from src.services.manim_service import render_video
from src.models.user import User
from src.models.video import Video
from src.api.auth import auth_bp
from src.api.videos import videos_bp
from src.utils.db import init_db

# Load environment variables
load_dotenv()

# Helper function to set directory permissions
def set_directory_permissions(path):
    """Set directory permissions to be writable by all users (for Docker environments)"""
    try:
        print(f"Creating directory with permissions: {path}")
        # First create the directory if it doesn't exist
        os.makedirs(path, exist_ok=True)
        
        # Set permissions (0777 = rwxrwxrwx)
        os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)  
        
        # Verify permissions were set correctly
        mode = os.stat(path).st_mode
        print(f"Directory {path} permissions: {mode & 0o777:o}")
        return True
    except Exception as e:
        print(f"ERROR: Could not set permissions on directory {path}: {str(e)}")
        print(traceback.format_exc())
        return False

# Helper function to set file permissions
def set_file_permissions(path):
    """Set file permissions to be readable/writable by all users"""
    try:
        print(f"Setting file permissions: {path}")
        # Set permissions (0666 = rw-rw-rw-)
        os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        
        # Verify permissions were set correctly
        mode = os.stat(path).st_mode
        print(f"File {path} permissions: {mode & 0o777:o}")
        return True
    except Exception as e:
        print(f"ERROR: Could not set permissions on file {path}: {str(e)}")
        print(traceback.format_exc())
        return False

app = Flask(__name__)
CORS(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Initialize database connection and attach it to the app
app.mongo_db = init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(videos_bp, url_prefix='/api/videos')

@app.route('/')
def health_check():
    # Test directory permissions as part of health check
    videos_dir = os.path.join(os.getcwd(), "videos")
    permissions_ok = set_directory_permissions(videos_dir)
    
    return jsonify({
        "status": "healthy", 
        "message": "Manim AI Video Generator API is running!",
        "permissions_ok": permissions_ok,
        "videos_dir": videos_dir,
        "current_working_dir": os.getcwd()
    }), 200

@app.route('/api/generate', methods=['POST'])
@jwt_required()
def generate_video():
    """
    Generate a video based on a text prompt
    """
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing prompt in request"}), 400
    
    prompt = data['prompt']
    user_id = get_jwt_identity()
    
    try:
        # Generate manim code using OpenAI
        manim_code = generate_manim_code(prompt)
        
        # Generate a unique ID for this video
        video_id = str(uuid.uuid4())
        
        # Create a directory for this video with proper permissions
        video_dir = f"videos/{video_id}"
        absolute_video_dir = os.path.join(os.getcwd(), video_dir)
        
        # Print the absolute path for debugging
        print(f"Creating video directory: {absolute_video_dir}")
        
        # Ensure the parent videos directory exists with correct permissions
        parent_dir = os.path.dirname(absolute_video_dir)
        if not os.path.exists(parent_dir):
            set_directory_permissions(parent_dir)
        
        # Create and set permissions for the video directory
        if not set_directory_permissions(absolute_video_dir):
            return jsonify({"error": f"Failed to create directory with proper permissions: {absolute_video_dir}"}), 500
        
        try:
            # Save the manim code to a Python file
            code_file_path = f"{absolute_video_dir}/animation.py"
            print(f"Writing code to file: {code_file_path}")
            
            with open(code_file_path, "w") as f:
                f.write(manim_code)
                
            # Set permissions for the Python file
            if not set_file_permissions(code_file_path):
                return jsonify({"error": f"Failed to set permissions on file: {code_file_path}"}), 500
                
            # Render the video using manim
            video_path = render_video(code_file_path, absolute_video_dir)
            
            # Save the video info to the database
            video = Video(
                id=video_id,
                user_id=user_id,
                prompt=prompt,
                code=manim_code,
                video_path=video_path,
                status="completed"
            )
            video.save()
            
            return jsonify({
                "status": "success",
                "message": "Video generated successfully",
                "video_id": video_id,
                "video_url": f"/api/videos/{video_id}"
            }), 200
            
        except IOError as e:
            print(f"IOError while writing file: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"error": f"File operation error: {str(e)}"}), 500
            
    except Exception as e:
        error_msg = f"Error generating video: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    print(f"Starting Manim AI Video Generator API")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    
    # Make sure videos directory exists with proper permissions
    videos_dir = os.path.join(os.getcwd(), "videos")
    set_directory_permissions(videos_dir)
    print(f"Videos directory: {videos_dir}")
    
    try:
        # Create a test file to verify write permissions
        test_file = os.path.join(videos_dir, "test-permissions.txt")
        with open(test_file, "w") as f:
            f.write("Permission test")
        set_file_permissions(test_file)
        print("Successfully created test file with correct permissions")
    except Exception as e:
        print(f"Warning: Could not create test file: {str(e)}")
    
    # Run the app
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=os.environ.get("DEBUG", "False").lower() == "true")