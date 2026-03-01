"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Globe, FileText, Loader2, LogIn, Lock, Info } from "lucide-react";
import ChatInput from "@/components/chat/ChatInput/ChatInput";
import UserMessage from "@/components/chat/Message/UserMessage";
import AIMessage from "@/components/chat/Message/AIMessage";
import PromptTemplates from "@/components/chat/PromptTemplates";
import { speakText } from "@/lib/tts";
import { canSendPrompt, recordPrompt, getRemainingPrompts, getRemainingThreads, canCreateThread } from "@/lib/freeUsage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { type: string; label: string }[];
}

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showLimitWall, setShowLimitWall] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [prefill, setPrefill] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check auth status
  useEffect(() => {
    try {
      // Simple check - if Clerk user cookie exists
      const hasAuth = document.cookie.includes("__clerk") || document.cookie.includes("__session");
      setIsSignedIn(hasAuth);
    } catch {
      setIsSignedIn(false);
    }
  }, []);

  // Load TTS preference
  useEffect(() => {
    const stored = localStorage.getItem("nexus_tts");
    if (stored === "true") setTtsEnabled(true);
  }, []);

  // Update remaining count
  useEffect(() => {
    if (!isSignedIn) {
      setRemaining(getRemainingPrompts(threadId));
    }
  }, [threadId, isSignedIn, messages.length]);

  // Load existing messages
  useEffect(() => {
    setMessages([]);
    setHistory([]);
    setStatusText("");
    setShowLimitWall(false);
    
    if (!threadId || threadId === "home") {
      // Check if can create new threads
      if (!isSignedIn && !canCreateThread()) {
        setShowLimitWall(true);
      }
      return;
    }

    fetch(`http://localhost:8000/api/threads/${threadId}/messages`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const loaded = data.map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at || Date.now())
          }));
          setMessages(loaded);
          setHistory(data.map((m: any) => ({
            role: m.role,
            content: m.content
          })));
        }
      })
      .catch(err => console.error("Failed to load chat history:", err));
  }, [threadId, isSignedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusText]);

  const handleSend = async (content: string, options: any = {}) => {
    // FREE TRIAL CHECK (skip for signed-in users)
    if (!isSignedIn) {
      if (!canSendPrompt(threadId)) {
        setShowLimitWall(true);
        return;
      }
    }

    // Auto-detect image generation requests from message content
    const imageGenKeywords = /\b(generate|create|make|draw|design|paint|sketch)\b.{0,15}\b(image|picture|photo|illustration|art|drawing|icon|logo)\b/i;
    const reversePattern = /\b(image|picture|photo|illustration)\b.{0,15}\b(of|for|about|showing)\b/i;
    if (!options.imageGen && (imageGenKeywords.test(content) || reversePattern.test(content))) {
      options.imageGen = true;
    }

    // Separate image files from documents
    const imageFiles: File[] = [];
    const docFiles: File[] = [];
    if (options.files && options.files.length > 0) {
      for (const file of options.files) {
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        } else {
          docFiles.push(file);
        }
      }
    }

    // Upload document files for RAG
    if (docFiles.length > 0) {
      for (const file of docFiles) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          await fetch('http://localhost:8000/api/documents/upload', {
            method: 'POST', body: formData
          });
        } catch (e) {
          console.error('Upload failed:', e);
        }
      }
    }

    // Convert first image to base64 for vision
    let imageBase64 = "";
    if (imageFiles.length > 0) {
      imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data:image/...;base64, prefix
          resolve(result.split(",")[1] || "");
        };
        reader.readAsDataURL(imageFiles[0]);
      });
    }

    // Record usage for free users
    if (!isSignedIn) {
      recordPrompt(threadId);
      setRemaining(getRemainingPrompts(threadId));
    }

    // Build display content with file/image attachments
    let displayContent = content;
    if (options.files && options.files.length > 0) {
      const fileNames = options.files
        .map((f: File) => f.type.startsWith("image/") ? `🖼️ ${f.name}` : `📎 ${f.name}`)
        .join("\n");
      displayContent = `${fileNames}\n\n${content}`;
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Add AI placeholder
    const aiId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiId,
      role: "assistant",
      content: options.imageGen ? "Generating image..." : "",
      timestamp: new Date(),
    }]);

    setIsStreaming(true);
    setStatusText("");

    try {
      if (options.imageGen) {
        const res = await fetch('http://localhost:8000/api/images/generate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ prompt: content })
        });
        const data = await res.json();
        
        if (data.image_url) {
          const imageContent = `[NEXUS_IMAGE:${data.image_url}]\n\n*"${content}"*`;
          setMessages(prev => prev.map(msg => 
            msg.id === aiId ? { ...msg, content: imageContent } : msg
          ));
          setHistory(prev => [
            ...prev, 
            { role: "user", content },
            { role: "assistant", content: `(Generated Image: ${data.image_url})` }
          ]);
        } else {
          throw new Error(data.error || "Failed to generate image");
        }
        setIsStreaming(false);

      } else {
        // NORMAL CHAT FLOW
        const model = localStorage.getItem("nexus_model") || "llama-3.3-70b-versatile";
        
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            thread_id: threadId,
            conversation_history: history,
            web_search: !!options.webSearch,
            model,
            image_data: imageBase64,
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let messageSources: { type: string; label: string }[] = [];

        if (!reader) {
          setIsStreaming(false);
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6);
              
              try {
                const event = JSON.parse(raw);
                
                if (event.type === "token") {
                  const cleanToken = event.content.replace(/\\n/g, "\n");
                  fullResponse += cleanToken;
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiId 
                      ? { ...msg, content: msg.content + cleanToken }
                      : msg
                  ));
                } else if (event.type === "status") {
                  setStatusText(event.message);
                } else if (event.type === "sources") {
                  messageSources = event.sources;
                } else if (event.type === "done") {
                  if (messageSources.length > 0) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === aiId 
                        ? { ...msg, sources: messageSources }
                        : msg
                    ));
                  }
                  setStatusText("");
                  break;
                } else if (event.type === "error") {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiId 
                      ? { ...msg, content: event.message }
                      : msg
                  ));
                }
              } catch {
                if (raw === "[DONE]") break;
                if (raw) {
                  const cleanToken = raw.replace(/\\n/g, "\n");
                  fullResponse += cleanToken;
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiId 
                      ? { ...msg, content: msg.content + cleanToken }
                      : msg
                  ));
                }
              }
            }
          }
        }

        setHistory(prev => [
          ...prev, 
          { role: "user", content },
          { role: "assistant", content: fullResponse }
        ]);

        if (ttsEnabled && fullResponse) {
          await speakText(fullResponse);
        }

        window.dispatchEvent(new Event("nexus-thread-updated"));
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiId 
          ? { ...msg, content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}` }
          : msg
      ));
    } finally {
      setIsStreaming(false);
      setStatusText("");
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#212121',
      position: 'relative'
    }}>
      {/* Top bar with sign-in button */}
      {!isSignedIn && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#6b6b6b]">
              Free trial: {remaining} prompt{remaining !== 1 ? "s" : ""} left in this thread
            </span>
            <span className="text-[11px] text-[#3a3a3a]">|</span>
            <span className="text-[12px] text-[#6b6b6b]">
              {getRemainingThreads()} thread{getRemainingThreads() !== 1 ? "s" : ""} left
            </span>
          </div>
          <button
            onClick={() => router.push("/sign-in")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#cf6679] hover:bg-[#b85768] text-white text-[12px] font-medium transition-all hover:shadow-lg hover:shadow-[#cf6679]/20"
          >
            <LogIn size={12} />
            Sign in for unlimited
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {/* LIMIT WALL — shown when free trial exceeded */}
        {showLimitWall ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#cf6679]/10 flex items-center justify-center mb-6">
              <Lock size={28} className="text-[#cf6679]" />
            </div>
            <h1 className="text-[24px] font-light text-[#ececec] mb-2 tracking-[-0.02em]">
              Free trial limit reached
            </h1>
            <p className="text-[14px] text-[#a0a0a0] max-w-[400px] mb-8 leading-relaxed">
              You&apos;ve used all your free prompts. Sign in with Google to get
              <span className="text-[#ececec] font-medium"> unlimited access</span> —
              it&apos;s completely free.
            </p>
            <button
              onClick={() => router.push("/sign-in")}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#cf6679] hover:bg-[#b85768] text-white text-[15px] font-medium transition-all hover:shadow-xl hover:shadow-[#cf6679]/25"
            >
              <LogIn size={18} />
              Sign in with Google
            </button>
            <p className="text-[11px] text-[#6b6b6b] mt-4">
              Takes 5 seconds · No credit card needed
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 16px'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              backgroundColor: '#cf6679',
              display: 'flex', alignItems: 'center', 
              justifyContent: 'center', marginBottom: 24
            }}>
              <span style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>N</span>
            </div>
            <h1 style={{ 
              fontSize: 28, fontWeight: 300, color: '#ececec',
              marginBottom: 8, letterSpacing: '-0.02em'
            }}>
              How can I help you today?
            </h1>
            <p style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 32 }}>
              Ask anything, upload documents, or search the web.
            </p>
            <PromptTemplates onSelect={(prompt) => setPrefill(prompt + "__" + Date.now())} />
            {!isSignedIn && (
              <p className="mt-6 text-[11px] text-[#6b6b6b]">
                <Info size={10} className="inline mr-1" />
                5 free threads · 5 prompts each · Sign in for unlimited
              </p>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg) => msg.role === "user" ? (
              <UserMessage key={msg.id} content={msg.content} 
                timestamp={msg.timestamp} />
            ) : (
              <div key={msg.id}>
                <AIMessage 
                  content={msg.content} 
                  timestamp={msg.timestamp} 
                  isStreaming={isStreaming && msg.id === messages[messages.length - 1]?.id}
                />
                {msg.sources && msg.sources.length > 0 && !isStreaming && (
                  <div className="max-w-[680px] mx-auto px-4 pb-2 -mt-1 ml-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-[#6b6b6b]">Sources:</span>
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#3a3a3a] text-[11px] text-[#a0a0a0] bg-[#2a2a2a]"
                        >
                          {src.type === "web" ? <Globe size={10} /> : <FileText size={10} />}
                          {src.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {statusText && (
              <div className="max-w-[680px] mx-auto px-4 py-2 ml-10">
                <div className="flex items-center gap-2 text-[12px] text-[#a0a0a0]">
                  <Loader2 size={12} className="animate-spin text-[#cf6679]" />
                  {statusText}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Chat input — hidden when limit wall is showing */}
      {!showLimitWall && (
        <div style={{ flexShrink: 0, padding: '8px 0 16px' }}>
          <ChatInput onSend={handleSend} prefill={prefill.split("__")[0]} />
        </div>
      )}
    </div>
  );
}
