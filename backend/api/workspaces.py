from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
import os, uuid

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client (with null guard)
_url = os.getenv("SUPABASE_URL")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if _url and _key:
    supabase = create_client(_url, _key)
else:
    print("WARNING: Supabase credentials missing for workspaces.")
    supabase = None

class WorkspaceCreate(BaseModel):
    name: str
    description: str = ""
    icon: str = "🗂️"
    color: str = "#cf6679"
    custom_instructions: str = ""

@router.get("/api/workspaces")
def list_workspaces():
    if not supabase: return []
    result = supabase.table("workspaces")\
        .select("*")\
        .order("created_at")\
        .execute()
    return result.data

@router.post("/api/workspaces")
def create_workspace(data: WorkspaceCreate):
    if not supabase: return {"error": "Database unavailable"}
    result = supabase.table("workspaces").insert({
        "id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "icon": data.icon,
        "color": data.color,
        "custom_instructions": data.custom_instructions
    }).execute()
    return result.data[0]

class WorkspaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    custom_instructions: str | None = None

@router.patch("/api/workspaces/{workspace_id}")
def update_workspace(workspace_id: str, data: WorkspaceUpdate):
    if not supabase: return {"error": "Database unavailable"}
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        return {"status": "no changes"}
    result = supabase.table("workspaces")\
        .update(updates)\
        .eq("id", workspace_id)\
        .execute()
    return result.data[0] if result.data else {"status": "updated"}

@router.delete("/api/workspaces/{workspace_id}")
def delete_workspace(workspace_id: str):
    if not supabase: return {"error": "Database unavailable"}
    supabase.table("workspaces")\
        .delete()\
        .eq("id", workspace_id)\
        .execute()
    return {"status": "deleted"}

