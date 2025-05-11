import os
from flask import Blueprint, request, jsonify, send_file, current_app, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.video import Video
from src.models.user import User
from src.services.openai_service import generate_manim_code
from src.services.manim_service import render_video
from src.services.s3_service import get_s3_service

videos_bp = Blueprint('videos', __name__)

@videos_bp.route('/', methods=['GET'])
@jwt_required()
def get_videos():
    """Get videos for the authenticated user"""
    user_id = get_jwt_identity()
    
    # Get pagination params
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Calculate skip
    skip = (page - 1) * per_page
    
    # Get videos for user
    videos = Video.find_by_user_id(user_id, limit=per_page, skip=skip)
    
    # Convert videos to dict
    videos_dict = [video.to_dict() for video in videos]
    
    return jsonify(videos_dict), 200


@videos_bp.route('/<video_id>', methods=['GET'])
@jwt_required()
def get_video(video_id):
    """Get a specific video"""
    user_id = get_jwt_identity()
    
    # Get video by ID
    video = Video.find_by_id(video_id)
    
    if not video:
        return jsonify({"error": "Video not found"}), 404
    
    # Check if video belongs to user
    if video.user_id != user_id:
        return jsonify({"error": "You don't have permission to access this video"}), 403
    
    return jsonify(video.to_dict()), 200


@videos_bp.route('/<video_id>/file', methods=['GET'])
@jwt_required()
def get_video_file(video_id):
    """Get the video file"""
    user_id = get_jwt_identity()
    
    # Get video by ID
    video = Video.find_by_id(video_id)
    
    if not video:
        return jsonify({"error": "Video not found"}), 404
    
    # Check if video belongs to user
    if video.user_id != user_id:
        return jsonify({"error": "You don't have permission to access this video"}), 403
    
    # If the video has an S3 URL, redirect to that URL
    if video.s3_video_url:
        current_app.logger.info(f"Redirecting to S3 URL: {video.s3_video_url}")
        return redirect(video.s3_video_url)
    
    # If no S3 URL is available, fall back to local file serving
    # Add debug logging
    current_app.logger.info(f"No S3 URL available, serving local file. Path: {video.video_path}")
    current_app.logger.info(f"Current working directory: {os.getcwd()}")
    
    # Try multiple approaches to find the video file
    video_file_path = None
    
    # 1. Check the original path 
    if video.video_path and os.path.exists(video.video_path):
        video_file_path = video.video_path
        current_app.logger.info(f"Found video at original path: {video_file_path}")
    else:
        # 2. Check if the path is relative to the videos directory
        base_videos_dir = os.path.join(os.getcwd(), "videos")
        video_id_dir = os.path.join(base_videos_dir, video.id)
        
        # Try to find any MP4 file in the video's directory
        if os.path.exists(video_id_dir):
            current_app.logger.info(f"Looking for MP4 files in: {video_id_dir}")
            for root, _, files in os.walk(video_id_dir):
                for file in files:
                    if file.endswith('.mp4'):
                        video_file_path = os.path.join(root, file)
                        current_app.logger.info(f"Found video at: {video_file_path}")
                        break
                if video_file_path:
                    break
                    
        # 3. Look in the media directory which manim might have created
        if not video_file_path:
            media_dir = os.path.join(video_id_dir, "media", "videos")
            if os.path.exists(media_dir):
                current_app.logger.info(f"Looking for MP4 files in media dir: {media_dir}")
                for root, _, files in os.walk(media_dir):
                    for file in files:
                        if file.endswith('.mp4'):
                            video_file_path = os.path.join(root, file)
                            current_app.logger.info(f"Found video in media dir: {video_file_path}")
                            break
                    if video_file_path:
                        break
    
    if not video_file_path:
        current_app.logger.error(f"Video file not found for ID: {video_id}")
        return jsonify({
            "error": "Video file not found",
            "details": "The video was generated but could not be located on the server. Please contact support."
        }), 404
    
    # Update the video path in the database if different
    if video.video_path != video_file_path:
        video.video_path = video_file_path
        video.save()
        current_app.logger.info(f"Updated video path in database to: {video_file_path}")
    
    # Try to upload the video to S3 if found locally but not yet uploaded
    try:
        s3_service = get_s3_service()
        s3_video_url = s3_service.upload_video(video_file_path, video.id)
        
        # Update video with S3 URL
        video.update_s3_url(s3_video_url)
        current_app.logger.info(f"Uploaded video to S3: {s3_video_url}")
        
        # Redirect to the S3 URL instead of serving locally
        return redirect(s3_video_url)
    except Exception as e:
        current_app.logger.error(f"Failed to upload to S3: {str(e)}, serving local file instead")
    
    # Return the video file from local storage as fallback
    current_app.logger.info(f"Serving video file: {video_file_path}")
    try:
        return send_file(video_file_path, mimetype='video/mp4')
    except Exception as e:
        current_app.logger.error(f"Error serving video file: {str(e)}")
        return jsonify({"error": f"Error serving video file: {str(e)}"}), 500


