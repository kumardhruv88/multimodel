"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Globe, Mic, Wand2, ArrowUp, Plus, Image, X, FileText } from "lucide-react";
import VoiceMode from "@/components/VoiceMode";

interface ChatInputProps {
  onSend?: (message: string, options: {
    webSearch: boolean
    imageGen: boolean
    files: File[]
  }) => void
  prefill?: string
}

const ChatInput = ({ onSend, prefill }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolMenuRef.current && !toolMenuRef.current.contains(event.target as Node)) {
        setShowToolMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle prefill from prompt templates
  useEffect(() => {
    if (prefill) {
      setMessage(prefill);
      textareaRef.current?.focus();
    }
  }, [prefill]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    onSend?.(message.trim(), {
      webSearch: isWebSearchActive,
      imageGen: imageGenMode,
      files: [...attachedFiles, ...attachedImages]
    });

    setMessage("");
    setAttachedFiles([]);
    setAttachedImages([]);
    setImagePreviews([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
    setShowToolMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = 
          textareaRef.current.scrollHeight + 'px';
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setShowToolMenu(false);
  };

  const hasText = message.trim().length > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="w-full py-4">
        <div className="max-w-[580px] mx-auto px-4 relative">
          <AnimatePresence>
            {showToolMenu && (
              <motion.div
                ref={toolMenuRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-6 mb-4 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-1 shadow-xl min-w-[200px] z-50 overflow-hidden"
              >
                {/* Attach document */}
                <div 
                  onClick={handleFileClick}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg hover:bg-[#333333] cursor-pointer text-sm text-[#ececec] transition-colors"
                >
                  <Paperclip size={16} className="text-[#a0a0a0]" />
                  <span>Attach document</span>
                </div>

                {/* Web Search */}
                <div 
                  onClick={() => {
                    setIsWebSearchActive(!isWebSearchActive);
                    setShowToolMenu(false);
                  }}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg hover:bg-[#333333] cursor-pointer text-sm text-[#ececec] transition-colors"
                >
                  <Globe size={16} className="text-[#a0a0a0]" />
                  <span>Web Search</span>
                  {isWebSearchActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </div>

                {/* Voice input */}
                <div 
                  onClick={handleVoiceToggle}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg hover:bg-[#333333] cursor-pointer text-sm text-[#ececec] transition-colors"
                >
                  <Mic size={16} className="text-[#a0a0a0]" />
                  <span>Voice input</span>
                  {isRecording && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#cf6679] animate-pulse" />
                  )}
                </div>

                {/* Image generation */}
                <div 
                  onClick={() => {
                    setImageGenMode(!imageGenMode);
                    setShowToolMenu(false);
                  }}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg hover:bg-[#333333] cursor-pointer text-sm text-[#ececec] transition-colors"
                >
                  <Wand2 size={16} className="text-[#a0a0a0]" />
                  <span>Image generation</span>
                  {imageGenMode && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c6cf0]" />
                  )}
                </div>
                {/* Image upload */}
                <div 
                  onClick={() => {
                    imageInputRef.current?.click();
                    setShowToolMenu(false);
                  }}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg hover:bg-[#333333] cursor-pointer text-sm text-[#ececec] transition-colors"
                >
                  <Image size={16} className="text-[#a0a0a0]" />
                  <span>Upload image</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={imageInputRef}
            type="file"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setAttachedImages(prev => [...prev, ...files]);
              files.forEach(f => {
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
                reader.readAsDataURL(f);
              });
            }}
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
          />

          {/* Active Mode Badges */}
          {(isWebSearchActive || imageGenMode) && (
            <div className="flex gap-2 mb-2 px-1">
              {isWebSearchActive && (
                <span
                  onClick={() => setIsWebSearchActive(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 cursor-pointer hover:bg-green-500/20 transition-colors"
                >
                  <Globe size={10} />
                  Web Search
                  <X size={10} className="ml-0.5" />
                </span>
              )}
              {imageGenMode && (
                <span
                  onClick={() => setImageGenMode(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7c6cf0]/10 border border-[#7c6cf0]/20 text-[11px] text-[#7c6cf0] cursor-pointer hover:bg-[#7c6cf0]/20 transition-colors"
                >
                  <Wand2 size={10} />
                  Image Mode
                  <X size={10} className="ml-0.5" />
                </span>
              )}
            </div>
          )}

          {/* Document File Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex gap-2 mb-2 px-1 flex-wrap">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] group">
                  <FileText size={16} className="text-[#cf6679] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#ececec] truncate max-w-[150px]">{file.name}</p>
                    <p className="text-[10px] text-[#6b6b6b]">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-0.5 rounded-full hover:bg-[#333333] text-[#6b6b6b] hover:text-[#ececec] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mb-2 px-1">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#3a3a3a] group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                      setAttachedImages(prev => prev.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-full px-3 py-2 focus-within:border-[#4a4a4a] focus-within:ring-3 focus-within:ring-[#cf6679]/10 transition-all duration-200 ease-in-out flex items-center gap-2">
            {/* Plus Button */}
            <button
              type="button"
              onClick={() => setShowToolMenu(!showToolMenu)}
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full border border-[#3a3a3a] hover:bg-[#333333] text-[#a0a0a0] transition-colors cursor-pointer"
            >
              <Plus size={15} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx,.md,.csv,.xlsx,.xls,.pptx"
              multiple
              className="hidden"
            />

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] leading-[1.7] text-[#ececec] placeholder-[#6b6b6b] max-h-[120px] overflow-y-auto py-1"
            />

            <div className="flex items-center gap-1 shrink-0">
              {/* Mic Button — voice-to-text dictation */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#333333] transition-colors ${
                  isRecording ? "text-[#cf6679] animate-pulse" : "text-[#a0a0a0]"
                }`}
                title="Voice to text"
              >
                <Mic size={15} />
              </button>

              {/* Dynamic: Waveform (voice agent) OR Send arrow */}
              <AnimatePresence mode="wait">
                {hasText ? (
                  /* Send Button — appears when user types */
                  <motion.button
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#ececec] text-[#1a1a1a] cursor-pointer"
                  >
                    <ArrowUp size={15} strokeWidth={2.5} />
                  </motion.button>
                ) : (
                  /* Voice Agent Waveform Button — opens full VoiceMode */
                  <motion.button
                    key="voice"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setVoiceModeOpen(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#333333] hover:bg-[#444444] text-[#ececec] cursor-pointer transition-colors"
                    title="Use Voice"
                  >
                    {/* Waveform bars icon */}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="5" width="2" height="6" rx="1" fill="currentColor" />
                      <rect x="5" y="3" width="2" height="10" rx="1" fill="currentColor" />
                      <rect x="9" y="1" width="2" height="14" rx="1" fill="currentColor" />
                      <rect x="13" y="4" width="2" height="8" rx="1" fill="currentColor" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Voice Mode overlay */}
      <AnimatePresence>
        {voiceModeOpen && <VoiceMode onClose={() => setVoiceModeOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default ChatInput;
