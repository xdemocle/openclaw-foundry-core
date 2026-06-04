"use strict";
/**
 * Skill Index Client — Publish and search the cloud skill marketplace.
 *
 * Handles communication with the skill index API, including x402 payments
 * for downloading skills on Solana. Publishing and searching are free;
 * downloading a skill package requires USDC via x402.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillIndexClient = void 0;
// ── Client ───────────────────────────────────────────────────────────────────
var SkillIndexClient = /** @class */ (function () {
    function SkillIndexClient(opts) {
        this.indexUrl = opts.indexUrl.replace(/\/$/, "");
        this.opts = opts;
    }
    Object.defineProperty(SkillIndexClient.prototype, "creatorWallet", {
        get: function () { return this.opts.creatorWallet; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkillIndexClient.prototype, "solanaPrivateKey", {
        get: function () { return this.opts.solanaPrivateKey; },
        enumerable: false,
        configurable: true
    });
    /** Search the skill index (free). */
    SkillIndexClient.prototype.search = function (query, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp, err_1, msg, name_1, text;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = new URL("".concat(this.indexUrl, "/skills/search"));
                        url.searchParams.set("q", query);
                        if (opts === null || opts === void 0 ? void 0 : opts.tags)
                            url.searchParams.set("tags", opts.tags);
                        if (opts === null || opts === void 0 ? void 0 : opts.limit)
                            url.searchParams.set("limit", String(opts.limit));
                        if (opts === null || opts === void 0 ? void 0 : opts.offset)
                            url.searchParams.set("offset", String(opts.offset));
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url.toString(), {
                                signal: AbortSignal.timeout(10000),
                            })];
                    case 2:
                        resp = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _c.sent();
                        msg = (_a = err_1.message) !== null && _a !== void 0 ? _a : "";
                        name_1 = (_b = err_1.name) !== null && _b !== void 0 ? _b : "";
                        if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || name_1 === "AbortError" || name_1 === "TimeoutError" || msg.includes("timeout")) {
                            throw new Error("Skill marketplace not reachable (".concat(this.indexUrl, "). The server may be offline or the URL misconfigured."));
                        }
                        throw err_1;
                    case 4:
                        if (!!resp.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 5:
                        text = _c.sent();
                        throw new Error("Search failed (".concat(resp.status, "): ").concat(text));
                    case 6: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    /** Get skill summary with endpoint list (free). */
    SkillIndexClient.prototype.getSummary = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.indexUrl, "/skills/").concat(encodeURIComponent(id), "/summary"), {
                            signal: AbortSignal.timeout(15000),
                        })];
                    case 1:
                        resp = _a.sent();
                        if (!!resp.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 2:
                        text = _a.sent();
                        throw new Error("Summary failed (".concat(resp.status, "): ").concat(text));
                    case 3: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    /**
     * Download a skill package (x402 payment required).
     *
     * Handles the 402 → sign → retry flow using a Solana keypair.
     * Falls back to free download if the server has no x402 gate (dev mode).
     */
    SkillIndexClient.prototype.download = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, text, paymentReq, accepts, paymentData, retryResp, text;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.indexUrl, "/skills/").concat(encodeURIComponent(id), "/download"), {
                            signal: AbortSignal.timeout(15000),
                        })];
                    case 1:
                        resp = _b.sent();
                        if (resp.ok) {
                            // Free mode — no payment required
                            return [2 /*return*/, resp.json()];
                        }
                        if (!(resp.status !== 402)) return [3 /*break*/, 3];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 2:
                        text = _b.sent();
                        throw new Error("Download failed (".concat(resp.status, "): ").concat(text));
                    case 3:
                        // Step 2: We got a 402 — need to pay
                        if (!this.solanaPrivateKey) {
                            throw new Error("No Solana private key configured for x402 payments. " +
                                "Set skillIndexSolanaPrivateKey in unbrowse config or UNBROWSE_SOLANA_PRIVATE_KEY env var.");
                        }
                        return [4 /*yield*/, resp.json()];
                    case 4:
                        paymentReq = _b.sent();
                        accepts = (_a = paymentReq === null || paymentReq === void 0 ? void 0 : paymentReq.accepts) === null || _a === void 0 ? void 0 : _a[0];
                        if (!accepts) {
                            throw new Error("Invalid 402 response: no payment requirements");
                        }
                        return [4 /*yield*/, this.buildAndSignPayment(accepts)];
                    case 5:
                        paymentData = _b.sent();
                        return [4 /*yield*/, fetch("".concat(this.indexUrl, "/skills/").concat(encodeURIComponent(id), "/download"), {
                                headers: { "X-Payment": paymentData },
                                signal: AbortSignal.timeout(30000),
                            })];
                    case 6:
                        retryResp = _b.sent();
                        if (!!retryResp.ok) return [3 /*break*/, 8];
                        return [4 /*yield*/, retryResp.text().catch(function () { return ""; })];
                    case 7:
                        text = _b.sent();
                        throw new Error("Download failed after payment (".concat(retryResp.status, "): ").concat(text));
                    case 8: return [2 /*return*/, retryResp.json()];
                }
            });
        });
    };
    /**
     * Build and sign a Solana x402 payment transaction.
     * Returns base64-encoded X-Payment header value.
     */
    SkillIndexClient.prototype.buildAndSignPayment = function (accepts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, Connection, PublicKey, Transaction, TransactionInstruction, Keypair, SystemProgram, _b, getAssociatedTokenAddress, createTransferInstruction, keypair, bs58, _c, isDevnet, rpcUrl, connection, amount, usdcMint, recipient, programId, payerTokenAccount, recipientTokenAccount, nonce, verifyData, verifyInstruction, transferInstruction, settleData, settleInstruction, tx, latestBlockhash, paymentPayload;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@solana/web3.js"); })];
                    case 1:
                        _a = _g.sent(), Connection = _a.Connection, PublicKey = _a.PublicKey, Transaction = _a.Transaction, TransactionInstruction = _a.TransactionInstruction, Keypair = _a.Keypair, SystemProgram = _a.SystemProgram;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("@solana/spl-token"); })];
                    case 2:
                        _b = _g.sent(), getAssociatedTokenAddress = _b.getAssociatedTokenAddress, createTransferInstruction = _b.createTransferInstruction;
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("bs58"); })];
                    case 4:
                        bs58 = _g.sent();
                        keypair = Keypair.fromSecretKey(bs58.default.decode(this.solanaPrivateKey));
                        return [3 /*break*/, 6];
                    case 5:
                        _c = _g.sent();
                        throw new Error("Invalid Solana private key. Must be base58-encoded.");
                    case 6:
                        isDevnet = (_d = accepts.network) === null || _d === void 0 ? void 0 : _d.includes("devnet");
                        rpcUrl = isDevnet ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com";
                        connection = new Connection(rpcUrl, "confirmed");
                        amount = BigInt(accepts.maxAmountRequired);
                        usdcMint = new PublicKey(accepts.asset);
                        recipient = new PublicKey(accepts.payTo);
                        programId = new PublicKey((_f = (_e = accepts.extra) === null || _e === void 0 ? void 0 : _e.programId) !== null && _f !== void 0 ? _f : "5g8XvMcpWEgHitW7abiYTr1u8sDasePLQnrebQyCLPvY");
                        return [4 /*yield*/, getAssociatedTokenAddress(usdcMint, keypair.publicKey)];
                    case 7:
                        payerTokenAccount = _g.sent();
                        return [4 /*yield*/, getAssociatedTokenAddress(usdcMint, recipient)];
                    case 8:
                        recipientTokenAccount = _g.sent();
                        nonce = BigInt(Date.now());
                        verifyData = Buffer.alloc(17);
                        verifyData[0] = 0;
                        verifyData.writeBigUInt64LE(amount, 1);
                        verifyData.writeBigUInt64LE(nonce, 9);
                        verifyInstruction = new TransactionInstruction({
                            programId: programId,
                            keys: [
                                { pubkey: keypair.publicKey, isSigner: true, isWritable: false },
                            ],
                            data: verifyData,
                        });
                        transferInstruction = createTransferInstruction(payerTokenAccount, recipientTokenAccount, keypair.publicKey, Number(amount));
                        settleData = Buffer.alloc(9);
                        settleData[0] = 1;
                        settleData.writeBigUInt64LE(nonce, 1);
                        settleInstruction = new TransactionInstruction({
                            programId: programId,
                            keys: [
                                { pubkey: keypair.publicKey, isSigner: true, isWritable: false },
                            ],
                            data: settleData,
                        });
                        tx = new Transaction();
                        tx.add(verifyInstruction);
                        tx.add(transferInstruction);
                        tx.add(settleInstruction);
                        return [4 /*yield*/, connection.getLatestBlockhash()];
                    case 9:
                        latestBlockhash = _g.sent();
                        tx.recentBlockhash = latestBlockhash.blockhash;
                        tx.feePayer = keypair.publicKey;
                        tx.sign(keypair);
                        paymentPayload = {
                            transaction: Buffer.from(tx.serialize()).toString("base64"),
                        };
                        return [2 /*return*/, Buffer.from(JSON.stringify(paymentPayload)).toString("base64")];
                }
            });
        });
    };
    /**
     * Publish a skill to the index.
     * Requires signing the message with the creator's private key to prove wallet ownership.
     */
    SkillIndexClient.prototype.publish = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var Keypair, nacl, bs58, keypair, walletFromKey, timestamp, message, messageBytes, signatureBytes, signature, signedPayload, resp, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.solanaPrivateKey) {
                            throw new Error("No Solana private key configured. Required to sign publish requests.");
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("@solana/web3.js"); })];
                    case 1:
                        Keypair = (_a.sent()).Keypair;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("tweetnacl"); })];
                    case 2:
                        nacl = _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("bs58"); })];
                    case 3:
                        bs58 = _a.sent();
                        try {
                            keypair = Keypair.fromSecretKey(bs58.default.decode(this.solanaPrivateKey));
                        }
                        catch (_b) {
                            throw new Error("Invalid Solana private key. Must be base58-encoded.");
                        }
                        walletFromKey = keypair.publicKey.toBase58();
                        if (walletFromKey !== payload.creatorWallet) {
                            throw new Error("Wallet mismatch: private key is for ".concat(walletFromKey, ", but payload claims ").concat(payload.creatorWallet));
                        }
                        timestamp = String(Date.now());
                        message = "Foundry:publish:".concat(payload.service, ":").concat(timestamp);
                        messageBytes = new TextEncoder().encode(message);
                        signatureBytes = nacl.default.sign.detached(messageBytes, keypair.secretKey);
                        signature = Buffer.from(signatureBytes).toString("base64");
                        signedPayload = __assign(__assign({}, payload), { signature: signature, timestamp: timestamp });
                        return [4 /*yield*/, fetch("".concat(this.indexUrl, "/skills/publish"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(signedPayload),
                                signal: AbortSignal.timeout(30000),
                            })];
                    case 4:
                        resp = _a.sent();
                        if (!!resp.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 5:
                        text = _a.sent();
                        throw new Error("Publish failed (".concat(resp.status, "): ").concat(text));
                    case 6: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    /**
     * Health check — verify the server is reachable (fast, no auth required).
     * Returns true if reachable, false otherwise.
     */
    SkillIndexClient.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fetch("".concat(this.indexUrl, "/health"), {
                                signal: AbortSignal.timeout(5000),
                            })];
                    case 1:
                        resp = _b.sent();
                        return [2 /*return*/, resp.ok];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SkillIndexClient;
}());
exports.SkillIndexClient = SkillIndexClient;
