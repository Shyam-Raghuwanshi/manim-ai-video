import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key from environment variable
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please set it in your .env file or environment.")

def generate_manim_code(prompt, max_retries=3):
    """
    Generate manim code based on user prompt using OpenAI's API
    
    Args:
        prompt (str): User's description of what animation to create
        max_retries (int): Maximum number of retry attempts for fixing errors
        
    Returns:
        str: Generated manim code
    """
    error_message = None
    attempt = 0
    
    while attempt < max_retries:
        try:
            # Create a system message that instructs the model about manim
            system_message = """
            You are an expert in creating mathematical animations using the manim library.
            Given a description, generate Python code using the manim library that will create
            the described animation. Only output valid, executable Python code without any explanations.
            
            The code should:
            1. Import necessary modules from manim
            2. Create a Scene class that inherits from Scene
            3. Implement the construct method
            4. Include appropriate animations and mathematical objects
            5. Be compatible with manimgl (not ManimCommunity)
            
            Important notes:
            - Use Create() instead of ShowCreation() as ShowCreation is deprecated
            - Make sure all animations and objects are properly imported
            - For text, always use Text() not TextMobject() which is deprecated
            - Use Write() for text animations
            - Use FadeIn() and FadeOut() for fade animations
            
            Output ONLY the Python code with no additional text.
            """
            
            # Prepare the prompt with examples and error feedback if any
            user_prompt = f"""
            Create a manim animation for the following description:
            
            {prompt}
            
            Return only the Python code that uses manimgl to create this animation
            """
            
            # Add error message for retry attempts
            if error_message and attempt > 0:
                user_prompt += f"""
                
                The previous code you generated resulted in the following error:
                {error_message}
                
                Please fix the code to avoid this error. Common issues:
                - ShowCreation is deprecated, use Create() instead
                - Some animation classes may have been renamed or need to be imported differently
                - Make sure all used classes are properly imported from manimlib
                """
            
            # Prepare the request payload
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            payload = {
                "model": "gpt-4-turbo",  # or whatever model is most suitable
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 3000
            }
            
            # Make a direct HTTP request to the OpenAI API
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload)
            )
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Parse the response JSON
            result = response.json()
            
            # Extract the generated code
            manim_code = result["choices"][0]["message"]["content"].strip()
            print(f"Received manim code (attempt {attempt+1}):\n{manim_code}")
            
            # Ensure the code contains the necessary imports and class definition
            if "from manim import" not in manim_code and "import manim" not in manim_code and "from manimlib import" not in manim_code:
                # Add basic imports if they're missing
                manim_code = "from manimlib import *\n\n" + manim_code

            if "python" in manim_code:
                # Remove any Python code block markers
                manim_code = manim_code.replace("```python", "").replace("```", "").strip()
            
            # Try to validate the code by running a simple syntax check
            try:
                compile(manim_code, '<string>', 'exec')
                print(f"Generated manim code passed syntax check")
                return manim_code
            except SyntaxError as se:
                error_message = f"Syntax error in generated code: {str(se)}"
                print(f"Syntax error detected: {error_message}")
                attempt += 1
                continue
                
            # If we get here, the code syntax is valid
            print(f"Generated manim code (attempt {attempt+1}):\n{manim_code}")
            return manim_code
        
        except Exception as e:
            error_message = str(e)
            print(f"Error in attempt {attempt+1}: {error_message}")
            attempt += 1
            if attempt >= max_retries:
                raise Exception(f"Failed to generate valid manim code after {max_retries} attempts. Last error: {error_message}")
    
    # If we've exhausted all retries
    raise Exception(f"Failed to generate valid manim code after {max_retries} attempts.")

def test_manim_code(code):
    """
    Test if the generated manim code has any known issues
    
    Args:
        code (str): The manim code to test
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check for common issues
    known_issues = [
        ("ShowCreation", "ShowCreation is deprecated. Use Create() instead."),
        ("TextMobject", "TextMobject is deprecated. Use Text() instead."),
        ("TexMobject", "TexMobject is deprecated. Use MathTex() instead."),
    ]
    
    for issue, message in known_issues:
        if issue in code:
            return False, message
    
    return True, None

def regenerate_with_error(prompt, error_message, max_retries=2):
    """
    Regenerate manim code with error feedback
    
    Args:
        prompt (str): Original user prompt
        error_message (str): Error message from previous attempt
        max_retries (int): Maximum number of retry attempts
        
    Returns:
        str: Updated manim code that addresses the error
    """
    retry_prompt = f"""
    {prompt}
    
    The previous code resulted in this error: {error_message}
    
    Common fixes:
    - If "ShowCreation not defined" error: Use Create() instead of ShowCreation()
    - If "TextMobject not defined" error: Use Text() instead of TextMobject()
    - Make sure to use correct import statements for manimgl
    
    Please regenerate valid manimgl code that won't produce these errors.
    """
    
    return generate_manim_code(retry_prompt, max_retries)