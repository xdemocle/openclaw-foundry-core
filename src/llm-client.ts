/**
 * LLM client for Foundry's autonomous features (Meta Agent Search / ADAS).
 *
 * Talks to an Anthropic-compatible Messages API over plain `fetch` — no SDK
 * dependency. Configure via plugin config or environment:
 *   - apiKey:  cfg.llmApiKey  | ANTHROPIC_API_KEY | FOUNDRY_LLM_API_KEY
 *   - baseUrl: cfg.llmBaseUrl | ANTHROPIC_BASE_URL | https://api.anthropic.com
 *   - model:   cfg.llmModel   | FOUNDRY_LLM_MODEL  | claude-3-5-sonnet-latest
 */
import type {
  LLMClient,
  TaskEvaluator,
  EvaluationResult,
} from "./meta-agent-search.js";

export interface LLMClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
}

/** Resolve LLM config from explicit plugin-config values, then environment. */
export function resolveLLMConfig(cfg?: {
  llmApiKey?: string;
  llmBaseUrl?: string;
  llmModel?: string;
}): LLMClientConfig {
  return {
    apiKey:
      cfg?.llmApiKey ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.FOUNDRY_LLM_API_KEY,
    baseUrl:
      cfg?.llmBaseUrl ||
      process.env.ANTHROPIC_BASE_URL ||
      "https://api.anthropic.com",
    model:
      cfg?.llmModel ||
      process.env.FOUNDRY_LLM_MODEL ||
      "claude-3-5-sonnet-latest",
  };
}

export class AnthropicLLMClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;

  constructor(cfg: LLMClientConfig) {
    if (!cfg.apiKey) {
      throw new Error(
        "No LLM API key configured. Set ANTHROPIC_API_KEY (or the foundry " +
          "config `llmApiKey`) to use LLM-backed features.",
      );
    }
    this.apiKey = cfg.apiKey;
    this.baseUrl = (cfg.baseUrl || "https://api.anthropic.com").replace(
      /\/+$/,
      "",
    );
    this.model = cfg.model || "claude-3-5-sonnet-latest";
    this.maxTokens = cfg.maxTokens ?? 4096;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          ...(systemPrompt ? { system: systemPrompt } : {}),
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (err) {
      throw new Error(
        `LLM endpoint not reachable (${this.baseUrl}): ${(err as Error).message}`,
      );
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(
        `LLM request failed (${resp.status}): ${text.slice(0, 300)}`,
      );
    }

    const data: any = await resp.json();
    const parts = Array.isArray(data?.content) ? data.content : [];
    return parts
      .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
      .join("")
      .trim();
  }

  async completeJson<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const text = await this.complete(
      `${prompt}\n\nRespond with ONLY a valid JSON value — no prose, no markdown fences.`,
      systemPrompt,
    );
    return parseJsonLoose<T>(text);
  }
}

/** Extract a JSON value from a model response that may include prose or fences. */
function parseJsonLoose<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(body) as T;
  } catch {
    // fall through to brace/bracket scanning
  }
  const firstObj = body.indexOf("{");
  const firstArr = body.indexOf("[");
  const start =
    firstObj === -1
      ? firstArr
      : firstArr === -1
        ? firstObj
        : Math.min(firstObj, firstArr);
  const end = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
  if (start >= 0 && end > start) {
    return JSON.parse(body.slice(start, end + 1)) as T;
  }
  throw new Error(
    `Could not parse JSON from LLM response: ${text.slice(0, 200)}`,
  );
}

/**
 * LLM-as-judge task evaluator: scores how well an agent design would plausibly
 * solve the given tasks. Returns accuracy in [0, 1]; never throws (failures are
 * reported as accuracy 0 with an error string so the search loop continues).
 */
export class LLMTaskEvaluator implements TaskEvaluator {
  constructor(private llm: LLMClient) {}

  async evaluate(agentCode: string, tasks: unknown[]): Promise<EvaluationResult> {
    const start = Date.now();
    try {
      const verdict = await this.llm.completeJson<{
        accuracy: number;
        reasoning?: string;
      }>(
        `Evaluate the following agent design (a forward() function) for how well it ` +
          `would likely solve the given tasks. Return {"accuracy": number 0..1, "reasoning": string}.\n\n` +
          `AGENT:\n${agentCode}\n\nTASKS:\n${JSON.stringify(tasks).slice(0, 4000)}`,
        "You are a strict, calibrated evaluator of AI agent designs. Be conservative.",
      );
      const accuracy = Math.max(0, Math.min(1, Number(verdict.accuracy) || 0));
      return { success: true, accuracy, errors: [], duration: Date.now() - start };
    } catch (err) {
      return {
        success: false,
        accuracy: 0,
        errors: [(err as Error).message],
        duration: Date.now() - start,
      };
    }
  }
}
