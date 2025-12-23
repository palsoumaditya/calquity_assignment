from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from stream import stream_chat

app = FastAPI(title="AI Search Chat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/chat/stream")
async def chat_stream():
    return stream_chat()
