import numpy as np

# Lazy-loaded model to avoid crashing on import
_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

# Simple in-memory store
documents = []
embeddings = []
metadatas = []

def add_document(chunks: list, doc_id: str, filename: str):
    """
    Generate embeddings for chunks and store them in memory.
    """
    global documents, embeddings, metadatas
    new_embeddings = _get_model().encode(chunks).tolist()
    documents.extend(chunks)
    embeddings.extend(new_embeddings)
    metadatas.extend([{"filename": filename, "doc_id": doc_id}] * len(chunks))

def search_documents(query: str, n_results=5) -> str:
    """
    Perform semantic search using numpy dot product.
    """
    if not documents:
        return ""
        
    query_emb = _get_model().encode([query])[0]
    
    # Calculate cosine similarity (dot product on normalized or raw embeddings)
    # Using raw dot product as a simple similarity measure
    scores = np.dot(embeddings, query_emb)
    
    # Get top indices
    top_indices = np.argsort(scores)[-n_results:][::-1]
    
    context = "### Relevant Document Content\n\n"
    found = False
    for i in top_indices:
        # Simple threshold to filter out low-relevance results
        if scores[i] > 0.3:
            found = True
            context += f"From {metadatas[i]['filename']}:\n"
            context += f"{documents[i]}\n\n"
            
    return context if found else ""

def delete_document(doc_id: str):
    """
    Remove all chunks associated with a document ID.
    """
    global documents, embeddings, metadatas
    
    # Create mask of indices to keep
    keep_indices = [i for i, meta in enumerate(metadatas) if meta['doc_id'] != doc_id]
    
    # Filter lists
    documents = [documents[i] for i in keep_indices]
    embeddings = [embeddings[i] for i in keep_indices]
    metadatas = [metadatas[i] for i in keep_indices]
