import os
import json
import asyncio
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from uuid import uuid4
from services.search_service import search_web
from services.vector_store import search_documents
from services.db_service import save_thread, save_message, update_thread_timestamp
from services.memory_service import get_memory_context

load_dotenv()

router = APIRouter()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"
    conversation_history: List[dict] = []
    web_search: bool = False
    workspace_instructions: str = ""
    model: str = "llama-3.3-70b-versatile"
    image_data: str = ""  # base64 encoded image for vision

async def generate_title(message: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system", 
                    "content": "Generate a short 4-6 word title for this chat based on the first message. Return ONLY the title text, no quotes, no punctuation at end."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=20
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Title generation error: {str(e)}")
        return "New Chat"

async def chat_stream_generator(request: ChatRequest):
    """
    Generator that yields SSE events for each token from Groq.
    Sends structured events: token, status, sources, done.
    """
    try:
        today = datetime.now().strftime("%B %d, %Y %I:%M %p")
        
        system_prompt = (
            "You are NEXUS, a helpful, knowledgeable, and articulate AI assistant. "
            "Format responses using Markdown where appropriate (headers, bullets, code blocks with language tags). "
            "Be concise but thorough. Acknowledge uncertainty rather than hallucinating. "
            "Always cite sources when using web search or document retrieval. "
            f"Current date and time: {today}. "
        )

        # Add workspace custom instructions
        if request.workspace_instructions:
            system_prompt += f"\n\nWorkspace instructions:\n{request.workspace_instructions}\n"

        # Add user memory context
        try:
            memory_ctx = get_memory_context(request.message)
            if memory_ctx:
                system_prompt += f"\n\n{memory_ctx}\nUse these memories if relevant to the user's question.\n"
        except Exception as e:
            print(f"Memory context error: {str(e)}")

        sources = []

        # 1. Integrate document RAG if possible
        doc_context = ""
        try:
            doc_context = search_documents(request.message)
            if doc_context:
                system_prompt += f"\n\n{doc_context}"
                system_prompt += "\nWhen using document context, say 'According to your documents...' or similar."
                sources.append({"type": "document", "label": "Your uploaded documents"})
        except Exception as e:
            print(f"RAG search error: {str(e)}")

        # 2. Integrate web search if requested
        if request.web_search:
            try:
                yield f"data: {json.dumps({'type': 'status', 'message': 'Searching the web...'})}\n\n"
                search_results = search_web(request.message)
                if search_results:
                    system_prompt += f"\n\nWeb search results (cite the source when using this information):\n{search_results}"
                    sources.append({"type": "web", "label": "Web search results"})
                    yield f"data: {json.dumps({'type': 'status', 'message': 'Found results'})}\n\n"
            except Exception as e:
                print(f"Web search error: {str(e)}")
                yield f"data: {json.dumps({'type': 'status', 'message': 'Search failed'})}\n\n"

        # Emit sources if any
        if sources:
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in request.conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        # Add current user message (with optional image for vision)
        full_response = ""
        if request.image_data:
            # Use vision model for image understanding
            vision_model = "llama-3.2-11b-vision-preview"
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": request.message
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{request.image_data}"
                        }
                    }
                ]
            })
            # Call Groq API with vision model (non-streaming for vision)
            response = client.chat.completions.create(
                model=vision_model,
                messages=messages,
                max_tokens=1024,
            )
            full_response = response.choices[0].message.content or ""
            # Send full response as tokens for streaming appearance
            for i in range(0, len(full_response), 3):
                chunk = full_response[i:i+3]
                escaped = chunk.replace("\\", "\\\\").replace("\n", "\\n")
                yield f"data: {json.dumps({'type': 'token', 'content': escaped})}\n\n"
                await asyncio.sleep(0.01)
        else:
            messages.append({"role": "user", "content": request.message})

            # Call Groq API with streaming
            stream = client.chat.completions.create(
                model=request.model,
                messages=messages,
                stream=True,
            )

        if not request.image_data:
            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token is not None:
                    full_response += token
                    escaped_token = token.replace("\\", "\\\\").replace("\n", "\\n")
                    yield f"data: {json.dumps({'type': 'token', 'content': escaped_token})}\n\n"
                
                await asyncio.sleep(0.01)

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

        # PERSIST TO SUPABASE
        try:
            from services.db_service import count_messages
            
            msg_count = count_messages(request.thread_id)
            
            if msg_count == 0:
                title = await generate_title(request.message)
                save_thread(request.thread_id, title)
            else:
                update_thread_timestamp(request.thread_id)

            save_message(str(uuid4()), request.thread_id, "user", request.message)
            save_message(str(uuid4()), request.thread_id, "assistant", full_response)
        except Exception as e:
            print(f"Database save error: {str(e)}")

    except Exception as e:
        error_msg = f"Error: {str(e)}"
        yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint for streaming chat responses via SSE.
    """
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
    return StreamingResponse(
        chat_stream_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
        }
    )
