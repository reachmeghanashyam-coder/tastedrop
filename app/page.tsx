"use client";

import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { SCENARIOS, ProductSKU } from "@/lib/catalog";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { playHarmonicChime, playHapticClick } from "@/lib/audio";

export default function Home() {
  const [activeScenarioId, setActiveScenarioId] = useState<"home_decor" | "fashion_heritage">("home_decor");
  const [mode, setMode] = useState<"baseline" | "tastedrop">("tastedrop");
  
  // UI Journey States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Cart & Telemetry Data States
  const currentScenario = SCENARIOS[activeScenarioId] || SCENARIOS.home_decor;
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
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

  // Trigger real backend simulation query
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

  // Run simulation query on scenario or mode change
  useEffect(() => {
    executeSimulation(mode, activeScenarioId);
    // Auto-select first addon in TasteDrop mode for immediate delight
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

  const handleAddToCart = () => {
    playHarmonicChime(528);
    setIsDrawerOpen(true);
  };

  const handleProceedToCheckout = () => {
    playHarmonicChime(660);
    setIsDrawerOpen(false);
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setIsDrawerOpen(false);
    setSelectedAddons([]);
  };

  const displayedRecommendations: ProductSKU[] =
    mode === "tastedrop"
      ? currentScenario.tasteDropCompanions.prePurchase
      : currentScenario.baselineAccessories;

  const confirmedSelectedItems = currentScenario.tasteDropCompanions.prePurchase.filter((item) =>
    selectedAddons.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navigation & Comparative Controls */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-12">
        
        {/* THE HERO SECTION (Final Unified Copy Standard) */}
        {!isConfirmed && (
          <section className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2 animate-in fade-in duration-300">
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-neutral-950 leading-[1.15]">
              Your shopping cart knows what you bought. <br className="hidden sm:inline" />
              <span className="text-neutral-500 font-normal">We find what actually belongs with it.</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto font-normal">
              <strong className="text-neutral-900 font-medium">"Frequently Bought Together"</strong> algorithms are trapped in predictable accessory loops. 
              TasteDrop uses cultural intelligence to unlock high-margin, cross-category lifestyle bundles.
            </p>

            {/* Clean Scenario Switcher Pills */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-neutral-400 font-mono">Scenario:</span>
              <button
                onClick={() => {
                  playHapticClick();
                  setActiveScenarioId("home_decor");
                  handleReset();
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeScenarioId === "home_decor"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                Mid-Century Center Table
              </button>
              <button
                onClick={() => {
                  playHapticClick();
                  setActiveScenarioId("fashion_heritage");
                  handleReset();
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeScenarioId === "fashion_heritage"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                Vintage Leather Jacket
              </button>
            </div>
          </section>
        )}

        {/* STEP 1: PRODUCT PAGE SIMULATION */}
        {!isConfirmed ? (
          <section className="max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 sm:p-10 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Product Photography */}
              <div className="relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 aspect-square group">
                <img
                  src={currentScenario.anchorProduct.image}
                  alt={currentScenario.anchorProduct.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-semibold text-neutral-900 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    {currentScenario.categoryName}
                  </span>
                </div>
              </div>

              {/* Product Info & Action */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">
                      {currentScenario.anchorProduct.rating} ({currentScenario.anchorProduct.reviewsCount.toLocaleString()} reviews)
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight leading-snug">
                    {currentScenario.anchorProduct.title}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">{currentScenario.anchorProduct.subtitle}</p>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {currentScenario.anchorProduct.description}
                </p>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 block">Retail Price</span>
                    <span className="text-2xl font-bold text-neutral-950 font-mono">
                      ${currentScenario.anchorProduct.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="py-3 px-6 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <span>Add to Basket</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Instant Hint */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
                  <span>Mode: <strong className="text-neutral-900">{mode === "tastedrop" ? "TasteDrop Activated" : "Standard Mode"}</strong></span>
                  <span className="font-mono text-emerald-600">Click Add to Basket to trigger simulation</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* STEP 2: ORDER CONFIRMATION & 1-CLICK POST-PURCHASE INTERCEPT */
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
        )}
      </main>

      {/* Cart Drawer (Pre-Purchase Basket Slide-Out) */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mode={mode}
        anchorTitle={currentScenario.anchorProduct.title}
        anchorPrice={currentScenario.anchorProduct.price}
        anchorImage={currentScenario.anchorProduct.image}
        recommendations={displayedRecommendations}
        selectedAddons={selectedAddons}
        onToggleAddon={handleToggleAddon}
        onProceedToCheckout={handleProceedToCheckout}
        isSimulating={isSimulating}
      />

      {/* The Back Door: Cognitive Telemetry & Live Qloo API Inspector */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        provenance={telemetryData}
        mode={mode}
        scenarioTitle={currentScenario.anchorProduct.qlooEntityQuery}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-center text-xs text-neutral-500">
        <p>TasteDrop // The Cultural Cart Agent · Built for the Qloo Agentic Hackathon · 100% Zero PII</p>
      </footer>
    </div>
  );
}
