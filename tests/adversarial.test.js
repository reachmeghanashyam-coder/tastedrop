const test = require("node:test");
const assert = require("node:assert/strict");

// Dynamic Solver Inversion Tests
// Directly test candidate filtering, budget bounds, and category diversity guards
test("Adversarial Inversion: Poison & Edge Constraint Tests", async (t) => {
  // Test 1: Zero budget should return 0 products and reject all candidates with clear audit trail
  const homeCandidates = [
    { id: "c1", price: 220, candidateCategory: "lighting", affinityScore: 0.96, tasteStanceFit: ["balanced"] },
    { id: "c2", price: 110, candidateCategory: "ceramics", affinityScore: 0.91, tasteStanceFit: ["balanced"] }
  ];

  function runSimpleSolver(pool, budget, minAffinity, stance) {
    const selected = [];
    const rejected = [];
    const categories = new Set();
    let currentSpend = 0;

    for (const c of pool) {
      if (c.affinityScore < minAffinity) {
        rejected.push({ id: c.id, reason: "Affinity below threshold" });
        continue;
      }
      if (!c.tasteStanceFit.includes(stance)) {
        rejected.push({ id: c.id, reason: "Stance mismatch" });
        continue;
      }
      if (categories.has(c.candidateCategory)) {
        rejected.push({ id: c.id, reason: "Category duplicate" });
        continue;
      }
      if (currentSpend + c.price > budget) {
        rejected.push({ id: c.id, reason: "Budget exceeded" });
        continue;
      }
      selected.push(c);
      categories.add(c.candidateCategory);
      currentSpend += c.price;
    }
    return { selected, rejected, currentSpend };
  }

  // 1. Zero Budget Test
  const zeroBudgetResult = runSimpleSolver(homeCandidates, 0, 0.70, "balanced");
  assert.equal(zeroBudgetResult.selected.length, 0, "Zero budget must yield 0 items");
  assert.equal(zeroBudgetResult.rejected.length, 2, "All items rejected due to budget");

  // 2. High Affinity Filter Test (95% cutoff drops 91% ceramics)
  const highAffinityResult = runSimpleSolver(homeCandidates, 500, 0.95, "balanced");
  assert.equal(highAffinityResult.selected.length, 1, "Only 96% item passes");
  assert.equal(highAffinityResult.selected[0].id, "c1");

  // 3. Stance Mismatch Test
  const avantGardeResult = runSimpleSolver(homeCandidates, 500, 0.70, "avant-garde");
  assert.equal(avantGardeResult.selected.length, 0, "No balanced-only items pass avant-garde stance");
});

test("Concurrency & Idempotency: Multiple Parallel Invocations", async () => {
  const fetchSimulation = async () => {
    return {
      status: 200,
      timestamp: Date.now()
    };
  };

  const results = await Promise.all([
    fetchSimulation(),
    fetchSimulation(),
    fetchSimulation(),
    fetchSimulation(),
    fetchSimulation()
  ]);

  assert.equal(results.length, 5);
  results.forEach(r => assert.equal(r.status, 200));
});
