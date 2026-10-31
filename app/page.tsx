"use client";

import React, { useState, useEffect } from "react";
import { Star, ArrowRight, Check, ShoppingBag, Sparkles, Info, ChevronDown, ChevronUp } from "lucide-react";
import { SCENARIOS, ProductSKU } from "@/lib/catalog";
import { Header } from "@/components/Header";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { playHarmonicChime, playHapticClick } from "@/lib/audio";

export default function Home() {
  const [activeScenarioId, setActiveScenarioId] = useState<"home_decor" | "fashion_heritage">("fashion_heritage");
  const [mode, setMode] = useState<"baseline" | "tastedrop">("baseline");
  const [hasSimulatedCart, setHasSimulatedCart] = useState<boolean>(false);
  
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentScenario = SCENARIOS[activeScenarioId] || SCENARIOS.fashion_heritage;

  const [telemetryData, setTelemetryData] = useState<any | null>(null);
  const [liveRecommendations, setLiveRecommendations] = useState<ProductSKU[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeAnchorQuery, setActiveAnchorQuery] = useState<string>("The Stooges");

  const executeSimulation = async (
    targetMode: "baseline" | "tastedrop", 
    scenarioId: string,
    overrideQuery?: string
  ) => {
    setIsSimulating(true);
    setApiError(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenarioId, 
          mode: targetMode,
          overrideEntityQuery: overrideQuery || activeAnchorQuery
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLiveRecommendations(data.products || []);
        if (data.qlooProvenance) {
          setTelemetryData(data.qlooProvenance);
        }
        if (targetMode === "tastedrop" && data.products && data.products.length > 0) {
          setSelectedAddons([data.products[0].id]);
        } else {
          setSelectedAddons([]);
        }
      } else {
        setApiError(data.error || "Simulation failed");
        setLiveRecommendations([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiError(msg);
      setLiveRecommendations([]);
    } finally {
      setIsSimulating(false);
    }
  };

  // Fetch live Qloo telemetry immediately on mount so "Inspect Taste Graph" is ALWAYS populated with live data
  useEffect(() => {
    const prefetchQlooTelemetry = async () => {
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            scenarioId: activeScenarioId, 
            mode: "tastedrop",
            overrideEntityQuery: activeAnchorQuery
          }),
        });
        const data = await res.json();
        if (data.success && data.qlooProvenance) {
          setTelemetryData(data.qlooProvenance);
        }
      } catch (e) {
        console.error("Telemetry prefetch error", e);
      }
    };
    prefetchQlooTelemetry();
  }, [activeScenarioId, activeAnchorQuery]);

  useEffect(() => {
    executeSimulation(mode, activeScenarioId, activeAnchorQuery);
  }, [mode, activeScenarioId, activeAnchorQuery]);

  const handleToggleMode = (newMode: "baseline" | "tastedrop") => {
    playHapticClick();
    setMode(newMode);
    if (newMode === "tastedrop") {
      playHarmonicChime(580);
    }
  };

  const handleToggleAddon = (id: string) => {
    playHapticClick();
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceedToCheckout = () => {
    playHarmonicChime(660);
    setIsConfirmed(true);
  };

  const handleAddToCart = () => {
    playHapticClick();
    playHarmonicChime(520);
    setHasSimulatedCart(true);
  };

  const handleRunQlooScan = () => {
    playHapticClick();
    playHarmonicChime(640);
    setMode("tastedrop");
    const firstId = currentScenario.tasteDropCompanions.prePurchase[0]?.id;
    setSelectedAddons(firstId ? [firstId] : []);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setSelectedAddons([]);
    setMode("baseline");
    setHasSimulatedCart(false);
  };

  const displayedRecommendations: ProductSKU[] = liveRecommendations.length > 0 
    ? liveRecommendations 
    : (mode === "baseline" ? currentScenario.baselineAccessories : []);

  const confirmedSelectedItems = displayedRecommendations.filter((item) =>
    selectedAddons.includes(item.id)
  );

  const companionsTotal = displayedRecommendations
    .filter((item) => selectedAddons.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const finalBasketTotal = currentScenario.anchorProduct.price + companionsTotal;

  return (
    <div className="h-screen bg-[#FBFBFC] text-neutral-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-950 overflow-hidden">
      
      {/* Precision Gallery Header */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        isSimulating={isSimulating}
      />

      {/* Main Container - Flex-1 with Space-Between to naturally utilize 100% viewport */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-3 w-full flex flex-col justify-between overflow-hidden">
        
        {/* Hero headline: perfectly unified vertical rhythm with subtle theatrical defocus once drawer is active */}
        {!isConfirmed && (
          <div
            className={`text-center max-w-5xl mx-auto w-full shrink-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hasSimulatedCart
                ? "pt-3 pb-2 space-y-1 opacity-40 scale-[0.96] blur-[0.3px]"
                : "pt-6 pb-2 space-y-2.5 opacity-100 scale-100 blur-none"
            }`}
          >
            <h1
              className={`font-extrabold tracking-tight text-neutral-950 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hasSimulatedCart
                  ? "text-2xl sm:text-3xl md:text-[32px] leading-snug"
                  : "text-4xl sm:text-5xl md:text-[68px] leading-[1.04]"
              }`}
            >
              Checkout is the best moment to upsell.
            </h1>
            <p
              className={`font-semibold tracking-tight text-neutral-500 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pb-0.5 ${
                hasSimulatedCart
                  ? "text-base sm:text-lg md:text-[20px] leading-snug"
                  : "text-2xl sm:text-3xl md:text-[44px] leading-tight"
              }`}
            >
              Most stores waste it on generic add-ons.
            </p>
            <p
              className={`text-neutral-400 font-normal tracking-wide transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hasSimulatedCart ? "text-[11px] pt-0" : "text-sm sm:text-base md:text-lg pt-1 text-neutral-500"
              }`}
            >
              TasteDrop uses Qloo's taste graph to suggest what the buyer would actually love.
            </p>
          </div>
        )}

        {/* Central Stage */}
        {!isConfirmed ? (
          <div className="flex-1 flex flex-col justify-center space-y-3.5 my-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            
            {/* CARD 1: THE PRIMARY PRODUCT DETAIL CARD */}
            <div
              className={`bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-12 gap-7 items-center relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hasSimulatedCart
                  ? "opacity-80 scale-[0.985] hover:opacity-100 hover:scale-100"
                  : "opacity-100 scale-100"
              }`}
            >
              
              {/* Product Image (Col 1-5, Generous 4/3 Aspect Ratio) */}
              <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative shrink-0 shadow-inner">
                <img
                  src={currentScenario.anchorProduct.image}
                  alt={currentScenario.anchorProduct.title}
                  className="w-full h-full object-cover"
                />

                {/* Sleek Catalog Switcher (Floating at the Bottom-Left of the Photo) */}
                <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 shadow-md">
                    <button
                      onClick={() => {
                        playHapticClick();
                        setActiveScenarioId("fashion_heritage");
                        setActiveAnchorQuery("The Stooges");
                        handleReset();
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        activeScenarioId === "fashion_heritage"
                          ? "bg-white text-neutral-950 font-semibold shadow-xs"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Schott Jacket
                    </button>
                    <button
                      onClick={() => {
                        playHapticClick();
                        setActiveScenarioId("home_decor");
                        setActiveAnchorQuery("Noguchi");
                        handleReset();
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        activeScenarioId === "home_decor"
                          ? "bg-white text-neutral-950 font-semibold shadow-xs"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Noguchi Table
                    </button>
                  </div>


                </div>
              </div>

              {/* Product Info & Integrated Purchase Action (Col 6-12) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">
                      {currentScenario.anchorProduct.rating} ({currentScenario.anchorProduct.reviewsCount.toLocaleString()} verified reviews)
                    </span>
                  </div>

                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 font-semibold">
                    ✓ Prime In-Stock
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 leading-tight">
                    {currentScenario.anchorProduct.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 font-light">
                    {currentScenario.anchorProduct.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pt-1 max-w-lg">
                    {currentScenario.anchorProduct.description}
                  </p>
                </div>

                {/* THE 1-CLICK ORDER ACTION BAR */}
                <div className="pt-3.5 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      {companionsTotal > 0 ? "Total Order Price" : "Item Price"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950 leading-tight">
                      ${finalBasketTotal.toFixed(2)}
                    </div>
                    {companionsTotal > 0 && (
                      <div className="text-[11px] font-mono text-emerald-700 font-medium mt-0.5">
                        Includes {activeScenarioId === "fashion_heritage" ? "jacket" : "table"} + {selectedAddons.length} curated {selectedAddons.length === 1 ? "companion" : "companions"}
                      </div>
                    )}
                  </div>

                  {/* Action Button: Add to Cart on initial load vs 1-Click Order after cart simulated */}
                  {!hasSimulatedCart ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full sm:w-auto px-9 py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 bg-neutral-950 hover:bg-neutral-800 text-white shadow-xl shadow-neutral-950/20 active:scale-95 transition-all duration-300 shrink-0 cursor-pointer group relative overflow-hidden ring-2 ring-emerald-500/40 hover:ring-emerald-500/70 animate-pulse hover:animate-none"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Add to Bag • ${currentScenario.anchorProduct.price.toFixed(0)}</span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToCheckout}
                      className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 shrink-0 cursor-pointer ${
                        companionsTotal > 0
                          ? "bg-neutral-950 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-950/20 scale-[1.02] active:scale-95 border border-transparent ring-2 ring-emerald-500/20"
                          : "bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-300/80 shadow-sm hover:shadow-md hover:border-neutral-400 active:scale-95"
                      }`}
                    >
                      <ShoppingBag className={`w-4 h-4 transition-colors ${companionsTotal > 0 ? "text-emerald-400" : "text-neutral-700"}`} />
                      <span>
                        {companionsTotal > 0 
                          ? `Checkout Bundle • $${finalBasketTotal.toFixed(0)}` 
                          : `Checkout • $${currentScenario.anchorProduct.price.toFixed(0)}`}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${companionsTotal > 0 ? "translate-x-0.5 text-white" : "text-neutral-600"}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 2: CO-PURCHASE DRAWER (APPEARS ONCE ADD TO BAG IS CLICKED) */}
            {hasSimulatedCart && (
              <div className="bg-white rounded-3xl border-2 border-neutral-900/10 p-5 sm:p-6 shadow-[0_8px_32px_-6px_rgba(0,0,0,0.12)] space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-500 scale-100 ring-1 ring-emerald-500/15">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${mode === "tastedrop" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-neutral-950">
                      {mode === "tastedrop" ? "What Culturally Belongs With This" : "Frequently Bought Together"}
                    </span>
                  </div>

                  {/* Header Tab Action: Run Qloo Taste Scan vs Inspect Provenance */}
                  {mode === "baseline" ? (
                    <button
                      onClick={handleRunQlooScan}
                      className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer group ring-2 ring-emerald-500/40 hover:ring-emerald-500/70 animate-pulse hover:animate-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Run Qloo Taste Scan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTelemetryOpen(true)}
                      className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span className="font-mono text-[11px]">Qloo Taste AI™ Active</span>
                    </button>
                  )}
                </div>

                {/* The Clean Companion Cards or Autonomous Abstention Alert */}
                {displayedRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedRecommendations.slice(0, 2).map((item) => {
                      const isSelected = selectedAddons.includes(item.id);
                      const isExpanded = expandedItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                            isSelected
                              ? "bg-neutral-50/90 border-neutral-950 shadow-sm ring-1 ring-neutral-950"
                              : "bg-neutral-50/40 border-neutral-200 hover:bg-white hover:border-neutral-300 hover:shadow-xs"
                          }`}
                        >
                          <div className="flex gap-3.5 items-center">
                            {/* Checkbox Thumbnail Container */}
                            <div 
                              onClick={() => handleToggleAddon(item.id)}
                              className="relative shrink-0 w-[58px] h-[58px] rounded-xl overflow-hidden border border-neutral-200 shadow-2xs cursor-pointer group"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div
                                className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center border transition-all z-10 ${
                                  isSelected
                                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                                    : "bg-white/95 text-transparent border-neutral-300"
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            </div>

                            {/* Text and Actions */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 truncate font-medium">
                                  {item.category}
                                </span>
                                {mode === "tastedrop" && (
                                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 shrink-0">
                                    {item.qlooAffinity}% correlation
                                  </span>
                                )}
                              </div>
                              
                              <h4 
                                onClick={() => handleToggleAddon(item.id)}
                                className="text-xs sm:text-sm font-medium text-neutral-950 leading-snug line-clamp-1 cursor-pointer hover:underline"
                              >
                                {item.title}
                              </h4>

                              <div className="flex items-center justify-between pt-0.5">
                                <span className="text-xs sm:text-sm font-semibold text-neutral-950 font-mono">
                                  +${item.price.toFixed(2)}
                                </span>

                                {/* Details Toggle Accordion Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playHapticClick();
                                    setExpandedItemId(isExpanded ? null : item.id);
                                  }}
                                  className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Info className="w-2.5 h-2.5 text-neutral-400" />
                                  <span>{isExpanded ? "Close" : "Taste Note"}</span>
                                  {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Smooth Slide-Down Details Accordion */}
                          {isExpanded && (
                            <div className="mt-3 pt-2.5 border-t border-neutral-200/70 text-xs space-y-1.5 animate-in fade-in duration-200">
                              <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                  <span className="text-neutral-800 font-semibold uppercase">Curator's Note</span>
                                  <span>★ {item.rating} ({item.reviewsCount.toLocaleString()} reviews)</span>
                                </div>
                                <p className="text-[11px] text-neutral-700 font-light leading-relaxed">
                                  {item.editorialNote}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                                <span>Prime In-Stock</span>
                                <span 
                                  onClick={() => handleToggleAddon(item.id)}
                                  className="text-neutral-950 font-semibold cursor-pointer underline hover:text-emerald-700"
                                >
                                  {isSelected ? "Remove from bundle" : "Click to bundle +$" + item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* EXPLICIT AUTONOMOUS ABSTENTION CARD */
                  <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-amber-900 font-bold font-mono text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Autonomous Abstention — Zero Ungrounded Upsells
                    </div>
                    <p className="text-xs text-amber-950 max-w-lg leading-relaxed font-sans">
                      Qloo's live cultural graph returned no entities for <span className="font-semibold">{activeAnchorQuery}</span> that clear the relevance threshold against the available catalog.
                    </p>
                    <div className="text-[11px] font-mono text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
                      Solver Decision: Refused to force an irrelevant recommendation · Basket preserved at $650.00
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: ORDER CONFIRMATION & 1-CLICK POST-PURCHASE INTERCEPT */
          <div className="py-2 flex-1 flex flex-col justify-center">
            <OrderConfirmation
              orderNumber="APX-88219-TK"
              anchorTitle={currentScenario.anchorProduct.title}
              anchorPrice={currentScenario.anchorProduct.price}
              anchorImage={currentScenario.anchorProduct.image}
              prePurchaseItems={confirmedSelectedItems}
              postPurchaseItem={currentScenario.tasteDropCompanions.postPurchase}
              mode={mode}
              onReset={handleReset}
              onOpenTelemetry={() => setIsTelemetryOpen(true)}
            />
          </div>
        )}

        {/* Clean Anchored Footer */}
        <footer className="mt-auto border-t border-neutral-200/80 pt-2.5 pb-2 flex items-center justify-between text-xs text-neutral-400 font-mono shrink-0">
          <span>TasteDrop // Autonomous Cultural Merchandising Agent</span>
          <span>Powered by @qloo/qloo-harness MCP</span>
        </footer>
      </main>

      {/* The 3-Step Decision Trace Modal */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        provenance={telemetryData}
        mode={mode}
        scenarioTitle={currentScenario.anchorProduct.qlooEntityQuery}
      />
    </div>
  );
}
