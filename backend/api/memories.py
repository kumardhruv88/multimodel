"""
Memory API — CRUD for long-term user memories.
"""
from fastapi import APIRouter, Header
from pydantic import BaseModel
from services.memory_service import save_memory, get_memories, delete_memory

router = APIRouter()

class MemoryCreate(BaseModel):
    content: str
    category: str = "general"

@router.get("/api/memories")
def list_memories(x_user_id: str | None = Header(None)):
    """List all memories."""
    return get_memories(limit=50, user_id=x_user_id)

@router.post("/api/memories")
def create_memory(data: MemoryCreate, x_user_id: str | None = Header(None)):
    """Create a new memory."""
    result = save_memory(data.content, data.category, user_id=x_user_id)
    return result or {"status": "saved"}

@router.delete("/api/memories/{memory_id}")
def remove_memory(memory_id: str, x_user_id: str | None = Header(None)):
    """Delete a memory."""
    delete_memory(memory_id, user_id=x_user_id)
    return {"status": "deleted"}
