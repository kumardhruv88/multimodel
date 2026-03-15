"use client";
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Trash2, 
  Code2, 
  Image as ImageIcon, 
  Type as TextIcon,
  Search,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Artifact {
  id: string;
  title: string;
  artifact_type: 'code' | 'image' | 'text';
  content?: string;
  image_url?: string;
  language?: string;
  created_at: string;
}

type FilterType = 'all' | 'code' | 'image' | 'text';

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/artifacts`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArtifacts(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/artifacts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setArtifacts(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete artifact:", err);
    }
  };

  const filteredArtifacts = artifacts.filter(a => 
    filter === 'all' ? true : a.artifact_type === filter
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'code':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/20">Code</span>;
      case 'image':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-coral-400 bg-coral-400/10 px-2 py-0.5 rounded-full border border-coral-400/20" style={{ color: '#cf6679', backgroundColor: '#cf66791a', borderColor: '#cf667933' }}>Image</span>;
      case 'text':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">Text</span>;
      default:
        return null;
    }
  };

  const renderPreview = (artifact: Artifact) => {
    if (artifact.artifact_type === 'image') {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333333] mb-3 relative">
          {artifact.image_url ? (
            <img src={artifact.image_url} alt={artifact.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#333333]">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
      );
    }

    if (artifact.artifact_type === 'code') {
      const lines = (artifact.content || "").split('\n').slice(0, 3).join('\n');
      return (
        <div className="w-full rounded-lg bg-[#1a1a1a] border border-[#333333] p-3 mb-3 font-mono text-[11px] text-[#a0a0a0] leading-relaxed overflow-hidden">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#333333]">
            <div className="w-2 h-2 rounded-full bg-[#3a3a3a]" />
            <span className="text-[10px] opacity-50 uppercase">{artifact.language || 'Plain'}</span>
          </div>
          <pre className="whitespace-pre-wrap">{lines || "// No content available"}</pre>
          <div className="mt-2 text-[10px] text-purple-400/50 italic pr-2 text-right">Continue...</div>
        </div>
      );
    }

    return (
      <div className="text-xs text-[#6b6b6b] mb-3 line-clamp-3 leading-relaxed">
        {artifact.content || "No content summary available..."}
      </div>
    );
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-[#ececec]">Artifacts</h1>
          <p className="text-sm text-[#a0a0a0] mt-1">
            Browser and manage your saved AI outputs
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#cf6679]/10 flex items-center justify-center text-[#cf6679] border border-[#cf6679]/20">
          <Box size={20} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-[#1a1a1a] border border-[#333333] rounded-xl mb-8 w-fit">
        {(['all', 'code', 'image', 'text'] as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150
              ${filter === t 
                ? 'bg-[#333333] text-[#ececec] shadow-sm' 
                : 'text-[#6b6b6b] hover:text-[#a0a0a0]'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Box size={24} className="text-[#cf6679]" />
          </motion.div>
          <p className="text-xs text-[#6b6b6b] mt-4">Loading your vault...</p>
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#333333] rounded-2xl bg-[#1a1a1a]/50">
          <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-[#333333] mx-auto mb-4">
            <Box size={32} />
          </div>
          <p className="text-sm font-medium text-[#a0a0a0]">No artifacts found</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Generated items like code or images will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredArtifacts.map((art) => (
              <motion.div
                layout
                key={art.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-[#2a2a2a] border border-[#333333] rounded-2xl p-5 hover:border-[#4a4a4a] transition-all hover:bg-[#2f2f2f] cursor-pointer shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  {getTypeBadge(art.artifact_type)}
                  <span className="text-[10px] text-[#6b6b6b]">
                    {new Date(art.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-sm font-medium text-[#ececec] mb-3 truncate group-hover:text-white transition-colors">
                  {art.title}
                </h3>

                {renderPreview(art)}

                <div className="flex items-center text-[11px] text-[#6b6b6b] font-medium group-hover:text-[#a0a0a0] transition-colors mt-auto">
                  View Full Output
                  <ChevronRight size={12} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <button
                  onClick={(e) => handleDelete(art.id, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-[#6b6b6b] hover:text-red-400 transition-all z-10"
                  title="Delete artifact"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
