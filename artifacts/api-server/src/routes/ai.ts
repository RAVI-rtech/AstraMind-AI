/**
 * AI Route — classifies user messages and calls the AI model.
 * POST /api/ai/route
 * POST /api/ai/classify
 * GET  /api/ai/categories
 */

import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// ── Types ──────────────────────────────────────────────────────────────────────

type Category =
  | "chat"
  | "code"
  | "pdf"
  | "image"
  | "voice"
  | "study_planner"
  | "quiz"
  | "general";

interface RouteRequest {
  message: string;
  model?: string;
  context?: Array<{ role: string; content: string }>;
  force_category?: Category;
  metadata?: Record<string, unknown>;
  max_tokens?: number;
  temperature?: number;
}

interface ClassificationResult {
  category: Category;
  confidence: number;
  scores: Record<string, number>;
  method: "keyword" | "ai" | "forced";
  reasoning: string;
}

interface RouteResponse {
  classification: ClassificationResult;
  content: string;
  model: string;
  tokens_used: number;
  category_data: Record<string, unknown>;
  suggested_actions: string[];
}

// ── Keyword classifier ─────────────────────────────────────────────────────────

const RULES: Record<Category, Array<[RegExp, number]>> = {
  code: [
    [/\bcode\b/i, 1.0], [/\bprogram\b/i, 0.9], [/\bscript\b/i, 0.9],
    [/\bfunction\b/i, 0.8], [/\bdebug\b/i, 1.0], [/\bsyntax\b/i, 0.9],
    [/\b(python|javascript|typescript|java|rust|go|sql|c\+\+)\b/i, 1.0],
    [/\balgorithm\b/i, 0.8], [/\brefactor\b/i, 0.9], [/\bunit test\b/i, 0.9],
    [/\bcompile|runtime error\b/i, 1.0], [/\bapi\b/i, 0.5],
  ],
  pdf: [
    [/\bpdf\b/i, 1.5], [/\bdocument\b/i, 0.8], [/\bsummariz/i, 0.9],
    [/\bextract\b/i, 0.7], [/\btranslate\b/i, 0.7], [/\bpaper\b/i, 0.7],
    [/\breport\b/i, 0.7], [/\bcontract\b/i, 0.8], [/\binvoice\b/i, 0.8],
  ],
  image: [
    [/\bimage\b/i, 1.2], [/\bphoto\b/i, 1.0], [/\bpicture\b/i, 1.0],
    [/\bdraw\b/i, 0.9], [/\bgenerate.*(image|picture|photo)\b/i, 1.5],
    [/\bocr\b/i, 1.5], [/\billustrat/i, 0.9], [/\bdall-?e\b/i, 1.5],
    [/\bstable diffusion\b/i, 1.5], [/\blogo\b/i, 0.8],
  ],
  voice: [
    [/\bvoice\b/i, 1.2], [/\bspeak\b/i, 1.0], [/\baudio\b/i, 1.2],
    [/\btranscri/i, 1.5], [/\bwhisper\b/i, 1.2], [/\btext.to.speech\b/i, 1.5],
    [/\btts\b/i, 1.5], [/\bspeech\b/i, 1.0], [/\brecord\b/i, 0.7],
  ],
  study_planner: [
    [/\bstudy\b/i, 1.2], [/\blearn\b/i, 0.8], [/\bschedule\b/i, 1.0],
    [/\bplan\b/i, 0.8], [/\bsyllabus\b/i, 1.2], [/\bcurriculum\b/i, 1.2],
    [/\bweekly plan\b/i, 1.2], [/\bexam prep\b/i, 1.5], [/\brevision\b/i, 0.9],
    [/\bdays?.*(study|learn)\b/i, 1.0], [/\broadmap\b/i, 0.9],
  ],
  quiz: [
    [/\bquiz\b/i, 1.5], [/\btest me\b/i, 1.5], [/\bflashcard\b/i, 1.2],
    [/\bquestion\b/i, 0.8], [/\bmcq\b/i, 1.5], [/\bmultiple choice\b/i, 1.5],
    [/\btrue or false\b/i, 1.2], [/\bexam\b/i, 0.9],
    [/\bpractice question\b/i, 1.2], [/\bfill.in.the.blank\b/i, 1.2],
  ],
  chat: [
    [/\bhello|hi\b/i, 0.6], [/\bhow are you\b/i, 0.8],
    [/\bwhat do you think\b/i, 0.7], [/\btell me\b/i, 0.5],
    [/\bexplain\b/i, 0.5], [/\bwhat is\b/i, 0.5], [/\badvice\b/i, 0.6],
  ],
  general: [[/.*/i, 0.2]],
};

