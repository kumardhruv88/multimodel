from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.document_service import extract_text, chunk_text
from services.vector_store import add_document, delete_document
from datetime import datetime
import uuid

router = APIRouter()

# Simple in-memory list to track uploaded documents metadata
uploaded_docs = []

@router.get("/")
async def list_documents():
    """
    Returns a list of uploaded documents.
    """
    return uploaded_docs

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Endpoint to process and index a document.
    """
    try:
        contents = await file.read()
        text = extract_text(contents, file.filename)
        
        if not text:
            return JSONResponse({"error": "Could not extract text from file"}, status_code=400)
            
        chunks = chunk_text(text)
        if not chunks:
            return JSONResponse({"error": "File resulted in zero chunks"}, status_code=400)
            
        doc_id = str(uuid.uuid4())
        add_document(chunks, doc_id, file.filename)
        
        # Track metadata
        doc_metadata = {
            "id": doc_id,
            "filename": file.filename,
            "chunks": len(chunks),
            "uploaded_at": datetime.now().isoformat(),
            "status": "ready"
        }
        uploaded_docs.append(doc_metadata)
        
        return doc_metadata
    except Exception as e:
        return JSONResponse({"error": f"Upload failed: {str(e)}"}, status_code=500)

@router.delete("/{doc_id}")
async def remove_document(doc_id: str):
    """
    Removes a document from the tracking list and the vector store.
    """
    global uploaded_docs
    
    # 1. Remove from vector store
    delete_document(doc_id)
    
    # 2. Remove from metadata list
    uploaded_docs = [d for d in uploaded_docs if d["id"] != doc_id]
    
    return {"status": "deleted"}
