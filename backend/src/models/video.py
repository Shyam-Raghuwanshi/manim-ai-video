import uuid
from datetime import datetime
from flask import current_app

class Video:
    """Video model for tracking generated videos"""
    
    def __init__(self, user_id, prompt, code=None, video_path=None, id=None, 
                 created_at=None, status="pending", thumbnail_path=None, s3_video_url=None):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.prompt = prompt
        self.code = code
        self.video_path = video_path
        self.thumbnail_path = thumbnail_path
        self.created_at = created_at or datetime.utcnow()
        self.status = status  # pending, processing, completed, failed
        self.s3_video_url = s3_video_url  # URL for the video in S3/R2 storage
        
    def save(self):
        """Save video to database"""
        video_data = {
            "_id": self.id,
            "user_id": self.user_id,
            "prompt": self.prompt,
            "code": self.code,
            "video_path": self.video_path,
            "thumbnail_path": self.thumbnail_path,
            "created_at": self.created_at,
            "status": self.status,
            "s3_video_url": self.s3_video_url
        }
        
        current_app.mongo_db.videos.update_one(
            {"_id": self.id}, 
            {"$set": video_data}, 
            upsert=True
        )
        
        return self
    
    @classmethod
    def find_by_id(cls, video_id):
        """Find video by ID"""
        video_data = current_app.mongo_db.videos.find_one({"_id": video_id})
        
        if not video_data:
            return None
        
        return cls(
            id=video_data["_id"],
            user_id=video_data["user_id"],
            prompt=video_data["prompt"],
            code=video_data.get("code"),
            video_path=video_data.get("video_path"),
            thumbnail_path=video_data.get("thumbnail_path"),
            created_at=video_data.get("created_at"),
            status=video_data.get("status", "pending"),
            s3_video_url=video_data.get("s3_video_url")
        )
    
    @classmethod
    def find_by_user_id(cls, user_id, limit=10, skip=0):
        """Find videos by user ID"""
        videos = []
        cursor = current_app.mongo_db.videos.find({"user_id": user_id})\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)
        
        for video_data in cursor:
            videos.append(cls(
                id=video_data["_id"],
                user_id=video_data["user_id"],
                prompt=video_data["prompt"],
                code=video_data.get("code"),
                video_path=video_data.get("video_path"),
                thumbnail_path=video_data.get("thumbnail_path"),
                created_at=video_data.get("created_at"),
                status=video_data.get("status", "pending"),
                s3_video_url=video_data.get("s3_video_url")
            ))
        
        return videos
    
    def update_status(self, status):
        """Update video status"""
        self.status = status
        current_app.mongo_db.videos.update_one(
            {"_id": self.id}, 
            {"$set": {"status": status}}
        )
        
        return self
        
    def update_s3_url(self, s3_video_url):
        """Update the S3 video URL"""
        self.s3_video_url = s3_video_url
        current_app.mongo_db.videos.update_one(
            {"_id": self.id},
            {"$set": {"s3_video_url": s3_video_url}}
        )
        
        return self
    
    def to_dict(self):
        """Convert video object to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "prompt": self.prompt,
            "video_path": self.video_path,
            "thumbnail_path": self.thumbnail_path,
            "created_at": self.created_at,
            "status": self.status,
            "s3_video_url": self.s3_video_url
        }