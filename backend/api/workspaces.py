from fastapi import APIRouter, Header
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
def list_workspaces(x_user_id: str | None = Header(None)):
    if not supabase: return []
    try:
        query = supabase.table("workspaces").select("*")
        if x_user_id: query = query.eq("user_id", x_user_id)
        result = query.order("created_at").execute()
        return result.data
    except Exception as e:
        print(f"Error listing workspaces: {e}")
        return []

@router.post("/api/workspaces")
def create_workspace(data: WorkspaceCreate, x_user_id: str | None = Header(None)):
    if not supabase: return {"error": "Database unavailable"}
    try:
        insert_data = {
            "id": str(uuid.uuid4()),
            "name": data.name,
            "description": data.description,
            "icon": data.icon,
            "color": data.color,
            "custom_instructions": data.custom_instructions
        }
        if x_user_id: insert_data["user_id"] = x_user_id
        result = supabase.table("workspaces").insert(insert_data).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error creating workspace: {e}")
        return {"error": str(e)}

class WorkspaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    custom_instructions: str | None = None

@router.patch("/api/workspaces/{workspace_id}")
def update_workspace(workspace_id: str, data: WorkspaceUpdate, x_user_id: str | None = Header(None)):
    if not supabase: return {"error": "Database unavailable"}
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        return {"status": "no changes"}
    try:
        query = supabase.table("workspaces").update(updates).eq("id", workspace_id)
        if x_user_id: query = query.eq("user_id", x_user_id)
        result = query.execute()
        return result.data[0] if result.data else {"status": "updated"}
    except Exception as e:
        print(f"Error updating workspace: {e}")
        return {"error": str(e)}

@router.delete("/api/workspaces/{workspace_id}")
def delete_workspace(workspace_id: str, x_user_id: str | None = Header(None)):
    if not supabase: return {"error": "Database unavailable"}
    try:
        query = supabase.table("workspaces").delete().eq("id", workspace_id)
        if x_user_id: query = query.eq("user_id", x_user_id)
        query.execute()
        return {"status": "deleted"}
    except Exception as e:
        print(f"Error deleting workspace: {e}")
        return {"error": str(e)}

