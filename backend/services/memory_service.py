"""
Memory Service — Extracts and stores key facts from conversations
for long-term recall across threads.
"""
import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
from uuid import uuid4

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if url and key:
    supabase = create_client(url, key)
else:
    supabase = None

def save_memory(content: str, category: str = "general", source_thread: str = "", user_id: str | None = None):
    """Save a memory fact to the database."""
    if not supabase: return None
    try:
        data = {
            "id": str(uuid4()),
            "content": content,
            "category": category,
            "source_thread": source_thread,
            "created_at": datetime.now().isoformat()
        }
        if user_id: data["user_id"] = user_id
        result = supabase.table("memories").insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error saving memory: {e}")
        return None

def get_memories(limit: int = 20, user_id: str | None = None):
    """Get recent memories."""
    if not supabase: return []
    try:
        query = supabase.table("memories").select("*")
        if user_id: query = query.eq("user_id", user_id)
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data
    except Exception as e:
        print(f"Error getting memories: {e}")
        return []

def search_memories(query_text: str, limit: int = 5, user_id: str | None = None):
    """Search memories by keyword (simple text search)."""
    if not supabase: return []
    try:
        query = supabase.table("memories").select("*").ilike("content", f"%{query_text}%")
        if user_id: query = query.eq("user_id", user_id)
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data
    except Exception as e:
        print(f"Error searching memories: {e}")
        return []

def delete_memory(memory_id: str, user_id: str | None = None):
    """Delete a specific memory."""
    if not supabase: return
    try:
        query = supabase.table("memories").delete().eq("id", memory_id)
        if user_id: query = query.eq("user_id", user_id)
        query.execute()
    except Exception as e:
        print(f"Error deleting memory: {e}")

def get_memory_context(query: str, user_id: str | None = None) -> str:
    """Get relevant memories as context string for the system prompt."""
    memories = search_memories(query, user_id=user_id)
    if not memories:
        return ""
    lines = ["Relevant user memories:"]
    for m in memories:
        lines.append(f"- {m['content']}")
    return "\n".join(lines)
