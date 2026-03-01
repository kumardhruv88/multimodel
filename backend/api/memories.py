"""
Memory API — CRUD for long-term user memories.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from services.memory_service import save_memory, get_memories, delete_memory

router = APIRouter()

class MemoryCreate(BaseModel):
    content: str
    category: str = "general"

@router.get("/api/memories")
def list_memories():
    """List all memories."""
    return get_memories(limit=50)

@router.post("/api/memories")
def create_memory(data: MemoryCreate):
    """Create a new memory."""
    result = save_memory(data.content, data.category)
    return result or {"status": "saved"}

@router.delete("/api/memories/{memory_id}")
def remove_memory(memory_id: str):
    """Delete a memory."""
    delete_memory(memory_id)
    return {"status": "deleted"}
