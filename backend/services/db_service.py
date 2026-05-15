import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("WARNING: Supabase credentials missing. Persistence will fail.")
    supabase = None
else:
    supabase = create_client(url, key)

def save_thread(thread_id: str, title: str = "New Chat", user_id: str | None = None):
    if not supabase: return
    try:
        data = {
            "id": thread_id,
            "title": title,
            "updated_at": "now()"
        }
        if user_id:
            data["user_id"] = user_id
        supabase.table("threads").upsert(data).execute()
    except Exception as e:
        print(f"Error saving thread: {e}")

def update_thread_timestamp(thread_id: str, user_id: str | None = None):
    """Update only the timestamp without overwriting the title."""
    if not supabase: return
    try:
        query = supabase.table("threads").update({
            "updated_at": "now()"
        }).eq("id", thread_id)
        if user_id: query = query.eq("user_id", user_id)
        query.execute()
    except Exception as e:
        print(f"Error updating thread timestamp: {e}")

def save_message(message_id: str, thread_id: str, role: str, content: str, user_id: str | None = None):
    if not supabase: return
    try:
        data = {
            "id": message_id,
            "thread_id": thread_id,
            "role": role,
            "content": content
        }
        if user_id:
            data["user_id"] = user_id
        supabase.table("messages").insert(data).execute()
    except Exception as e:
        print(f"Error saving message: {e}")

def get_threads(user_id: str | None = None):
    if not supabase: return []
    try:
        query = supabase.table("threads").select("*")
        if user_id: query = query.eq("user_id", user_id)
        result = query.order("updated_at", desc=True).execute()
        return result.data
    except Exception as e:
        print(f"Error getting threads: {e}")
        return []

def get_messages(thread_id: str, user_id: str | None = None):
    if not supabase: return []
    try:
        query = supabase.table("messages").select("*").eq("thread_id", thread_id)
        if user_id: query = query.eq("user_id", user_id)
        result = query.order("created_at").execute()
        return result.data
    except Exception as e:
        print(f"Error getting messages: {e}")
        return []

def delete_thread(thread_id: str, user_id: str | None = None):
    if not supabase: return
    try:
        # Delete messages first
        m_query = supabase.table("messages").delete().eq("thread_id", thread_id)
        if user_id: m_query = m_query.eq("user_id", user_id)
        m_query.execute()
        
        t_query = supabase.table("threads").delete().eq("id", thread_id)
        if user_id: t_query = t_query.eq("user_id", user_id)
        t_query.execute()
    except Exception as e:
        print(f"Error deleting thread: {e}")

def count_messages(thread_id: str, user_id: str | None = None) -> int:
    if not supabase: return 0
    try:
        query = supabase.table("messages").select("id", count="exact").eq("thread_id", thread_id)
        if user_id: query = query.eq("user_id", user_id)
        result = query.execute()
        return result.count or 0
    except Exception as e:
        print(f"Error counting messages: {e}")
        return 0

def rename_thread(thread_id: str, title: str, user_id: str | None = None):
    if not supabase: return
    try:
        query = supabase.table("threads").update({"title": title}).eq("id", thread_id)
        if user_id: query = query.eq("user_id", user_id)
        query.execute()
    except Exception as e:
        print(f"Error renaming thread: {e}")

def pin_thread(thread_id: str, pinned: bool, user_id: str | None = None):
    if not supabase: return
    try:
        query = supabase.table("threads").update({"is_pinned": pinned}).eq("id", thread_id)
        if user_id: query = query.eq("user_id", user_id)
        query.execute()
    except Exception as e:
        print(f"Error pinning thread: {e}")
