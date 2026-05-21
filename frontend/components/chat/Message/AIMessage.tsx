"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Loader2, Zap, Clock, Hash } from "lucide-react";
import ThinkingBlock from "./ThinkingBlock";
import MermaidBlock from "./MermaidBlock";

interface MessageMetadata {
  model?: string;
  responseTime?: number;
  tokenCount?: number;
}

interface AIMessageProps {
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  metadata?: MessageMetadata;
  thinkingContent?: string;
  thinkingTime?: number;
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

/* ─── Code Block with Syntax Highlighting ─── */
function CodeBlock({ className, children }: { className?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace("language-", "") || "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mermaid diagrams get their own renderer
  if (lang === "mermaid") {
    return <MermaidBlock code={code} />;
  }

  const lineCount = code.split("\n").length;
  const showLineNumbers = lineCount > 4;

  return (
    <div className="group relative rounded-xl border border-[#2a2a3a] bg-[#1e1e2e] mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a3a] bg-[#1a1a2a]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]/70" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]/70" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]/70" />
          </div>
          <span className="text-[11px] text-[#6b6b6b] uppercase tracking-wider font-medium ml-2">
            {lang || "code"}
          </span>
        </div>
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
      {/* Syntax-highlighted code */}
      <SyntaxHighlighter
        language={lang || "text"}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={{
          margin: 0,
          padding: "16px",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.7",
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: "#4a4a5a",
          fontSize: "11px",
          userSelect: "none",
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono'), 'Fira Code', monospace" }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const AIMessage: React.FC<AIMessageProps> = ({
  content,
  timestamp,
  isStreaming,
  onRegenerate,
  metadata,
  thinkingContent,
  thinkingTime,
}) => {
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

  // Format metadata display
  const metaModel = metadata?.model?.replace("llama-", "LLaMA ").replace("-versatile", "") || "";
  const metaTime = metadata?.responseTime
    ? metadata.responseTime >= 1000
      ? `${(metadata.responseTime / 1000).toFixed(1)}s`
      : `${Math.round(metadata.responseTime)}ms`
    : "";
  const metaTokens = metadata?.tokenCount ? `${metadata.tokenCount} tokens` : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex gap-3 px-4 py-3 max-w-[680px] mx-auto w-full"
    >
      {/* LEFT: Avatar */}
      <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#cf6679] to-[#7c6cf0] flex items-center justify-center mt-1">
        <span className="text-white text-[11px] font-bold">N</span>
      </div>

      {/* RIGHT: Content & Actions */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Thinking block */}
        {thinkingContent && (
          <ThinkingBlock content={thinkingContent} thinkingTime={thinkingTime} />
        )}

        {/* Render extracted images */}
        {imageUrls.map((url, i) => (
          <GeneratedImage key={i} url={url} />
        ))}

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
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
              h4: ({ children }) => (
                <h4 className="text-[15px] font-semibold text-[#d0d0d0] mb-2 mt-4">{children}</h4>
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
                  className="text-[#4a9eff] hover:text-[#6bb3ff] hover:underline underline-offset-2 transition-colors"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-[3px] border-[#cf6679] pl-4 my-3 text-[#a0a0a0] italic bg-[#cf6679]/5 py-2 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-[#3a3a3a] my-6" />
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
                <div className="overflow-x-auto mb-4 rounded-lg border border-[#2a2a3a]">
                  <table className="w-full border-collapse text-[13px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#1e1e2e]">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="border-b border-[#2a2a3a] px-4 py-2.5 text-left text-[#ececec] font-semibold text-[12px] uppercase tracking-wider">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border-b border-[#2a2a3a]/50 px-4 py-2.5 text-[#d0d0d0]">{children}</td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-[#2a2a2a]/30 transition-colors">{children}</tr>
              ),
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return <CodeBlock className={className}>{String(children)}</CodeBlock>;
                }
                return (
                  <code
                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-1.5 py-0.5 text-[#e06c8a] text-[13px] font-mono"
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

        {/* Message Actions & Metadata */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-1 ml-1 flex-wrap">
            <span className="text-[11px] text-[#6b6b6b] mr-2">
              {format(timestamp, "h:mm a")}
            </span>

            {/* Metadata badges */}
            {metadata && (metaModel || metaTime || metaTokens) && (
              <div className="flex items-center gap-2 mr-2">
                {metaModel && (
                  <span className="flex items-center gap-1 text-[10px] text-[#5a5a6a]">
                    <Zap size={9} className="text-[#cf6679]" />
                    {metaModel}
                  </span>
                )}
                {metaTime && (
                  <span className="flex items-center gap-1 text-[10px] text-[#5a5a6a]">
                    <Clock size={9} />
                    {metaTime}
                  </span>
                )}
                {metaTokens && (
                  <span className="flex items-center gap-1 text-[10px] text-[#5a5a6a]">
                    <Hash size={9} />
                    {metaTokens}
                  </span>
                )}
              </div>
            )}

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
