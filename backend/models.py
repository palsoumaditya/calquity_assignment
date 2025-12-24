from pydantic import BaseModel
from typing import Optional, List, Any

class StreamEvent(BaseModel):
    type: str          # "tool" | "text" | "citation" | "component" | "error"
    content: Optional[str] = None
    name: Optional[str] = None
    page: Optional[int] = None
    snippet: Optional[str] = None # Added for highlighter
    data: Optional[Any] = None    # Added for generic component data