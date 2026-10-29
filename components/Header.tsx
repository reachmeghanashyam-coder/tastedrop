"use client";

import React from "react";
import { Sparkles, ShoppingBag, ShieldCheck } from "lucide-react";
import { TasteDropLogo } from "./TasteDropLogo";

interface HeaderProps {
  mode: "baseline" | "tastedrop";
  onToggleMode: (mode: "baseline" | "tastedrop") => void;
  onOpenTelemetry: () => void;
  isSimulating: boolean;
}

export function Header({ mode, onToggleMode, onOpenTelemetry, isSimulating }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <TasteDropLogo />
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emeraldVibe animate-pulse" />
            <span>Store: <strong className="text-neutral-900 font-medium">Apex Modern</strong></span>
          </div>
        </div>

        {/* Center / Action Controls: The Comparative Split-Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-full bg-neutral-100 border border-neutral-200/80 shadow-inner">
            <button
              onClick={() => onToggleMode("baseline")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                mode === "baseline"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/60"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${mode === "baseline" ? "bg-rose-500" : "bg-neutral-300"}`} />
              Standard Recommender
            </button>
            <button
              onClick={() => onToggleMode("tastedrop")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                mode === "tastedrop"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${mode === "tastedrop" ? "bg-emeraldVibe animate-pulse" : "bg-neutral-300"}`} />
              <Sparkles className="w-3.5 h-3.5 text-emeraldVibe" />
              TasteDrop Activated
            </button>
          </div>

          {/* The Back Door Button */}
          <button
            onClick={onOpenTelemetry}
            className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <span>⚡ REVEAL THE MAGIC</span>
          </button>
        </div>
      </div>
    </header>
  );
}
