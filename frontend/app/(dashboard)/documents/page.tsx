"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  FileCode, 
  File, 
  UploadCloud, 
  Loader2,
  X 
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  chunks: number;
  uploaded_at: string;
  status: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/documents")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      })
      .catch(console.error)
  }, [])

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => [...prev, data]);
      } else {
        const err = await res.json();
        console.error("Upload error:", err);
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'md') return <FileCode className="text-blue-400" size={24} />;
    if (ext === 'pdf' || ext === 'txt') return <FileText className="text-red-400" size={24} />;
    return <File className="text-zinc-400" size={24} />;
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-xl font-medium text-[#ececec]">Documents</h1>
        <p className="text-sm text-[#a0a0a0] mt-1">
          Upload and manage files for your RAG knowledge base
        </p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group mb-10 h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-[#cf6679] bg-[#cf6679]/5' 
            : 'border-[#333333] bg-[#1a1a1a] hover:border-[#444444] hover:bg-[#252525]'
          }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          accept=".pdf,.txt,.docx,.md"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#cf6679]" size={32} />
            <p className="text-sm font-medium text-[#ececec]">Processing document...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center text-[#cf6679] mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-medium text-[#ececec]">
              Drop files here or click to upload
            </p>
            <p className="text-[11px] text-[#6b6b6b] mt-1">
              Supports PDF, TXT, DOCX, and Markdown
            </p>
          </>
        )}
      </div>

      {/* Documents Grid */}
      <div className="mb-4">
        <h2 className="text-[13px] uppercase tracking-widest text-[#6b6b6b] mb-4 font-semibold">
          Your Documents
        </h2>

        {documents.length === 0 ? (
          <div className="text-center py-20 border border-[#2a2a2a] rounded-2xl bg-[#1a1a1a]/50">
            <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-[#444444] mx-auto mb-4">
              <FileText size={32} />
            </div>
            <p className="text-sm font-medium text-[#a0a0a0]">No documents uploaded yet</p>
            <p className="text-xs text-[#6b6b6b] mt-1">Uploaded files will appear here for use in chat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="group relative bg-[#2a2a2a] border border-[#333333] rounded-xl p-4 hover:border-[#444444] transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getFileIcon(doc.filename)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#ececec] truncate pr-6" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#6b6b6b] bg-[#333333] px-1.5 py-0.5 rounded">
                        {doc.chunks} chunks
                      </span>
                      <span className="text-[11px] text-[#6b6b6b]">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#cf6679]/10 text-[#6b6b6b] hover:text-[#cf6679] transition-all"
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