function classify(message: string, forceCategory?: Category): ClassificationResult {
  if (forceCategory) {
    return {
      category: forceCategory,
      confidence: 1.0,
      scores: {},
      method: "forced",
      reasoning: "Category was explicitly specified.",
    };
  }

  const rawScores: Record<string, number> = {};
  for (const [cat, rules] of Object.entries(RULES) as [Category, Array<[RegExp, number]>][]) {
    let score = 0;
    for (const [pattern, weight] of rules) {
      if (pattern.test(message)) score += weight;
    }
    rawScores[cat] = score;
  }

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0) || 1;
  const normalised = Object.fromEntries(
    Object.entries(rawScores).map(([k, v]) => [k, Math.round((v / total) * 10000) / 10000])
  );

  const bestKey = Object.entries(normalised).sort(([, a], [, b]) => b - a)[0][0] as Category;

  return {
    category: bestKey,
    confidence: normalised[bestKey],
    scores: normalised,
    method: "keyword",
    reasoning: `Keyword scoring selected '${bestKey}' with confidence ${(normalised[bestKey] * 100).toFixed(1)}%.`,
  };
}

// ── System prompts per category ────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<Category, string> = {
  chat:
    "You are AstraMind AI, a helpful, precise, and professional AI assistant. " +
    "Respond clearly, concisely, and in a friendly tone.",
  code:
    "You are AstraMind AI, an expert software engineer. " +
    "Always wrap code blocks in triple backticks with the language name. " +
    "Explain what the code does and point out edge cases.",
  pdf:
    "You are AstraMind AI, a document analysis expert. " +
    "Summarize clearly with key bullet points. Answer with direct references to the source.",
  image:
    "You are AstraMind AI, a visual AI specialist. " +
    "For generation requests, craft detailed vivid prompts optimized for DALL-E. " +
    "For analysis, describe content accurately.",
  voice:
    "You are AstraMind AI, a voice and audio specialist. " +
    "Clean up transcribed text. For TTS, optimize for natural-sounding speech.",
  study_planner:
    "You are AstraMind AI, an expert learning coach. " +
    "Create structured study plans with daily sessions, specific topics, and review checkpoints.",
  quiz:
    "You are AstraMind AI, an expert quiz generator. " +
    "Generate clear, well-structured quiz questions with explanations for each answer.",
  general:
    "You are AstraMind AI, a versatile and helpful AI assistant. " +
    "Answer thoughtfully and concisely.",
};

const SUGGESTED_ACTIONS: Record<Category, string[]> = {
  chat: ["Continue conversation", "Save to notes", "Share response"],
  code: ["Copy code", "Explain further", "Optimize", "Add tests"],
  pdf: ["Ask a follow-up", "Export summary", "Translate document"],
  image: ["Generate image", "Analyze another", "Extract text (OCR)"],
  voice: ["Play audio", "Save transcript", "Translate"],
  study_planner: ["Save plan", "Set reminders", "Generate quiz"],
  quiz: ["Start quiz", "More questions", "Create study plan"],
  general: ["Ask a follow-up", "Try a specific feature"],
};

// ── OpenAI call ────────────────────────────────────────────────────────────────

async function callAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  model: string,
  maxTokens: number,
  temperature: number,
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      content:
        `[${model}] AI features are not yet configured. ` +
        "Add OPENAI_API_KEY to the environment to enable real responses.",
      tokensUsed: 0,
    };
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const mapped = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  const response = await client.chat.completions.create({
    model: model.startsWith("gpt") ? model : "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...mapped],
    max_tokens: maxTokens,
    temperature,
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    tokensUsed: response.usage?.total_tokens ?? 0,
  };
}

// ── Routes ─────────────────────────────────────────────────────────────────────

router.post("/route", async (req: Request, res: Response): Promise<void> => {
  const body = req.body as RouteRequest;

  if (!body?.message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const classification = classify(body.message, body.force_category);
  const systemPrompt = SYSTEM_PROMPTS[classification.category];
  const context = body.context ?? [];
  const model = body.model ?? "gpt-4o";
  const maxTokens = body.max_tokens ?? 2048;
  const temperature = body.temperature ?? 0.7;

  const { content, tokensUsed } = await callAI(
    systemPrompt,
    context,
    model,
    maxTokens,
    temperature,
  );

  const result: RouteResponse = {
    classification,
    content: content || body.message, // safety fallback
    model,
    tokens_used: tokensUsed,
    category_data: { type: classification.category },
    suggested_actions: SUGGESTED_ACTIONS[classification.category] ?? [],
  };

  res.json(result);
});

router.post("/classify", (req: Request, res: Response): void => {
  const { message, force_category } = req.body as {
    message: string;
    force_category?: Category;
  };
  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }
  res.json(classify(message, force_category));
});

router.get("/categories", (_req: Request, res: Response): void => {
  const categories: Category[] = [
    "chat", "code", "pdf", "image", "voice", "study_planner", "quiz", "general",
  ];
  res.json({ categories });
});

router.get("/models", (_req: Request, res: Response): void => {
  res.json({
    models: [
      { id: "gpt-4o", name: "AstraMind AI", provider: "openai" },
      { id: "gpt-4o-mini", name: "AstraMind AI Mini", provider: "openai" },
      { id: "claude-3-5-sonnet", name: "AstraMind AI 3.5", provider: "anthropic" },
      { id: "gemini-pro", name: "AstraMind AI Pro", provider: "google" },
    ],
  });
});

export default router;
