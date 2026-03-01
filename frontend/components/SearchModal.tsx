"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, X, ArrowRight } from "lucide-react";

interface SearchResult {
  thread_id: string;
  title: string;
  preview: string;
  created_at: string;
  match_type: "title" | "message";
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/threads/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setSelectedIndex(0);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
  }, [query]);

  const handleSelect = (threadId: string) => {
    router.push(`/chat/${threadId}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex].thread_id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-[560px] z-[201]"
          >
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 h-14 border-b border-[#3a3a3a]">
                <Search size={18} className="text-[#6b6b6b] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-[14px] text-[#ececec] placeholder-[#6b6b6b] outline-none"
                />
                <kbd className="hidden sm:block px-1.5 py-0.5 text-[10px] text-[#6b6b6b] bg-[#333333] border border-[#3a3a3a] rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto">
                {loading && (
                  <div className="px-4 py-6 text-center text-[12px] text-[#6b6b6b]">Searching...</div>
                )}
                {!loading && query && results.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[13px] text-[#6b6b6b]">No results for &quot;{query}&quot;</p>
                  </div>
                )}
                {!loading && results.map((r, i) => (
                  <div
                    key={r.thread_id}
                    onClick={() => handleSelect(r.thread_id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      i === selectedIndex ? "bg-[#333333]" : "hover:bg-[#333333]/50"
                    }`}
                  >
                    <MessageSquare size={14} className="text-[#6b6b6b] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#ececec] truncate">
                        {r.title || "Untitled thread"}
                      </p>
                      <p className="text-[11px] text-[#6b6b6b] truncate mt-0.5">
                        {r.preview}
                      </p>
                    </div>
                    <ArrowRight size={12} className="text-[#3a3a3a] flex-shrink-0" />
                  </div>
                ))}
                {!query && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[12px] text-[#6b6b6b]">Type to search across all your conversations</p>
                    <p className="text-[11px] text-[#4a4a4a] mt-1">Use ↑↓ to navigate, Enter to select</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
