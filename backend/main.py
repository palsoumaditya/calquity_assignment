import shutil
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse  # <--- 1. ADDED THIS IMPORT
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables explicitly
load_dotenv()

from stream import router as stream_router
from chat_engine import load_pdf_content

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify key is loaded on startup
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ WARNING: GEMINI_API_KEY not found in environment!")
    else:
        print("✅ GEMINI_API_KEY loaded successfully.")
        
    print("Loading default PDF content...")
    # Attempt to load, but don't crash if missing on startup
    load_pdf_content()
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stream_router)

# --- UPLOAD ENDPOINT ---
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Overwrite the existing sample.pdf in the current directory
    file_location = "sample.pdf"
    
    try:
        # 1. Save the file locally
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # 2. Reload the PDF content in memory using the absolute path
        absolute_path = os.path.abspath(file_location)
        success = load_pdf_content(absolute_path)
        
        if success:
            return {"message": "PDF uploaded and processed successfully"}
        else:
            return {"message": "File saved but failed to extract text"}, 500

    except Exception as e:
        return {"message": f"Upload failed: {str(e)}"}, 500

# --- NEW: SERVE THE PDF (Fixes the 404 Error) ---
@app.get("/get-pdf")
async def get_pdf():
    file_path = "sample.pdf"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf", filename="document.pdf")
    return {"error": "File not found"}, 404