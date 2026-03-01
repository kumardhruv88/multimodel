"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex justify-end px-4 py-3 max-w-[680px] mx-auto w-full"
    >
      <div className="flex flex-col items-end gap-1 max-w-[85%]">
        <div className="bg-[#cf6679]/15 border border-[#cf6679]/20 rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-[14px] text-[#ececec] leading-[1.7] whitespace-pre-wrap">
            {content}
          </p>
        </div>
        <span className="text-[11px] text-[#6b6b6b] mr-1">
          {format(timestamp, "h:mm a")}
        </span>
      </div>
    </motion.div>
  );
};

export default UserMessage;
