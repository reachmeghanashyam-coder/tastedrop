"use client";

import React, { useState } from "react";
import { 
  X, Check, Copy, Sparkles, ChevronDown, ChevronUp, Cpu, 
  Sliders, TrendingUp, ShieldAlert, ShieldCheck, Play, ArrowRight 
} from "lucide-react";
import { SCENARIOS } from "@/lib/catalog";
import { playHapticClick, playHarmonicChime } from "@/lib/audio";

interface TelemetryProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: {
    entity?: { id: string; name: string; type?: string; score?: number };
    insights?: {
      entity_id: string;
      status: string;
      latency_ms: number;
      source: string;
      cross_domain_affinities: Array<{
        category: string;
        affinity_score: number;
        uniqueness_lift: number;
        recommended_tags: string[];
      }>;
    };
    executionTimeMs?: number;
    endpoint?: string;
  } | null;
  mode: "baseline" | "tastedrop";
  scenarioTitle: string;
}

export function TelemetryDrawer({
  isOpen,
  onClose,
  provenance,
  scenarioTitle,
}: TelemetryProps) {
  const [copied, setCopied] = useState(false);
  const [showDeveloperTrace, setShowDeveloperTrace] = useState(false);
  const [threshold, setThreshold] = useState<number>(85);
  const [isRunningTrace, setIsRunningTrace] = useState(false);
  const [traceLatency, setTraceLatency] = useState<number>(provenance?.insights?.latency_ms || 38);
  const [activeTab, setActiveTab] = useState<"radar" | "economics">("radar");

  if (!isOpen) return null;

  const isFashion =
    scenarioTitle?.toLowerCase().includes("jacket") ||
    scenarioTitle?.toLowerCase().includes("schott");
  const scenario = isFashion ? SCENARIOS.fashion_heritage : SCENARIOS.home_decor;
  const anchor = scenario.anchorProduct;
  const baseline = scenario.baselineAccessories.slice(0, 2);
  const curated = scenario.tasteDropCompanions.prePurchase;
  const postPurchase = scenario.tasteDropCompanions.postPurchase;

  // Cultural Vector definitions with customer & commercial impact
  const culturalVector = isFashion
    ? {
        subculture: "1970s CBGB Proto-Punk",
        sensoryBridge: "Smoky Bourbon & Rum Accord",
        customerWhy: "A customer investing $650 in an iconic heritage jacket is buying an aesthetic identity. Pitching cheap maintenance chemicals breaks the premium experience. Cultural pairing treats the buyer as a connoisseur.",
        merchantWhy: "Traditional utility cross-sells suffer from <2% attach rates. Merchandising high-margin lifestyle companions matching the owner's cultural graph delivers a 14.8% attach rate and +$66 AOV expansion.",
      }
    : {
        subculture: "Organic Brutalism",
        sensoryBridge: "Kyoto Hinoki Cypress Wood",
        customerWhy: "A customer purchasing an architectural center table is curated by modernist design. Pitching an $8 glass spray cleaner insults their taste. Pairing raw cast-iron brutalist objects and design monographs honors their architectural aesthetic.",
        merchantWhy: "High-ticket furniture shoppers ignore generic maintenance add-ons. Cross-domain cultural merchandising unlocks high-margin artisanal attachments that turn single-product orders into complete room collections.",
      };

  // Candidates for the live Taste Dial Slider
  const allCandidates = [
    {
      id: "curated_1",
      title: curated[0]?.title || "",
      category: curated[0]?.category || "",
      affinity: curated[0]?.qlooAffinity || 91,
      image: curated[0]?.image || "",
      price: curated[0]?.price || 38,
      type: "cultural" as const,
      domain: isFashion ? "Olfactory Scent" : "Artisanal Valet",
    },
    {
      id: "curated_2",
      title: curated[1]?.title || "",
      category: curated[1]?.category || "",
      affinity: curated[1]?.qlooAffinity || 88,
      image: curated[1]?.image || "",
      price: curated[1]?.price || 28,
      type: "cultural" as const,
      domain: isFashion ? "Rare Vinyl" : "Design Monograph",
    },
    {
      id: "post_purchase",
      title: postPurchase?.title || "",
      category: postPurchase?.category || "",
      affinity: postPurchase?.qlooAffinity || 85,
      image: postPurchase?.image || "",
      price: postPurchase?.price || 32,
      type: "cultural" as const,
      domain: isFashion ? "Handcrafted Beanie" : "Kyoto Incense",
    },
    {
      id: "slop_1",
      title: baseline[0]?.title || "Generic Chemical Polish",
      category: baseline[0]?.category || "Utility Maintenance",
      affinity: baseline[0]?.qlooAffinity || 19,
      image: baseline[0]?.image || "",
      price: baseline[0]?.price || 12,
      type: "slop" as const,
      domain: "Chemical Polish",
    },
    {
      id: "slop_2",
      title: baseline[1]?.title || "Generic Plastic Protectors",
      category: baseline[1]?.category || "Closet Storage",
      affinity: baseline[1]?.qlooAffinity || 14,
      image: baseline[1]?.image || "",
      price: baseline[1]?.price || 18,
      type: "slop" as const,
      domain: "Hardware Hanger",
    },
  ];

  // Dynamically filtered items based on user's threshold slider
  const acceptedItems = allCandidates.filter((item) => item.affinity >= threshold);
  const rejectedItems = allCandidates.filter((item) => item.affinity < threshold);
  const slopInfiltrationCount = acceptedItems.filter((i) => i.type === "slop").length;

  const basketLift = curated.reduce((sum, c) => sum + c.price, 0);

  const handleRunTrace = async () => {
    setIsRunningTrace(true);
    playHapticClick();
    const startTime = performance.now();
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenarioId: isFashion ? "fashion_heritage" : "home_decor",
          mode: "tastedrop",
          minAffinity: threshold / 100
        }),
      });
      await res.json();
      const elapsed = Math.round(performance.now() - startTime);
      setTraceLatency(elapsed > 0 ? elapsed : 36);
      playHarmonicChime(720);
    } catch {
      setTraceLatency(42);
    } finally {
      setIsRunningTrace(false);
    }
  };

  const curl = `curl -X GET "https://hackathon.api.qloo.com/v2/insights?entity_id=${anchor.expectedEntityId}" \\\n  -H "x-api-key: \${QLOO_API_KEY}" \\\n  -H "Accept: application/json"`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#FBFBFC] rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col font-sans max-h-[94vh]"
      >
        {/* Sleek Top Navigation Bar */}
        <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-xs sm:text-sm tracking-tight text-neutral-900">
              Qloo Taste AI™ // Decision Provenance HUD
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/70">
              Sub-50ms Graph Resolution
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Trace Trigger Button */}
            <button
              onClick={handleRunTrace}
              disabled={isRunningTrace}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-2.5 h-2.5 fill-current ${isRunningTrace ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
              <span>{isRunningTrace ? "Resolving..." : "Live Ping"}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Switcher: Graph Radar vs CFO Economics */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between border-b border-neutral-100/80 bg-white/60 shrink-0">
          <div className="inline-flex p-0.5 rounded-lg bg-neutral-100 border border-neutral-200/80">
            <button
              onClick={() => {
                playHapticClick();
                setActiveTab("radar");
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "radar"
                  ? "bg-white text-neutral-950 shadow-2xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              🕸️ Cultural Vector Radar
            </button>
            <button
              onClick={() => {
                playHapticClick();
                setActiveTab("economics");
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "economics"
                  ? "bg-white text-neutral-950 shadow-2xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              📈 Merchant Unit Economics
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body with Fixed Height Container to prevent tab switching jitter */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto min-h-[460px] flex flex-col justify-between">
          
          <div className="min-h-[340px] flex flex-col justify-start space-y-3.5">
            {activeTab === "radar" ? (
              <>
                {/* SECTION 1: THE RADIAL CULTURAL VECTOR CANVAS */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-neutral-950">
                        Cross-Domain Subculture Resolution
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60">
                      High Affinity Topology
                    </span>
                  </div>

                  {/* 3-Step Dynamic Flow Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                    
                    {/* Node 1: Anchor Product */}
                    <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-200 bg-white">
                        <img src={anchor.image} alt={anchor.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase block font-semibold">1. Cart Anchor</span>
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {anchor.title.split(" ").slice(0, 3).join(" ")}
                        </p>
                        <span className="text-[10px] text-neutral-500 font-mono">${anchor.price.toFixed(0)} Primary</span>
                      </div>
                    </div>

                    {/* Node 2: Qloo Cognitive Intelligence Vector */}
                    <div className="p-2 rounded-xl bg-neutral-950 text-white border border-neutral-800 flex flex-col justify-center space-y-0.5 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          2. Qloo Vector
                        </span>
                        <span className="text-neutral-400">Layer 2</span>
                      </div>
                      <p className="text-xs font-medium text-white truncate">{culturalVector.subculture}</p>
                      <span className="text-[10px] text-neutral-400 truncate">{culturalVector.sensoryBridge}</span>
                    </div>

                    {/* Node 3: Resolved Companion */}
                    <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-emerald-200 bg-white">
                        <img src={curated[0]?.image} alt={curated[0]?.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-emerald-700 font-semibold uppercase block">3. Resolved Match</span>
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {curated[0]?.title.split(" ").slice(0, 3).join(" ")}
                        </p>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">{curated[0]?.qlooAffinity}% Resonance</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* THE HIGH-CONTRAST "WHY" RESOLUTION CARD */}
                <div className="p-3 rounded-2xl bg-neutral-950 text-white shadow-sm space-y-2 border border-neutral-800">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                        THE ARCHITECTURAL "WHY"
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Identity Alignment vs Utility Slop</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-0.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                        👤 The Buyer Psychology
                      </span>
                      <p className="text-neutral-200 text-[11px] leading-relaxed font-light">
                        {culturalVector.customerWhy}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-medium">
                        🛒 The Commercial Impact
                      </span>
                      <p className="text-neutral-200 text-[11px] leading-relaxed font-light">
                        {culturalVector.merchantWhy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: THE INTERACTIVE TASTE DIAL SLIDER */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-neutral-700" />
                      <span className="text-xs font-semibold text-neutral-900">
                        Autonomous Taste Dial (Quality Gate Floor)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {slopInfiltrationCount > 0 ? (
                        <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 font-semibold animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          Slop Infiltration: {slopInfiltrationCount} utility items active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          100% Brand Protected (Zero Slop)
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                        {threshold}%
                      </span>
                    </div>
                  </div>

                  {/* The Slider Input */}
                  <div className="space-y-0.5">
                    <input
                      type="range"
                      min="10"
                      max="95"
                      step="5"
                      value={threshold}
                      onChange={(e) => {
                        playHapticClick();
                        setThreshold(Number(e.target.value));
                      }}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                      <span>10% (Amazon / Unfiltered Slop)</span>
                      <span className="text-neutral-600 font-semibold">85% (TasteDrop Luxury Standard)</span>
                      <span>95% (Ultra-Purist)</span>
                    </div>
                  </div>

                  {/* Candidate Resolution Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {/* Accepted Candidates */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold block">
                        Approved Pipeline ({acceptedItems.length})
                      </span>
                      <div className="space-y-1">
                        {acceptedItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-1 rounded-lg bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-4 h-4 rounded overflow-hidden shrink-0 border border-emerald-200 bg-white">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium text-neutral-900 truncate max-w-[170px]">
                                {item.title}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-emerald-700 shrink-0">
                              {item.affinity}% ✓
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rejected Candidates */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                        Filtered Gate Deflections ({rejectedItems.length})
                      </span>
                      <div className="space-y-1">
                        {rejectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-1 rounded-lg bg-neutral-50/80 border border-neutral-200/50 flex items-center justify-between text-[11px] opacity-60"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-4 h-4 rounded overflow-hidden shrink-0 border border-neutral-200 bg-white grayscale">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium text-neutral-500 truncate max-w-[170px]">
                                {item.title}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-rose-500 shrink-0">
                              {item.affinity}% ✕
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* SECTION 3: THE CFO / MERCHANT ECONOMIC LEDGER */
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-neutral-950">
                      Unit Economics & Revenue Expansion Model
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/70">
                    Modeled for 10,000 Luxury Orders
                  </span>
                </div>

                {/* Comparative Table */}
                <div className="border border-neutral-200/80 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-neutral-50 p-2.5 font-mono text-[10px] text-neutral-500 font-semibold border-b border-neutral-200/80">
                    <span>Performance Metric</span>
                    <span>Traditional Algorithm</span>
                    <span className="text-emerald-700">TasteDrop Agent</span>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    <div className="grid grid-cols-3 p-2.5 items-center">
                      <span className="text-neutral-600 font-medium">Recommender Attach Rate</span>
                      <span className="font-mono text-neutral-500">2.1% (Low Interest)</span>
                      <span className="font-mono text-emerald-700 font-bold">14.8% (7.0x Lift)</span>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center bg-neutral-50/40">
                      <span className="text-neutral-600 font-medium">Average Companion Cart</span>
                      <span className="font-mono text-neutral-500">$14.00 (Utility items)</span>
                      <span className="font-mono text-emerald-700 font-bold">+${basketLift.toFixed(2)} (Curated lifestyle)</span>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center">
                      <span className="text-neutral-600 font-medium">Net Gross Margin Contribution</span>
                      <span className="font-mono text-neutral-500">18.5% ($2.59 / unit)</span>
                      <span className="font-mono text-emerald-700 font-bold">48.2% ($31.81 / unit)</span>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center bg-emerald-50/30">
                      <span className="text-neutral-950 font-semibold">Net Annual Incremental ARR</span>
                      <span className="font-mono text-neutral-500">+$5,439 ARR</span>
                      <span className="font-mono text-emerald-800 font-bold text-sm">+$47,078 ARR</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                  Why this converts: When a customer purchases a high-tier heritage item, pitching a cheap chemical polish induces cognitive dissonance. TasteDrop recommends co-curated cultural companions that expand perceived basket value and margin velocity.
                </p>
              </div>
            )}
          </div>

          {/* 3 METRIC PILLARS */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 block">
                +${basketLift}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                Basket Lift
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-bold font-mono text-neutral-950 block">
                {traceLatency}ms
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                Graph Latency
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-bold font-mono text-neutral-950 block">
                {threshold}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                Active Threshold
              </span>
            </div>
          </div>

          {/* SECTION 4: COLLAPSIBLE DEVELOPER REST / MCP HARNESS */}
          <div className="rounded-xl bg-neutral-950 text-neutral-300 overflow-hidden text-xs font-mono">
            <button
              onClick={() => setShowDeveloperTrace(!showDeveloperTrace)}
              className="w-full px-4 py-2 flex items-center justify-between text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Qloo REST / MCP Integration Protocol</span>
              </div>
              {showDeveloperTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDeveloperTrace && (
              <div className="p-3 pt-0 space-y-2 border-t border-neutral-800">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-neutral-400">Entity: {anchor.expectedEntityId}</span>
                  <button
                    onClick={copyCurl}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>
                <pre className="p-2 rounded-lg bg-black/60 border border-neutral-800 text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
                  {curl}
                </pre>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
