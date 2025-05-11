import os
import subprocess
import tempfile
import shutil
import stat
import traceback
import re
from pathlib import Path
from .openai_service import regenerate_with_error, test_manim_code

def set_permissions(path, is_dir=False):
    """
    Set appropriate permissions on a file or directory
    
    Args:
        path (str): Path to the file or directory
        is_dir (bool): Whether the path is a directory
    """
    try:
        if is_dir:
            # Directory: rwxrwxrwx (0777)
            os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
        else:
            # File: rw-rw-rw- (0666)
            os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return True
    except Exception as e:
        print(f"Permission setting failed for {path}: {str(e)}")
        print(traceback.format_exc())
        return False

def render_video(code_file_path, output_dir, original_prompt=None, max_retries=3):
    """
    Renders manim code into a video with automatic error recovery
    
    Args:
        code_file_path (str): Path to the Python file containing manim code
        output_dir (str): Directory to store the output video
        original_prompt (str): Original prompt used to generate the code (for retries)
        max_retries (int): Maximum number of retry attempts
        
    Returns:
        str: Path to the rendered video file
    """
    print(f"Starting video rendering process")
    print(f"Code file: {code_file_path}")
    print(f"Output directory: {output_dir}")
    
    attempt = 0
    last_error = None
    
    while attempt < max_retries:
        try:
            # Read the current code
            with open(code_file_path, 'r') as f:
                current_code = f.read()
                
            # Run static analysis on the code first
            is_valid, error_message = test_manim_code(current_code)
            if not is_valid and original_prompt:
                print(f"Static analysis found issue: {error_message}")
                # Regenerate code with error feedback
                updated_code = regenerate_with_error(original_prompt, error_message)
                
                # Save the regenerated code
                with open(code_file_path, 'w') as f:
                    f.write(updated_code)
                    
                print(f"Regenerated code due to known issue")
                attempt += 1
                continue
            
            # Make sure the output directory exists with proper permissions
            if not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
                print(f"Created output directory: {output_dir}")
            
            # Set directory permissions
            set_permissions(output_dir, is_dir=True)
            print(f"Set permissions on output directory")
            
            # Get the file name without extension
            file_name = os.path.basename(code_file_path).split('.')[0]
            
            # Ensure the code file has the right permissions
            set_permissions(code_file_path)
            print(f"Set permissions on code file")
            
            # Find the first Scene class in the code
            scene_class = None
            for line in current_code.split('\n'):
                if "class" in line and "Scene" in line:
                    # Extract class name (assuming format "class ClassName(Scene):")
                    parts = line.split("class ")[1].split("(")[0].strip()
                    scene_class = parts
                    break
            
            if not scene_class:
                raise Exception("No Scene class found in the generated code")
            
            print(f"Found scene class: {scene_class}")
            
            # Prepare a media directory with correct permissions
            media_dir = os.path.join(os.path.dirname(code_file_path), "media")
            if not os.path.exists(media_dir):
                os.makedirs(media_dir, exist_ok=True)
                set_permissions(media_dir, is_dir=True)
            
            # Run the manim command to render the video
            command = [
                "manim",  
                code_file_path, 
                scene_class,
                "-qm",  # Medium quality
                "--format", "mp4"  # Ensure mp4 output format
            ]
            
            print(f"Executing command: {' '.join(command)}")
            
            # Execute the command
            process = subprocess.run(
                command,
                text=True,
                capture_output=True,
                check=False
            )
            
            print(f"Command output: {process.stdout}")
            
            if process.returncode != 0:
                print(f"Command stderr: {process.stderr}")
                error_output = process.stderr
                
                # Check for known error patterns
                if original_prompt and (
                    "NameError: name 'ShowCreation' is not defined" in error_output or
                    "NameError: name" in error_output or
                    "AttributeError:" in error_output or
                    "ImportError:" in error_output
                ):
                    # Extract the specific error message for regeneration
                    error_pattern = r"(NameError: name '[^']*' is not defined|AttributeError:[^\n]*|ImportError:[^\n]*)"
                    error_matches = re.findall(error_pattern, error_output)
                    specific_error = error_matches[0] if error_matches else error_output[:200]
                    
                    print(f"Detected known error pattern: {specific_error}")
                    # Regenerate code with error feedback
                    updated_code = regenerate_with_error(original_prompt, specific_error)
                    
                    # Save the regenerated code
                    with open(code_file_path, 'w') as f:
                        f.write(updated_code)
                    
                    print(f"Regenerated code to fix error, attempt {attempt+1}/{max_retries}")
                    attempt += 1
                    continue
                else:
                    # Unknown error pattern
                    raise Exception(f"Manim rendering failed: {error_output}")
            
            # For Manim Community, the output structure is different
            # Try different possible output locations
            rendered_file = None
            search_dirs = [
                # Standard Manim Community output directory
                Path(os.path.dirname(code_file_path)) / "media" / "videos" / file_name,
                # Root media directory (fallback)
                Path(os.path.dirname(code_file_path)) / "media",
                # Current working directory
                Path(os.getcwd()) / "media" / "videos",
                # Output directory itself
                Path(output_dir)
            ]
            
            # Search for MP4 files in all potential directories
            for search_dir in search_dirs:
                print(f"Searching for video files in: {search_dir}")
                if search_dir.exists():
                    # Search recursively for any mp4 files
                    for file in list(search_dir.glob("**/*.mp4")):
                        print(f"Found video file: {file}")
                        if rendered_file is None or file.stat().st_mtime > Path(rendered_file).stat().st_mtime:
                            rendered_file = str(file)
            
            if not rendered_file:
                # If we still can't find the file, do a more extensive search
                print("Doing a more extensive search for MP4 files...")
                for root, dirs, files in os.walk(os.path.dirname(code_file_path)):
                    for file in files:
                        if file.endswith('.mp4'):
                            full_path = os.path.join(root, file)
                            print(f"Found potential video file: {full_path}")
                            if rendered_file is None or os.path.getmtime(full_path) > os.path.getmtime(rendered_file):
                                rendered_file = full_path
            
            if not rendered_file:
                raise Exception("Could not find rendered video file. Check manim output.")
            
            print(f"Using rendered file: {rendered_file}")
            
            # Create a unique output path
            output_path = os.path.join(output_dir, f"{scene_class}.mp4")
            
            # Copy the video to our output directory
            print(f"Copying video to: {output_path}")
            shutil.copy2(rendered_file, output_path)
            
            # Ensure the output file has the right permissions
            set_permissions(output_path)
            print(f"Set permissions on output file")
            
            # Verify file exists and has content
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"Successfully created video: {output_path} ({os.path.getsize(output_path)} bytes)")
            else:
                raise Exception(f"Video file was not created properly at {output_path}")
            
            # Successful render - return the path
            return output_path
        
        except Exception as e:
            last_error = str(e)
            print(f"Error rendering video (attempt {attempt+1}/{max_retries}): {last_error}")
            print(traceback.format_exc())
            
            # If we have a prompt and we haven't exhausted retries, try regenerating the code
            if original_prompt and attempt < max_retries - 1:
                print(f"Regenerating code due to error: {last_error}")
                updated_code = regenerate_with_error(original_prompt, last_error)
                
                # Save the regenerated code
                with open(code_file_path, 'w') as f:
                    f.write(updated_code)
                
                attempt += 1
            else:
                if attempt >= max_retries - 1:
                    print(f"Max retry attempts reached ({max_retries})")
                raise Exception(f"Error rendering video with manim after {attempt+1} attempts: {last_error}")
    
    # If we've exhausted all retries (shouldn't reach here due to exception above)
    raise Exception(f"Failed to render video after {max_retries} attempts. Last error: {last_error}")