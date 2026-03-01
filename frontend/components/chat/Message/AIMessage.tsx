"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

interface AIMessageProps {
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

function GeneratedImage({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="my-2">
      {status === "loading" && (
        <div className="w-full max-w-[400px] h-[300px] rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="text-[#cf6679] animate-spin" />
          <span className="text-[12px] text-[#6b6b6b]">Generating image... (may take 10-15s)</span>
        </div>
      )}
      {status === "error" && (
        <div className="w-full max-w-[400px] h-[200px] rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center">
          <span className="text-[12px] text-[#6b6b6b]">Image failed to load. Try again.</span>
        </div>
      )}
      <img
        src={url}
        alt="Generated Image"
        className={`rounded-xl max-w-full max-h-[400px] object-contain border border-[#3a3a3a] ${status !== "loaded" ? "hidden" : ""}`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

/* ─── Code Block with Copy Button ─── */
function CodeBlock({ className, children }: { className?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace("language-", "") || "plain";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-[#2a2a3a] bg-[#1e1e2e] mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a3a] bg-[#1e1e2e]">
        <span className="text-[11px] text-[#6b6b6b] uppercase tracking-wider font-medium">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b] hover:text-[#ececec] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#4ade80]" />
              <span className="text-[#4ade80]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-[13px] font-mono text-[#ececec] leading-6">{code}</code>
      </pre>
    </div>
  );
}

const AIMessage: React.FC<AIMessageProps> = ({ content, timestamp, isStreaming, onRegenerate }) => {
  const [msgCopied, setMsgCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  };

  // Extract image URLs from [NEXUS_IMAGE:url] markers
  const imageRegex = /\[NEXUS_IMAGE:(.*?)\]/g;
  const imageUrls: string[] = [];
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    imageUrls.push(match[1]);
  }
  const textContent = content.replace(/\[NEXUS_IMAGE:.*?\]\n*/g, "").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex gap-3 px-4 py-3 max-w-[680px] mx-auto w-full"
    >
      {/* LEFT: Avatar */}
      <div className="w-7 h-7 shrink-0 rounded-full bg-[#cf6679] flex items-center justify-center mt-1">
        <span className="text-white text-[11px] font-bold">N</span>
      </div>

      {/* RIGHT: Content & Actions */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Render extracted images directly */}
        {imageUrls.map((url, i) => (
          <GeneratedImage key={i} url={url} />
        ))}

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-[14px] text-[#ececec] leading-7 mb-3">
                  {children}
                  {isStreaming && (
                    <span className="inline-block w-[2px] h-[16px] bg-[#cf6679] ml-1 animate-pulse align-middle" />
                  )}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#ececec]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[#a0a0a0]">{children}</em>
              ),
              h1: ({ children }) => (
                <h1 className="text-[24px] font-semibold text-[#ececec] border-b border-[#3a3a3a] pb-2 mb-4 mt-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-[20px] font-semibold text-[#ececec] mb-3 mt-6">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-[17px] font-semibold text-[#ececec] mb-2 mt-5">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-5 mb-3 space-y-1 text-[14px] text-[#ececec]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-5 mb-3 space-y-1 text-[14px] text-[#ececec]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-[14px] text-[#ececec] leading-7">{children}</li>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4a9eff] hover:underline"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-[3px] border-[#cf6679] pl-4 my-3 text-[#a0a0a0] italic">
                  {children}
                </blockquote>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || "Generated Image"}
                  className="rounded-xl max-w-full max-h-[400px] object-contain my-3 border border-[#3a3a3a]"
                  loading="lazy"
                />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse text-[13px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#2a2a2a]">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="border border-[#3a3a3a] px-3 py-2 text-left text-[#ececec] font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-[#3a3a3a] px-3 py-2 text-[#ececec]">{children}</td>
              ),
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return <CodeBlock className={className}>{String(children)}</CodeBlock>;
                }
                return (
                  <code
                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-1.5 py-0.5 text-[#cf6679] text-[13px] font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {textContent}
          </ReactMarkdown>
        </div>

        {/* Message Actions & Timestamp */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <span className="text-[11px] text-[#6b6b6b] mr-2">
              {format(timestamp, "h:mm a")}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopyMessage}
                className="p-1.5 rounded-md hover:bg-[#333333] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                title="Copy message"
              >
                {msgCopied ? <Check size={13} className="text-[#4ade80]" /> : <Copy size={13} />}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md hover:bg-[#333333] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw size={13} />
                </button>
              )}
              <button
                className="p-1.5 rounded-md hover:bg-[#333333] text-[#6b6b6b] hover:text-[#4ade80] transition-colors"
                title="Good response"
              >
                <ThumbsUp size={13} />
              </button>
              <button
                className="p-1.5 rounded-md hover:bg-[#333333] text-[#6b6b6b] hover:text-[#f87171] transition-colors"
                title="Bad response"
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIMessage;
