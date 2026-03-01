from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chat import router as chat_router
from api.documents import router as docs_router
from api.images import router as images_router
from api.threads import router as threads_router
from api.workspaces import router as workspaces_router
from api.artifacts import router as artifacts_router
from api.memories import router as memories_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(docs_router, prefix="/api/documents")
app.include_router(images_router, prefix="/api/images")
app.include_router(threads_router)
app.include_router(workspaces_router)
app.include_router(artifacts_router)
app.include_router(memories_router)

@app.get("/")
def read_root():
    return {"status": "NEXUS AI Backend Running"}
