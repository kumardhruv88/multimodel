"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, User, Bot, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function SharedThread() {
  const params = useParams();
  const threadId = params?.threadId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    fetch(`http://localhost:8000/api/threads/${threadId}/share`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
        else setError(true);
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
        <p className="text-[#a0a0a0] text-[15px]">This conversation is not available</p>
        <Link href="/" className="text-[#cf6679] text-[13px] hover:underline flex items-center gap-1">
          <ArrowLeft size={12} /> Go to NEXUS AI
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#3a3a3a] px-6 py-3 flex items-center gap-3 backdrop-blur-xl z-10">
        <Link href="/" className="flex items-center gap-2 text-[#ececec] hover:text-[#cf6679] transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#cf6679] to-[#7c6cf0] flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">N</span>
          </div>
          <span className="font-semibold text-[14px]">NEXUS AI</span>
        </Link>
        <span className="text-[#3a3a3a] text-[12px]">·</span>
        <span className="text-[#6b6b6b] text-[12px]">Shared conversation</span>
      </div>

      {/* Messages */}
      <div className="max-w-[760px] mx-auto px-6 py-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "user" ? "bg-[#2d2d3a]" : "bg-gradient-to-br from-[#cf6679] to-[#7c6cf0]"
            }`}>
              {msg.role === "user" ? (
                <User size={13} className="text-[#a0a0a0]" />
              ) : (
                <Bot size={13} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#6b6b6b] mb-1.5 capitalize">{msg.role}</p>
              <div className={`text-[14px] leading-[1.7] ${
                msg.role === "user" ? "text-[#ececec] bg-[#2d2d3a] p-3 rounded-xl" : "text-[#a0a0a0]"
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#3a3a3a] py-6 text-center">
        <p className="text-[12px] text-[#6b6b6b]">
          Shared from <span className="text-[#cf6679]">NEXUS AI</span>
        </p>
        <Link href="/" className="text-[12px] text-[#4a9eff] hover:underline mt-1 inline-block">
          Try NEXUS AI for free →
        </Link>
      </div>
    </div>
  );
}
