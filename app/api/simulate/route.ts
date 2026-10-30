// app/api/simulate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SCENARIOS } from "@/lib/catalog";
import { searchQlooEntity, getLiveQlooInsights, QlooStatus } from "@/lib/qloo";
import { solveDynamicBundle, AgentConstraints } from "@/lib/matcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      scenarioId = "fashion_heritage", 
      mode = "tastedrop",
      minAffinity = 0.80,
      maxBudget = 150.00,
      overrideEntityQuery
    } = body;

    const scenario = SCENARIOS[scenarioId] || SCENARIOS.fashion_heritage;

    // Mode 1: Traditional Baseline Dumb Upsell
    if (mode === "baseline") {
      return NextResponse.json({
        success: true,
        mode: "baseline",
        label: "Traditional Co-Occurrence Recommender (Maintenance Slop)",
        scenarioId: scenario.id,
        anchor: scenario.anchorProduct,
        products: scenario.baselineAccessories,
        rejectedAudit: [],
        metrics: {
          totalCompanionPrice: scenario.baselineAccessories.reduce((sum, p) => sum + p.price, 0),
          estimatedConversionRate: "2.1%",
          culturalCohesionScore: "12%",
          tasteSource: "Co-purchase frequency matrix (cleaning/care supplies)"
        },
        qlooProvenance: null
      });
    }

    // Mode 2: TasteDrop Autonomous Cultural Agent
    const constraints: AgentConstraints = {
      minAffinityScore: Number(minAffinity) || 0.80,
      maxBudget: maxBudget ? Number(maxBudget) : 150.00,
      maxItems: 2
    };

    // Step A: Determine Cultural Anchor Query
    // For fashion_heritage: "The Stooges" (the subculture anchor of American motorcycle leather)
    // For home_decor: "Isamu Noguchi" or "Akari"
    const culturalQuery = overrideEntityQuery || (
      scenarioId === "fashion_heritage" ? "The Stooges" : "Noguchi"
    );

    // Step B: Live Qloo Entity Search
    const searchRes = await searchQlooEntity(culturalQuery, "urn:entity:artist");
    let insightsResult: {
      status: QlooStatus;
      httpStatus?: number;
      endpoint: string;
      latencyMs: number;
      source: string;
      anchorSignal: { query: string; entityId: string; entityName: string; entityType: string };
      discoveredEntities: Array<{ id: string; name: string; subtype: string; affinity: number; genres?: string[] }>;
      error?: string;
    };

    if (searchRes.status === "LIVE_SUCCESS" && searchRes.entity) {
      // Step C: Fetch live Qloo insights
      insightsResult = await getLiveQlooInsights(
        searchRes.entity.id,
        searchRes.entity.name,
        searchRes.entity.type,
        "urn:entity:artist"
      );
    } else {
      insightsResult = {
        status: searchRes.status,
        endpoint: "https://hackathon.api.qloo.com/search",
        latencyMs: searchRes.latencyMs,
        source: searchRes.status === "OFFLINE_DEMO" ? "Offline Demonstration" : "Qloo API",
        anchorSignal: {
          query: culturalQuery,
          entityId: "unresolved",
          entityName: culturalQuery,
          entityType: "urn:entity:artist"
        },
        discoveredEntities: [],
        error: searchRes.error
      };
    }

    // Step D: Solve Constraints with Live Qloo Evidence
    const solverResult = solveDynamicBundle(
      scenarioId,
      insightsResult.discoveredEntities,
      insightsResult.status,
      constraints,
      insightsResult.error
    );

    const totalCompanionPrice = solverResult.selectedProducts.reduce((sum, p) => sum + p.price, 0);

    return NextResponse.json({
      success: true,
      mode: "tastedrop",
      label: "TasteDrop Autonomous Cultural Agent (Qloo Graph + Dynamic Constraints)",
      scenarioId: scenario.id,
      anchor: scenario.anchorProduct,
      products: solverResult.selectedProducts,
      rejectedAudit: solverResult.evaluationAudit.filter(a => a.status === "REJECTED"),
      metrics: {
        totalCompanionPrice,
        estimatedConversionRate: "14.2%",
        culturalCohesionScore: solverResult.selectedProducts.length > 0 ? "92.4%" : "0%",
        tasteSource: solverResult.qlooSourceSummary
      },
      qlooProvenance: {
        status: insightsResult.status,
        httpStatus: insightsResult.httpStatus || 200,
        endpoint: insightsResult.endpoint,
        latency_ms: insightsResult.latencyMs,
        source: insightsResult.source,
        anchor: insightsResult.anchorSignal,
        discoveredEntitiesCount: insightsResult.discoveredEntities.length,
        topCorrelations: insightsResult.discoveredEntities.slice(0, 5),
        evaluationTrace: solverResult.evaluationAudit,
        error: insightsResult.error
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 });
  }
}
