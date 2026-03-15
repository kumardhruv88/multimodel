"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, User, Bot, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at?: string;
}

export default function SharedThread() {
  const params = useParams();
  const threadId = params?.threadId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/threads/${threadId}/share`, { method: "GET" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Not available");
        return r.json();
      })
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [threadId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#cf6679] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#212121] flex flex-col items-center justify-center gap-4">
        <Share2 size={48} className="text-[#3a3a3a]" />
        <p className="text-[#a0a0a0] text-[15px]">This shared conversation is not available or does not exist.</p>
        <Link href="/" className="text-[#cf6679] text-[13px] hover:underline flex items-center gap-1 mt-4 px-4 py-2 border border-[#3a3a3a] rounded-lg bg-[#2a2a2a]">
          <ArrowLeft size={16} /> Go to NEXUS AI
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col text-[#ececec]">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a]/80 border-b border-[#3a3a3a] px-6 py-4 flex items-center justify-between backdrop-blur-xl z-10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cf6679] to-[#7c6cf0] flex items-center justify-center shadow-md">
            <span className="text-[13px] font-bold text-white">N</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight group-hover:text-white text-[#ececec] transition-colors">NEXUS AI</span>
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-[#ececec] text-[13px] font-medium flex items-center gap-1.5"><Share2 size={12} className="text-[#a0a0a0]" /> Shared Chat</span>
          <span className="text-[#888] text-[11px]">Read-only view</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[760px] mx-auto px-4 py-10 space-y-8">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 outline outline-1 outline-offset-1 shadow-sm ${
                msg.role === "user" 
                  ? "bg-[#2d2d3a] outline-[#3a3a3a]" 
                  : "bg-gradient-to-br from-[#cf6679] to-[#7c6cf0] outline-transparent"
              }`}>
                {msg.role === "user" ? (
                  <User size={15} className="text-[#a0a0a0]" />
                ) : (
                  <Bot size={15} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#888] mb-1.5 capitalize tracking-wide">{msg.role === 'user' ? 'User' : 'Nexus AI'}</p>
                <div className={`text-[14px] leading-[1.7] ${
                  msg.role === "user" ? "text-[#ececec]" : "text-[#c0c0c0]"
                }`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-[#3a3a3a] max-w-none break-words"
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-20 text-[#a0a0a0]">
              <p>This conversation has no messages yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[#3a3a3a] bg-[#1a1a1a] py-6 text-center flex-shrink-0">
        <p className="text-[13px] text-[#a0a0a0] mb-3">
          Want to continue this conversation or start your own?
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#cf6679] hover:bg-[#b85768] text-white text-[14px] font-medium transition-all hover:shadow-lg hover:shadow-[#cf6679]/20"
        >
          Try NEXUS AI for free
        </Link>
      </div>
    </div>
  );
}
