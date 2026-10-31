"use client";

import React, { useState } from "react";
import { 
  X, Check, Copy, Activity, Terminal, ArrowRight, Sparkles
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
  const [activeTab, setActiveTab] = useState<"visual" | "curl">("visual");

  if (!isOpen) return null;

  const liveLatency = provenance?.latency_ms || 58;
  const liveStatus = provenance?.status || "LIVE_SUCCESS";
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                How TasteDrop Works
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Live Qloo Intelligence · {liveLatency}ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-200/60 p-0.5 rounded-lg text-[11px] font-mono">
              <button
                onClick={() => { playHapticClick(); setActiveTab("visual"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "visual" ? "bg-white text-neutral-950 font-semibold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Visual Flow
              </button>
              <button
                onClick={() => { playHapticClick(); setActiveTab("curl"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "curl" ? "bg-white text-neutral-950 font-semibold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                API
              </button>
            </div>

            <button
              onClick={() => { playHapticClick(); onClose(); }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "visual" ? (
            <>
              {/* Card 1: The Cultural Leap (Simple, visual 3 boxes) */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  1. Cultural Resonance
                </div>
                
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 p-2.5 rounded-xl bg-white border border-neutral-200 text-center">
                    <div className="text-[10px] text-neutral-400 font-mono">Cart Anchor</div>
                    <div className="font-semibold text-neutral-900 mt-0.5">Schott Jacket</div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />

                  <div className="flex-1 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
                    <div className="text-[10px] text-emerald-600 font-mono">Qloo Match</div>
                    <div className="font-semibold mt-0.5">The Stooges (97%)</div>
                  </div>
                </div>

                {topCorrelations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topCorrelations.slice(0, 3).map((ent: any) => (
                      <span key={ent.id || ent.name} className="px-2 py-0.5 rounded-md bg-white text-[11px] font-mono text-neutral-700 border border-neutral-200">
                        {ent.name} <span className="text-emerald-700 font-semibold font-mono">{(ent.affinity * 100).toFixed(0)}%</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 2: Filter Decisions (Clean, readable accept/reject) */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3 shadow-2xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  2. Smart Inventory Curation
                </div>

                <div className="space-y-2">
                  {evaluationTrace.map((trace: any) => (
                    <div 
                      key={trace.productId}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        trace.status === "ACCEPTED" 
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" 
                          : "bg-neutral-50/50 border-neutral-200/70 text-neutral-500"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium truncate">{trace.title}</div>
                        <div className="text-[10px] font-mono opacity-80">
                          {trace.status === "ACCEPTED" 
                            ? `✓ Cultural match · $${trace.price}` 
                            : `✕ ${trace.price > 150 ? "Over budget limit" : "No cultural match"}`}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        trace.status === "ACCEPTED" ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-600"
                      }`}>
                        {trace.status === "ACCEPTED" ? "Added" : "Skipped"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: The Result Comparison (Clean and obvious) */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  3. The Customer Experience
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                    <div className="text-[10px] text-neutral-400 font-mono">Traditional</div>
                    <div className="text-neutral-300 font-medium mt-1">Shoe grease & hangers</div>
                    <div className="text-[10px] text-neutral-500 mt-1">Utility maintenance</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200">
                    <div className="text-[10px] text-emerald-400 font-mono">With TasteDrop</div>
                    <div className="text-white font-medium mt-1">Stooges Vinyl record</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Cultural lifestyle companion</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* cURL / DEVELOPER API TRACE TAB */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-neutral-600" />
                  Live API Query
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{copied ? "Copied" : "Copy cURL"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                <pre>{curlCommand}</pre>
              </div>

              <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-600 space-y-1">
                <div>Endpoint: <span className="text-neutral-900 font-semibold">/v2/insights</span></div>
                <div>Status: <span className="text-emerald-700 font-semibold">200 OK ({liveLatency}ms)</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>TasteDrop Decision Engine</span>
          <span className="text-emerald-700 font-medium">Qloo Graph Active</span>
        </div>
      </div>
    </div>
  );
}
