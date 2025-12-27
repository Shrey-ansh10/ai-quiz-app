import os
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Configure the API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_challenge_with_ai(difficultyLevel : str) -> Dict[str, Any]:
    system_prompt = """ You are an expert coding challenge creator. 
    Your task is to generate a coding question with multiple choice answers.
    The question should be appropriate for the specified difficulty level. 
    Question can be from CS Fundamental, CS Core, Data Structures, Computer Networks, and general Computer Science Domain.

    For easy questions: Focus on basic syntax, simple operations, or common programming concepts.
    For medium questions: Cover intermediate concepts like data structures, algorithms, or language features.
    For hard questions: Include advanced topics, design patterns, optimization techniques, or complex algorithms.

    Return the challenge in the following JSON structure:
    {
        "title": "Short title of the concept",
        "description": "The text asking the question (e.g., 'What is the output of the following code?')",
        "code_snippet": "The actual code block to analyze (if applicable), or null",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_answer_id": 0, // Index of the correct answer (0-3)
        "explanation": "Detailed explanation of why the correct answer is right"
    }

    Make sure the options are plausible but with only one clearly correct answer.
    """

    try:
        # With gemini we do it as follow
        
        # Initialize the model first
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt
        )

        # Generate Content
        # We use 'generation_config' to enforce JSON output
        response = model.generate_content(
            f"Generate a {difficultyLevel} difficulty coding challenge.",
            generation_config={
                "response_mime_type": "application/json", 
                "temperature": 0.7
            }
        )

        # 4. Parse Response
        # Gemini usually returns the text directly accessible via response.text
        content = response.text
        challenge_data = json.loads(content) #convert to dictonary from json object


        required_fields = ["title", "options", "correct_answer_id", "explanation"]
        for field in required_fields:
            if field not in challenge_data:
                raise ValueError(f"Missing required field: {field}")

        return challenge_data

    except Exception as e:
        print(f"Error generating challenge: {e}")

        # fallback response
        return { 
            "title": "Basic Python List Operation",
            "options": [
                "my_list.append(5)",
                "my_list.add(5)",
                "my_list.push(5)",
                "my_list.insert(5)",
            ],
            "correct_answer_id": 0,
            "explanation": "In Python, append() is the correct method to add an element to the end of a list."
        }

# Example usage (for testing)
if __name__ == "__main__":
    print(json.dumps(generate_challenge_with_ai("medium"), indent=2))