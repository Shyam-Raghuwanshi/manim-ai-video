# Use the official Python image with Manim dependencies
FROM manimcommunity/manim:latest

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create videos directory 
RUN mkdir -p /app/videos

# Copy the rest of the application
COPY . .

# Create a simple init script within the container itself instead of copying
RUN echo '#!/bin/bash\n\
mkdir -p /app/videos\n\
chmod -R 777 /app/videos 2>/dev/null || true\n\
echo "Starting Manim AI Video Generator..."\n\
exec "$@"' > /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Use an inline entrypoint command to set permissions and run app
ENTRYPOINT ["/bin/bash", "-c", "mkdir -p /app/videos && chmod -R 777 /app/videos 2>/dev/null || true && python app.py"]