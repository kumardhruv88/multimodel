import os
import io
import base64
import requests
from typing import Optional
from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from services.db_service import save_thread, save_message, update_thread_timestamp, count_messages
from uuid import uuid4

load_dotenv()

router = APIRouter()

# Hugging Face Inference API
HF_TOKEN = os.getenv("HF_TOKEN")
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

class ImageRequest(BaseModel):
    prompt: str
    thread_id: Optional[str] = None
    width: int = 512
    height: int = 512

@router.post("/generate")
async def generate_image(request: ImageRequest, x_user_id: str | None = Header(None)):
    """
    Generate an image using Hugging Face FLUX.1-schnell model.
    Returns a base64 data URI so no external hosting is needed.
    """
    if not HF_TOKEN:
        return JSONResponse(
            {"error": "HF_TOKEN not configured. Please add your Hugging Face token."},
            status_code=500
        )

    try:
        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": request.prompt,
            "parameters": {
                "width": request.width,
                "height": request.height,
                "num_inference_steps": 4,  # FLUX.1-schnell works great with 4 steps
                "guidance_scale": 0.0,
            }
        }

        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)

        if response.status_code == 200:
            # Convert binary image bytes to base64 data URI
            image_bytes = response.content
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            image_url = f"data:image/jpeg;base64,{b64}"
            
            # PERSIST TO DATABASE if thread_id is provided
            if request.thread_id:
                try:
                    # Same logic as chat.py persistence
                    msg_count = count_messages(request.thread_id, user_id=x_user_id)
                    if msg_count == 0:
                        # Simple title for new image threads
                        title = f"Image: {request.prompt[:20]}..."
                        save_thread(request.thread_id, title, user_id=x_user_id)
                    else:
                        update_thread_timestamp(request.thread_id, user_id=x_user_id)

                    # Save the user prompt
                    save_message(str(uuid4()), request.thread_id, "user", request.prompt, user_id=x_user_id)
                    # Save the assistant message with the image marker
                    image_content = f"[NEXUS_IMAGE:{image_url}]\n\n*\"{request.prompt}\"*"
                    save_message(str(uuid4()), request.thread_id, "assistant", image_content, user_id=x_user_id)
                except Exception as db_err:
                    print(f"Database save error during image gen: {str(db_err)}")

            return {"image_url": image_url, "prompt": request.prompt}

        elif response.status_code == 503:
            # Model is loading — return a friendly message
            error_detail = response.json()
            estimated_time = error_detail.get("estimated_time", 30)
            return JSONResponse(
                {"error": f"Model is loading (estimated {int(estimated_time)}s). Please try again in a moment."},
                status_code=503
            )
        else:
            return JSONResponse(
                {"error": f"HuggingFace API error: {response.status_code} - {response.text[:200]}"},
                status_code=500
            )

    except requests.exceptions.Timeout:
        return JSONResponse(
            {"error": "Image generation timed out (60s). The model may be cold-starting. Try again."},
            status_code=504
        )
    except Exception as e:
        return JSONResponse(
            {"error": f"Image generation failed: {str(e)}"},
            status_code=500
        )
