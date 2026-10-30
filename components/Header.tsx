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

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Reveal The Magic / Inspect Graph HUD Button */}
          <button
            onClick={onOpenTelemetry}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 hover:text-neutral-950 text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
            title="Open real-time Qloo cultural taste graph HUD"
          >
            <span className="text-amber-500 font-bold text-xs">⚡</span>
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Inspect Taste Graph</span>
          </button>
        </div>
      </div>
    </header>
  );
}
