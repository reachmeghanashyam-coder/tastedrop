"use client";

import React, { useState } from "react";
import { CheckCircle2, Package, Sparkles, Plus, Check, ArrowLeft, Clock } from "lucide-react";
import { ProductSKU } from "@/lib/catalog";

interface ConfirmationProps {
  orderNumber: string;
  anchorTitle: string;
  anchorPrice: number;
  anchorImage: string;
  prePurchaseItems: ProductSKU[];
  postPurchaseItem: ProductSKU;
  mode: "baseline" | "tastedrop";
  onReset: () => void;
  onOpenTelemetry: () => void;
}

export function OrderConfirmation({
  orderNumber,
  anchorTitle,
  anchorPrice,
  anchorImage,
  prePurchaseItems,
  postPurchaseItem,
  mode,
  onReset,
  onOpenTelemetry,
}: ConfirmationProps) {
  const [postAdded, setPostAdded] = useState(false);

  const initialTotal = anchorPrice + prePurchaseItems.reduce((acc, item) => acc + item.price, 0);
  const finalTotal = postAdded ? initialTotal + postPurchaseItem.price : initialTotal;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      
      {/* Success Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Order Confirmed</h2>
              <p className="text-xs text-neutral-400 font-mono">Order #{orderNumber} · Verified Payment Approved</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block">Delivery ETA</span>
            <span className="text-xs font-medium text-emerald-400 font-mono">Tuesday by 10 PM</span>
          </div>
        </div>
      </div>

      {/* Package Summary */}
      <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Shipment Package Details</span>
          <span className="text-xs font-mono text-neutral-500">1 Box · Priority Dispatch</span>
        </div>

        <div className="space-y-3">
          {/* Anchor Item */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <img src={anchorImage} alt={anchorTitle} className="w-12 h-12 rounded-xl object-cover border border-neutral-100" />
              <div>
                <h4 className="text-xs font-medium text-neutral-900">{anchorTitle}</h4>
                <span className="text-[10px] text-neutral-400">Primary Selection</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-neutral-900">${anchorPrice.toFixed(2)}</span>
          </div>

          {/* Pre-purchase selected add-ons */}
          {prePurchaseItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-t border-neutral-100/60">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-neutral-100" />
                <div>
                  <h4 className="text-xs font-medium text-neutral-900">{item.title}</h4>
                  <span className="text-[10px] text-emerald-600 font-mono">Grounded Companion</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-neutral-900">${item.price.toFixed(2)}</span>
            </div>
          ))}

          {/* Post-Purchase Intercept item (if added) */}
          {postAdded && (
            <div className="flex items-center justify-between py-2 border-t border-emerald-100 bg-emerald-50/30 px-3 rounded-xl animate-in fade-in">
              <div className="flex items-center gap-3">
                <img src={postPurchaseItem.image} alt={postPurchaseItem.title} className="w-12 h-12 rounded-xl object-cover border border-emerald-200" />
                <div>
                  <h4 className="text-xs font-medium text-neutral-900">{postPurchaseItem.title}</h4>
                  <span className="text-[10px] text-emerald-700 font-semibold">Post-Purchase 1-Click Addition</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-neutral-900">${postPurchaseItem.price.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Total Arithmetic */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-900">Total Charged:</span>
          <div className="text-right">
            <span className="text-base font-bold text-neutral-900 font-mono">${finalTotal.toFixed(2)}</span>
            {postAdded && (
              <span className="block text-[11px] text-emerald-600 font-medium font-mono">
                +${postPurchaseItem.price.toFixed(2)} added before warehouse seal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* THE POST-PURCHASE INTERCEPT: 1-Click Supplemental Addition */}
      {mode === "tastedrop" && !postAdded && (
        <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emeraldVibe" />
              <span className="text-xs font-semibold text-neutral-900 tracking-tight">
                One Final Sensory Touch for Your Space
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ships in 28 mins</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 flex items-center gap-4">
            <img
              src={postPurchaseItem.image}
              alt={postPurchaseItem.title}
              className="w-16 h-16 rounded-xl object-cover border border-neutral-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                  {postPurchaseItem.category}
                </span>
                <span className="text-[10px] font-mono text-emeraldVibe bg-neutral-900 px-1.5 py-0.2 rounded">
                  {postPurchaseItem.qlooAffinity}% Affinity
                </span>
              </div>
              <h5 className="font-medium text-xs text-neutral-900 truncate">{postPurchaseItem.title}</h5>
              <p className="text-[11px] text-neutral-500 line-clamp-1">{postPurchaseItem.editorialNote}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-neutral-900">${postPurchaseItem.price.toFixed(2)}</span>
                {postPurchaseItem.originalPrice && (
                  <span className="text-[11px] text-neutral-400 line-through">
                    ${postPurchaseItem.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setPostAdded(true)}
              className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Delivery</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onReset}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Test Another Scenario</span>
        </button>

        <button
          onClick={onOpenTelemetry}
          className="text-xs font-mono font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <span>⚡ Inspect Provenance Pipeline</span>
        </button>
      </div>
    </div>
  );
}
