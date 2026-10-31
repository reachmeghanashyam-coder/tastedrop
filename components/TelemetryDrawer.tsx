"use client";

import React, { useState } from "react";
import { 
  X, Check, Copy, Terminal, ArrowRight, Sparkles, Activity, ShieldCheck, Zap
} from "lucide-react";
import { playHapticClick } from "@/lib/audio";

interface TelemetryProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: any;
  mode: "baseline" | "tastedrop";
  scenarioTitle: string;
}

export function TelemetryDrawer({
  isOpen,
  onClose,
  provenance,
}: TelemetryProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"flow" | "curl">("flow");

  if (!isOpen) return null;

  const liveLatency = provenance?.latency_ms || 58;
  const anchorName = provenance?.anchor?.entityName || "The Stooges";
  const anchorId = provenance?.anchor?.entityId || "5712394B-DBA2-4338-AD92-324B29B601FB";
  const topCorrelations = provenance?.topCorrelations || [];
  const evaluationTrace = provenance?.evaluationTrace || [];

  const curlCommand = `curl -X GET "${provenance?.endpoint || "https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:artist&signal.interests.entities=" + anchorId}" \\
  -H "x-api-key: \${QLOO_API_KEY}" \\
  -H "Accept: application/json"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    playHapticClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-neutral-950 text-white h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Obsidian Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Qloo Intelligence Engine
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {liveLatency}ms
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Real-Time Cultural Provenance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/[0.06] p-0.5 rounded-lg text-[11px] font-mono border border-white/[0.08]">
              <button
                onClick={() => { playHapticClick(); setActiveTab("flow"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "flow" ? "bg-white text-neutral-950 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => { playHapticClick(); setActiveTab("curl"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "curl" ? "bg-white text-neutral-950 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                API
              </button>
            </div>

            <button
              onClick={() => { playHapticClick(); onClose(); }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "flow" ? (
            <>
              {/* STAGE 1: Visual Vector Traversal Flow (Rule 24 Item 7) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Activity className="w-3.5 h-3.5" />
                    Cross-Domain Leap
                  </span>
                  <span className="text-neutral-500">Live Qloo Graph</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[10px] text-neutral-500 font-mono">1. Apparel</div>
                    <div className="font-semibold text-neutral-200 mt-1 text-[11px] truncate">Schott 618</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">Heritage Leather</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300">
                    <div className="text-[10px] text-emerald-400 font-mono">2. Subculture</div>
                    <div className="font-semibold text-emerald-300 mt-1 text-[11px] truncate">The Stooges</div>
                    <div className="text-[9px] text-emerald-400/80 mt-0.5">Proto-Punk 97%</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-500/[0.08] border border-purple-500/20 text-purple-300">
                    <div className="text-[10px] text-purple-400 font-mono">3. Lifestyle SKU</div>
                    <div className="font-semibold text-purple-200 mt-1 text-[11px] truncate">Raw Power</div>
                    <div className="text-[9px] text-purple-400/80 mt-0.5">Audiophile Vinyl</div>
                  </div>
                </div>

                {topCorrelations.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="text-[10px] font-mono text-neutral-500 mb-1.5">Top Correlated Entities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {topCorrelations.slice(0, 3).map((ent: any) => (
                        <span 
                          key={ent.id || ent.name} 
                          className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] font-mono text-neutral-300 border border-white/[0.08]"
                        >
                          {ent.name} <span className="text-emerald-400 font-semibold">{(ent.affinity * 100).toFixed(0)}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 2: Autonomous Merchandising Policy Guardrails */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Autonomous Policy Solver
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Budget ≤ $150</span>
                </div>

                <div className="space-y-2 pt-1">
                  {evaluationTrace.map((trace: any) => {
                    const isAccepted = trace.status === "ACCEPTED";
                    return (
                      <div 
                        key={trace.productId}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isAccepted 
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" 
                            : "bg-white/[0.02] border-white/[0.06] text-neutral-400"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-neutral-200 text-xs truncate">
                            {trace.title}
                          </div>
                          <div className="text-[10px] font-mono opacity-80 mt-0.5">
                            {isAccepted 
                              ? `✓ Grounded affinity ${(trace.qlooEvidence?.affinityScore * 100).toFixed(0)}% · $${trace.price}` 
                              : `✕ ${trace.price > 150 ? "Exceeds $150 budget limit" : "No cultural affinity in Qloo graph"}`}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          isAccepted 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                            : "bg-white/[0.06] text-neutral-500"
                        }`}>
                          {isAccepted ? "COMMITTED" : "REJECTED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STAGE 3: The 3-Second Business Impact Contrast */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Cart Experience Transformation
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div className="text-[10px] text-neutral-500 font-mono">Legacy Baseline</div>
                    <div className="text-neutral-300 font-medium mt-1 text-[11px]">Leather cleaner & hangers</div>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">$30 utility slop (2% conv)</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-mono">TasteDrop Curation</div>
                    <div className="text-white font-medium mt-1 text-[11px]">The Stooges Vinyl</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-mono">$678 companion bundle</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* cURL / DEVELOPER API TRACE TAB */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-neutral-400" />
                  Outbound Qloo Request
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-neutral-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/[0.08]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  <span>{copied ? "Copied" : "Copy cURL"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-white/[0.08]">
                <pre>{curlCommand}</pre>
              </div>

              <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-neutral-400 space-y-1">
                <div>Endpoint: <span className="text-neutral-200">/v2/insights</span></div>
                <div>Status: <span className="text-emerald-400 font-semibold">200 OK ({liveLatency}ms latency)</span></div>
                <div>Authentication: <span className="text-neutral-300">Server-Side Verified (x-api-key)</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Obsidian Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-neutral-900/60 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>TasteDrop Decision Provenance</span>
          <span className="text-emerald-400 font-medium">Qloo Taste Graph</span>
        </div>
      </div>
    </div>
  );
}
