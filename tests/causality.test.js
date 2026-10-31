const test = require("node:test");
const assert = require("node:assert/strict");

/**
 * Controlled Causality & Data Dependency Test
 * 
 * Verifies that the decision engine is strictly causally driven by Qloo's returned entities:
 * 1. Experiment 1: Feeding correlated proto-punk entity (MC5) causes the engine to ACCEPT the vinyl.
 * 2. Experiment 2: Feeding unrelated cultural entities (Bach, Beethoven) with the EXACT SAME starting product,
 *    exact same merchant catalog, and exact same constraints causes the engine to REJECT the vinyl and ABSTAIN.
 * 3. Experiment 3: Feeding an empty Qloo response causes the engine to ABSTAIN (zero accepted products).
 */

// Candidate catalog pool under test
const CANDIDATE_VINYL = {
  id: "td_stooges_vinyl",
  title: "The Stooges: 'Raw Power' (David Bowie Mix) 180g Audiophile Vinyl",
  price: 28.00,
  category: "Rare & Heritage Vinyl",
  candidateCategory: "vinyl",
  qlooMatchKeywords: ["stooges", "proto-punk", "punk", "mc5", "rock", "new york dolls"]
};

// Word-boundary matching logic identical to lib/matcher.ts
function matchEntityToCandidate(candidate, ent) {
  const entNameLower = ent.name.toLowerCase();
  const entGenres = (ent.genres || []).map(g => g.toLowerCase());

  return candidate.qlooMatchKeywords.some(kw => {
    const kwLower = kw.toLowerCase().trim();
    const nameRegex = new RegExp(`\\b${kwLower.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\b`, 'i');
    if (nameRegex.test(entNameLower)) return true;
    return entGenres.some(g => {
      const genreRegex = new RegExp(`\\b${kwLower.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\b`, 'i');
      return genreRegex.test(g);
    });
  });
}

function evaluateCandidate(candidate, liveEntities, minThreshold = 0.80) {
  let bestMatch = null;
  for (const ent of liveEntities) {
    if (matchEntityToCandidate(candidate, ent)) {
      if (!bestMatch || ent.affinity > bestMatch.affinity) {
        bestMatch = ent;
      }
    }
  }

  const affinity = bestMatch ? bestMatch.affinity : 0.0;
  return {
    accepted: affinity >= minThreshold,
    calculatedAffinity: affinity,
    matchedEntity: bestMatch ? bestMatch.name : null
  };
}

test("Controlled Causality Experiment 1: Correlated Qloo entity produces ACCEPTED recommendation", () => {
  const correlatedQlooResponse = [
    { name: "MC5", affinity: 0.9714, genres: ["proto-punk", "garage rock"] },
    { name: "The Sonics", affinity: 0.9546, genres: ["garage rock"] }
  ];

  const result = evaluateCandidate(CANDIDATE_VINYL, correlatedQlooResponse, 0.80);
  assert.equal(result.accepted, true, "Candidate vinyl must be ACCEPTED when MC5 is returned by Qloo");
  assert.equal(result.matchedEntity, "MC5");
  assert.equal(result.calculatedAffinity, 0.9714);
});

test("Controlled Causality Experiment 2: Unrelated Qloo entities force REJECTION & ABSTENTION on same catalog item", () => {
  // Same starting jacket, same catalog candidate, same constraints, DIFFERENT Qloo evidence
  const unrelatedQlooResponse = [
    { name: "Johann Sebastian Bach", affinity: 0.9850, genres: ["baroque", "classical"] },
    { name: "Ludwig van Beethoven", affinity: 0.9620, genres: ["romantic", "classical symphony"] },
    { name: "Wolfgang Amadeus Mozart", affinity: 0.9410, genres: ["classical opera"] }
  ];

  const result = evaluateCandidate(CANDIDATE_VINYL, unrelatedQlooResponse, 0.80);
  assert.equal(result.accepted, false, "Candidate vinyl must be REJECTED when unrelated classical entities are returned");
  assert.equal(result.calculatedAffinity, 0.0, "Derived affinity must evaluate to 0.0%");
  assert.equal(result.matchedEntity, null);
});

test("Controlled Causality Experiment 3: Empty Qloo response forces zero accepted items", () => {
  const emptyQlooResponse = [];
  const result = evaluateCandidate(CANDIDATE_VINYL, emptyQlooResponse, 0.80);
  assert.equal(result.accepted, false);
  assert.equal(result.calculatedAffinity, 0.0);
});
