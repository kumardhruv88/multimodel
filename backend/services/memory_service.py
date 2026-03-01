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

def save_memory(content: str, category: str = "general", source_thread: str = ""):
    """Save a memory fact to the database."""
    if not supabase: return None
    result = supabase.table("memories").insert({
        "id": str(uuid4()),
        "content": content,
        "category": category,
        "source_thread": source_thread,
        "created_at": datetime.now().isoformat()
    }).execute()
    return result.data[0] if result.data else None

def get_memories(limit: int = 20):
    """Get recent memories."""
    if not supabase: return []
    result = supabase.table("memories")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data

def search_memories(query: str, limit: int = 5):
    """Search memories by keyword (simple text search)."""
    if not supabase: return []
    result = supabase.table("memories")\
        .select("*")\
        .ilike("content", f"%{query}%")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data

def delete_memory(memory_id: str):
    """Delete a specific memory."""
    if not supabase: return
    supabase.table("memories")\
        .delete()\
        .eq("id", memory_id)\
        .execute()

def get_memory_context(query: str) -> str:
    """Get relevant memories as context string for the system prompt."""
    memories = search_memories(query)
    if not memories:
        return ""
    lines = ["Relevant user memories:"]
    for m in memories:
        lines.append(f"- {m['content']}")
    return "\n".join(lines)
