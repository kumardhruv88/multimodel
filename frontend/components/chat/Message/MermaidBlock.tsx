"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";

interface MermaidBlockProps {
  code: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#cf6679",
            primaryTextColor: "#ececec",
            primaryBorderColor: "#3a3a3a",
            lineColor: "#6b6b6b",
            secondaryColor: "#2a2a2a",
            tertiaryColor: "#1e1e2e",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
          },
          flowchart: { curve: "basis", padding: 15 },
          sequence: { mirrorActors: false },
        });

        const { svg: renderedSvg } = await mermaid.render(idRef.current, code.trim());
        if (!cancelled) {
          setSvg(renderedSvg);
          setError("");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to render diagram");
          setSvg("");
        }
      }
    };

    renderDiagram();
    return () => { cancelled = true; };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-[#3a3a3a] bg-[#1e1e2e] p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Code2 size={14} className="text-[#f87171]" />
          <span className="text-[11px] text-[#f87171] font-medium">Diagram Error</span>
        </div>
        <pre className="text-[12px] text-[#6b6b6b] font-mono whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#1e1e2e] mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a3a]">
        <span className="text-[11px] text-[#6b6b6b] uppercase tracking-wider font-medium">
          mermaid diagram
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 text-[11px] text-[#6b6b6b] hover:text-[#ececec] transition-colors"
          >
            <Code2 size={12} />
            <span>{showCode ? "Diagram" : "Code"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-[#6b6b6b] hover:text-[#ececec] transition-colors"
          >
            {copied ? <Check size={12} className="text-[#4ade80]" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {showCode ? (
        <pre className="p-4 overflow-x-auto">
          <code className="text-[13px] font-mono text-[#ececec] leading-6">{code}</code>
        </pre>
      ) : (
        <div
          ref={containerRef}
          className="p-4 flex justify-center overflow-x-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
};

export default MermaidBlock;
