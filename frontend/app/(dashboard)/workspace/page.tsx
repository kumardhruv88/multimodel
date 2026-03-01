"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🗂️");

  const icons = ["🗂️","💼","🚀","🎨","📚","🔬","💡","🎯"]

  // Fetch workspaces on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/workspaces")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkspaces(data);
        }
      })
      .catch(console.error)
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      const res = await fetch("http://localhost:8000/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon })
      })
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(prev => [...prev, data])
        setName("")
        setDescription("")
        setShowCreate(false)
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/api/workspaces/${id}`, { 
        method: "DELETE" 
      });
      if (res.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-10 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-[#ececec]">
            Workspaces
          </h1>
          <p className="text-sm text-[#a0a0a0] mt-1">
            Organize your chats by project
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 
            bg-[#cf6679] text-white text-sm rounded-lg 
            hover:bg-[#b85566] transition-colors shadow-lg shadow-[#cf6679]/10"
        >
          <Plus size={16} />
          New Workspace
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 rounded-xl border border-[#3a3a3a] 
          bg-[#2a2a2a] shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="mb-3">
            <label className="text-[11px] uppercase tracking-wider text-[#6b6b6b] mb-2 block font-semibold">
              Select Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                    transition-all duration-150
                    ${icon === i 
                      ? 'bg-[#cf6679]/20 border border-[#cf6679] scale-105' 
                      : 'bg-[#333333] hover:bg-[#3a3a3a] border border-transparent'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Workspace name"
              className="w-full bg-[#333333] border border-[#3a3a3a] 
                rounded-lg px-3 py-2 text-sm text-[#ececec] 
                placeholder-[#6b6b6b] outline-none
                focus:border-[#cf6679]/50 transition-colors"
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-[#333333] border border-[#3a3a3a] 
                rounded-lg px-3 py-2 text-sm text-[#ececec] 
                placeholder-[#6b6b6b] outline-none
                focus:border-[#cf6679]/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate}
              className="px-4 py-2 bg-[#cf6679] text-white 
                text-sm font-medium rounded-lg hover:bg-[#b85566] transition-colors">
              Create
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-[#333333] text-[#a0a0a0] 
                text-sm font-medium rounded-lg hover:bg-[#3a3a3a] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {workspaces.length === 0 ? (
        <div className="text-center py-20 text-[#6b6b6b] border border-dashed border-[#3a3a3a] rounded-2xl">
          <div className="text-4xl mb-4">🗂️</div>
          <p className="text-sm font-medium text-[#a0a0a0]">No workspaces yet</p>
          <p className="text-xs mt-1">
            Create one to keep your research and projects organized
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces.map(w => (
            <div key={w.id}
              className="p-5 rounded-xl border border-[#3a3a3a] 
                bg-[#2a2a2a] hover:bg-[#2f2f2f] hover:border-[#4a4a4a]
                transition-all duration-150 group relative cursor-pointer shadow-sm">
              <div className="text-3xl mb-3">{w.icon}</div>
              <div className="text-[15px] font-medium text-[#ececec]">
                {w.name}
              </div>
              {w.description && (
                <div className="text-xs text-[#6b6b6b] mt-1.5 line-clamp-2 leading-relaxed">
                  {w.description}
                </div>
              )}
              <button
                onClick={(e) => handleDelete(w.id, e)}
                className="absolute top-4 right-4 opacity-0 
                  group-hover:opacity-100 transition-opacity
                  w-8 h-8 rounded-lg hover:bg-[#cf6679]/10 hover:text-[#cf6679]
                  flex items-center justify-center text-[#6b6b6b]"
                title="Delete workspace"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
