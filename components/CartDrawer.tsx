"use client";

import React from "react";
import { Star, ShieldCheck, Check, Sparkles, ArrowRight, X } from "lucide-react";
import { ProductSKU } from "@/lib/catalog";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "baseline" | "tastedrop";
  anchorTitle: string;
  anchorPrice: number;
  anchorImage: string;
  recommendations: ProductSKU[];
  selectedAddons: string[];
  onToggleAddon: (id: string) => void;
  onProceedToCheckout: () => void;
  isSimulating: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  mode,
  anchorTitle,
  anchorPrice,
  anchorImage,
  recommendations,
  selectedAddons,
  onToggleAddon,
  onProceedToCheckout,
  isSimulating,
}: DrawerProps) {
  if (!isOpen) return null;

  const addonsTotal = recommendations
    .filter((item) => selectedAddons.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const cartTotal = anchorPrice + addonsTotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Your Shopping Basket</span>
            <h3 className="font-semibold text-neutral-900 text-sm">1 Primary Item Added</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Primary Item Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex gap-4 items-center">
            <img
              src={anchorImage}
              alt={anchorTitle}
              className="w-20 h-20 rounded-xl object-cover border border-neutral-200 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Primary Selection
              </span>
              <h4 className="font-medium text-xs text-neutral-900 truncate">{anchorTitle}</h4>
              <p className="text-sm font-semibold text-neutral-900 mt-1">${anchorPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Section Divider & Comparison Badge */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                {mode === "tastedrop" ? (
                  <>
                    <Sparkles className="w-4 h-4 text-emeraldVibe" />
                    <span className="font-semibold text-xs tracking-tight text-neutral-900">
                      Curated Companions (TasteDrop)
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-xs tracking-tight text-neutral-700">
                    Frequently Bought Together (Standard)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {mode === "tastedrop" ? "Qloo Taste Graph Match" : "Taxonomic Co-occurrence"}
              </span>
            </div>

            {/* Recommendation Cards */}
            <div className="space-y-3">
              {recommendations.map((item) => {
                const isSelected = selectedAddons.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleAddon(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center select-none ${
                      isSelected
                        ? "bg-neutral-50 border-neutral-900 shadow-sm"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-100"
                      />
                      <div
                        className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-transparent border-neutral-300"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                        {item.discountBadge && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {item.discountBadge}
                          </span>
                        )}
                        {mode === "tastedrop" && (
                          <span className="text-[10px] font-mono text-emeraldVibe bg-neutral-900 px-1.5 py-0.2 rounded">
                            {item.qlooAffinity}% Affinity
                          </span>
                        )}
                      </div>
                      <h5 className="font-medium text-xs text-neutral-900 line-clamp-1">{item.title}</h5>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{item.editorialNote}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-neutral-900">${item.price.toFixed(2)}</span>
                        {item.originalPrice && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer with Honest Dynamic Arithmetic */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Primary Item:</span>
              <span>${anchorPrice.toFixed(2)}</span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Selected Companions ({selectedAddons.length}):</span>
                <span>+${addonsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-1.5 border-t border-neutral-200">
              <span>Order Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>Proceed to 1-Click Order Confirmation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
