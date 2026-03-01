from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
import os, uuid
from typing import Optional

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client (with null guard)
_url = os.getenv("SUPABASE_URL")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if _url and _key:
    supabase = create_client(_url, _key)
else:
    print("WARNING: Supabase credentials missing for artifacts.")
    supabase = None

class ArtifactCreate(BaseModel):
    title: str
    artifact_type: str  # 'code', 'image', 'text'
    content: Optional[str] = None
    image_url: Optional[str] = None
    language: Optional[str] = None
    thread_id: Optional[str] = None

@router.get("/api/artifacts")
def list_artifacts():
    if not supabase: return []
    result = supabase.table("artifacts")\
        .select("*")\
        .order("created_at", desc=True)\
        .execute()
    return result.data

@router.post("/api/artifacts")
def create_artifact(data: ArtifactCreate):
    if not supabase: return {"error": "Database unavailable"}
    result = supabase.table("artifacts").insert({
        "id": str(uuid.uuid4()),
        "title": data.title,
        "artifact_type": data.artifact_type.lower(),
        "content": data.content,
        "image_url": data.image_url,
        "language": data.language,
        "thread_id": data.thread_id
    }).execute()
    return result.data[0]

@router.delete("/api/artifacts/{artifact_id}")
def delete_artifact(artifact_id: str):
    if not supabase: return {"error": "Database unavailable"}
    supabase.table("artifacts")\
        .delete()\
        .eq("id", artifact_id)\
        .execute()
    return {"status": "deleted"}
