"use client";

import React from "react";
import { Code, FileText, Lightbulb, PenTool, Search, Zap } from "lucide-react";

interface PromptTemplate {
  icon: React.ElementType;
  label: string;
  prompt: string;
  color: string;
}

const templates: PromptTemplate[] = [
  {
    icon: Code,
    label: "Write code",
    prompt: "Write a Python function that ",
    color: "#4ade80",
  },
  {
    icon: PenTool,
    label: "Help me write",
    prompt: "Help me write a professional email about ",
    color: "#cf6679",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm ideas",
    prompt: "Give me 10 creative ideas for ",
    color: "#fb923c",
  },
  {
    icon: Search,
    label: "Research a topic",
    prompt: "Research and summarize the key points about ",
    color: "#4a9eff",
  },
  {
    icon: FileText,
    label: "Summarize text",
    prompt: "Summarize the following text:\n\n",
    color: "#a78bfa",
  },
  {
    icon: Zap,
    label: "Explain simply",
    prompt: "Explain in simple terms how ",
    color: "#fbbf24",
  },
];

export default function PromptTemplates({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-[480px] mx-auto">
      {templates.map((t) => (
        <button
          key={t.label}
          onClick={() => onSelect(t.prompt)}
          className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] transition-all text-left"
        >
          <t.icon size={14} style={{ color: t.color }} className="flex-shrink-0" />
          <span className="text-[12px] text-[#a0a0a0] group-hover:text-[#ececec] transition-colors">
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}
