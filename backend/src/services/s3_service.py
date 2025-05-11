import os
import boto3
from botocore.client import Config
from flask import current_app
import uuid

class S3Service:
    """Service for handling S3 operations with Cloudflare R2"""
    
    def __init__(self):
        self.s3 = None
        self.bucket_name = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')
        self.setup_client()
        
    def setup_client(self):
        """Set up the S3 client with Cloudflare R2 credentials"""
        try:
            self.s3 = boto3.client(
                's3',
                endpoint_url=os.environ.get('CLOUDFLARE_R2_ENDPOINT'),
                aws_access_key_id=os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID'),
                aws_secret_access_key=os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
                config=Config(signature_version='s3v4')
            )
        except Exception as e:
            print(f"Error setting up S3 client: {str(e)}")
            self.s3 = None
    
    def upload_video(self, file_path, video_id):
        """
        Upload a video to Cloudflare R2 bucket
        
        Args:
            file_path (str): Path to the video file
            video_id (str): ID of the video for naming in S3
            
        Returns:
            str: URL of the uploaded video
        """
        if not self.s3 or not self.bucket_name:
            raise ValueError("S3 client or bucket name not configured")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Video file not found: {file_path}")
            
        try:
            # Generate a safe key for S3
            key = f"videos/{video_id}.mp4"
            
            # Upload file
            self.s3.upload_file(
                Filename=file_path,
                Bucket=self.bucket_name,
                Key=key,
                ExtraArgs={
                    'ContentType': 'video/mp4',
                    'ACL': 'public-read'
                }
            )
            
            # Generate the public URL
            video_url = f"{os.environ.get('CLOUDFLARE_R2_PUBLIC_URL')}/{key}"
            
            return video_url
            
        except Exception as e:
            print(f"Error uploading file to S3: {str(e)}")
            raise
            
    def delete_video(self, video_id):
        """
        Delete a video from Cloudflare R2 bucket
        
        Args:
            video_id (str): ID of the video to delete
            
        Returns:
            bool: True if deleted successfully
        """
        if not self.s3 or not self.bucket_name:
            raise ValueError("S3 client or bucket name not configured")
            
        try:
            key = f"videos/{video_id}.mp4"
            
            self.s3.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            return True
            
        except Exception as e:
            print(f"Error deleting file from S3: {str(e)}")
            return False

# Initialize the S3 service
s3_service = None

def get_s3_service():
    """
    Get or create the S3 service instance
    
    Returns:
        S3Service: The S3 service instance
    """
    global s3_service
    
    if s3_service is None:
        s3_service = S3Service()
        
    return s3_service