@videos_bp.route('/<video_id>/code', methods=['GET'])
@jwt_required()
def get_video_code(video_id):
    """Get the manim code used to generate the video"""
    user_id = get_jwt_identity()
    
    # Get video by ID
    video = Video.find_by_id(video_id)
    
    if not video:
        return jsonify({"error": "Video not found"}), 404
    
    # Check if video belongs to user
    if video.user_id != user_id:
        return jsonify({"error": "You don't have permission to access this video"}), 403
    
    if not video.code:
        return jsonify({"error": "Code not available for this video"}), 404
    
    return jsonify({"code": video.code}), 200


@videos_bp.route('/', methods=['POST'])
@jwt_required()
def create_video():
    """Create a new video generation request"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing prompt in request"}), 400
    
    prompt = data['prompt']
    
    # Create initial video record
    video = Video(
        user_id=user_id,
        prompt=prompt,
        status="pending"
    )
    video.save()
    
    # Return the video ID for tracking
    return jsonify({
        "message": "Video generation request submitted",
        "video_id": video.id,
        "status": "pending"
    }), 202


@videos_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_video_now():
    """Generate a video immediately and return the result (may be slow)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing prompt in request"}), 400
    
    prompt = data['prompt']
    
    try:
        # Create videos directory if it doesn't exist
        os.makedirs("videos", exist_ok=True)
        
        # Generate manim code using OpenAI
        manim_code = generate_manim_code(prompt)
        
        # Create a video record with pending status
        video = Video(
            user_id=user_id,
            prompt=prompt,
            code=manim_code,
            status="processing"
        )
        video.save()
        
        # Create directory for this video
        video_dir = os.path.join("videos", video.id)
        os.makedirs(video_dir, exist_ok=True)
        
        # Save code to file
        code_file = os.path.join(video_dir, "animation.py")
        with open(code_file, "w") as f:
            f.write(manim_code)
        
        # Render video with retry mechanism
        # Pass the original prompt to enable regeneration if errors occur
        video_path = render_video(code_file, video_dir, original_prompt=prompt, max_retries=3)
        
        # If code was regenerated during rendering, read the updated version
        if os.path.exists(code_file):
            with open(code_file, "r") as f:
                updated_code = f.read()
                if updated_code != manim_code:
                    # Update the code in the database if it was changed during the retry process
                    video.code = updated_code
        
        # Update video record with path and status
        video.video_path = video_path
        video.status = "completed"
        
        # Upload to S3 bucket if available
        try:
            s3_service = get_s3_service()
            s3_video_url = s3_service.upload_video(video_path, video.id)
            video.s3_video_url = s3_video_url
            current_app.logger.info(f"Uploaded video to S3: {s3_video_url}")
        except Exception as e:
            # Log the error but continue with local file
            current_app.logger.error(f"Error uploading to S3: {str(e)}")
            
        # Save all updates    
        video.save()
        
        # Prepare response with appropriate video URL
        video_url = f"/api/videos/{video.id}/file"
        
        return jsonify({
            "message": "Video generated successfully",
            "video_id": video.id,
            "status": "completed",
            "video_url": video_url
        }), 200
        
    except Exception as e:
        # Log error
        print(f"Error generating video: {str(e)}")
        
        # Update video record with error status
        if 'video' in locals():
            video.status = "failed"
            video.save()
            
            return jsonify({
                "error": str(e),
                "video_id": video.id,
                "status": "failed"
            }), 500
        
        return jsonify({"error": str(e)}), 500