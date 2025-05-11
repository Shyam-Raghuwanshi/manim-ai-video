import uuid
from datetime import datetime
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    """User model for authentication and profile management"""
    
    def __init__(self, email, password=None, name=None, id=None, created_at=None, subscription_tier="free"):
        self.id = id or str(uuid.uuid4())
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.name = name
        self.created_at = created_at or datetime.utcnow()
        self.subscription_tier = subscription_tier  # free, basic, premium
        
    def check_password(self, password):
        """Check if provided password matches the stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def save(self):
        """Save user to database"""
        user_data = {
            "_id": self.id,
            "email": self.email,
            "password_hash": self.password_hash,
            "name": self.name,
            "created_at": self.created_at,
            "subscription_tier": self.subscription_tier
        }
        
        current_app.mongo_db.users.update_one(
            {"_id": self.id}, 
            {"$set": user_data}, 
            upsert=True
        )
        
        return self
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        user_data = current_app.mongo_db.users.find_one({"email": email})
        
        if not user_data:
            return None
        
        user = cls(
            id=user_data["_id"],
            email=user_data["email"],
            name=user_data.get("name"),
            created_at=user_data.get("created_at"),
            subscription_tier=user_data.get("subscription_tier", "free")
        )
        user.password_hash = user_data["password_hash"]
        
        return user
    
    @classmethod
    def find_by_id(cls, user_id):
        """Find user by ID"""
        user_data = current_app.mongo_db.users.find_one({"_id": user_id})
        
        if not user_data:
            return None
        
        user = cls(
            id=user_data["_id"],
            email=user_data["email"],
            name=user_data.get("name"),
            created_at=user_data.get("created_at"),
            subscription_tier=user_data.get("subscription_tier", "free")
        )
        user.password_hash = user_data["password_hash"]
        
        return user
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at,
            "subscription_tier": self.subscription_tier
        }