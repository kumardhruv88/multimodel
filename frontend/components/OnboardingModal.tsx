"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Upload, Rocket, X, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Rocket,
    title: "Welcome to NEXUS AI",
    description: "Your intelligent AI companion that searches the web, understands your documents, and remembers your work.",
    color: "#cf6679",
  },
  {
    icon: MessageSquare,
    title: "Start chatting",
    description: "Type a message below to begin. Use prompt templates for quick starts, or just ask anything.",
    color: "#4a9eff",
  },
  {
    icon: Upload,
    title: "Upload documents",
    description: "Click the paperclip icon to upload PDFs, docs, or text files. NEXUS will use them to answer your questions accurately.",
    color: "#4ade80",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("nexus-onboarding-done");
    if (!dismissed) setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("nexus-onboarding-done", "true");
  };

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else dismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] z-[301]"
          >
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-8 text-center relative">
              {/* Skip */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-[11px] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
              >
                Skip
              </button>

              {/* Icon */}
              <motion.div
                key={step}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${slides[step].color}15` }}
              >
                {(() => {
                  const Icon = slides[step].icon;
                  return <Icon size={28} style={{ color: slides[step].color }} />;
                })()}
              </motion.div>

              {/* Content */}
              <motion.div
                key={`content-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-[20px] font-semibold text-[#ececec] mb-3">
                  {slides[step].title}
                </h2>
                <p className="text-[13px] text-[#a0a0a0] leading-relaxed mb-8">
                  {slides[step].description}
                </p>
              </motion.div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mb-6">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === step ? "bg-[#cf6679] w-6" : "bg-[#3a3a3a]"
                    }`}
                  />
                ))}
              </div>

              {/* Button */}
              <button
                onClick={next}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#cf6679] hover:bg-[#b85768] text-white text-[14px] font-medium transition-all"
              >
                {step < slides.length - 1 ? (
                  <>Next <ChevronRight size={14} /></>
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
