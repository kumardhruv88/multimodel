from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from urllib.parse import quote

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str

@router.post("/generate")
async def generate_image(request: ImageRequest):
    """
    Generate an image URL using Pollinations AI.
    """
    try:
        # URL-encode the prompt properly
        encoded_prompt = quote(request.prompt, safe='')
        # Pollinations AI format
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true"
        
        return {
            "image_url": image_url, 
            "prompt": request.prompt
        }
    except Exception as e:
        return JSONResponse({"error": f"Image generation failed: {str(e)}"}, status_code=500)

