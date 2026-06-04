/**
 * Skill Index Client — search and download the cloud skill marketplace.
 *
 * Searching, summaries, and free downloads are supported over plain HTTP.
 * Paid (x402 on-chain) downloads are not supported in this build.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface SkillSummary {
  id: string;
  service: string;
  slug: string;
  baseUrl: string;
  authMethodType: string;
  endpointCount: number;
  downloadCount: number;
  tags: string[];
  creatorWallet: string;
  creatorAlias?: string;
  updatedAt: string;
}

export interface SkillPackage {
  id: string;
  service: string;
  baseUrl: string;
  authMethodType: string;
  endpoints: { method: string; path: string; description?: string }[];
  skillMd: string;
  apiTemplate: string;
}

export interface SearchResult {
  skills: SkillSummary[];
  total: number;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class SkillIndexClient {
  protected indexUrl: string;

  constructor(opts: { indexUrl: string }) {
    this.indexUrl = opts.indexUrl.replace(/\/$/, "");
  }

  /**
   * fetch() wrapper that translates connection/timeout failures into a clear,
   * user-facing "marketplace not reachable" error instead of a raw TypeError.
   */
  protected async safeFetch(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (err) {
      const msg = (err as Error).message ?? "";
      const name = (err as Error).name ?? "";
      if (
        msg.includes("fetch failed") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ENOTFOUND") ||
        name === "AbortError" ||
        name === "TimeoutError" ||
        msg.includes("timeout")
      ) {
        throw new Error(
          `Skill marketplace not reachable (${this.indexUrl}). The server may be offline or the URL misconfigured.`,
        );
      }
      throw err;
    }
  }

  /** Search the skill index (free). */
  async search(
    query: string,
    opts?: { tags?: string; limit?: number; offset?: number },
  ): Promise<SearchResult> {
    const url = new URL(`${this.indexUrl}/skills/search`);
    url.searchParams.set("q", query);
    if (opts?.tags) url.searchParams.set("tags", opts.tags);
    if (opts?.limit) url.searchParams.set("limit", String(opts.limit));
    if (opts?.offset) url.searchParams.set("offset", String(opts.offset));

    const resp = await this.safeFetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Search failed (${resp.status}): ${text}`);
    }

    return resp.json() as Promise<SearchResult>;
  }

  /** Get skill summary with endpoint list (free). */
  async getSummary(id: string): Promise<SkillSummary & { endpoints: { method: string; path: string }[] }> {
    const resp = await this.safeFetch(`${this.indexUrl}/skills/${encodeURIComponent(id)}/summary`, {
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Summary failed (${resp.status}): ${text}`);
    }

    return resp.json() as any;
  }

  /**
   * Download a skill package.
   *
   * Free downloads (server returns 200) are supported. Paid abilities gated
   * behind x402 on-chain payment are not supported in this build.
   */
  async download(id: string): Promise<SkillPackage> {
    const resp = await this.safeFetch(`${this.indexUrl}/skills/${encodeURIComponent(id)}/download`, {
      signal: AbortSignal.timeout(15_000),
    });

    if (resp.ok) {
      return resp.json() as Promise<SkillPackage>;
    }

    if (resp.status === 402) {
      throw new Error(
        "This ability requires a paid (x402 on-chain) download, which is disabled in this build. " +
        "Only free abilities can be downloaded.",
      );
    }

    const text = await resp.text().catch(() => "");
    throw new Error(`Download failed (${resp.status}): ${text}`);
  }

  /**
   * Health check — verify the server is reachable (fast, no auth required).
   */
  async healthCheck(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.indexUrl}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      return resp.ok;
    } catch {
      return false;
    }
  }
}
