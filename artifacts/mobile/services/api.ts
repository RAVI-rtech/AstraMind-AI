/**
 * API client for AstraMind AI backend.
 * Calls the Node.js Express API server via the Replit shared proxy.
 */

const DEV_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

// Build the base URL:
//  - On Replit: https://<repl-dev-domain>/api
//  - Locally:   http://localhost:8080/api (fallback)
function getBaseUrl(): string {
  if (DEV_DOMAIN) return `https://${DEV_DOMAIN}/api`;
  return "http://localhost:8080/api";
}

export type AIModel = "gpt-4o" | "gpt-4o-mini" | "claude-3-5-sonnet" | "gemini-pro";
export type Category =
  | "chat" | "code" | "pdf" | "image" | "voice"
  | "study_planner" | "quiz" | "general";

export interface RouteRequest {
  message: string;
  model?: AIModel;
  context?: Array<{ role: string; content: string }>;
  force_category?: Category;
  metadata?: Record<string, unknown>;
  max_tokens?: number;
  temperature?: number;
}

export interface ClassificationResult {
  category: Category;
  confidence: number;
  scores: Record<string, number>;
  method: string;
  reasoning: string;
}

export interface RouteResponse {
  classification: ClassificationResult;
  content: string;
  model: string;
  tokens_used: number;
  category_data: Record<string, unknown>;
  suggested_actions: string[];
}

export async function routeMessage(
  request: RouteRequest,
  authToken?: string,
): Promise<RouteResponse> {
  const url = `${getBaseUrl()}/ai/route`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<RouteResponse>;
}
