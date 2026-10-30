// lib/matcher.ts
/**
 * Dynamic Cultural Constraint Solver & Agent Matcher
 * 
 * Takes live Qloo insights, maps discovered cultural vectors onto candidate merchant SKUs,
 * evaluates constraints (budget, affinity threshold, category diversity), and produces
 * a transparent decision record.
 */

import { ProductSKU } from "./catalog";
import { QlooInsightItem, QlooStatus } from "./qloo";

export interface CandidateItem extends ProductSKU {
  candidateCategory: "lighting" | "print" | "fragrance" | "vinyl" | "apparel" | "care";
  qlooMatchKeywords: string[]; // Keywords matched against Qloo entities/genres (e.g., ["stooges", "proto-punk", "rock", "mc5", "punk"])
  culturalContext: string;
}

export interface AgentConstraints {
  minAffinityScore: number; // 0.0 to 1.0 (Qloo cosine affinity)
  maxBudget?: number;      // Maximum spend allowed for companion bundle
  maxItems?: number;       // Maximum items to select (default 2)
}

export interface CandidateEvaluationTrace {
  productId: string;
  title: string;
  price: number;
  category: string;
  status: "ACCEPTED" | "REJECTED";
  qlooEvidence?: {
    matchedEntityName?: string;
    matchedSubtype?: string;
    affinityScore?: number;
    genreOverlap?: string[];
  };
  rejectionReason?: string;
}

export interface MatcherOutput {
  status: QlooStatus;
  selectedProducts: ProductSKU[];
  evaluationAudit: CandidateEvaluationTrace[];
  activeConstraints: AgentConstraints;
  runningSpend: number;
  qlooSourceSummary: string;
}

/**
 * Universal Merchant Catalog Candidates
 * These are the actual store products evaluated by the solver.
 */
export const STORE_CANDIDATE_POOL: Record<string, CandidateItem[]> = {
  fashion_heritage: [
    {
      id: "td_stooges_vinyl",
      title: "The Stooges: 'Raw Power' (David Bowie Mix) 180g Audiophile Vinyl",
      category: "Rare & Heritage Vinyl",
      candidateCategory: "vinyl",
      price: 28.00,
      originalPrice: 35.00,
      discountBadge: "Cultural Anchor",
      rating: 4.9,
      reviewsCount: 880,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Seminal proto-punk record that soundtracked 1970s motorcycle culture.",
      qlooTag: "garage_proto_punk",
      qlooAffinity: 0,
      qlooMatchKeywords: ["stooges", "proto-punk", "punk", "mc5", "rock", "new york dolls"],
      culturalContext: "Direct cultural audio companion to 1970s CBGB motorcycle leather subculture."
    },
    {
      id: "td_jazz_club",
      title: "Maison Margiela REPLICA 'Jazz Club' Eau de Toilette (Travel Spray)",
      category: "Artisanal Fragrance",
      candidateCategory: "fragrance",
      price: 38.00,
      originalPrice: 45.00,
      discountBadge: "Curated Companion",
      rating: 4.8,
      reviewsCount: 1650,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Smoky rum and tobacco leaf accords that pair with vintage leather.",
      qlooTag: "niche_fragrance_subculture",
      qlooAffinity: 0,
      qlooMatchKeywords: ["margiela", "lifestyle", "parfum", "tobacco", "leather"],
      culturalContext: "Sensory olfactory pairing designed around Brooklyn jazz club and aged leather accords."
    },
    {
      id: "iron-heart-flannel",
      title: "Iron Heart Ultra Heavy 12oz Selvedge Tartan Flannel",
      category: "Japanese Textiles",
      candidateCategory: "apparel",
      price: 360.00,
      originalPrice: 395.00,
      discountBadge: "Vintage Shuttle Loom",
      rating: 4.9,
      reviewsCount: 420,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Woven in Japan on vintage shuttle looms from Peruvian Aspero cotton.",
      qlooTag: "selvedge_textile",
      qlooAffinity: 0,
      qlooMatchKeywords: ["rock", "workwear", "denim", "motorcycle"],
      culturalContext: "High-density Japanese motorcycle subculture apparel."
    },
    {
      id: "base_leather_cleaner",
      title: "Bickmore Bick 4 Premium Leather Cleaner & Conditioner (8 oz)",
      category: "Cleaning & Maintenance",
      candidateCategory: "care",
      price: 12.00,
      rating: 4.6,
      reviewsCount: 5240,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Standard maintenance utility bottle.",
      qlooTag: "utility_cleaner",
      qlooAffinity: 0,
      qlooMatchKeywords: ["cleaner", "maintenance", "conditioner"],
      culturalContext: "Commodity maintenance supply with zero aesthetic/cultural correlation."
    }
  ],
  home_decor: [
    {
      id: "td_cast_iron_dish",
      title: "Cast Iron Raw Forged Organic Sculptural Dish",
      category: "Artisanal Decor",
      candidateCategory: "lighting",
      price: 34.00,
      originalPrice: 42.00,
      discountBadge: "Hand-Forged",
      rating: 4.9,
      reviewsCount: 320,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Raw forged cast iron complements the dark sculptural walnut base.",
      qlooTag: "brutalist_decor",
      qlooAffinity: 0,
      qlooMatchKeywords: ["sculpture", "minimalism", "design", "decor", "japan"],
      culturalContext: "Biomorphic metalcraft complementing Noguchi's sculpted organic geometry."
    },
    {
      id: "td_taschen_book",
      title: "Taschen: Brutalism in Architecture & Modern Spatial Design",
      category: "Design & Art Monographs",
      candidateCategory: "print",
      price: 42.00,
      originalPrice: 50.00,
      discountBadge: "Top Cultural Trend",
      rating: 4.8,
      reviewsCount: 914,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      editorialNote: "The authoritative visual companion for modernist living spaces.",
      qlooTag: "architectural_monograph",
      qlooAffinity: 0,
      qlooMatchKeywords: ["architecture", "monograph", "book", "modernism", "spatial"],
      culturalContext: "Curated design theory publication exploring mid-century sculptural spaces."
    },
    {
      id: "flos-snoopy-lamp",
      title: "Flos Snoopy Enamel & Marble Table Light",
      category: "Sculptural Lighting",
      candidateCategory: "lighting",
      price: 1250.00,
      rating: 4.9,
      reviewsCount: 95,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Carrara marble and enameled steel table light.",
      qlooTag: "italian_lighting",
      qlooAffinity: 0,
      qlooMatchKeywords: ["marble", "lighting", "castiglioni"],
      culturalContext: "Radical Italian design counterpart to mid-century furniture."
    },
    {
      id: "base_table_cloth",
      title: "Crystal Clear Heavy-Duty PVC Vinyl Tablecloth Protector",
      category: "Cleaning & Maintenance",
      candidateCategory: "care",
      price: 14.99,
      rating: 4.1,
      reviewsCount: 3120,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
      editorialNote: "Transparent PVC plastic cover.",
      qlooTag: "pvc_cover",
      qlooAffinity: 0,
      qlooMatchKeywords: ["pvc", "plastic", "protector"],
      culturalContext: "Aesthetic-destroying plastic utility protector."
    }
  ]
};

