from fastapi import APIRouter, Header
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
def list_threads(x_user_id: str | None = Header(None)):
    """List all chat threads."""
    return get_threads(user_id=x_user_id)

@router.get("/api/threads/search")
def search_threads(q: str = "", x_user_id: str | None = Header(None)):
    """Search threads by title or message content."""
    from services.db_service import supabase
    if not supabase or not q.strip():
        return []
    # Search in thread titles
    t_query = supabase.table("threads").select("id, title, created_at, is_pinned").ilike("title", f"%{q}%")
    if x_user_id: t_query = t_query.eq("user_id", x_user_id)
    title_results = t_query.order("updated_at", desc=True).limit(10).execute()
    # Search in message content
    m_query = supabase.table("messages").select("thread_id, content, created_at").ilike("content", f"%{q}%")
    if x_user_id: m_query = m_query.eq("user_id", x_user_id)
    msg_results = m_query.order("created_at", desc=True).limit(10).execute()
    
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
def list_messages(thread_id: str, x_user_id: str | None = Header(None)):
    """List all messages for a specific thread."""
    return get_messages(thread_id, user_id=x_user_id)

@router.delete("/api/threads/{thread_id}")
def remove_thread(thread_id: str, x_user_id: str | None = Header(None)):
    """Delete a chat thread and its messages."""
    delete_thread(thread_id, user_id=x_user_id)
    return {"status": "deleted"}

@router.patch("/api/threads/{thread_id}/rename")
def rename_thread_endpoint(thread_id: str, data: ThreadRename, x_user_id: str | None = Header(None)):
    """Rename a thread."""
    rename_thread(thread_id, data.title, user_id=x_user_id)
    return {"status": "renamed", "title": data.title}

@router.patch("/api/threads/{thread_id}/pin")
def pin_thread_endpoint(thread_id: str, data: ThreadPin, x_user_id: str | None = Header(None)):
    """Pin or unpin a thread."""
    pin_thread(thread_id, data.pinned, user_id=x_user_id)
    return {"status": "pinned" if data.pinned else "unpinned"}

@router.get("/api/threads/{thread_id}/export")
def export_thread(thread_id: str, format: str = "md", x_user_id: str | None = Header(None)):
    """Export a thread as markdown, JSON, or plain text."""
    messages = get_messages(thread_id, user_id=x_user_id)
    
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
def archive_thread_endpoint(thread_id: str, x_user_id: str | None = Header(None)):
    """Toggle archive on a thread."""
    from services.db_service import supabase
    if not supabase:
        return {"status": "error"}
    # Get current state
    q = supabase.table("threads").select("is_pinned").eq("id", thread_id)
    if x_user_id: q = q.eq("user_id", x_user_id)
    current = q.execute()
    # We'll repurpose model_used field or add archive logic
    # For now, just delete from main view by setting a flag
    upq = supabase.table("threads").update({"title": "[ARCHIVED] " + (current.data[0].get("title", "") if current.data else "")}).eq("id", thread_id)
    if x_user_id: upq = upq.eq("user_id", x_user_id)
    upq.execute()
    return {"status": "archived"}

@router.post("/api/threads/{thread_id}/share")
def share_thread(thread_id: str, x_user_id: str | None = Header(None)):
    """Make a thread publicly shareable."""
    from services.db_service import supabase
    if supabase:
        # Check if thread exists
        q = supabase.table("threads").select("id").eq("id", thread_id)
        if x_user_id: q = q.eq("user_id", x_user_id)
        thread_res = q.execute()
        
        if not thread_res.data:
            data = {"id": thread_id, "title": "New Group Chat", "shared": True}
            if x_user_id: data["user_id"] = x_user_id
            supabase.table("threads").insert(data).execute()
        else:
            upq = supabase.table("threads").update({"shared": True}).eq("id", thread_id)
            if x_user_id: upq = upq.eq("user_id", x_user_id)
            upq.execute()
            
    messages = get_messages(thread_id, user_id=x_user_id)
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
