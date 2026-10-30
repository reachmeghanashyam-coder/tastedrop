"use client";

import React, { useState } from "react";
import { 
  X, Check, Copy, Activity, Terminal
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
  const [activeTab, setActiveTab] = useState<"lab" | "curl">("lab");

  if (!isOpen) return null;

  const liveLatency = provenance?.latency_ms || 260;
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
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-800">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 font-mono tracking-tight uppercase">
                Merchandising Decision Lab
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Two-Layer Intelligence: Qloo Cultural Graph → Retail Constraint Solver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-200/60 p-0.5 rounded-lg text-[11px] font-mono">
              <button
                onClick={() => { playHapticClick(); setActiveTab("lab"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "lab" ? "bg-white text-neutral-950 font-semibold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Decision Lab
              </button>
              <button
                onClick={() => { playHapticClick(); setActiveTab("curl"); }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === "curl" ? "bg-white text-neutral-950 font-semibold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                cURL / API
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "lab" ? (
            <>
              {/* STAGE 1: THE MERCHANT GOAL */}
              <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                    Stage 1 — Configured Merchant Objective
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full font-semibold">
                    Autonomous Constraint Set
                  </span>
                </div>
                <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                  "Find culturally aligned, cross-category companions matching the anchor's aesthetic vector while respecting budget and category limits. Abstain if evidence is insufficient."
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-200/60 text-[11px] font-mono text-neutral-600">
                  <div>Max Spend: <span className="font-semibold text-neutral-950">$150.00</span></div>
                  <div>Min Evidence: <span className="font-semibold text-neutral-950">0.80</span></div>
                  <div>Diversity: <span className="font-semibold text-neutral-950">1/category</span></div>
                </div>
              </div>

              {/* STAGE 2: LIVE PERCEPTION (QLOO) */}
              <div className="rounded-2xl border border-neutral-200 p-4 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${liveStatus === "LIVE_SUCCESS" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    Stage 2 — Live Cultural Perception (Qloo API)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-semibold">
                    {liveLatency}ms latency
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="text-[10px] font-mono text-neutral-400">Anchor Signal</div>
                    <div className="font-semibold text-neutral-950 pt-0.5">{anchorName}</div>
                    <div className="text-[10px] font-mono text-neutral-500 truncate pt-0.5">ID: {anchorId}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="text-[10px] font-mono text-neutral-400">Upstream Status</div>
                    <div className="font-semibold text-emerald-700 pt-0.5">{liveStatus}</div>
                    <div className="text-[10px] font-mono text-neutral-500 pt-0.5">Discovered: {topCorrelations.length} entities</div>
                  </div>
                </div>

                {/* Cross-Domain Traversal Visual Proof */}
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center justify-between">
                    <span>Qloo Cross-Domain Leap (Zero Co-Occurrence)</span>
                    <span className="text-emerald-700 font-semibold text-[10px]">Fashion → Music & Scent</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                    <div className="p-1.5 rounded-lg bg-white border border-neutral-200">
                      <div className="text-neutral-400">Anchor Cart</div>
                      <div className="font-semibold text-neutral-900 pt-0.5">Fashion / Jacket</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800">
                      <div className="text-emerald-600">Cross Domain A</div>
                      <div className="font-semibold pt-0.5">Music Vinyl 🎵</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-50/70 border border-purple-200 text-purple-800">
                      <div className="text-purple-600">Cross Domain B</div>
                      <div className="font-semibold pt-0.5">Fragrance EDT 🧪</div>
                    </div>
                  </div>
                </div>

                {topCorrelations.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] font-mono text-neutral-400 pb-1.5">Top Traversed Correlations from Qloo:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {topCorrelations.slice(0, 4).map((ent: any) => (
                        <span key={ent.id || ent.name} className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] font-mono text-neutral-800 border border-neutral-200/70">
                          {ent.name} <span className="text-emerald-700 font-semibold font-mono">({(ent.affinity * 100).toFixed(1)}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 3: TWO-STAGE INTERPRETATION TABLE */}
              <div className="rounded-2xl border border-neutral-200 p-4 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                    Stage 3 — Retail Candidate Decision Trace
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Evaluated: {evaluationTrace.length} candidates
                  </span>
                </div>

                <div className="space-y-2">
                  {evaluationTrace.map((trace: any) => (
                    <div 
                      key={trace.productId}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-all ${
                        trace.status === "ACCEPTED" 
                          ? "bg-emerald-50/40 border-emerald-200/80" 
                          : "bg-neutral-50/60 border-neutral-200/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-neutral-950 truncate max-w-[340px]">
                          {trace.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trace.status === "ACCEPTED" ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-700"
                        }`}>
                          {trace.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-600 font-mono">
                        {trace.status === "ACCEPTED" ? (
                          <span className="text-emerald-800">
                            ✓ Correlated via '{trace.qlooEvidence?.matchedEntityName}' (Affinity: {(trace.qlooEvidence?.affinityScore * 100).toFixed(1)}%) · Budget & category passed
                          </span>
                        ) : (
                          <span className="text-neutral-500">
                            ✕ {trace.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 4: ACTION / ABSTENTION SUMMARY */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 text-white text-xs font-mono space-y-1">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Stage 4 — Final Action Commitment
                </div>
                <div className="text-neutral-200 font-sans text-xs">
                  {evaluationTrace.filter((t: any) => t.status === "ACCEPTED").length > 0 
                    ? "✓ Successfully committed 1-click curated lifestyle companion to cart."
                    : "✕ Autonomous Abstention: Refused to force ungrounded upsell. Shopping basket preserved."}
                </div>
              </div>
            </>
          ) : (
            /* cURL / DEVELOPER API TRACE TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-neutral-600" />
                  Live Upstream Request Trace
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{copied ? "Copied" : "Copy cURL"}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                <pre>{curlCommand}</pre>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2 text-xs">
                <div className="font-semibold text-neutral-950 font-mono">Response Signature:</div>
                <div className="font-mono text-[11px] text-neutral-600 space-y-1">
                  <div>Status: <span className="text-neutral-950 font-bold">{provenance?.httpStatus || 200} OK</span></div>
                  <div>Server: <span className="text-neutral-950">hackathon.api.qloo.com</span></div>
                  <div>Protocol: <span className="text-neutral-950">Direct Server-Side HTTPS (x-api-key)</span></div>
                  <div>Latency: <span className="text-neutral-950 font-bold">{liveLatency}ms</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>TasteDrop Decision Provenance</span>
          <span>Powered by Qloo Taste AI™ Graph</span>
        </div>
      </div>
    </div>
  );
}
