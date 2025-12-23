from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv  # <--- ADD THIS
import os

# Load environment variables explicitly
load_dotenv()  # <--- ADD THIS

from stream import router as stream_router
from chat_engine import load_pdf_content
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify key is loaded on startup
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ WARNING: GEMINI_API_KEY not found in environment!")
    else:
        print("✅ GEMINI_API_KEY loaded successfully.")
        
    print("Loading PDF content...")
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