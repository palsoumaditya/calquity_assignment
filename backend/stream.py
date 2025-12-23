import asyncio
import json
from sse_starlette.sse import EventSourceResponse
from typing import AsyncGenerator, Dict


async def fake_ai_stream() -> AsyncGenerator[Dict, None]:
    steps = [
        {"type": "tool", "content": "🔍 Searching documents..."},
        {"type": "tool", "content": "📄 Reading PDF sources..."},
        {"type": "text", "content": "AI search systems use streaming responses "},
        {"type": "text", "content": "to reduce perceived latency and improve UX "},
        {"type": "text", "content": "by sending partial outputs early. [1]"},
        {"type": "tool", "content": "🧠 Analyzing extracted content..."},
        {"type": "text", "content": "This approach is widely used in products like Perplexity."},
        {"type": "done"},
    ]

    for step in steps:
        yield step
        await asyncio.sleep(0.7)


def stream_chat():
    async def event_generator():
        async for chunk in fake_ai_stream():
            yield {
                "event": "message",
                "data": json.dumps(chunk),
            }

    return EventSourceResponse(event_generator())
