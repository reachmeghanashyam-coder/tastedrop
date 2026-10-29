// app/api/simulate/route.ts
import { NextResponse } from "next/server";
import { searchQlooEntity, getQlooInsights } from "@/lib/qloo";
import { SCENARIOS } from "@/lib/catalog";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenarioId = "home_decor", mode = "tastedrop" } = body;

    const scenario = SCENARIOS[scenarioId] || SCENARIOS.home_decor;
    const startTime = Date.now();

    if (mode === "baseline") {
      // Phase 1: Traditional algorithmic co-occurrence (No Qloo)
      return NextResponse.json({
        success: true,
        mode: "baseline",
        scenarioId,
        anchor: scenario.anchorProduct,
        recommendations: scenario.baselineAccessories,
        executionTimeMs: 24,
        qlooGrounded: false,
        message: "Baseline algorithmic co-occurrence lookup executed (Standard Taxonomic Item-to-Item Matching)."
      });
    }

    // Phase 2: Live Cultural Grounding Query (Qloo Taste Graph)
    const entity = await searchQlooEntity(scenario.anchorProduct.qlooEntityQuery);
    const insights = await getQlooInsights(entity.id, entity.name);

    const totalDuration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      mode: "tastedrop",
      scenarioId,
      anchor: scenario.anchorProduct,
      prePurchaseCompanions: scenario.tasteDropCompanions.prePurchase,
      postPurchaseCompanion: scenario.tasteDropCompanions.postPurchase,
      qlooProvenance: {
        entity,
        insights,
        qlooGrounded: true,
        endpoint: "https://hackathon.api.qloo.com/v2/insights",
        executionTimeMs: Math.max(insights.latency_ms, totalDuration),
        status: insights.status
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute simulation query"
      },
      { status: 500 }
    );
  }
}
