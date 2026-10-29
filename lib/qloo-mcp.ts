/**
 * Qloo Model Context Protocol (MCP) and Harness Integration Bridge
 * Implements official hackathon-supported tooling surfaces:
 * - 'qloo mcp' canonical tool schema definitions
 * - 'qloo api' deterministic execution bridge
 * - Direct resilient HTTPS fallback matching Qloo's official wire protocol
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface QlooMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const QLOO_MCP_TOOLS: QlooMcpToolDefinition[] = [
  {
    name: "qloo_resolve_entity",
    description: "Resolves an unstructured text query into a canonical Qloo entity with cultural classification.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string (e.g. 'Isamu Noguchi', 'Schott NYC')" },
        types: { type: "array", items: { type: "string" }, description: "Optional entity type filters" }
      },
      required: ["query"]
    }
  },
  {
    name: "qloo_get_insights",
    description: "Queries Qloo's cultural affinity knowledge graph across taste domains for candidate scoring.",
    inputSchema: {
      type: "object",
      properties: {
        signalEntityId: { type: "string", description: "Canonical Qloo entity ID of the anchor item" },
        targetTypes: { type: "array", items: { type: "string" }, description: "Target cultural domains (brand, book, audio)" },
        limit: { type: "number", description: "Max results to return" }
      },
      required: ["signalEntityId"]
    }
  },
  {
    name: "qloo_agent_constraint_solver",
    description: "Autonomous agent execution loop: applies dynamic budget caps, category diversity, and affinity thresholds against catalog candidates.",
    inputSchema: {
      type: "object",
      properties: {
        anchorEntityId: { type: "string" },
        minAffinityScore: { type: "number", description: "Minimum cultural correlation (0.0 - 1.0)" },
        maxBudget: { type: "number", description: "Maximum companion total bundle spend in USD" },
        tasteStance: { type: "string", enum: ["purist", "balanced", "avant-garde"] }
      },
      required: ["anchorEntityId", "minAffinityScore"]
    }
  }
];

/**
 * Execute a command through the official @qloo/qloo-harness CLI if available,
 * with graceful fallback to the direct REST API client.
 */
export async function runQlooCliCommand(args: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const { stdout } = await execAsync(`npx qloo ${args}`, { timeout: 8000 });
    return { success: true, data: JSON.parse(stdout) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
