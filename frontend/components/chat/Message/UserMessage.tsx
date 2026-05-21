"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Pencil, X, Check } from "lucide-react";

interface UserMessageProps {
  content: string;
  timestamp: Date;
  onEdit?: (newContent: string) => void;
}

const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== content && onEdit) {
      onEdit(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex justify-end px-4 py-3 max-w-[680px] mx-auto w-full"
    >
      <div className="flex flex-col items-end gap-1 max-w-[85%]">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full min-w-[300px]"
            >
              <div className="bg-[#2a2a2a] border border-[#cf6679]/30 rounded-2xl rounded-br-md px-4 py-3">
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-[14px] text-[#ececec] leading-[1.7] outline-none resize-none"
                  rows={1}
                />
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-1.5">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-[#a0a0a0] hover:bg-[#333333] transition-colors"
                >
                  <X size={12} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-[#ececec] bg-[#cf6679] hover:bg-[#b85768] transition-colors"
                >
                  <Check size={12} />
                  Submit
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="bg-[#cf6679]/15 border border-[#cf6679]/20 rounded-2xl rounded-br-md px-4 py-3">
                <p className="text-[14px] text-[#ececec] leading-[1.7] whitespace-pre-wrap">
                  {content}
                </p>
              </div>
              {/* Edit button on hover */}
              {onEdit && (
                <button
                  onClick={() => {
                    setEditValue(content);
                    setIsEditing(true);
                  }}
                  className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[#333333] text-[#6b6b6b] hover:text-[#a0a0a0] transition-all opacity-0 group-hover:opacity-100"
                  title="Edit message"
                >
                  <Pencil size={13} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-[11px] text-[#6b6b6b] mr-1">
          {format(timestamp, "h:mm a")}
        </span>
      </div>
    </motion.div>
  );
};

export default UserMessage;
