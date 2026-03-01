"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import SearchModal from "@/components/SearchModal";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import {
  PanelLeftClose,
  PanelRightOpen,
  Plus,
  Search,
  MessageSquare,
  LayoutGrid,
  FileStack,
  Box,
  Settings,
  Trash2,
  Pin,
  PinOff,
  Pencil,
  Download,
  MoreHorizontal,
  X,
  Check,
} from "lucide-react";

interface Thread {
  id: string;
  title: string;
  created_at: string;
  is_pinned?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function groupThreadsByDate(threads: Thread[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const oneWeekAgo = new Date(today.getTime() - 7 * 86400000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 86400000);

  // Separate pinned threads
  const pinned = threads.filter((t) => t.is_pinned);
  const unpinned = threads.filter((t) => !t.is_pinned);

  const groups: { label: string; threads: Thread[] }[] = [];

  if (pinned.length > 0) {
    groups.push({ label: "📌 Pinned", threads: pinned });
  }

  const dateGroups: { label: string; threads: Thread[] }[] = [
    { label: "Today", threads: [] },
    { label: "Yesterday", threads: [] },
    { label: "Previous 7 Days", threads: [] },
    { label: "Previous 30 Days", threads: [] },
    { label: "Older", threads: [] },
  ];

  unpinned.forEach((t) => {
    const d = new Date(t.created_at);
    if (d >= today) dateGroups[0].threads.push(t);
    else if (d >= yesterday) dateGroups[1].threads.push(t);
    else if (d >= oneWeekAgo) dateGroups[2].threads.push(t);
    else if (d >= oneMonthAgo) dateGroups[3].threads.push(t);
    else dateGroups[4].threads.push(t);
  });

  return [...groups, ...dateGroups.filter((g) => g.threads.length > 0)];
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [contextMenu, setContextMenu] = useState<{ threadId: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchThreads = () => {
      // Only load chat history for signed-in users
      const isSignedIn = document.cookie.includes("__clerk") || document.cookie.includes("__session");
      if (!isSignedIn) {
        setThreads([]);
        return;
      }
      fetch("http://localhost:8000/api/threads")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setThreads(data);
        })
        .catch((err) => console.error("Failed to fetch threads:", err));
    };

    fetchThreads();
    window.addEventListener("nexus-thread-updated", fetchThreads);
    return () => window.removeEventListener("nexus-thread-updated", fetchThreads);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "n") {
        e.preventDefault();
        router.push(`/chat/${uuidv4()}`);
      }
      if (isMod && e.key === "b") {
        e.preventDefault();
        onToggleCollapse();
      }
      if (isMod && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, onToggleCollapse]);

  // Close context menu on click outside
  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [contextMenu]);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleDelete = async (threadId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/threads/${threadId}`, { method: "DELETE" });
      if (res.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        if (pathname === `/chat/${threadId}`) router.push("/chat/home");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleRename = async (threadId: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await fetch(`http://localhost:8000/api/threads/${threadId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: renameValue.trim() } : t))
      );
    } catch (err) {
      console.error("Failed to rename:", err);
    }
    setRenamingId(null);
  };

  const handlePin = async (threadId: string, pinned: boolean) => {
    try {
      await fetch(`http://localhost:8000/api/threads/${threadId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, is_pinned: pinned } : t))
      );
    } catch (err) {
      console.error("Failed to pin:", err);
    }
  };

  const handleExport = async (threadId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/threads/${threadId}/export?format=md`);
      const data = await res.json();
      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus-chat-${threadId.slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export:", err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, threadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ threadId, x: e.clientX, y: e.clientY });
  };

  const user = { firstName: "Dhruv", imageUrl: null as string | null };

  const navItems = [
    { icon: Search, label: "Search", onClick: () => setSearchOpen(true) },
    { type: "divider" },
    { icon: MessageSquare, label: "Chats", onClick: () => router.push("/chat/home") },
    { icon: LayoutGrid, label: "Workspaces", onClick: () => router.push("/workspace") },
    { icon: FileStack, label: "Documents", onClick: () => router.push("/documents") },
    { icon: Box, label: "Artifacts", onClick: () => router.push("/artifacts") },
  ];

  const grouped = groupThreadsByDate(threads);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`h-14 flex items-center border-b border-[rgba(255,255,255,0.06)] flex-shrink-0 ${isCollapsed ? "justify-center px-0" : "px-4"}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-lg bg-[#cf6679] flex items-center justify-center">
            <span className="text-white text-[14px] font-bold">N</span>
          </div>
          {!isCollapsed && <span className="text-[#ececec] font-semibold text-[15px] ml-2">NEXUS AI</span>}
        </div>
        {!isCollapsed && (
          <button onClick={onToggleCollapse} className="ml-auto p-1 rounded-md hover:bg-[#333333] transition-colors">
            <PanelLeftClose size={16} className="text-[#a0a0a0] hover:text-[#ececec]" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      {!isCollapsed && (
        <div className="px-3 pt-2 flex-shrink-0">
          <WorkspaceSelector />
        </div>
      )}

      {/* New Chat */}
      <div className={`px-3 pt-2 pb-1 flex-shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => router.push(`/chat/${uuidv4()}`)}
          className={`w-full flex items-center h-9 px-3 rounded-lg hover:bg-[#333333] transition-all duration-150 group ${isCollapsed ? "justify-center" : "gap-2"}`}
        >
          <Plus size={16} className="text-[#a0a0a0] shrink-0" />
          {!isCollapsed && <span className="text-sm text-[#ececec] font-medium">New chat</span>}
        </button>
      </div>

      {/* Nav Links */}
      <div className="px-3 py-1 flex-shrink-0">
        {navItems.map((item, index) => {
          if (item.type === "divider") {
            return !isCollapsed ? (
              <div key={`d-${index}`} className="border-t border-[rgba(255,255,255,0.06)] my-1" />
            ) : (
              <div key={`d-${index}`} className="h-4" />
            );
          }
          const Icon = item.icon!;
          return (
            <div key={item.label} onClick={item.onClick}
              className={`flex items-center rounded-lg cursor-pointer hover:bg-[#333333] transition-all duration-150 text-[#a0a0a0] hover:text-[#ececec] group h-9 ${isCollapsed ? "justify-center px-0 mb-1" : "gap-2 px-3"}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={16} className="group-hover:text-[#ececec]" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </div>
          );
        })}
      </div>

      {/* Expand button */}
      {isCollapsed && (
        <div className="px-3 py-1 flex justify-center">
          <button onClick={onToggleCollapse} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#333333] transition-colors" title="Expand sidebar">
            <PanelRightOpen size={16} className="text-[#a0a0a0] hover:text-[#ececec]" />
          </button>
        </div>
      )}

      {/* Thread List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          {grouped.length === 0 && (
            <div className="text-[12px] text-[#6b6b6b] text-center py-6">No conversations yet</div>
          )}
          {grouped.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="text-[11px] uppercase tracking-widest text-[#6b6b6b] px-3 mb-1 font-semibold">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.threads.map((thread) => {
                  const isActive = pathname === `/chat/${thread.id}`;
                  const isRenaming = renamingId === thread.id;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => !isRenaming && router.push(`/chat/${thread.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, thread.id)}
                      className={`h-9 flex items-center px-3 rounded-lg text-sm cursor-pointer transition-all duration-150 group relative ${
                        isActive
                          ? "bg-[#333333] text-[#ececec] font-medium border-l-2 border-[#cf6679]"
                          : "text-[#a0a0a0] hover:bg-[#333333] hover:text-[#ececec]"
                      }`}
                    >
                      {thread.is_pinned && <Pin size={10} className="text-[#cf6679] mr-1.5 flex-shrink-0" />}

                      {isRenaming ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleRename(thread.id); }}
                          className="flex items-center gap-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRename(thread.id)}
                            className="flex-1 bg-transparent text-[#ececec] text-sm outline-none border-b border-[#cf6679]"
                          />
                          <button type="submit" className="p-0.5">
                            <Check size={12} className="text-[#4ade80]" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="truncate flex-1">{thread.title || "Untitled"}</span>
                          <button
                            onClick={(e) => handleContextMenu(e, thread.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#444444] text-[#6b6b6b] hover:text-[#a0a0a0] transition-all flex-shrink-0 ml-1"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom User Area */}
      <div className={`mt-auto border-t border-[rgba(255,255,255,0.06)] p-3 flex-shrink-0 ${isCollapsed ? "flex justify-center px-0" : ""}`}>
        <div onClick={() => router.push("/settings")}
          className={`flex items-center rounded-lg hover:bg-[#333333] cursor-pointer transition-all duration-150 group ${isCollapsed ? "w-9 h-9 justify-center" : "gap-2 h-10 px-2"}`}
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.firstName || "User"} className="w-[26px] h-[26px] rounded-full object-cover" />
          ) : (
            <div className="w-[26px] h-[26px] rounded-full bg-[#cf6679] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold uppercase">{user?.firstName?.charAt(0) || "U"}</span>
            </div>
          )}
          {!isCollapsed && (
            <>
              <span className="text-sm text-[#ececec] font-medium truncate flex-1">{user?.firstName || "Settings"}</span>
              <Settings size={14} className="text-[#6b6b6b] group-hover:text-[#a0a0a0]" />
            </>
          )}
        </div>
      </div>
    </>
  );

  const ctxThread = contextMenu ? threads.find((t) => t.id === contextMenu.threadId) : null;

  return (
    <>
      {/* Desktop */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 60 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)" }}
        className="fixed left-0 top-0 h-screen bg-[#1a1a1a] flex-col z-50 overflow-hidden hidden md:flex"
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-[#1a1a1a] flex flex-col z-50 md:hidden"
              style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)" }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && ctxThread && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-[100] w-48 py-1.5 rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] shadow-2xl shadow-black/50"
          >
            <button
              onClick={() => {
                setRenamingId(ctxThread.id);
                setRenameValue(ctxThread.title || "");
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#a0a0a0] hover:bg-[#333333] hover:text-[#ececec] transition-colors"
            >
              <Pencil size={13} /> Rename
            </button>
            <button
              onClick={() => {
                handlePin(ctxThread.id, !ctxThread.is_pinned);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#a0a0a0] hover:bg-[#333333] hover:text-[#ececec] transition-colors"
            >
              {ctxThread.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
              {ctxThread.is_pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={() => {
                handleExport(ctxThread.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#a0a0a0] hover:bg-[#333333] hover:text-[#ececec] transition-colors"
            >
              <Download size={13} /> Export
            </button>
            <div className="border-t border-[#3a3a3a] my-1" />
            <button
              onClick={() => {
                handleDelete(ctxThread.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#cf6679] hover:bg-[#cf6679]/10 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Sidebar;
