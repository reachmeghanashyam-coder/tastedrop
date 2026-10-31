// lib/qloo.ts
// Direct Server-Side Qloo Hackathon Integration (Typed & Transparent)

export type QlooStatus = 
  | "LIVE_SUCCESS" 
  | "OFFLINE_DEMO" 
  | "AUTHENTICATION_ERROR" 
  | "RATE_LIMITED" 
  | "NETWORK_ERROR" 
  | "INVALID_RESPONSE";

export interface QlooEntityResult {
  id: string;
  name: string;
  type: string;
  popularity?: number;
  tags?: string[];
}

export interface QlooInsightItem {
  id: string;
  name: string;
  subtype: string;
  affinity: number; // 0.0 to 1.0 (Returned Qloo cultural correlation score)
  genres?: string[];
}

export interface QlooLiveInsightsResult {
  status: QlooStatus;
  httpStatus?: number;
  endpoint: string;
  latencyMs: number;
  source: string;
  anchorSignal: {
    query: string;
    entityId: string;
    entityName: string;
    entityType: string;
  };
  discoveredEntities: QlooInsightItem[];
  error?: string;
}

const HACKATHON_API_BASE = "https://hackathon.api.qloo.com";

/**
 * Resolve an entity query using Qloo /search endpoint.
 */
export async function searchQlooEntity(
  query: string,
  type: "urn:entity:artist" | "urn:entity:brand" | "urn:entity:person" = "urn:entity:artist",
  apiKey?: string
): Promise<{ status: QlooStatus; entity?: QlooEntityResult; latencyMs: number; error?: string }> {
  const token = apiKey || process.env.QLOO_API_KEY;
  const startTime = Date.now();

  if (!token) {
    return {
      status: "OFFLINE_DEMO",
      latencyMs: 0,
      error: "QLOO_API_KEY is not configured in environment."
    };
  }

  try {
    const url = `${HACKATHON_API_BASE}/search?query=${encodeURIComponent(query)}&types=${encodeURIComponent(type)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: {
        "x-api-key": token,
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return { status: "AUTHENTICATION_ERROR", latencyMs, error: `Qloo API rejected key (HTTP ${res.status}).` };
    }
    if (res.status === 429) {
      return { status: "RATE_LIMITED", latencyMs, error: "Qloo API rate limit exceeded." };
    }
    if (!res.ok) {
      return { status: "INVALID_RESPONSE", latencyMs, error: `Qloo search returned HTTP ${res.status}.` };
    }

    const data = await res.json();
    if (Array.isArray(data.results) && data.results.length > 0) {
      const top = data.results[0];
      return {
        status: "LIVE_SUCCESS",
        latencyMs,
        entity: {
          id: top.entity_id || top.id,
          name: top.name,
          type: (top.types && top.types[0]) || type,
          popularity: top.popularity,
          tags: top.tags ? top.tags.map((t: { name?: string; value?: string }) => t.name || t.value || "") : []
        }
      };
    }

    return {
      status: "INVALID_RESPONSE",
      latencyMs,
      error: `No entities found for query '${query}' under type '${type}'.`
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "NETWORK_ERROR", latencyMs, error: `Network exception contacting Qloo: ${msg}` };
  }
}

/**
 * Fetch insights from Qloo /v2/insights using an entity interest signal.
 */
export async function getLiveQlooInsights(
  signalEntityId: string,
  signalEntityName: string,
  signalEntityType: string,
  filterType: "urn:entity:artist" | "urn:entity:brand" = "urn:entity:artist",
  apiKey?: string
): Promise<QlooLiveInsightsResult> {
  const token = apiKey || process.env.QLOO_API_KEY;
  const startTime = Date.now();
  const endpoint = `${HACKATHON_API_BASE}/v2/insights?filter.type=${encodeURIComponent(filterType)}&signal.interests.entities=${encodeURIComponent(signalEntityId)}`;

  if (!token) {
    return {
      status: "OFFLINE_DEMO",
      endpoint,
      latencyMs: 0,
      source: "Offline Schema (Missing API Key)",
      anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
      discoveredEntities: [],
      error: "QLOO_API_KEY not configured"
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      headers: {
        "x-api-key": token,
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        status: "AUTHENTICATION_ERROR",
        httpStatus: res.status,
        endpoint,
        latencyMs,
        source: "hackathon.api.qloo.com",
        anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
        discoveredEntities: [],
        error: `Authentication failed (HTTP ${res.status}). Check QLOO_API_KEY.`
      };
    }

    if (res.status === 429) {
      return {
        status: "RATE_LIMITED",
        httpStatus: 429,
        endpoint,
        latencyMs,
        source: "hackathon.api.qloo.com",
        anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
        discoveredEntities: [],
        error: "Rate limit reached on hackathon endpoint."
      };
    }

    if (!res.ok) {
      return {
        status: "INVALID_RESPONSE",
        httpStatus: res.status,
        endpoint,
        latencyMs,
        source: "hackathon.api.qloo.com",
        anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
        discoveredEntities: [],
        error: `Upstream error HTTP ${res.status}`
      };
    }

    const data = await res.json();
    if (data.success && data.results && Array.isArray(data.results.entities)) {
      const discovered: QlooInsightItem[] = data.results.entities.map((ent: {
        entity_id?: string;
        id?: string;
        name: string;
        subtype?: string;
        query?: { affinity?: number };
        primary_genres?: string[];
      }) => ({
        id: ent.entity_id || ent.id || "",
        name: ent.name,
        subtype: ent.subtype || filterType,
        affinity: typeof ent.query?.affinity === "number" ? ent.query.affinity : 0,
        genres: ent.primary_genres || []
      }));

      return {
        status: "LIVE_SUCCESS",
        httpStatus: 200,
        endpoint,
        latencyMs,
        source: "https://hackathon.api.qloo.com/v2/insights",
        anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
        discoveredEntities: discovered
      };
    }

    return {
      status: "INVALID_RESPONSE",
      httpStatus: 200,
      endpoint,
      latencyMs,
      source: "hackathon.api.qloo.com",
      anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
      discoveredEntities: [],
      error: "Malformed JSON response structure from Qloo"
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: "NETWORK_ERROR",
      endpoint,
      latencyMs,
      source: "hackathon.api.qloo.com",
      anchorSignal: { query: signalEntityName, entityId: signalEntityId, entityName: signalEntityName, entityType: signalEntityType },
      discoveredEntities: [],
      error: `Network failure connecting to Qloo: ${msg}`
    };
  }
}