/**
 * Match Qloo live insight entities against merchant candidates and solve constraints.
 */
export function solveDynamicBundle(
  scenarioId: string,
  liveEntities: QlooInsightItem[],
  status: QlooStatus,
  constraints: AgentConstraints,
  offlineMessage?: string
): MatcherOutput {
  const pool = STORE_CANDIDATE_POOL[scenarioId] || STORE_CANDIDATE_POOL.fashion_heritage;
  const maxItems = constraints.maxItems ?? 2;
  const budgetCap = constraints.maxBudget ?? 150.00; // Cap to keep upsell reasonable
  const minAffinity = constraints.minAffinityScore ?? 0.80;

  const selectedProducts: ProductSKU[] = [];
  const evaluationAudit: CandidateEvaluationTrace[] = [];
  const usedCategories = new Set<string>();
  let currentSpend = 0;

  for (const candidate of pool) {
    // 1. Evaluate Cultural Evidence from Qloo
    let bestMatchedEntity: QlooInsightItem | null = null;
    let matchedKeywords: string[] = [];

    if (status === "LIVE_SUCCESS" && liveEntities.length > 0) {
      // Find highest affinity entity matching candidate's cultural keywords
      for (const ent of liveEntities) {
        const entNameLower = ent.name.toLowerCase();
        const entGenres = (ent.genres || []).map(g => g.toLowerCase());
        
        const matches = candidate.qlooMatchKeywords.some(kw => 
          entNameLower.includes(kw) || entGenres.some(g => g.includes(kw))
        );

        if (matches) {
          if (!bestMatchedEntity || ent.affinity > bestMatchedEntity.affinity) {
            bestMatchedEntity = ent;
            matchedKeywords.push(ent.name);
          }
        }
      }
    }

    // Determine derived affinity score
    let calculatedAffinity = 0;
    let evidenceNote = "";

    if (bestMatchedEntity) {
      calculatedAffinity = bestMatchedEntity.affinity;
      evidenceNote = `Live Qloo correlation: Matched related entity '${bestMatchedEntity.name}' (${bestMatchedEntity.subtype}) with affinity ${(calculatedAffinity * 100).toFixed(1)}%`;
    } else if (candidate.candidateCategory === "care") {
      calculatedAffinity = 0.12; // Maintenance commodities have near-zero cultural affinity
      evidenceNote = "Maintenance utility commodity: No cultural entity or subculture affinity discovered in Qloo graph";
    } else if (status === "LIVE_SUCCESS") {
      // In live mode: If candidate has no correlation to the live Qloo graph, it has 0.0 cultural evidence
      calculatedAffinity = 0.0;
      evidenceNote = `Rejected: No correlation discovered in live Qloo graph for active anchor query`;
    } else {
      // Explicit offline demo fallback
      calculatedAffinity = 0.88;
      evidenceNote = `Offline fallback mode: ${offlineMessage || "Demonstration baseline"}`;
    }

    // Constraint 1: Affinity Threshold
    if (calculatedAffinity < minAffinity) {
      evaluationAudit.push({
        productId: candidate.id,
        title: candidate.title,
        price: candidate.price,
        category: candidate.category,
        status: "REJECTED",
        rejectionReason: `Cultural affinity ${(calculatedAffinity * 100).toFixed(1)}% is below threshold ${(minAffinity * 100).toFixed(0)}% (${evidenceNote})`,
        qlooEvidence: bestMatchedEntity ? {
          matchedEntityName: bestMatchedEntity.name,
          affinityScore: calculatedAffinity
        } : undefined
      });
      continue;
    }

    // Constraint 2: Budget Cap
    if (currentSpend + candidate.price > budgetCap) {
      evaluationAudit.push({
        productId: candidate.id,
        title: candidate.title,
        price: candidate.price,
        category: candidate.category,
        status: "REJECTED",
        rejectionReason: `Price ($${candidate.price.toFixed(2)}) exceeds remaining bundle budget ($${(budgetCap - currentSpend).toFixed(2)})`,
        qlooEvidence: bestMatchedEntity ? {
          matchedEntityName: bestMatchedEntity.name,
          affinityScore: calculatedAffinity
        } : undefined
      });
      continue;
    }

    // Constraint 3: Category Diversity Guard
    if (usedCategories.has(candidate.candidateCategory)) {
      evaluationAudit.push({
        productId: candidate.id,
        title: candidate.title,
        price: candidate.price,
        category: candidate.category,
        status: "REJECTED",
        rejectionReason: `Category '${candidate.candidateCategory}' already fulfilled by higher-ranking companion`,
        qlooEvidence: bestMatchedEntity ? {
          matchedEntityName: bestMatchedEntity.name,
          affinityScore: calculatedAffinity
        } : undefined
      });
      continue;
    }

    // All constraints passed -> Accept Candidate
    usedCategories.add(candidate.candidateCategory);
    currentSpend += candidate.price;

    const acceptedProduct: ProductSKU = {
      id: candidate.id,
      title: candidate.title,
      category: candidate.category,
      price: candidate.price,
      originalPrice: candidate.originalPrice,
      discountBadge: candidate.discountBadge,
      rating: candidate.rating,
      reviewsCount: candidate.reviewsCount,
      isPrime: candidate.isPrime,
      image: candidate.image,
      editorialNote: candidate.editorialNote,
      qlooTag: candidate.qlooTag,
      qlooAffinity: Math.round(calculatedAffinity * 100),
      isUtilitySlop: false
    };

    selectedProducts.push(acceptedProduct);
    evaluationAudit.push({
      productId: candidate.id,
      title: candidate.title,
      price: candidate.price,
      category: candidate.category,
      status: "ACCEPTED",
      qlooEvidence: {
        matchedEntityName: bestMatchedEntity?.name || "Curated Aesthetic Vector",
        affinityScore: calculatedAffinity,
        genreOverlap: bestMatchedEntity?.genres
      }
    });

    if (selectedProducts.length >= maxItems) {
      break;
    }
  }

  return {
    status,
    selectedProducts,
    evaluationAudit,
    activeConstraints: constraints,
    runningSpend: currentSpend,
    qlooSourceSummary: status === "LIVE_SUCCESS" 
      ? `Live Qloo Graph (${liveEntities.length} entities traversed from hackathon.api.qloo.com)`
      : `Fallback (${status})`
  };
}
