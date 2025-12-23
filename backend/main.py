from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from stream import router as stream_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stream_router)
