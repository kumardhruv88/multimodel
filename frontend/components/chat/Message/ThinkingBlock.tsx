"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain } from "lucide-react";

interface ThinkingBlockProps {
  content: string;
  thinkingTime?: number;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content, thinkingTime }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTime = thinkingTime
    ? thinkingTime >= 60
      ? `${Math.floor(thinkingTime / 60)}m ${Math.round(thinkingTime % 60)}s`
      : `${Math.round(thinkingTime)}s`
    : null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1e1e2e] border border-[#2a2a3a] hover:border-[#3a3a4a] transition-all duration-200 cursor-pointer group w-full text-left"
      >
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#cf6679]/20 to-[#7c6cf0]/20 flex items-center justify-center">
          <Brain size={12} className="text-[#cf6679]" />
        </div>
        <span className="text-[12px] text-[#a0a0a0] font-medium">
          {displayTime ? `Thought for ${displayTime}` : "Thinking process"}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown size={14} className="text-[#6b6b6b] group-hover:text-[#a0a0a0] transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 px-4 py-3 rounded-xl bg-[#1e1e2e]/60 border border-[#2a2a3a]/50 ml-1">
              <pre className="text-[12px] text-[#8b8b9b] leading-6 whitespace-pre-wrap font-sans">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThinkingBlock;
