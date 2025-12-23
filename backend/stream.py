import asyncio
import json
import uuid
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from chat_engine import chat_generator

router = APIRouter()
job_queues: dict[str, asyncio.Queue] = {}

class ChatRequest(BaseModel):
    query: str

async def process_job(job_id: str, query: str):
    queue = job_queues[job_id]
    try:
        async for event in chat_generator(query, job_id):
            await queue.put(json.dumps(event))
        await queue.put("[DONE]")
    except Exception as e:
        await queue.put(json.dumps({"type": "error", "content": str(e)}))
        await queue.put("[DONE]")

@router.post("/chat")
async def start_chat(request: ChatRequest):
    job_id = str(uuid.uuid4())
    job_queues[job_id] = asyncio.Queue()
    asyncio.create_task(process_job(job_id, request.query))
    return {"job_id": job_id}

@router.get("/stream/{job_id}")
async def stream(job_id: str):
    async def event_generator():
        queue = job_queues.get(job_id)
        if not queue: return
        while True:
            data = await queue.get()
            if data == "[DONE]": break
            yield f"data: {data}\n\n"
        del job_queues[job_id]
    return StreamingResponse(event_generator(), media_type="text/event-stream")