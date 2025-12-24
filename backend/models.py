from pydantic import BaseModel
from typing import Optional, Any

class StreamEvent(BaseModel):
    type: str          # "tool" | "text" | "citation" | "component" | "error"
    content: Optional[str] = None
    name: Optional[str] = None
    page: Optional[int] = None
    snippet: Optional[str] = None
    data: Optional[Any] = None    # ✅ FIX: Allows generic JSON data for charts/tables