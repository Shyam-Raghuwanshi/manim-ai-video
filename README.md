# ManimAI Video Generator

A full-stack application that uses AI to generate beautiful mathematical animations from text descriptions, powered by the [Manim library](https://www.manim.community/).

## Overview

ManimAI allows users to generate professional-quality mathematical animations simply by describing what they want in plain English. The application uses OpenAI's API to convert text descriptions into Manim code, which is then rendered into animations.

### Features

- **AI-Powered Generation**: Convert natural language descriptions into Manim animation code
- **User Authentication**: Secure user accounts with JWT-based authentication
- **Video Management**: Save, browse, and download generated videos
- **Code Access**: View and download the generated Manim code for further customization
- **Responsive Design**: Works on desktop and mobile devices
- **Subscription Tiers**: Free, Basic, and Premium tiers with different capabilities

## Architecture

The application consists of three main components:

1. **Frontend**: Next.js React application with TypeScript and Tailwind CSS
2. **Backend**: Python Flask API server
3. **Database**: MongoDB for storing user data and video metadata

### Technologies Used

- **Frontend**:
  - Next.js 13+
  - React 18+
  - TypeScript
  - Tailwind CSS
  - Axios for API communication

- **Backend**:
  - Python 3.10+
  - Flask
  - Flask-JWT-Extended for authentication
  - PyMongo for database access
  - OpenAI API for code generation
  - Manim for animation rendering

- **Infrastructure**:
  - Docker and Docker Compose for containerization
  - MongoDB for data storage

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API Key

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/manim-ai-video.git
   cd manim-ai-video
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_USERNAME=your_mongodb_username
   MONGO_PASSWORD=your_mongodb_password
   JWT_SECRET_KEY=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```

### Running the Application

1. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Development Setup

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask development server:
   ```bash
   python app.py
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get an access token
- `GET /api/auth/me`: Get current user profile
- `PUT /api/auth/me`: Update user profile

### Videos

- `GET /api/videos`: Get a list of user's videos
- `GET /api/videos/:id`: Get a specific video
- `POST /api/videos`: Create a new video generation request
- `GET /api/videos/:id/file`: Get the video file
- `GET /api/videos/:id/code`: Get the Manim code for a video

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Manim Community](https://www.manim.community/) for the amazing animation engine
- [3Blue1Brown](https://www.3blue1brown.com/) for the original Manim library and inspiration