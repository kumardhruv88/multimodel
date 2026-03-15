"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FolderOpen, Plus, Check } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface WorkspaceSelectorProps {
  onWorkspaceChange?: (workspaceId: string | null) => void;
}

export default function WorkspaceSelector({ onWorkspaceChange }: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/workspaces`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWorkspaces(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const active = workspaces.find((w) => w.id === activeId);

  const select = (id: string | null) => {
    setActiveId(id);
    setIsOpen(false);
    onWorkspaceChange?.(id);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#333333] transition-colors text-left"
      >
        <span className="text-[14px]">{active?.icon || "🗂️"}</span>
        <span className="flex-1 text-[13px] text-[#ececec] truncate">
          {active?.name || "All Workspaces"}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#6b6b6b] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50"
          >
            {/* All Workspaces option */}
            <button
              onClick={() => select(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                !activeId ? "bg-[#333333]" : "hover:bg-[#333333]/50"
              }`}
            >
              <FolderOpen size={14} className="text-[#a0a0a0]" />
              <span className="flex-1 text-[13px] text-[#ececec]">All Workspaces</span>
              {!activeId && <Check size={12} className="text-[#cf6679]" />}
            </button>

            {workspaces.length > 0 && <div className="h-px bg-[#3a3a3a]" />}

            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => select(w.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  activeId === w.id ? "bg-[#333333]" : "hover:bg-[#333333]/50"
                }`}
              >
                <span className="text-[14px]">{w.icon}</span>
                <span className="flex-1 text-[13px] text-[#ececec] truncate">{w.name}</span>
                {activeId === w.id && <Check size={12} className="text-[#cf6679]" />}
              </button>
            ))}

            <div className="h-px bg-[#3a3a3a]" />
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = "/workspace";
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#333333]/50 transition-colors"
            >
              <Plus size={13} className="text-[#cf6679]" />
              <span className="text-[12px] text-[#cf6679]">New Workspace</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
