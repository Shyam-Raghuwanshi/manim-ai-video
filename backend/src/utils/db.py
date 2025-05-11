import os
from flask_pymongo import PyMongo
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_db(app):
    """
    Initialize database connection
    
    Args:
        app: Flask application instance
        
    Returns:
        PyMongo: MongoDB client instance
    """
    # Get MongoDB URI from environment variables
    mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/manim_ai_videos")
    
    # Configure Flask app with MongoDB
    app.config["MONGO_URI"] = mongodb_uri
    
    # Create PyMongo instance
    mongo = PyMongo(app)
    
    return mongo.db