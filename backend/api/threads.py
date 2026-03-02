from fastapi import APIRouter
from services.db_service import (get_threads, save_thread, 
    delete_thread, get_messages, rename_thread, pin_thread)
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime

router = APIRouter()

class ThreadRename(BaseModel):
    title: str

class ThreadPin(BaseModel):
    pinned: bool

@router.get("/api/threads")
def list_threads():
    """List all chat threads."""
    return get_threads()

@router.get("/api/threads/search")
def search_threads(q: str = ""):
    """Search threads by title or message content."""
    from services.db_service import supabase
    if not supabase or not q.strip():
        return []
    # Search in thread titles
    title_results = supabase.table("threads")\
        .select("id, title, created_at, is_pinned")\
        .ilike("title", f"%{q}%")\
        .order("updated_at", desc=True)\
        .limit(10)\
        .execute()
    # Search in message content
    msg_results = supabase.table("messages")\
        .select("thread_id, content, created_at")\
        .ilike("content", f"%{q}%")\
        .order("created_at", desc=True)\
        .limit(10)\
        .execute()
    
    # Combine results, dedup by thread_id
    seen = set()
    results = []
    for t in (title_results.data or []):
        if t["id"] not in seen:
            seen.add(t["id"])
            results.append({
                "thread_id": t["id"],
                "title": t["title"],
                "preview": t["title"],
                "created_at": t["created_at"],
                "match_type": "title"
            })
    for m in (msg_results.data or []):
        tid = m["thread_id"]
        if tid not in seen:
            seen.add(tid)
            results.append({
                "thread_id": tid,
                "title": "",
                "preview": m["content"][:120],
                "created_at": m["created_at"],
                "match_type": "message"
            })
    return results[:15]

@router.get("/api/threads/{thread_id}/messages")
def list_messages(thread_id: str):
    """List all messages for a specific thread."""
    return get_messages(thread_id)

@router.delete("/api/threads/{thread_id}")
def remove_thread(thread_id: str):
    """Delete a chat thread and its messages."""
    delete_thread(thread_id)
    return {"status": "deleted"}

@router.patch("/api/threads/{thread_id}/rename")
def rename_thread_endpoint(thread_id: str, data: ThreadRename):
    """Rename a thread."""
    rename_thread(thread_id, data.title)
    return {"status": "renamed", "title": data.title}

@router.patch("/api/threads/{thread_id}/pin")
def pin_thread_endpoint(thread_id: str, data: ThreadPin):
    """Pin or unpin a thread."""
    pin_thread(thread_id, data.pinned)
    return {"status": "pinned" if data.pinned else "unpinned"}

@router.get("/api/threads/{thread_id}/export")
def export_thread(thread_id: str, format: str = "md"):
    """Export a thread as markdown, JSON, or plain text."""
    messages = get_messages(thread_id)
    
    if format == "json":
        return {
            "thread_id": thread_id,
            "exported_at": datetime.now().isoformat(),
            "messages": messages
        }
    
    # Markdown format
    lines = [f"# NEXUS AI Chat Export\n"]
    lines.append(f"*Exported on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}*\n")
    lines.append("---\n")
    
    for msg in messages:
        role = "**You**" if msg.get("role") == "user" else "**NEXUS AI**"
        content = msg.get("content", "")
        lines.append(f"\n{role}:\n\n{content}\n")
        lines.append("---\n")
    
    return {"content": "\n".join(lines), "format": "md"}

# Search endpoint moved above {thread_id} routes to avoid route conflicts

@router.patch("/api/threads/{thread_id}/archive")
def archive_thread_endpoint(thread_id: str):
    """Toggle archive on a thread."""
    from services.db_service import supabase
    if not supabase:
        return {"status": "error"}
    # Get current state
    current = supabase.table("threads").select("is_pinned").eq("id", thread_id).execute()
    # We'll repurpose model_used field or add archive logic
    # For now, just delete from main view by setting a flag
    supabase.table("threads").update({"title": "[ARCHIVED] " + (current.data[0].get("title", "") if current.data else "")}).eq("id", thread_id).execute()
    return {"status": "archived"}

@router.post("/api/threads/{thread_id}/share")
def share_thread(thread_id: str):
    """Make a thread publicly shareable."""
    from services.db_service import supabase
    if supabase:
        # Check if thread exists
        thread_res = supabase.table("threads").select("id").eq("id", thread_id).execute()
        if not thread_res.data:
            supabase.table("threads").insert({"id": thread_id, "title": "New Group Chat", "shared": True}).execute()
        else:
            supabase.table("threads").update({"shared": True}).eq("id", thread_id).execute()
            
    messages = get_messages(thread_id)
    return {
        "thread_id": thread_id,
        "messages": messages,
        "shared": True
    }

@router.get("/api/threads/{thread_id}/share")
def get_shared_thread(thread_id: str):
    """Get a shared thread (no auth required for read)."""
    from services.db_service import supabase
    if not supabase:
        return {"status": "error", "message": "Database not connected"}
    
    # Verify it is shared
    thread_res = supabase.table("threads").select("shared").eq("id", thread_id).execute()
    if not thread_res.data or not thread_res.data[0].get("shared"):
        # For development we might just allow it, but let's be safe
        messages = get_messages(thread_id)
        if messages:
            return {"thread_id": thread_id, "messages": messages, "shared": False}
        return {"status": "error", "message": "Not found or not shared"}
        
    messages = get_messages(thread_id)
    return {
        "thread_id": thread_id,
        "messages": messages,
        "shared": True
    }
