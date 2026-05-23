"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Search,
  FileText,
  Mic,
  Image as ImageIcon,
  LayoutGrid,
  Zap,
  ArrowRight,
  Github,
  Mail,
  Bot,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "RAG Document Intelligence",
    desc: "Upload PDFs, docs, and text files. NEXUS chunks, embeds, and retrieves the most relevant passages to ground every answer in your own data.",
    gradient: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: Search,
    title: "Real-Time Web Search",
    desc: "Toggle web search on any message. NEXUS queries the internet via Tavily AI, synthesizes results, and cites every source inline.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Mic,
    title: "Voice Conversations",
    desc: "Speak your questions using the browser's Speech API. Get responses read back with natural ElevenLabs or browser TTS voices.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    desc: "Describe any image and watch it appear inline. Powered by Together AI's FLUX model with automatic prompt enhancement.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Workspace Organization",
    desc: "Group related threads into workspaces, each with its own documents and context — like Claude's Projects, but free.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Responses",
    desc: "Powered by Groq's ultra-fast inference. Llama 3.3 70B at 500+ tokens/second — responses feel instant, not sluggish.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/10 border-pink-500/20",
  },
];

const steps = [
  {
    num: "01",
    title: "Sign in with Google",
    desc: "One click. No passwords, no forms. Clerk handles secure authentication so you can jump straight in.",
  },
  {
    num: "02",
    title: "Upload docs or start chatting",
    desc: "Drop your PDFs and notes, or just start typing. NEXUS adapts to your workflow — research, code, or create.",
  },
  {
    num: "03",
    title: "Get cited, intelligent answers",
    desc: "Every response is grounded in your documents or live web data. See exactly where each answer comes from.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const HeroBackground3D = dynamic(
  () => import("@/components/ui/hero-background-3d"),
  { ssr: false }
);

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full min-h-screen"
        >
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e05a7a] to-[#a855f7] flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">NEXUS AI</span>
        </a>



        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/sign-in")}
            className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors rounded-full"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/chat/new")}
            className="px-5 py-2 bg-[#e05a7a] hover:bg-[#c9506c] text-white text-sm font-medium rounded-full transition-all hover:shadow-lg hover:shadow-[#e05a7a]/20"
          >
            Try Free
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        {/* Background effects */}
        <HeroBackground3D />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(224,90,122,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_60%,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />

        {/* Canvas Edge Blending Overlays for smooth scroll transitions */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#0d0d0d_95%)] pointer-events-none z-1" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/70 to-transparent pointer-events-none z-1" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-4xl"
        >
          <h1 className="text-[clamp(24px,4.2vw,48px)] font-bold leading-tight tracking-tight flex flex-wrap justify-center gap-x-3 md:gap-x-5">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-white"
            >
              Think Deeper
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-white"
            >
              Create Faster
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-r from-[#e05a7a] to-[#a855f7] bg-clip-text text-transparent"
            >
              Know More
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.6 }}
            className="mt-6 text-[#888] text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            An AI that searches the web, understands your documents, and
            remembers your work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            className="mt-10 flex flex-col items-center"
          >
            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex flex-col items-center gap-2.5 text-xs font-semibold tracking-widest text-[#888] hover:text-white uppercase transition-colors pointer-events-auto"
            >
              <span>Scroll to Explore</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={15} className="rotate-90 text-[#e05a7a]" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== CHAT MOCKUP CONTAINER ===== */}
      <section className="relative z-10 px-6 flex justify-center -mt-20 md:-mt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#e05a7a]/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="ml-3 text-xs text-[#555]">NEXUS AI Chat</span>
            </div>
            {/* User message */}
            <div className="flex gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#2d2d3a] flex items-center justify-center text-[11px] font-semibold text-[#aaa] flex-shrink-0">D</div>
              <div className="bg-[#2d2d3a] rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-[#eee] max-w-md">
                Summarize the key findings from my research paper
              </div>
            </div>
            {/* AI response */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e05a7a] to-[#a855f7] flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="text-sm text-[#aaa] leading-relaxed">
                Based on your document, the key findings include three main areas: the novel architecture achieves <strong className="text-white">94.2% accuracy</strong> on benchmark tests...<span className="inline-block w-0.5 h-4 bg-[#e05a7a] animate-pulse ml-0.5 align-middle" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-6 max-w-6xl mx-auto" id="features">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need.{" "}
            <span className="text-[#555]">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-3 text-[#888] text-base max-w-lg mx-auto">
            A complete AI workspace built on free-tier APIs — no compromises on
            quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${f.iconBg} border flex items-center justify-center mb-4`}>
                  <Icon size={20} className={f.iconColor} />
                </div>
                <h3 className="text-[15px] font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#0d0d0d]" id="how">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center text-3xl md:text-4xl font-bold tracking-tight mb-14"
          >
            Up and running in{" "}
            <span className="text-[#e05a7a]">60 seconds</span>
          </motion.h2>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <span className="text-4xl font-bold text-[#e05a7a]/40 leading-none flex-shrink-0 w-12">
                  {s.num}
                </span>
                <div>
                  <h3 className="font-semibold text-[15px] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#888] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(224,90,122,0.08),transparent_60%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to think deeper?
          </h2>
          <p className="text-[#888] text-base mb-8">
            Try NEXUS AI free — no sign-up needed. Sign in for unlimited access.
          </p>
          <button
            onClick={() => router.push("/chat/new")}
            className="group px-8 py-3.5 bg-[#e05a7a] hover:bg-[#c9506c] text-white font-semibold rounded-full text-base inline-flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-[#e05a7a]/25"
          >
            Try it Now
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative bg-[#080808] border-t border-white/[0.04] pt-16 pb-8 px-6 md:px-10 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e05a7a] to-[#a855f7] flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">NEXUS AI</span>
            </div>
            <p className="text-xs text-[#666] leading-relaxed">
              Think deeper, create faster, and know more with the ultimate AI-powered workspace. Powered by cutting-edge intelligence.
            </p>
          </div>

          {/* Columns */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs text-[#666]">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/chat/new" className="hover:text-white transition-colors">Try Free</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Releases</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs text-[#666]">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="mailto:hello@nexus-ai.com" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-[#666]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & socials */}
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#555] text-xs">© {new Date().getFullYear()} NEXUS AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/20 transition-all">
              <Github size={14} />
            </a>
            <a href="mailto:hello@nexus-ai.com" className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/20 transition-all">
              <Mail size={14} />
            </a>
          </div>
        </div>
      </footer>
        </motion.div>
    </div>
  );
}
