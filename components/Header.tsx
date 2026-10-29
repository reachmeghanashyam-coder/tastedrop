"use client";

import React from "react";
import { TasteDropLogo } from "./TasteDropLogo";

interface HeaderProps {
  mode: "baseline" | "tastedrop";
  onToggleMode: (mode: "baseline" | "tastedrop") => void;
  onOpenTelemetry: () => void;
  isSimulating: boolean;
}

export function Header({ mode, onToggleMode, onOpenTelemetry }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Standalone Pure Brand Lockup */}
        <div className="flex items-center shrink-0">
          <TasteDropLogo />
        </div>

        {/* Precision Segmented Controls */}
        <div className="flex items-center gap-2.5">
          {/* Segmented Dual Switch */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-100 border border-neutral-200 shadow-inner">
            <button
              onClick={() => onToggleMode("baseline")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                mode === "baseline"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/70"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mode === "baseline" ? "bg-rose-500" : "bg-neutral-300"}`} />
              <span>Standard Baseline</span>
            </button>
            <button
              onClick={() => onToggleMode("tastedrop")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                mode === "tastedrop"
                  ? "bg-neutral-900 text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mode === "tastedrop" ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"}`} />
              <span>TasteDrop Active</span>
            </button>
          </div>

          {/* Reveal The Magic / Inspect Graph HUD Button (Secondary Ghost Pill) */}
          <button
            onClick={onOpenTelemetry}
            className="px-3 py-1 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-neutral-950 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 shrink-0"
            title="Open real-time Qloo cultural taste graph HUD"
          >
            <span className="text-amber-500 font-bold text-xs">⚡</span>
            <span className="font-mono text-[11px] uppercase tracking-wider">Reveal The Magic</span>
          </button>
        </div>
      </div>
    </header>
  );
}
