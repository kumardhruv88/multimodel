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

def save_thread(thread_id: str, title: str = "New Chat"):
    if not supabase: return
    supabase.table("threads").upsert({
        "id": thread_id,
        "title": title,
        "updated_at": "now()"
    }).execute()

def update_thread_timestamp(thread_id: str):
    """Update only the timestamp without overwriting the title."""
    if not supabase: return
    supabase.table("threads").update({
        "updated_at": "now()"
    }).eq("id", thread_id).execute()

def save_message(message_id: str, thread_id: str, role: str, content: str):
    if not supabase: return
    supabase.table("messages").insert({
        "id": message_id,
        "thread_id": thread_id,
        "role": role,
        "content": content
    }).execute()

def get_threads():
    if not supabase: return []
    result = supabase.table("threads")\
        .select("*")\
        .order("updated_at", desc=True)\
        .execute()
    return result.data

def get_messages(thread_id: str):
    if not supabase: return []
    result = supabase.table("messages")\
        .select("*")\
        .eq("thread_id", thread_id)\
        .order("created_at")\
        .execute()
    return result.data

def delete_thread(thread_id: str):
    if not supabase: return
    # Delete messages first
    supabase.table("messages")\
        .delete()\
        .eq("thread_id", thread_id)\
        .execute()
    supabase.table("threads")\
        .delete()\
        .eq("id", thread_id)\
        .execute()

def count_messages(thread_id: str) -> int:
    if not supabase: return 0
    result = supabase.table("messages")\
        .select("id", count="exact")\
        .eq("thread_id", thread_id)\
        .execute()
    return result.count or 0

def rename_thread(thread_id: str, title: str):
    if not supabase: return
    supabase.table("threads")\
        .update({"title": title})\
        .eq("id", thread_id)\
        .execute()

def pin_thread(thread_id: str, pinned: bool):
    if not supabase: return
    supabase.table("threads")\
        .update({"is_pinned": pinned})\
        .eq("id", thread_id)\
        .execute()
