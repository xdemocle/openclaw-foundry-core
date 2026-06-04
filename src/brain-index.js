"use strict";
/**
 * Brain Index Client — Unified marketplace for abilities (skills, patterns, extensions, etc.)
 *
 * Extends the skill marketplace to support multiple ability types with
 * crowdsourced pricing and ranking by unique payers.
 *
 * Ability Types:
 *   - skill:      API skills (endpoints, auth, templates)
 *   - pattern:    Failure resolution patterns from unlearn
 *   - technique:  Reusable code snippets
 *   - extension:  Full OpenClaw plugins
 *   - insight:    Successful approaches
 *   - agent:      High-fitness agent designs
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.BrainIndexClient = void 0;
var skill_index_js_1 = require("./skill-index.js");
// ── Client ───────────────────────────────────────────────────────────────────
var BrainIndexClient = /** @class */ (function (_super) {
    __extends(BrainIndexClient, _super);
    function BrainIndexClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Search abilities by query with optional type filter.
     */
    BrainIndexClient.prototype.searchAbilities = function (query, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL("".concat(this["indexUrl"], "/skills/search"));
                        url.searchParams.set("q", query);
                        if (opts === null || opts === void 0 ? void 0 : opts.type)
                            url.searchParams.set("type", opts.type);
                        if (opts === null || opts === void 0 ? void 0 : opts.tags)
                            url.searchParams.set("tags", opts.tags);
                        if (opts === null || opts === void 0 ? void 0 : opts.limit)
                            url.searchParams.set("limit", String(opts.limit));
                        if (opts === null || opts === void 0 ? void 0 : opts.offset)
                            url.searchParams.set("offset", String(opts.offset));
                        return [4 /*yield*/, fetch(url.toString(), {
                                signal: AbortSignal.timeout(10000),
                            })];
                    case 1:
                        resp = _a.sent();
                        if (!!resp.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 2:
                        text = _a.sent();
                        throw new Error("Search failed (".concat(resp.status, "): ").concat(text));
                    case 3: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    /**
     * Get the leaderboard — top abilities ranked by unique payers.
     */
    BrainIndexClient.prototype.getLeaderboard = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL("".concat(this["indexUrl"], "/abilities/leaderboard"));
                        if (opts === null || opts === void 0 ? void 0 : opts.type)
                            url.searchParams.set("type", opts.type);
                        if (opts === null || opts === void 0 ? void 0 : opts.limit)
                            url.searchParams.set("limit", String(opts.limit));
                        return [4 /*yield*/, fetch(url.toString(), {
                                signal: AbortSignal.timeout(10000),
                            })];
                    case 1:
                        resp = _a.sent();
                        if (!!resp.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, resp.text().catch(function () { return ""; })];
                    case 2:
                        text = _a.sent();
                        throw new Error("Leaderboard failed (".concat(resp.status, "): ").concat(text));
                    case 3: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    /**
     * Publish an ability (pattern, extension, technique, insight, or agent).
     * Requires signing the message with the creator's private key to prove wallet ownership.
     */
    BrainIndexClient.prototype.publishAbility = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKey, Keypair, nacl, bs58, keypair, walletFromKey, timestamp, message, messageBytes, signatureBytes, signature, body, resp, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        privateKey = this.solanaPrivateKey;
                        if (!privateKey) {
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
                            keypair = Keypair.fromSecretKey(bs58.default.decode(privateKey));
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
                        body = {
                            abilityType: payload.type,
                            service: payload.service,
                            content: payload.content,
                            creatorWallet: payload.creatorWallet,
                            priceCents: payload.priceCents,
                            signature: signature,
                            timestamp: timestamp,
                            // Stub fields for compatibility with existing schema
                            baseUrl: "",
                            authMethodType: "none",
                            endpoints: [],
                            skillMd: "",
                            apiTemplate: "",
                        };
                        return [4 /*yield*/, fetch("".concat(this["indexUrl"], "/skills/publish"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(body),
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
     * Download an ability by ID (x402 payment required for non-free abilities).
     */
    BrainIndexClient.prototype.downloadAbility = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Uses the parent download method — server returns the right format
                return [2 /*return*/, this.download(id)];
            });
        });
    };
    /**
     * Search for patterns that match a specific error.
     */
    BrainIndexClient.prototype.searchPatterns = function (errorPattern) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchAbilities(errorPattern, { type: "pattern", limit: 10 })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.skills];
                }
            });
        });
    };
    /**
     * Search for extensions by capability.
     */
    BrainIndexClient.prototype.searchExtensions = function (capability) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchAbilities(capability, { type: "extension", limit: 10 })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.skills];
                }
            });
        });
    };
    /**
     * Search for techniques by language/topic.
     */
    BrainIndexClient.prototype.searchTechniques = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchAbilities(topic, { type: "technique", limit: 10 })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.skills];
                }
            });
        });
    };
    return BrainIndexClient;
}(skill_index_js_1.SkillIndexClient));
exports.BrainIndexClient = BrainIndexClient;
