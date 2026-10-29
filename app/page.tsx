"use client";

import React, { useState, useEffect } from "react";
import { Star, ArrowRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import { SCENARIOS, ProductSKU } from "@/lib/catalog";
import { Header } from "@/components/Header";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { playHarmonicChime, playHapticClick } from "@/lib/audio";

export default function Home() {
  const [activeScenarioId, setActiveScenarioId] = useState<"home_decor" | "fashion_heritage">("fashion_heritage");
  const [mode, setMode] = useState<"baseline" | "tastedrop">("baseline");
  
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentScenario = SCENARIOS[activeScenarioId] || SCENARIOS.fashion_heritage;

  const [telemetryData, setTelemetryData] = useState<{
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
  } | null>(null);

  const executeSimulation = async (targetMode: "baseline" | "tastedrop", scenarioId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, mode: targetMode }),
      });
      const data = await res.json();
      if (data.success && data.qlooProvenance) {
        setTelemetryData(data.qlooProvenance);
      }
    } catch (err) {
      console.warn("Simulation call error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    executeSimulation(mode, activeScenarioId);
    if (mode === "tastedrop") {
      const firstId = currentScenario.tasteDropCompanions.prePurchase[0]?.id;
      setSelectedAddons(firstId ? [firstId] : []);
    } else {
      setSelectedAddons([]);
    }
  }, [mode, activeScenarioId]);

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

  const handleReset = () => {
    setIsConfirmed(false);
    setSelectedAddons([]);
  };

  const displayedRecommendations: ProductSKU[] =
    mode === "tastedrop"
      ? currentScenario.tasteDropCompanions.prePurchase
      : currentScenario.baselineAccessories;

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
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3 w-full flex flex-col justify-between overflow-hidden">
        
        {/* Bold, Cinematic 2-Line Headline (Hero Stature with Dedicated Breathing Space) */}
        {!isConfirmed && (
          <div className="text-center pt-3 pb-2 max-w-4xl mx-auto space-y-2 shrink-0">
            <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-neutral-950 leading-[1.1]">
              Your shopping cart knows what you bought.
            </h1>
            <p className="text-2xl sm:text-3xl md:text-[38px] font-normal tracking-tight text-neutral-500 font-serif italic">
              We find what actually belongs with it.
            </p>
          </div>
        )}

        {/* Central Stage */}
        {!isConfirmed ? (
          <div className="flex-1 flex flex-col justify-center space-y-3.5 my-auto">
            
            {/* CARD 1: THE PRIMARY PRODUCT DETAIL CARD */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-12 gap-7 items-center relative">
              
              {/* Product Image (Col 1-5, Generous 4/3 Aspect Ratio) */}
              <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative shrink-0 shadow-inner">
                <img
                  src={currentScenario.anchorProduct.image}
                  alt={currentScenario.anchorProduct.title}
                  className="w-full h-full object-cover"
                />

                {/* Sleek Catalog Switcher (Floating at the Bottom-Left of the Photo) */}
                <div className="absolute bottom-3 left-3 z-10 inline-flex items-center p-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                  <button
                    onClick={() => {
                      playHapticClick();
                      setActiveScenarioId("fashion_heritage");
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
                      {companionsTotal > 0 ? "Combined Order Total" : "Item Price"}
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      {companionsTotal > 0 ? (
                        <>
                          <span className="text-base sm:text-lg line-through font-mono text-neutral-400">
                            ${currentScenario.anchorProduct.price.toFixed(2)}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950">
                            ${finalBasketTotal.toFixed(2)}
                          </span>
                          <span className="text-xs font-mono text-emerald-700 font-semibold">
                            (+${companionsTotal.toFixed(2)} co-curated)
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950">
                          ${currentScenario.anchorProduct.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Proceed to 1-Click Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: WHAT CULTURALLY BELONGS WITH THIS */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${mode === "tastedrop" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className="text-sm sm:text-base font-semibold tracking-tight text-neutral-950">
                    {mode === "tastedrop" ? "What Culturally Belongs With This" : "Frequently Bought Together"}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {mode === "tastedrop" ? "Qloo Taste AI™ Dynamic Affinity" : "Standard Frequency Baseline"}
                </span>
              </div>

              {/* 2 Companion Cards with Direct Checkbox Click */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedRecommendations.map((item) => {
                  const isSelected = selectedAddons.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleAddon(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center select-none ${
                        isSelected
                          ? "bg-neutral-50/90 border-neutral-950 shadow-sm ring-1 ring-neutral-950"
                          : "bg-neutral-50/40 border-neutral-200 hover:bg-white hover:border-neutral-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="relative shrink-0 w-15 h-15 w-[60px] h-[60px] rounded-xl overflow-hidden border border-neutral-200 shadow-2xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
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

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 truncate font-medium">
                            {item.category}
                          </span>
                          {mode === "tastedrop" && (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 shrink-0">
                              {item.qlooAffinity}% match
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-medium text-neutral-950 leading-snug line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-950 font-mono block">
                          +${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
        <footer className="border-t border-neutral-200/80 pt-2.5 pb-2 flex items-center justify-between text-xs text-neutral-400 font-mono shrink-0">
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
