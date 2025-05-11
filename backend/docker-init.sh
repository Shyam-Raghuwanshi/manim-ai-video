#!/bin/bash

# Create the videos directory if it doesn't exist
mkdir -p /app/videos

# Set permissive permissions for the videos directory and all subdirectories
chmod -R 777 /app/videos

# Create a test file to verify write permissions
echo "Permission test" > /app/videos/test-permissions.txt
chmod 666 /app/videos/test-permissions.txt

# Print confirmation
echo "Initialized video directory with correct permissions"
echo "Directory structure:"
ls -la /app/videos

# Execute the passed command (usually python app.py)
exec "$@"