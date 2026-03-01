"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, X, Loader2, Phone } from "lucide-react";
import Vapi from "@vapi-ai/web";

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

const VAPI_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export default function VoiceMode({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // Use a ref to keep the Vapi instance stable
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(VAPI_KEY);
    }
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      console.log("Call started");
      setState("listening");
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setState("idle");
      setTranscript("");
      setResponse("");
    });

    vapi.on("speech-start", () => {
      setState("listening");
    });

    vapi.on("speech-end", () => {
      setState("thinking");
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setTranscript(message.transcript);
        setState("listening");
      }
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript(message.transcript);
        setState("thinking");
      }
      if (message.type === "model-output") {
        setResponse(prev => prev + " " + message.output);
        setState("speaking");
      }
    });

    vapi.on("volume-level", (level) => {
      setVolume(level);
    });

    vapi.on("error", (e) => {
      const msg = e?.message || JSON.stringify(e);
      console.error("Vapi Error details:", msg);
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("forbidden")) {
        alert("Vapi Authorization Failed! Please ensure your Public Key in .env.local is correct and you have restarted the server.");
      }
      setState("idle");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startCall = async () => {
    if (VAPI_KEY === "your_vapi_public_key_here" || !VAPI_KEY) {
      alert("Please paste your Vapi Public Key in .env.local and restart the server!");
      return;
    }

    setState("connecting");
    try {
      const assistantConfig = {
        name: "Nexus AI Voice",
        firstMessage: "Hello! I'm Nexus AI. How can I help you today?",
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are Nexus AI, a helpful voice assistant. Keep responses short and conversational. Avoid markdown."
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "paula",
        }
      };
      
      console.log("Starting Vapi with config:", assistantConfig);
      await vapiRef.current?.start(assistantConfig as any);
    } catch (e: any) {
      console.error("Failed to start vapi call:", e?.message || e);
      setState("idle");
    }
  };

  const stopCall = () => {
    vapiRef.current?.stop();
  };

  const toggleMute = () => {
    vapiRef.current?.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const orbScale = 1 + (volume * 1.5) + (state === "connecting" ? 0.05 : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1a1a1a] z-[500] flex flex-col items-center justify-center"
    >
      {/* Close */}
      <button
        onClick={() => {
          stopCall();
          onClose();
        }}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#333333] transition-colors"
      >
        <X size={20} className="text-[#a0a0a0]" />
      </button>

      {/* State label */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <p className="text-[12px] text-[#6b6b6b] uppercase tracking-widest">
          {state === "idle" && "Ready to talk"}
          {state === "connecting" && "Connecting..."}
          {state === "listening" && "Listening..."}
          {state === "thinking" && "AI Thinking..."}
          {state === "speaking" && "AI Speaking..."}
        </p>
        {state !== "idle" && (
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cf6679] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#cf6679] animate-pulse [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#cf6679] animate-pulse [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Animated Orb */}
      <motion.div
        animate={{
          scale: orbScale,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="relative w-[200px] h-[200px] rounded-full mb-12 flex items-center justify-center overflow-hidden"
        style={{
          background: state === "listening"
            ? "radial-gradient(circle, #cf6679 0%, #7c6cf0 70%, #4a9eff 100%)"
            : state === "thinking"
            ? "radial-gradient(circle, #7c6cf0 0%, #4a9eff 70%, #333333 100%)"
            : state === "speaking"
            ? "radial-gradient(circle, #cf6679 0%, #fb923c 70%, #cf6679 100%)"
            : state === "connecting"
            ? "radial-gradient(circle, #333333 0%, #444 70%, #555 100%)"
            : "radial-gradient(circle, #3a3a3a 0%, #2a2a2a 70%, #1a1a1a 100%)",
          boxShadow: state !== "idle"
            ? `0 0 80px ${state === "listening" ? "#cf667950" : state === "thinking" ? "#7c6cf050" : "#cf667950"}`
            : "none",
          transition: "background 0.5s, box-shadow 0.5s",
        }}
      >
        <AnimatePresence mode="wait">
          {state === "connecting" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={40} className="text-white/40 animate-spin" />
            </motion.div>
          )}
          {state === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Phone size={40} className="text-white/20" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow rings */}
        {state !== "idle" && (
          <>
            <div className="absolute inset-0 rounded-full border border-white/10 animate-ping [animation-duration:3s]" />
            <div className="absolute inset-4 rounded-full border border-white/5 animate-ping [animation-duration:2s]" />
          </>
        )}
      </motion.div>

      {/* Transcript / Response Display */}
      <div className="max-w-[600px] w-full text-center px-10 mb-12 min-h-[100px] flex flex-col justify-center gap-4">
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.p
              key="transcript"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[18px] text-[#ececec] font-medium leading-relaxed"
            >
              &quot;{transcript}&quot;
            </motion.p>
          )}
          {response && !transcript && (
            <motion.p
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[15px] text-[#a0a0a0] leading-relaxed italic"
            >
              {response}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={toggleMute}
          disabled={state === "idle" || state === "connecting"}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-red-500/20 text-red-500" : "bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#333333]"
          } disabled:opacity-20`}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={state === "idle" ? startCall : stopCall}
          disabled={state === "connecting"}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            state === "idle"
              ? "bg-[#cf6679] hover:bg-[#b85768] hover:scale-105"
              : "bg-red-500 hover:bg-red-600 scale-110"
          } disabled:opacity-50`}
        >
          {state === "idle" ? (
            <Mic size={32} className="text-white" />
          ) : (
            <MicOff size={32} className="text-white" />
          )}
        </button>

        <button
          onClick={() => {
            stopCall();
            onClose();
          }}
          className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#333333] transition-colors"
        >
          <X size={20} className="text-[#a0a0a0]" />
        </button>
      </div>

      <p className="mt-12 text-[11px] text-[#444] font-medium uppercase tracking-[0.2em]">
        Powered by Vapi AI
      </p>
    </motion.div>
  );
}
