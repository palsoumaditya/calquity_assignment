import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

async def event_generator():
    # Tool event
    yield f"data: {json.dumps({'type': 'tool', 'name': 'searching_documents'})}\n\n"
    await asyncio.sleep(1)

    # Tool event
    yield f"data: {json.dumps({'type': 'tool', 'name': 'reading_pdf'})}\n\n"
    await asyncio.sleep(1)

    # Text streaming (character by character)
    text = "This answer is based on the uploaded document."
    for char in text:
        yield f"data: {json.dumps({'type': 'text', 'content': char})}\n\n"
        await asyncio.sleep(0.05)

    # Citation event
    yield f"data: {json.dumps({'type': 'citation', 'page': 2})}\n\n"

@router.get("/stream/{job_id}")
async def stream(job_id: str):
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
