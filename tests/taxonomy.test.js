const test = require("node:test");
const assert = require("node:assert/strict");

/**
 * Cultural Relationship Registry & Matching Tier Tests
 */

// Simulated candidates matching lib/matcher.ts STORE_CANDIDATE_POOL
const CANDIDATE_VINYL = {
  id: "td_stooges_vinyl",
  title: "The Stooges: 'Raw Power' (David Bowie Mix) 180g Audiophile Vinyl",
  price: 28.00,
  category: "Rare & Heritage Vinyl",
  candidateCategory: "vinyl",
  qlooMatchKeywords: ["stooges", "proto-punk", "garage-rock", "mc5", "rock", "new york dolls"]
};

const REGISTRY = {
  "the sonics": {
    entityName: "The Sonics",
    concepts: ["garage-rock", "proto-punk"],
    provenance: "Pacific Northwest Garage Movement"
  },
  "mc5": {
    entityName: "MC5",
    concepts: ["proto-punk", "garage-rock", "detroit-scene"],
    provenance: "Detroit 1968-1972 Counterculture Archive"
  },
  "iggy pop": {
    entityName: "Iggy Pop",
    concepts: ["proto-punk", "glam-rock", "detroit-scene"],
    provenance: "CBGB & Detroit Proto-Punk Lineage"
  }
};

function evaluateCandidateMultiTier(candidate, liveEntities, registry = REGISTRY, minThreshold = 0.80) {
  let bestEntity = null;
  let tier = null;
  let concept = null;
  let provenance = null;

  for (const ent of liveEntities) {
    const entLower = ent.name.toLowerCase().trim();
    const entGenres = (ent.genres || []).map(g => g.toLowerCase().trim());
    const keywords = candidate.qlooMatchKeywords.map(k => k.toLowerCase().trim());

    // Tier 1: Direct Entity Match
    const directMatch = keywords.some(kw => {
      const tokens = entLower.split(/[^a-z0-9]+/);
      return tokens.includes(kw) || entLower === kw;
    });

    if (directMatch) {
      if (!bestEntity || ent.affinity > bestEntity.affinity) {
        bestEntity = ent;
        tier = "Tier 1: Direct Entity Match";
        concept = ent.name;
        provenance = "Direct artist/creator catalog match";
      }
      continue;
    }

    // Tier 2: Cultural Concept Expansion
    const entry = registry[entLower];
    if (entry) {
      const matchingConcept = entry.concepts.find(c => 
        keywords.some(kw => kw.includes(c) || c.includes(kw))
      );
      if (matchingConcept) {
        if (!bestEntity || ent.affinity > bestEntity.affinity) {
          bestEntity = ent;
          tier = "Tier 2: Cultural Concept Expansion";
          concept = matchingConcept;
          provenance = `${entry.provenance} (${entry.entityName} → ${matchingConcept})`;
        }
        continue;
      }
    }

    // Tier 3: Metadata Alignment
    const genreMatch = entGenres.find(g => 
      keywords.some(kw => g.split(/[^a-z0-9]+/).includes(kw) || g === kw)
    );
    if (genreMatch) {
      if (!bestEntity || ent.affinity > bestEntity.affinity) {
        bestEntity = ent;
        tier = "Tier 3: Metadata Alignment";
        concept = genreMatch;
        provenance = `Qloo Genre Classification (${genreMatch})`;
      }
    }
  }

  const affinity = bestEntity ? bestEntity.affinity : 0.0;
  return {
    accepted: affinity >= minThreshold,
    tier,
    concept,
    provenance,
    affinity,
    matchedEntityName: bestEntity ? bestEntity.name : null
  };
}

test("Tier 1: MC5 matches vinyl via Direct Entity Match", () => {
  const qlooResponse = [{ name: "MC5", affinity: 0.9714, genres: [] }];
  const res = evaluateCandidateMultiTier(CANDIDATE_VINYL, qlooResponse);
  assert.equal(res.accepted, true);
  assert.equal(res.tier, "Tier 1: Direct Entity Match");
  assert.equal(res.matchedEntityName, "MC5");
  assert.equal(res.affinity, 0.9714);
});

test("Tier 2: The Sonics matches vinyl via Cultural Concept Expansion (garage-rock)", () => {
  // Candidate vinyl does NOT have "the sonics" in its title or creators
  // But registry connects The Sonics -> garage-rock -> matches candidate's garage-rock tag!
  const qlooResponse = [{ name: "The Sonics", affinity: 0.9546, genres: [] }];
  const res = evaluateCandidateMultiTier(CANDIDATE_VINYL, qlooResponse);
  assert.equal(res.accepted, true);
  assert.equal(res.tier, "Tier 2: Cultural Concept Expansion");
  assert.equal(res.concept, "garage-rock");
  assert.equal(res.matchedEntityName, "The Sonics");
  assert.match(res.provenance, /Pacific Northwest Garage Movement/);
});

test("Tier 2: Iggy Pop matches vinyl via Cultural Concept Expansion (proto-punk)", () => {
  const qlooResponse = [{ name: "Iggy Pop", affinity: 0.9543, genres: [] }];
  const res = evaluateCandidateMultiTier(CANDIDATE_VINYL, qlooResponse);
  assert.equal(res.accepted, true);
  assert.equal(res.tier, "Tier 2: Cultural Concept Expansion");
  assert.equal(res.concept, "proto-punk");
  assert.match(res.provenance, /CBGB & Detroit Proto-Punk Lineage/);
});

test("Taxonomy Integrity: Removing taxonomy relationship causes match to disappear", () => {
  const prunedRegistry = { ...REGISTRY };
  delete prunedRegistry["the sonics"]; // Remove The Sonics from registry

  const qlooResponse = [{ name: "The Sonics", affinity: 0.9546, genres: [] }];
  const res = evaluateCandidateMultiTier(CANDIDATE_VINYL, qlooResponse, prunedRegistry);
  assert.equal(res.accepted, false, "When taxonomy relationship is removed, recommendation must disappear");
  assert.equal(res.affinity, 0.0);
});

test("Negative Control: Bach receives zero matches and is rejected", () => {
  const qlooResponse = [{ name: "Johann Sebastian Bach", affinity: 0.9850, genres: ["baroque", "classical"] }];
  const res = evaluateCandidateMultiTier(CANDIDATE_VINYL, qlooResponse);
  assert.equal(res.accepted, false);
  assert.equal(res.affinity, 0.0);
  assert.equal(res.tier, null);
});
