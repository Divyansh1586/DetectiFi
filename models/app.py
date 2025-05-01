from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

from io import BytesIO

from dotenv import load_dotenv
import os

# Setup FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env file
load_dotenv()

# Setup Gemini API using API_KEY from .env
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY not found in environment variables")
genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

@app.post("/predict")
async def solve_scene(file: UploadFile = File(...)):
    try:
        # Read uploaded image
        contents = await file.read()
        
        # Prepare the prompt for Gemini
        prompt = (
            "You are an expert forensic analyst. "
            "Analyze the uploaded crime scene photo carefully.\n"
            "- What is the most likely type of crime?\n"
            "- List the top 3 pieces of evidence visible in the scene.\n"
            "- Be concise and professional."
        )
        
        # Send the image and prompt to Gemini
        response = gemini_model.generate_content(
            [
                prompt,
                {
                    "mime_type": file.content_type,
                    "data": contents
                }
            ]
        )
        
        # Get Gemini's reply
        result_text = response.text
        
        return JSONResponse(content={
            "analysis": result_text
        })
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
