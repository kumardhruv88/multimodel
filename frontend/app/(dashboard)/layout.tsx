"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen bg-[#212121] overflow-hidden">
      
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile top bar with hamburger */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#1a1a1a] 
        border-b border-[#3a3a3a] z-30 flex md:hidden items-center 
        px-4 gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1 rounded-md hover:bg-[#333333] transition-colors"
        >
          <Menu size={20} className="text-[#a0a0a0]" />
        </button>
        <span className="text-[#ececec] font-semibold text-[15px]">
          NEXUS AI
        </span>
      </div>

      <motion.main
        initial={false}
        animate={{ 
          marginLeft: isMobile ? 0 : (isCollapsed ? 60 : 260),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col h-screen overflow-hidden"
      >
        <div className="flex-1 flex flex-col h-full min-h-0 
          overflow-hidden md:pt-0 pt-12">
          {children}
        </div>
      </motion.main>

      {/* Onboarding Modal — first-time user */}
      <OnboardingModal />

    </div>
  );
}