"use client";
import React, { useState, useEffect } from "react";
import {
  Cpu,
  Volume2,
  Keyboard,
  Info,
  Check,
  Brain,
  Trash2,
  Plus,
} from "lucide-react";

const tabs = [
  { id: "ai", label: "AI Settings", icon: Cpu },
  { id: "voice", label: "Voice", icon: Volume2 },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "about", label: "About", icon: Info },
];

const shortcuts = [
  { keys: ["Ctrl", "N"], desc: "New chat" },
  { keys: ["Ctrl", "B"], desc: "Toggle sidebar" },
  { keys: ["Ctrl", "K"], desc: "Search chats" },
  { keys: ["Ctrl", "Shift", "S"], desc: "Toggle web search" },
  { keys: ["Enter"], desc: "Send message" },
  { keys: ["Shift", "Enter"], desc: "New line" },
  { keys: ["Esc"], desc: "Close modals" },
];

interface Memory {
  id: string;
  content: string;
  category: string;
  created_at: string;
}

function MemoryTab() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/memories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMemories(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addMemory = async () => {
    if (!newContent.trim()) return;
    try {
      const res = await fetch("http://localhost:8000/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), category: newCategory }),
      });
      const data = await res.json();
      if (data.id) setMemories((prev) => [data, ...prev]);
      setNewContent("");
    } catch {}
  };

  const deleteMemory = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/memories/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch {}
  };

  const categoryColors: Record<string, string> = {
    general: "#a0a0a0",
    preference: "#4ade80",
    fact: "#4a9eff",
    project: "#fb923c",
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[#6b6b6b]">
        Memories help NEXUS remember facts about you across conversations.
      </p>

      {/* Add new memory */}
      <div className="p-4 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] space-y-3">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="e.g. I prefer TypeScript over JavaScript"
          className="w-full bg-transparent text-[13px] text-[#ececec] placeholder-[#6b6b6b] outline-none resize-none"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Object.keys(categoryColors).map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] capitalize transition-all ${
                  newCategory === cat
                    ? "bg-[#cf6679] text-white"
                    : "bg-[#333333] text-[#a0a0a0] hover:bg-[#3a3a3a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={addMemory}
            disabled={!newContent.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#cf6679] text-white text-[12px] font-medium hover:bg-[#b85768] transition-all disabled:opacity-40"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Memory list */}
      {loading ? (
        <div className="text-[12px] text-[#6b6b6b] text-center py-6">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-8">
          <Brain size={32} className="mx-auto text-[#3a3a3a] mb-2" />
          <p className="text-[13px] text-[#6b6b6b]">No memories saved yet</p>
          <p className="text-[11px] text-[#4a4a4a] mt-1">Add facts about yourself for personalized responses</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((m) => (
            <div
              key={m.id}
              className="group flex items-start gap-3 p-3 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] hover:border-[#3a3a3a] transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#ececec]">{m.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{
                      color: categoryColors[m.category] || "#a0a0a0",
                      backgroundColor: `${categoryColors[m.category] || "#a0a0a0"}15`,
                    }}
                  >
                    {m.category}
                  </span>
                  <span className="text-[10px] text-[#4a4a4a]">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteMemory(m.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#333333] text-[#6b6b6b] hover:text-[#cf6679] transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [webSearchDefault, setWebSearchDefault] = useState(false);
  const [responseStyle, setResponseStyle] = useState("balanced");
  const [speakingRate, setSpeakingRate] = useState("1");
  const [autoPlayVoice, setAutoPlayVoice] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = (k: string) => localStorage.getItem(k);
    if (s("nexus_model")) setModel(s("nexus_model")!);
    if (s("nexus_tts")) setTtsEnabled(s("nexus_tts") === "true");
    if (s("nexus_websearch")) setWebSearchDefault(s("nexus_websearch") === "true");
    if (s("nexus_response_style")) setResponseStyle(s("nexus_response_style")!);
    if (s("nexus_speaking_rate")) setSpeakingRate(s("nexus_speaking_rate")!);
    if (s("nexus_autoplay_voice")) setAutoPlayVoice(s("nexus_autoplay_voice") === "true");
  }, []);

  const handleSave = () => {
    localStorage.setItem("nexus_model", model);
    localStorage.setItem("nexus_tts", String(ttsEnabled));
    localStorage.setItem("nexus_websearch", String(webSearchDefault));
    localStorage.setItem("nexus_response_style", responseStyle);
    localStorage.setItem("nexus_speaking_rate", speakingRate);
    localStorage.setItem("nexus_autoplay_voice", String(autoPlayVoice));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const models = [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", desc: "Best quality" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", desc: "Fastest" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", desc: "Balanced" },
  ];

  const styles = [
    { id: "concise", label: "Concise", desc: "Short, direct answers" },
    { id: "balanced", label: "Balanced", desc: "Mix of detail and brevity" },
    { id: "detailed", label: "Detailed", desc: "In-depth explanations" },
  ];

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${
        enabled ? "bg-[#cf6679]" : "bg-[#3a3a3a]"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </div>
  );

  return (
    <div className="max-w-[780px] mx-auto px-6 py-10 font-sans">
      <h1 className="text-xl font-medium text-[#ececec] mb-1">Settings</h1>
      <p className="text-sm text-[#a0a0a0] mb-6">Customize your NEXUS AI experience</p>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#2a2a2a] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "text-[#ececec] border-b-2 border-[#cf6679] bg-[#2a2a2a]/40"
                : "text-[#6b6b6b] hover:text-[#a0a0a0]"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Settings Tab */}
      {activeTab === "ai" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-[13px] uppercase tracking-widest text-[#6b6b6b] mb-3 font-semibold">
              Default Model
            </h2>
            <div className="flex flex-col gap-2">
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    model === m.id
                      ? "border-[#cf6679] bg-[#cf6679]/10"
                      : "border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#333333]"
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-normal text-[#ececec]">{m.name}</div>
                    <div className="text-xs text-[#6b6b6b] mt-0.5">{m.desc}</div>
                  </div>
                  {model === m.id && (
                    <div className="w-4 h-4 rounded-full bg-[#cf6679] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[13px] uppercase tracking-widest text-[#6b6b6b] mb-3 font-semibold">
              Response Style
            </h2>
            <div className="flex gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setResponseStyle(s.id)}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-center transition-all ${
                    responseStyle === s.id
                      ? "border-[#cf6679] bg-[#cf6679]/10 text-[#ececec]"
                      : "border-[#3a3a3a] bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#333333]"
                  }`}
                >
                  <div className="text-[13px] font-medium">{s.label}</div>
                  <div className="text-[11px] text-[#6b6b6b] mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a]">
            <div>
              <div className="text-[14px] font-normal text-[#ececec]">Web Search by Default</div>
              <div className="text-xs text-[#6b6b6b] mt-0.5">Always search the web for answers</div>
            </div>
            <Toggle enabled={webSearchDefault} onToggle={() => setWebSearchDefault(!webSearchDefault)} />
          </div>
        </div>
      )}

      {/* Voice Tab */}
      {activeTab === "voice" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a]">
            <div>
              <div className="text-[14px] font-normal text-[#ececec]">Voice Responses</div>
              <div className="text-xs text-[#6b6b6b] mt-0.5">AI speaks responses aloud</div>
            </div>
            <Toggle enabled={ttsEnabled} onToggle={() => setTtsEnabled(!ttsEnabled)} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a]">
            <div>
              <div className="text-[14px] font-normal text-[#ececec]">Auto-Play Voice</div>
              <div className="text-xs text-[#6b6b6b] mt-0.5">Automatically read new responses</div>
            </div>
            <Toggle enabled={autoPlayVoice} onToggle={() => setAutoPlayVoice(!autoPlayVoice)} />
          </div>

          <div className="p-4 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a]">
            <div className="text-[14px] font-normal text-[#ececec] mb-2">Speaking Rate</div>
            <div className="flex gap-2">
              {["0.75", "1", "1.25", "1.5"].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeakingRate(rate)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    speakingRate === rate
                      ? "bg-[#cf6679] text-white"
                      : "bg-[#333333] text-[#a0a0a0] hover:bg-[#3a3a3a]"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === "memory" && (
        <MemoryTab />
      )}

      {/* Shortcuts Tab */}
      {activeTab === "shortcuts" && (
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]"
            >
              <span className="text-[13px] text-[#a0a0a0]">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-[11px] font-mono text-[#ececec] bg-[#2a2a2a] border border-[#3a3a3a] rounded-md shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* About Tab */}
      {activeTab === "about" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#cf6679] flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#ececec]">NEXUS AI</div>
                <div className="text-[11px] text-[#6b6b6b]">v0.1.0-alpha</div>
              </div>
            </div>
            <p className="text-[13px] text-[#a0a0a0] leading-relaxed">
              An AI workspace that searches the web, understands your documents, and remembers your work.
              Built with Next.js, FastAPI, Groq, and Supabase.
            </p>
          </div>
          <div className="text-[11px] text-[#6b6b6b]">
            Made by Dhruv · Powered by Llama 3.3 via Groq
          </div>
        </div>
      )}

      {/* Save Button (for AI and Voice tabs) */}
      {(activeTab === "ai" || activeTab === "voice") && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              saved
                ? "bg-green-600 text-white"
                : "bg-[#cf6679] text-white hover:bg-[#cf6679]/90 shadow-lg shadow-[#cf6679]/20"
            }`}
          >
            {saved ? (
              <>
                <Check size={14} />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
