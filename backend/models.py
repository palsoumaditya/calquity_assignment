from pydantic import BaseModel
from typing import Optional

class StreamEvent(BaseModel):
    type: str          # "tool" | "text" | "citation"
    content: Optional[str] = None
    name: Optional[str] = None
    page: Optional[int] = None
