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
# Together AI API (fallback)
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

class ImageRequest(BaseModel):
    prompt: str
    thread_id: Optional[str] = None
    width: int = 512
    height: int = 512

@router.post("/generate")
async def generate_image(request: ImageRequest, x_user_id: str | None = Header(None)):
    """
    Generate an image using Hugging Face models, with Together AI fallback.
    Tries FLUX.1-schnell (HF), then SDXL (HF), then FLUX.1-schnell (Together AI).
    """
    if not HF_TOKEN and not TOGETHER_API_KEY:
        return JSONResponse(
            {"error": "No image generation tokens configured. Please add HF_TOKEN or TOGETHER_API_KEY to your secrets."},
            status_code=500
        )

    last_error = ""

    # --- ATTEMPT 1: Hugging Face FLUX.1-schnell ---
    if HF_TOKEN:
        try:
            print("Attempting image generation with Hugging Face FLUX.1-schnell...")
            headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
            payload = {"inputs": request.prompt}
            
            response = requests.post(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", 
                headers=headers, json=payload, timeout=60
            )

            if response.status_code == 200:
                image_bytes = response.content
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                return await _save_and_return_image(
                    f"data:image/jpeg;base64,{b64}", request.prompt, "HF: FLUX.1-schnell", request.thread_id, x_user_id
                )
            else:
                last_error = f"HF FLUX failed: {response.status_code} - {response.text[:100]}"
                print(last_error)
        except Exception as e:
            last_error = f"Error with HF FLUX: {str(e)}"
            print(last_error)

    # --- ATTEMPT 2: Together AI FLUX.1-schnell (Free Tier Fallback) ---
    if TOGETHER_API_KEY:
        try:
            print("Attempting image generation with Together AI FLUX.1-schnell...")
            from together import Together
            client = Together(api_key=TOGETHER_API_KEY)

            response = client.images.generate(
                prompt=request.prompt,
                model="black-forest-labs/FLUX.1-schnell-Free",
                width=1024,
                height=768,
                steps=4,
                n=1,
                response_format="b64_json"
            )

            if response and response.data and len(response.data) > 0:
                b64 = response.data[0].b64_json
                return await _save_and_return_image(
                    f"data:image/jpeg;base64,{b64}", request.prompt, "Together: FLUX.1-schnell", request.thread_id, x_user_id
                )
        except Exception as e:
            last_error = f"Error with Together AI: {str(e)}"
            print(last_error)

    # --- ATTEMPT 3: Hugging Face Stable Diffusion XL ---
    if HF_TOKEN:
        try:
            print("Attempting image generation with Hugging Face SDXL...")
            headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
            payload = {"inputs": request.prompt}
            
            response = requests.post(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", 
                headers=headers, json=payload, timeout=60
            )

            if response.status_code == 200:
                image_bytes = response.content
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                return await _save_and_return_image(
                    f"data:image/jpeg;base64,{b64}", request.prompt, "HF: SDXL", request.thread_id, x_user_id
                )
            else:
                last_error = f"HF SDXL failed: {response.status_code} - {response.text[:100]}"
                print(last_error)
        except Exception as e:
            last_error = f"Error with HF SDXL: {str(e)}"
            print(last_error)

    # If we get here, all models failed
    return JSONResponse(
        {"error": f"Image generation failed across all providers. Last error: {last_error}"},
        status_code=500
    )


async def _save_and_return_image(image_url: str, prompt: str, model_name: str, thread_id: str | None, user_id: str | None):
    """Helper to save image to thread and return response."""
    if thread_id:
        try:
            msg_count = count_messages(thread_id, user_id=user_id)
            if msg_count == 0:
                title = f"Image: {prompt[:20]}..."
                save_thread(thread_id, title, user_id=user_id)
            else:
                update_thread_timestamp(thread_id, user_id=user_id)

            save_message(str(uuid4()), thread_id, "user", prompt, user_id=user_id)
            image_content = f"[NEXUS_IMAGE:{image_url}]\n\n*\"{prompt}\"*"
            save_message(str(uuid4()), thread_id, "assistant", image_content, user_id=user_id)
        except Exception as db_err:
            print(f"Database save error: {str(db_err)}")

    return {"image_url": image_url, "prompt": prompt, "model": model_name}
