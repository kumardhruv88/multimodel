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
    Generate an image using Hugging Face models.
    Tries FLUX.1-schnell first, falls back to Stable Diffusion XL if needed.
    """
    if not HF_TOKEN:
        return JSONResponse(
            {"error": "HF_TOKEN not configured. Please add your Hugging Face token as a Secret."},
            status_code=500
        )

    # List of models to try in order
    models_to_try = [
        ("black-forest-labs/FLUX.1-schnell", "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"),
        ("stabilityai/stable-diffusion-xl-base-1.0", "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0")
    ]

    last_error = ""

    for model_name, api_url in models_to_try:
        try:
            print(f"Attempting image generation with {model_name}...")
            headers = {
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json"
            }
            # Simple payload for maximum compatibility
            payload = {"inputs": request.prompt}

            response = requests.post(api_url, headers=headers, json=payload, timeout=60)

            if response.status_code == 200:
                # Success!
                image_bytes = response.content
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                image_url = f"data:image/jpeg;base64,{b64}"
                
                # PERSIST TO DATABASE
                if request.thread_id:
                    try:
                        msg_count = count_messages(request.thread_id, user_id=x_user_id)
                        if msg_count == 0:
                            title = f"Image: {request.prompt[:20]}..."
                            save_thread(request.thread_id, title, user_id=x_user_id)
                        else:
                            update_thread_timestamp(request.thread_id, user_id=x_user_id)

                        save_message(str(uuid4()), request.thread_id, "user", request.prompt, user_id=x_user_id)
                        image_content = f"[NEXUS_IMAGE:{image_url}]\n\n*\"{request.prompt}\"*"
                        save_message(str(uuid4()), request.thread_id, "assistant", image_content, user_id=x_user_id)
                    except Exception as db_err:
                        print(f"Database save error: {str(db_err)}")

                return {"image_url": image_url, "prompt": request.prompt, "model": model_name}

            elif response.status_code == 503:
                # Model loading, try next one if available
                err_json = response.json()
                last_error = f"{model_name} is loading. {err_json.get('error', '')}"
                continue
            else:
                last_error = f"{model_name} failed: {response.status_code} - {response.text[:100]}"
                continue

        except Exception as e:
            last_error = f"Error with {model_name}: {str(e)}"
            continue

    # If we get here, all models failed
    return JSONResponse(
        {"error": f"Image generation failed. Last error: {last_error}"},
        status_code=500
    )

