/**
 * Skill Index Client — Publish and search the cloud skill marketplace.
 *
 * Handles communication with the skill index API, including x402 payments
 * for downloading skills on Solana. Publishing and searching are free;
 * downloading a skill package requires USDC via x402.
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

export interface PublishPayload {
  service: string;
  baseUrl: string;
  authMethodType: string;
  endpoints: { method: string; path: string; description?: string }[];
  skillMd: string;
  apiTemplate: string;
  creatorWallet: string;
}

export interface PublishResult {
  id: string;
  slug: string;
  version: number;
}

export interface SearchResult {
  skills: SkillSummary[];
  total: number;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class SkillIndexClient {
  private indexUrl: string;
  private opts: {
    indexUrl: string;
    creatorWallet?: string;
    solanaPrivateKey?: string;
  };

  get creatorWallet(): string | undefined { return this.opts.creatorWallet; }
  get solanaPrivateKey(): string | undefined { return this.opts.solanaPrivateKey; }

  constructor(opts: {
    indexUrl: string;
    creatorWallet?: string;
    solanaPrivateKey?: string;
  }) {
    this.indexUrl = opts.indexUrl.replace(/\/$/, "");
    this.opts = opts;
  }

  /**
   * Derive the wallet address (base58 ed25519 public key) and a detached signer
   * from the configured base58 Solana secret key. Uses tweetnacl + bs58 directly
   * so the heavyweight @solana/web3.js dependency is not required.
   */
  protected async loadKeypair(): Promise<{
    wallet: string;
    sign: (message: Uint8Array) => Uint8Array;
  }> {
    if (!this.solanaPrivateKey) {
      throw new Error(
        "No Solana private key configured. Required to sign publish requests."
      );
    }
    const nacl = await import("tweetnacl");
    const bs58 = await import("bs58");
    try {
      const secretKey = bs58.default.decode(this.solanaPrivateKey);
      const keypair = nacl.default.sign.keyPair.fromSecretKey(secretKey);
      return {
        wallet: bs58.default.encode(keypair.publicKey),
        sign: (message: Uint8Array) =>
          nacl.default.sign.detached(message, keypair.secretKey),
      };
    } catch {
      throw new Error("Invalid Solana private key. Must be base58-encoded.");
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

    let resp: Response;
    try {
      resp = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      const msg = (err as Error).message ?? "";
      const name = (err as Error).name ?? "";
      if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || name === "AbortError" || name === "TimeoutError" || msg.includes("timeout")) {
        throw new Error(`Skill marketplace not reachable (${this.indexUrl}). The server may be offline or the URL misconfigured.`);
      }
      throw err;
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Search failed (${resp.status}): ${text}`);
    }

    return resp.json() as Promise<SearchResult>;
  }

  /** Get skill summary with endpoint list (free). */
  async getSummary(id: string): Promise<SkillSummary & { endpoints: { method: string; path: string }[] }> {
    const resp = await fetch(`${this.indexUrl}/skills/${encodeURIComponent(id)}/summary`, {
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
   * behind x402 on-chain payment are NOT supported in this build — the Solana
   * transaction dependencies were removed. Such downloads fail with a clear
   * error rather than attempting an on-chain USDC transfer.
   */
  async download(id: string): Promise<SkillPackage> {
    const resp = await fetch(`${this.indexUrl}/skills/${encodeURIComponent(id)}/download`, {
      signal: AbortSignal.timeout(15_000),
    });

    if (resp.ok) {
      // Free mode — no payment required
      return resp.json() as Promise<SkillPackage>;
    }

    if (resp.status === 402) {
      throw new Error(
        "This ability requires an x402 on-chain payment, which is not supported in this build. " +
        "Only free abilities can be downloaded.",
      );
    }

    const text = await resp.text().catch(() => "");
    throw new Error(`Download failed (${resp.status}): ${text}`);
  }

  /**
   * Publish a skill to the index.
   * Requires signing the message with the creator's private key to prove wallet ownership.
   */
  async publish(payload: PublishPayload): Promise<PublishResult> {
    const { wallet, sign } = await this.loadKeypair();

    // Verify wallet matches
    if (wallet !== payload.creatorWallet) {
      throw new Error(
        `Wallet mismatch: private key is for ${wallet}, but payload claims ${payload.creatorWallet}`
      );
    }

    // Sign message: "Foundry:publish:<service>:<timestamp>"
    const timestamp = String(Date.now());
    const message = `Foundry:publish:${payload.service}:${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = sign(messageBytes);
    const signature = Buffer.from(signatureBytes).toString("base64");

    // Include signature and timestamp in payload
    const signedPayload = {
      ...payload,
      signature,
      timestamp,
    };

    const resp = await fetch(`${this.indexUrl}/skills/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signedPayload),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Publish failed (${resp.status}): ${text}`);
    }

    return resp.json() as Promise<PublishResult>;
  }

  /**
   * Health check — verify the server is reachable (fast, no auth required).
   * Returns true if reachable, false otherwise.
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
