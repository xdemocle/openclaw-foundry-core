"use strict";
/**
 * Foundry — Self-writing coding subagent for OpenClaw.
 *
 * A meta-extension that researches best practices and writes code into:
 * - OpenClaw extensions (tools, hooks)
 * - Skills (SKILL.md + api.ts)
 * - The extension itself
 *
 * Grounded in docs.molt.bot/llms.txt — fetches documentation on demand.
 *
 * Tools:
 *   foundry_research     — Search docs.molt.bot for best practices
 *   foundry_implement    — Research + implement a capability
 *   foundry_write_extension — Write a new OpenClaw extension
 *   foundry_write_skill  — Write a skill package
 *   foundry_add_tool     — Add a tool to an existing extension
 *   foundry_add_hook     — Add a hook to an existing extension
 *   foundry_list         — List written extensions/skills
 *   foundry_docs         — Read OpenClaw plugin/hooks documentation
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_os_1 = require("node:os");
// ── Documentation URLs ───────────────────────────────────────────────────────
// Primary: OpenClaw documentation (AgentSkills-compatible)
var OPENCLAW_DOCS_BASE = "https://docs.openclaw.ai";
var OPENCLAW_LLMS_TXT = "".concat(OPENCLAW_DOCS_BASE, "/llms.txt");
// Fallback: molt.bot documentation
var DOCS_BASE = "https://docs.molt.bot";
var LLMS_TXT = "".concat(DOCS_BASE, "/llms.txt");
// Key documentation pages for different capabilities
// Prioritizes OpenClaw docs for skills, falls back to molt.bot for other topics
var DOC_PAGES = {
    // OpenClaw primary docs (skills, plugins, clawdhub)
    skills: ["/tools/skills", "/tools/skills-config", "/tools/clawdhub"],
    plugin: ["/plugin", "/tools/plugin"],
    clawdhub: ["/tools/clawdhub"],
    // Gateway and infrastructure
    hooks: ["/automation/hooks"],
    tools: ["/tools/tools", "/tools/lobster", "/tools/exec"],
    browser: ["/tools/browser", "/tools/browser-login"],
    agent: ["/concepts/agent", "/concepts/agent-loop", "/concepts/system-prompt"],
    gateway: ["/gateway/gateway", "/gateway/configuration", "/gateway/protocol"],
    channels: [
        "/channels/index",
        "/channels/whatsapp",
        "/channels/telegram",
        "/channels/discord",
    ],
    memory: ["/concepts/memory", "/cli/memory"],
    models: ["/concepts/models", "/concepts/model-providers"],
    automation: [
        "/automation/hooks",
        "/automation/cron-jobs",
        "/automation/webhook",
    ],
    nodes: ["/nodes/nodes", "/nodes/camera"],
    security: ["/gateway/security", "/gateway/sandboxing"],
};
// ── Documentation Fetcher ────────────────────────────────────────────────────
// Topics that should use OpenClaw docs as primary source
var OPENCLAW_TOPICS = new Set(["skills", "plugin", "clawdhub"]);
var DocsFetcher = /** @class */ (function () {
    function DocsFetcher() {
        this.cache = new Map();
        this.cacheTtl = 1000 * 60 * 30; // 30 minutes
        this.openclawIndex = null;
    }
    /**
     * Fetch the OpenClaw llms.txt index for discovering available documentation pages.
     * This should be called first to understand what docs are available.
     */
    DocsFetcher.prototype.fetchOpenClawIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.openclawIndex)
                            return [2 /*return*/, this.openclawIndex];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch(OPENCLAW_LLMS_TXT)];
                    case 2:
                        res = _b.sent();
                        if (!res.ok) return [3 /*break*/, 4];
                        _a = this;
                        return [4 /*yield*/, res.text()];
                    case 3:
                        _a.openclawIndex = _b.sent();
                        this.cache.set(OPENCLAW_LLMS_TXT, {
                            content: this.openclawIndex,
                            fetchedAt: Date.now(),
                        });
                        return [2 /*return*/, this.openclawIndex];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, "OpenClaw llms.txt not available. Using fallback documentation."];
                }
            });
        });
    };
    /**
     * Get the base URL for a topic - OpenClaw for skills/plugins, molt.bot for others
     */
    DocsFetcher.prototype.getBaseUrl = function (topic) {
        return OPENCLAW_TOPICS.has(topic.toLowerCase())
            ? OPENCLAW_DOCS_BASE
            : DOCS_BASE;
    };
    DocsFetcher.prototype.fetchPage = function (path_1) {
        return __awaiter(this, arguments, void 0, function (path, preferOpenClaw) {
            var baseUrl, url, cached, res, fallbackUrl, fallbackRes, html_1, content_1, html, content, err_2;
            if (preferOpenClaw === void 0) { preferOpenClaw = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseUrl = DOCS_BASE;
                        if (preferOpenClaw ||
                            path.includes("/skills") ||
                            path.includes("/plugin") ||
                            path.includes("/clawdhub")) {
                            baseUrl = OPENCLAW_DOCS_BASE;
                        }
                        url = path.startsWith("http") ? path : "".concat(baseUrl).concat(path);
                        cached = this.cache.get(url);
                        if (cached && Date.now() - cached.fetchedAt < this.cacheTtl) {
                            return [2 /*return*/, cached.content];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, fetch(url)];
                    case 2:
                        res = _a.sent();
                        if (!!res.ok) return [3 /*break*/, 6];
                        if (!(baseUrl === OPENCLAW_DOCS_BASE)) return [3 /*break*/, 5];
                        fallbackUrl = "".concat(DOCS_BASE).concat(path);
                        return [4 /*yield*/, fetch(fallbackUrl)];
                    case 3:
                        fallbackRes = _a.sent();
                        if (!fallbackRes.ok) return [3 /*break*/, 5];
                        return [4 /*yield*/, fallbackRes.text()];
                    case 4:
                        html_1 = _a.sent();
                        content_1 = this.extractContent(html_1);
                        this.cache.set(fallbackUrl, { content: content_1, fetchedAt: Date.now() });
                        return [2 /*return*/, content_1];
                    case 5: return [2 /*return*/, "Failed to fetch ".concat(url, ": ").concat(res.status)];
                    case 6: return [4 /*yield*/, res.text()];
                    case 7:
                        html = _a.sent();
                        content = this.extractContent(html);
                        this.cache.set(url, { content: content, fetchedAt: Date.now() });
                        return [2 /*return*/, content];
                    case 8:
                        err_2 = _a.sent();
                        return [2 /*return*/, "Error fetching ".concat(url, ": ").concat(err_2.message)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DocsFetcher.prototype.fetchForTopic = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            var pages, matchingTopic, preferOpenClaw, results, _i, _a, page, content, baseUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pages = DOC_PAGES[topic.toLowerCase()];
                        if (!pages) {
                            matchingTopic = Object.keys(DOC_PAGES).find(function (k) {
                                return k.includes(topic.toLowerCase()) || topic.toLowerCase().includes(k);
                            });
                            if (matchingTopic) {
                                return [2 /*return*/, this.fetchForTopic(matchingTopic)];
                            }
                            return [2 /*return*/, "No documentation pages mapped for topic: ".concat(topic, ". Available topics: ").concat(Object.keys(DOC_PAGES).join(", "))];
                        }
                        if (!OPENCLAW_TOPICS.has(topic.toLowerCase())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchOpenClawIndex()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        preferOpenClaw = OPENCLAW_TOPICS.has(topic.toLowerCase());
                        results = [];
                        _i = 0, _a = pages.slice(0, 2);
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        page = _a[_i];
                        return [4 /*yield*/, this.fetchPage(page, preferOpenClaw)];
                    case 4:
                        content = _b.sent();
                        baseUrl = preferOpenClaw ? OPENCLAW_DOCS_BASE : DOCS_BASE;
                        results.push("## ".concat(baseUrl).concat(page, "\n\n").concat(content.slice(0, 4000)));
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, results.join("\n\n---\n\n")];
                }
            });
        });
    };
    DocsFetcher.prototype.search = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var queryLower, relevantTopics, _i, _a, _b, topic, pages, uniqueTopics, openclawIndex, results, _c, uniqueTopics_1, topic, content;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        queryLower = query.toLowerCase();
                        relevantTopics = [];
                        for (_i = 0, _a = Object.entries(DOC_PAGES); _i < _a.length; _i++) {
                            _b = _a[_i], topic = _b[0], pages = _b[1];
                            if (queryLower.includes(topic) ||
                                topic.includes(queryLower.split(" ")[0])) {
                                relevantTopics.push(topic);
                            }
                        }
                        // Check for specific keywords
                        if (queryLower.includes("hook") || queryLower.includes("event"))
                            relevantTopics.push("hooks");
                        if (queryLower.includes("tool") || queryLower.includes("plugin"))
                            relevantTopics.push("plugin", "tools");
                        if (queryLower.includes("browser") || queryLower.includes("playwright"))
                            relevantTopics.push("browser");
                        if (queryLower.includes("skill") ||
                            queryLower.includes("api") ||
                            queryLower.includes("agentskill"))
                            relevantTopics.push("skills");
                        if (queryLower.includes("agent") || queryLower.includes("prompt"))
                            relevantTopics.push("agent");
                        if (queryLower.includes("channel") || queryLower.includes("message"))
                            relevantTopics.push("channels");
                        if (queryLower.includes("cron") || queryLower.includes("schedule"))
                            relevantTopics.push("automation");
                        if (queryLower.includes("clawdhub") || queryLower.includes("registry"))
                            relevantTopics.push("clawdhub");
                        if (queryLower.includes("openclaw") ||
                            queryLower.includes("frontmatter") ||
                            queryLower.includes("metadata"))
                            relevantTopics.push("skills");
                        uniqueTopics = __spreadArray([], new Set(relevantTopics), true).slice(0, 3);
                        if (uniqueTopics.length === 0) {
                            return [2 /*return*/, "No matching documentation found for: \"".concat(query, "\"\n\nAvailable topics: ").concat(Object.keys(DOC_PAGES).join(", "))];
                        }
                        return [4 /*yield*/, this.fetchOpenClawIndex()];
                    case 1:
                        openclawIndex = _d.sent();
                        results = ["# Documentation for: ".concat(query, "\n")];
                        // Include OpenClaw index summary if skills-related
                        if (uniqueTopics.some(function (t) { return OPENCLAW_TOPICS.has(t); })) {
                            results.push("## OpenClaw Documentation Index\n\n".concat(openclawIndex.slice(0, 1500), "\n"));
                        }
                        _c = 0, uniqueTopics_1 = uniqueTopics;
                        _d.label = 2;
                    case 2:
                        if (!(_c < uniqueTopics_1.length)) return [3 /*break*/, 5];
                        topic = uniqueTopics_1[_c];
                        return [4 /*yield*/, this.fetchForTopic(topic)];
                    case 3:
                        content = _d.sent();
                        results.push("## Topic: ".concat(topic, "\n\n").concat(content.slice(0, 3000)));
                        _d.label = 4;
                    case 4:
                        _c++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results.join("\n\n---\n\n")];
                }
            });
        });
    };
    DocsFetcher.prototype.extractContent = function (html) {
        // Remove scripts, styles, nav
        var content = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
        // Convert common HTML to markdown-ish
        content = content
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
            .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n")
            .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
            .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
            .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
            .replace(/<pre[^>]*>(.*?)<\/pre>/gis, "```\n$1\n```\n")
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
            .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "") // Remove remaining tags
            .replace(/&nbsp;/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
            .trim();
        return content;
    };
    return DocsFetcher;
}());
// ── Templates ────────────────────────────────────────────────────────────────
var EXTENSION_TEMPLATE = "/**\n * {{NAME}} \u2014 Auto-generated by foundry\n * {{DESCRIPTION}}\n * Generated: {{DATE}}\n */\n\nimport type { ClawdbotPluginApi } from \"clawdbot/plugin-sdk\";\n\nexport default {\n  id: \"{{ID}}\",\n  name: \"{{NAME}}\",\n  description: \"{{DESCRIPTION}}\",\n\n  register(api: ClawdbotPluginApi) {\n    const logger = api.logger;\n\n{{TOOLS}}\n\n{{HOOKS}}\n\n    logger.info(\"[{{ID}}] Extension loaded\");\n  },\n};\n";
var TOOL_TEMPLATE = "    api.registerTool({\n      name: \"{{NAME}}\",\n      label: \"{{LABEL}}\",\n      description: \"{{DESCRIPTION}}\",\n      parameters: {\n        type: \"object\",\n        properties: {\n{{PROPERTIES}}\n        },\n        required: [{{REQUIRED}}],\n      },\n      async execute(_toolCallId: string, params: unknown) {\n        const p = params as any;\n{{CODE}}\n      },\n    });\n";
var HOOK_TEMPLATE = "    api.on(\"{{EVENT}}\", async (event: any, ctx: any) => {\n{{CODE}}\n    });\n";
var PLUGIN_JSON_TEMPLATE = "{\n  \"id\": \"{{ID}}\",\n  \"name\": \"{{NAME}}\",\n  \"description\": \"{{DESCRIPTION}}\",\n  \"version\": \"0.1.0\",\n  \"configSchema\": {\n    \"type\": \"object\",\n    \"properties\": {},\n    \"additionalProperties\": false\n  }\n}\n";
// OpenClaw/AgentSkills-compatible SKILL.md template
// Format: YAML frontmatter + markdown content
// See: https://docs.openclaw.ai/tools/skills
var SKILL_TEMPLATE = "---\nname: {{NAME}}\ndescription: {{DESCRIPTION}}\n{{FRONTMATTER}}---\n\n{{CONTENT}}\n";
var API_CLIENT_TEMPLATE = "/**\n * {{NAME}} API Client\n * Auto-generated by foundry\n */\n\nconst BASE_URL = \"{{BASE_URL}}\";\n\nexport class {{CLIENT_NAME}} {\n  private headers: Record<string, string>;\n\n  constructor(authHeaders?: Record<string, string>) {\n    this.headers = {\n      \"Content-Type\": \"application/json\",\n      ...authHeaders,\n    };\n  }\n\n{{METHODS}}\n}\n\nexport default {{CLIENT_NAME}};\n";
// Browser automation skill template - uses OpenClaw browser tool
var BROWSER_SKILL_TEMPLATE = "---\nname: {{NAME}}\ndescription: {{DESCRIPTION}}\n{{FRONTMATTER}}---\n\n# {{DISPLAY_NAME}}\n\n{{DESCRIPTION}}\n\n## Browser Actions\n\nThis skill uses the OpenClaw `browser` tool for web automation.\n\n### Available Actions\n\nThe browser tool supports:\n- **Navigation**: `browser open <url>`, tab management\n- **Inspection**: `browser snapshot` (AI or ARIA format)\n- **Actions**: click, type, select using snapshot refs\n- **State**: cookies, headers, credentials, geolocation\n\n### Usage Pattern\n\n```\n1. Open the target URL: browser open <url>\n2. Take a snapshot: browser snapshot\n3. Interact using refs from snapshot: browser click ref=<id>\n4. Verify state with another snapshot\n```\n\n{{CONTENT}}\n\n## Authentication\n\n{{AUTH_SECTION}}\n\n## Notes\n\n- Use `{baseDir}` to reference files in this skill folder\n- The browser runs in the `openclaw` profile (isolated from personal browsing)\n- For sites with anti-bot detection, authenticate manually first\n";
// Hook template - HOOK.md + handler.ts pattern
var HOOK_MD_TEMPLATE = "---\nname: {{NAME}}\ndescription: {{DESCRIPTION}}\nmetadata: {{METADATA}}\n---\n\n# {{DISPLAY_NAME}}\n\n{{DESCRIPTION}}\n\n## Events\n\nThis hook triggers on: {{EVENTS}}\n\n## Behavior\n\n{{CONTENT}}\n";
var HOOK_HANDLER_TEMPLATE = "/**\n * {{NAME}} Hook Handler\n * Auto-generated by Foundry\n *\n * Events: {{EVENTS}}\n */\n\nimport type { HookHandler, HookEvent } from \"openclaw/hooks\";\n\n{{CODE}}\n\nexport default handler;\n";
// ── Extension Writer ─────────────────────────────────────────────────────────
var CodeWriter = /** @class */ (function () {
    function CodeWriter(dataDir, openclawPath, logger) {
        this.dataDir = dataDir;
        this.openclawPath = openclawPath;
        this.logger = logger;
        this.manifest = {
            extensions: [],
            skills: [],
        };
        this.openclawDocs = {
            plugin: "",
            hooks: "",
        };
        this.extensionsDir = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "extensions");
        this.skillsDir = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "skills");
        this.manifestPath = (0, node_path_1.join)(dataDir, "manifest.json");
        if (!(0, node_fs_1.existsSync)(this.extensionsDir))
            (0, node_fs_1.mkdirSync)(this.extensionsDir, { recursive: true });
        if (!(0, node_fs_1.existsSync)(this.skillsDir))
            (0, node_fs_1.mkdirSync)(this.skillsDir, { recursive: true });
        this.loadManifest();
        this.loadOpenClawDocs();
    }
    CodeWriter.prototype.loadManifest = function () {
        if ((0, node_fs_1.existsSync)(this.manifestPath)) {
            try {
                var data = JSON.parse((0, node_fs_1.readFileSync)(this.manifestPath, "utf-8"));
                // Ensure manifest has proper structure with arrays
                this.manifest = {
                    extensions: Array.isArray(data === null || data === void 0 ? void 0 : data.extensions) ? data.extensions : [],
                    skills: Array.isArray(data === null || data === void 0 ? void 0 : data.skills) ? data.skills : [],
                };
            }
            catch (_a) {
                this.manifest = { extensions: [], skills: [] };
            }
        }
    };
    CodeWriter.prototype.saveManifest = function () {
        var dir = (0, node_path_1.join)(this.manifestPath, "..");
        if (!(0, node_fs_1.existsSync)(dir))
            (0, node_fs_1.mkdirSync)(dir, { recursive: true });
        (0, node_fs_1.writeFileSync)(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    };
    CodeWriter.prototype.loadOpenClawDocs = function () {
        var _a, _b;
        var pluginDocPath = (0, node_path_1.join)(this.openclawPath, "docs", "plugin.md");
        var hooksDocPath = (0, node_path_1.join)(this.openclawPath, "docs", "hooks.md");
        if ((0, node_fs_1.existsSync)(pluginDocPath)) {
            this.openclawDocs.plugin = (0, node_fs_1.readFileSync)(pluginDocPath, "utf-8");
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Loaded plugin docs");
        }
        if ((0, node_fs_1.existsSync)(hooksDocPath)) {
            this.openclawDocs.hooks = (0, node_fs_1.readFileSync)(hooksDocPath, "utf-8");
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info("[foundry] Loaded hooks docs");
        }
    };
    CodeWriter.prototype.getDocs = function () {
        return this.openclawDocs;
    };
    // ── Extension Writing ─────────────────────────────────────────────────────
    /**
     * Write extension with validation. Returns { path, validation } or throws on blocked code.
     */
    CodeWriter.prototype.writeExtension = function (def, validator) {
        return __awaiter(this, void 0, void 0, function () {
            var full, toolsCode, hooksCode, extensionCode, validation, sandboxDir, sandboxResult, extDir, idx;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        full = __assign(__assign({}, def), { createdAt: new Date().toISOString() });
                        toolsCode = def.tools
                            .map(function (t) {
                            var props = Object.entries(t.properties)
                                .map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return "          ".concat(k, ": { type: \"").concat(v.type, "\", description: \"").concat(v.description.replace(/"/g, '\\"'), "\" },");
                            })
                                .join("\n");
                            var req = t.required.map(function (r) { return "\"".concat(r, "\""); }).join(", ");
                            return TOOL_TEMPLATE.replace(/\{\{NAME\}\}/g, t.name)
                                .replace(/\{\{LABEL\}\}/g, t.label || t.name)
                                .replace(/\{\{DESCRIPTION\}\}/g, t.description.replace(/"/g, '\\"'))
                                .replace(/\{\{PROPERTIES\}\}/g, props)
                                .replace(/\{\{REQUIRED\}\}/g, req)
                                .replace(/\{\{CODE\}\}/g, t.code
                                .split("\n")
                                .map(function (l) { return "        " + l; })
                                .join("\n"));
                        })
                            .join("\n");
                        hooksCode = def.hooks
                            .map(function (h) {
                            return HOOK_TEMPLATE.replace(/\{\{EVENT\}\}/g, h.event).replace(/\{\{CODE\}\}/g, h.code
                                .split("\n")
                                .map(function (l) { return "      " + l; })
                                .join("\n"));
                        })
                            .join("\n");
                        extensionCode = EXTENSION_TEMPLATE.replace(/\{\{ID\}\}/g, def.id)
                            .replace(/\{\{NAME\}\}/g, def.name)
                            .replace(/\{\{DESCRIPTION\}\}/g, def.description)
                            .replace(/\{\{DATE\}\}/g, full.createdAt)
                            .replace(/\{\{TOOLS\}\}/g, toolsCode)
                            .replace(/\{\{HOOKS\}\}/g, hooksCode);
                        validation = {
                            valid: true,
                            errors: [],
                            warnings: [],
                            securityFlags: [],
                        };
                        if (!validator) return [3 /*break*/, 3];
                        return [4 /*yield*/, validator.validate(extensionCode, "extension")];
                    case 1:
                        validation = _f.sent();
                        // Block if validation failed
                        if (!validation.valid) {
                            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Extension ".concat(def.id, " BLOCKED: ").concat(validation.errors.join(", ")));
                            throw new Error("Code validation failed: ".concat(validation.errors.join(", ")));
                        }
                        // Log warnings
                        if (validation.warnings.length > 0) {
                            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info("[foundry] Extension ".concat(def.id, " warnings: ").concat(validation.warnings.join(", ")));
                        }
                        sandboxDir = (0, node_path_1.join)(this.dataDir, "sandbox");
                        return [4 /*yield*/, validator.testInSandbox(extensionCode, sandboxDir)];
                    case 2:
                        sandboxResult = _f.sent();
                        if (!sandboxResult.success) {
                            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.info("[foundry] Extension ".concat(def.id, " SANDBOX FAILED: ").concat(sandboxResult.error));
                            throw new Error("Sandbox test failed: ".concat(sandboxResult.error));
                        }
                        (_d = this.logger) === null || _d === void 0 ? void 0 : _d.info("[foundry] Extension ".concat(def.id, " passed sandbox test"));
                        _f.label = 3;
                    case 3:
                        extDir = (0, node_path_1.join)(this.extensionsDir, def.id);
                        if (!(0, node_fs_1.existsSync)(extDir))
                            (0, node_fs_1.mkdirSync)(extDir, { recursive: true });
                        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(extDir, "index.ts"), extensionCode);
                        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(extDir, "openclaw.plugin.json"), PLUGIN_JSON_TEMPLATE.replace(/\{\{ID\}\}/g, def.id)
                            .replace(/\{\{NAME\}\}/g, def.name)
                            .replace(/\{\{DESCRIPTION\}\}/g, def.description));
                        idx = this.manifest.extensions.findIndex(function (e) { return e.id === def.id; });
                        if (idx >= 0)
                            this.manifest.extensions[idx] = full;
                        else
                            this.manifest.extensions.push(full);
                        this.saveManifest();
                        (_e = this.logger) === null || _e === void 0 ? void 0 : _e.info("[foundry] Wrote extension: ".concat(def.id, " (").concat(validation.warnings.length, " warnings, ").concat(validation.securityFlags.length, " flags)"));
                        return [2 /*return*/, { path: extDir, validation: validation }];
                }
            });
        });
    };
    CodeWriter.prototype.addTool = function (extensionId, tool) {
        var ext = this.manifest.extensions.find(function (e) { return e.id === extensionId; });
        if (!ext)
            return false;
        ext.tools.push(tool);
        this.writeExtension(ext);
        return true;
    };
    CodeWriter.prototype.addHook = function (extensionId, hook) {
        var ext = this.manifest.extensions.find(function (e) { return e.id === extensionId; });
        if (!ext)
            return false;
        ext.hooks.push(hook);
        this.writeExtension(ext);
        return true;
    };
    // ── Skill Writing (OpenClaw/AgentSkills-compatible) ─────────────────────────
    CodeWriter.prototype.writeSkill = function (def) {
        var _a;
        var full = __assign(__assign({}, def), { createdAt: new Date().toISOString() });
        var skillDir = (0, node_path_1.join)(this.skillsDir, def.name.toLowerCase().replace(/\s+/g, "-"));
        if (!(0, node_fs_1.existsSync)(skillDir))
            (0, node_fs_1.mkdirSync)(skillDir, { recursive: true });
        // Build YAML frontmatter (AgentSkills-compatible, single-line JSON for metadata)
        var frontmatterLines = [];
        // Optional frontmatter fields
        if (def.homepage) {
            frontmatterLines.push("homepage: ".concat(def.homepage));
        }
        if (def.userInvocable === false) {
            frontmatterLines.push("user-invocable: false");
        }
        if (def.disableModelInvocation === true) {
            frontmatterLines.push("disable-model-invocation: true");
        }
        if (def.commandDispatch) {
            frontmatterLines.push("command-dispatch: ".concat(def.commandDispatch));
        }
        if (def.commandTool) {
            frontmatterLines.push("command-tool: ".concat(def.commandTool));
        }
        if (def.commandArgMode) {
            frontmatterLines.push("command-arg-mode: ".concat(def.commandArgMode));
        }
        // Metadata must be single-line JSON per OpenClaw spec
        if (def.metadata) {
            frontmatterLines.push("metadata: ".concat(JSON.stringify(def.metadata)));
        }
        var frontmatter = frontmatterLines.length > 0 ? frontmatterLines.join("\n") + "\n" : "";
        // Build skill content
        var content = def.content || "";
        // If legacy API-based skill, generate content from endpoints
        if (def.baseUrl && def.endpoints && def.endpoints.length > 0) {
            var endpointsDoc = def.endpoints
                .map(function (e) { return "- `".concat(e.method, " ").concat(e.path, "` \u2014 ").concat(e.description); })
                .join("\n");
            content = "## Endpoints\n\n".concat(endpointsDoc, "\n\n## Usage\n\n```typescript\nimport { ").concat(toPascalCase(def.name), "Client } from \"./api\";\n\nconst client = new ").concat(toPascalCase(def.name), "Client();\n// Use the client methods...\n```\n\n## Auth\n\n").concat(def.authHeaders ? "Auth headers stored in auth.json" : "No auth required");
            // Generate api.ts for API-based skills
            var methods = def.endpoints
                .map(function (e) {
                var methodName = toMethodName(e.method, e.path);
                var pathParams = (e.path.match(/\{(\w+)\}/g) || []).map(function (p) {
                    return p.slice(1, -1);
                });
                var methodCode = "  async ".concat(methodName, "(");
                if (pathParams.length > 0) {
                    methodCode += pathParams.map(function (p) { return "".concat(p, ": string"); }).join(", ");
                }
                if (e.method !== "GET" && e.method !== "DELETE") {
                    methodCode += pathParams.length > 0 ? ", body?: any" : "body?: any";
                }
                methodCode += ") {\n";
                var urlCode = "`${BASE_URL}".concat(e.path, "`");
                for (var _i = 0, pathParams_1 = pathParams; _i < pathParams_1.length; _i++) {
                    var p = pathParams_1[_i];
                    urlCode = urlCode.replace("{".concat(p, "}"), "${".concat(p, "}"));
                }
                methodCode += "    const url = ".concat(urlCode, ";\n");
                methodCode += "    const res = await fetch(url, {\n";
                methodCode += "      method: \"".concat(e.method, "\",\n");
                methodCode += "      headers: this.headers,\n";
                if (e.method !== "GET" && e.method !== "DELETE") {
                    methodCode += "      body: body ? JSON.stringify(body) : undefined,\n";
                }
                methodCode += "    });\n";
                methodCode += "    return res.json();\n";
                methodCode += "  }\n";
                return methodCode;
            })
                .join("\n");
            var apiTs = API_CLIENT_TEMPLATE.replace(/\{\{NAME\}\}/g, def.name)
                .replace(/\{\{BASE_URL\}\}/g, def.baseUrl)
                .replace(/\{\{CLIENT_NAME\}\}/g, toPascalCase(def.name) + "Client")
                .replace(/\{\{METHODS\}\}/g, methods);
            (0, node_fs_1.writeFileSync)((0, node_path_1.join)(skillDir, "api.ts"), apiTs);
            // Save auth if provided
            if (def.authHeaders) {
                (0, node_fs_1.writeFileSync)((0, node_path_1.join)(skillDir, "auth.json"), JSON.stringify({ headers: def.authHeaders }, null, 2));
            }
        }
        // Generate SKILL.md with proper OpenClaw/AgentSkills format
        var skillMd = SKILL_TEMPLATE.replace(/\{\{NAME\}\}/g, def.name)
            .replace(/\{\{DESCRIPTION\}\}/g, def.description)
            .replace(/\{\{FRONTMATTER\}\}/g, frontmatter)
            .replace(/\{\{CONTENT\}\}/g, content);
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(skillDir, "SKILL.md"), skillMd);
        var idx = this.manifest.skills.findIndex(function (s) { return s.name === def.name; });
        if (idx >= 0)
            this.manifest.skills[idx] = full;
        else
            this.manifest.skills.push(full);
        this.saveManifest();
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Wrote skill: ".concat(def.name));
        return skillDir;
    };
    // ── Browser Skill Writing ─────────────────────────────────────────────────
    CodeWriter.prototype.writeBrowserSkill = function (def) {
        var _a;
        var skillDir = (0, node_path_1.join)(this.skillsDir, def.name.toLowerCase().replace(/\s+/g, "-"));
        if (!(0, node_fs_1.existsSync)(skillDir))
            (0, node_fs_1.mkdirSync)(skillDir, { recursive: true });
        // Build frontmatter
        var frontmatterLines = [];
        // Browser skills require browser.enabled config
        var metadata = def.metadata || {};
        if (!metadata.openclaw)
            metadata.openclaw = {};
        if (!metadata.openclaw.requires)
            metadata.openclaw.requires = {};
        if (!metadata.openclaw.requires.config)
            metadata.openclaw.requires.config = [];
        if (!metadata.openclaw.requires.config.includes("browser.enabled")) {
            metadata.openclaw.requires.config.push("browser.enabled");
        }
        frontmatterLines.push("metadata: ".concat(JSON.stringify(metadata)));
        var frontmatter = frontmatterLines.join("\n") + "\n";
        // Build actions content
        var actionsContent = "";
        if (def.actions && def.actions.length > 0) {
            actionsContent = "### Documented Actions\n\n";
            for (var _i = 0, _b = def.actions; _i < _b.length; _i++) {
                var action = _b[_i];
                actionsContent += "#### ".concat(action.name, "\n\n").concat(action.description, "\n\n");
                if (action.steps && action.steps.length > 0) {
                    actionsContent += "Steps:\n";
                    action.steps.forEach(function (step, i) {
                        actionsContent += "".concat(i + 1, ". ").concat(step, "\n");
                    });
                    actionsContent += "\n";
                }
            }
        }
        // Build auth section
        var authSection = "No special authentication required.";
        if (def.authMethod === "manual") {
            authSection = "**Manual Login Required**\n\nSign in to ".concat(def.targetUrl || "the target site", " in the openclaw browser profile before using this skill.\n\n").concat(def.authNotes || "");
        }
        else if (def.authMethod === "cookie") {
            authSection = "**Cookie-based Authentication**\n\nCookies are preserved in the browser profile.\n\n".concat(def.authNotes || "");
        }
        else if (def.authMethod === "header") {
            authSection = "**Header-based Authentication**\n\nSet auth headers via browser tool state management.\n\n".concat(def.authNotes || "");
        }
        else if (def.authMethod === "oauth") {
            authSection = "**OAuth Authentication**\n\nUse auth-profiles for OAuth token management.\n\n".concat(def.authNotes || "");
        }
        // Combine custom content
        var fullContent = "".concat(actionsContent).concat(def.content || "").trim();
        // Generate SKILL.md
        var skillMd = BROWSER_SKILL_TEMPLATE.replace(/\{\{NAME\}\}/g, def.name)
            .replace(/\{\{DISPLAY_NAME\}\}/g, toPascalCase(def.name.replace(/-/g, " ")))
            .replace(/\{\{DESCRIPTION\}\}/g, def.description)
            .replace(/\{\{FRONTMATTER\}\}/g, frontmatter)
            .replace(/\{\{CONTENT\}\}/g, fullContent)
            .replace(/\{\{AUTH_SECTION\}\}/g, authSection);
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(skillDir, "SKILL.md"), skillMd);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Wrote browser skill: ".concat(def.name));
        return skillDir;
    };
    // ── Hook Writing ──────────────────────────────────────────────────────────
    CodeWriter.prototype.writeHook = function (def) {
        var _a;
        var hooksDir = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "hooks");
        var hookDir = (0, node_path_1.join)(hooksDir, def.name.toLowerCase().replace(/\s+/g, "-"));
        if (!(0, node_fs_1.existsSync)(hookDir))
            (0, node_fs_1.mkdirSync)(hookDir, { recursive: true });
        // Build metadata - events go at openclaw level per hook spec
        var metadata = def.metadata || {};
        if (!metadata.openclaw)
            metadata.openclaw = {};
        metadata.openclaw.events = def.events;
        var metadataJson = JSON.stringify(metadata);
        var eventsStr = def.events.join(", ");
        // Generate HOOK.md
        var hookMd = HOOK_MD_TEMPLATE.replace(/\{\{NAME\}\}/g, def.name)
            .replace(/\{\{DISPLAY_NAME\}\}/g, toPascalCase(def.name.replace(/-/g, " ")))
            .replace(/\{\{DESCRIPTION\}\}/g, def.description)
            .replace(/\{\{METADATA\}\}/g, metadataJson)
            .replace(/\{\{EVENTS\}\}/g, eventsStr)
            .replace(/\{\{CONTENT\}\}/g, def.code
            ? "Custom handler logic implemented below."
            : "No custom behavior defined.");
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(hookDir, "HOOK.md"), hookMd);
        // Generate handler.ts
        var handlerCode = def.code ||
            "const handler: HookHandler = async (event: HookEvent) => {\n  // Event type: ".concat(eventsStr, "\n  console.log(\"[").concat(def.name, "] Hook triggered:\", event.type, event.action);\n};");
        var handlerTs = HOOK_HANDLER_TEMPLATE.replace(/\{\{NAME\}\}/g, def.name)
            .replace(/\{\{EVENTS\}\}/g, eventsStr)
            .replace(/\{\{CODE\}\}/g, handlerCode);
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(hookDir, "handler.ts"), handlerTs);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Wrote hook: ".concat(def.name));
        return hookDir;
    };
    // ── Getters ───────────────────────────────────────────────────────────────
    CodeWriter.prototype.getExtensions = function () {
        return this.manifest.extensions;
    };
    CodeWriter.prototype.getSkills = function () {
        return this.manifest.skills;
    };
    CodeWriter.prototype.getExtension = function (id) {
        return this.manifest.extensions.find(function (e) { return e.id === id; });
    };
    return CodeWriter;
}());
// ── Learning Engine ─────────────────────────────────────────────────────────
var LearningEngine = /** @class */ (function () {
    function LearningEngine(dataDir, logger) {
        this.dataDir = dataDir;
        this.logger = logger;
        this.learnings = [];
        this.pendingSession = null;
        this.toolMetrics = new Map();
        this.overseerInterval = null;
        this.lastOverseerReport = null;
        // Outcome-based learning
        this.outcomes = [];
        this.taskTypeInsights = new Map();
        this.feedbackCollectionInterval = null;
        // Workflow learning
        this.workflows = [];
        this.workflowPatterns = new Map();
        this.currentWorkflow = null;
        this.learningsPath = (0, node_path_1.join)(dataDir, "learnings.json");
        this.pendingSessionPath = (0, node_path_1.join)(dataDir, "pending-session.json");
        this.metricsPath = (0, node_path_1.join)(dataDir, "metrics.json");
        this.outcomesPath = (0, node_path_1.join)(dataDir, "outcomes.json");
        this.insightsPath = (0, node_path_1.join)(dataDir, "task-insights.json");
        this.workflowsPath = (0, node_path_1.join)(dataDir, "workflows.json");
        this.workflowPatternsPath = (0, node_path_1.join)(dataDir, "workflow-patterns.json");
        if (!(0, node_fs_1.existsSync)(dataDir))
            (0, node_fs_1.mkdirSync)(dataDir, { recursive: true });
        this.loadLearnings();
        this.loadPendingSession();
        this.loadOutcomes();
        this.loadMetrics();
        this.loadWorkflows();
    }
    LearningEngine.prototype.loadMetrics = function () {
        if ((0, node_fs_1.existsSync)(this.metricsPath)) {
            try {
                var data = JSON.parse((0, node_fs_1.readFileSync)(this.metricsPath, "utf-8"));
                this.toolMetrics = new Map(Object.entries(data));
            }
            catch (_a) {
                this.toolMetrics = new Map();
            }
        }
    };
    LearningEngine.prototype.saveMetrics = function () {
        var obj = Object.fromEntries(this.toolMetrics);
        (0, node_fs_1.writeFileSync)(this.metricsPath, JSON.stringify(obj, null, 2));
    };
    // ADAS: Record tool execution for fitness tracking
    LearningEngine.prototype.recordToolExecution = function (toolName, success, latencyMs) {
        var metrics = this.toolMetrics.get(toolName);
        if (!metrics) {
            metrics = {
                toolName: toolName,
                successCount: 0,
                failureCount: 0,
                totalLatencyMs: 0,
                fitness: 0.5,
            };
        }
        if (success)
            metrics.successCount++;
        else
            metrics.failureCount++;
        metrics.totalLatencyMs += latencyMs;
        metrics.fitness =
            metrics.successCount / (metrics.successCount + metrics.failureCount);
        this.toolMetrics.set(toolName, metrics);
        this.saveMetrics();
    };
    LearningEngine.prototype.getToolFitness = function (toolName) {
        var _a, _b;
        return (_b = (_a = this.toolMetrics.get(toolName)) === null || _a === void 0 ? void 0 : _a.fitness) !== null && _b !== void 0 ? _b : 0.5;
    };
    LearningEngine.prototype.getAllToolMetrics = function () {
        return Array.from(this.toolMetrics.values());
    };
    LearningEngine.prototype.loadLearnings = function () {
        if ((0, node_fs_1.existsSync)(this.learningsPath)) {
            try {
                var data = JSON.parse((0, node_fs_1.readFileSync)(this.learningsPath, "utf-8"));
                // Ensure learnings is always an array
                this.learnings = Array.isArray(data) ? data : [];
            }
            catch (_a) {
                this.learnings = [];
            }
        }
    };
    LearningEngine.prototype.saveLearnings = function () {
        (0, node_fs_1.writeFileSync)(this.learningsPath, JSON.stringify(this.learnings, null, 2));
    };
    LearningEngine.prototype.loadPendingSession = function () {
        var _a, _b;
        if ((0, node_fs_1.existsSync)(this.pendingSessionPath)) {
            try {
                this.pendingSession = JSON.parse((0, node_fs_1.readFileSync)(this.pendingSessionPath, "utf-8"));
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Found pending session from: ".concat((_b = this.pendingSession) === null || _b === void 0 ? void 0 : _b.reason));
            }
            catch (_c) {
                this.pendingSession = null;
            }
        }
    };
    // ── Learning from failures ───────────────────────────────────────────────
    // RISE (arXiv:2407.18219): Recursive introspection with attempt tracking
    LearningEngine.prototype.extractErrorSignature = function (error) {
        return error
            .replace(/\d+/g, "N")
            .replace(/0x[a-f0-9]+/gi, "ADDR")
            .replace(/["'][^"']*["']/g, "STR")
            .replace(/at .*:\d+:\d+/g, "at LOCATION")
            .slice(0, 150);
    };
    LearningEngine.prototype.findSimilarPattern = function (tool, error) {
        var _this = this;
        var signature = this.extractErrorSignature(error);
        return this.learnings.find(function (l) {
            return l.type === "pattern" &&
                l.tool === tool &&
                l.error &&
                _this.extractErrorSignature(l.error) === signature;
        });
    };
    LearningEngine.prototype.findSimilarFailure = function (tool, error) {
        var _this = this;
        var signature = this.extractErrorSignature(error);
        return this.learnings.find(function (l) {
            return l.type === "failure" &&
                l.tool === tool &&
                l.error &&
                _this.extractErrorSignature(l.error) === signature;
        });
    };
    LearningEngine.prototype.recordFailure = function (tool, error, context, executionFeedback) {
        var _a, _b;
        // RISE: Check for similar past failures to track attempt progression
        var similar = this.findSimilarFailure(tool, error);
        var attemptCount = similar ? (similar.attemptCount || 0) + 1 : 1;
        var trajectory = similar
            ? __spreadArray(__spreadArray([], (similar.improvementTrajectory || []), true), [0], false) : [0];
        var id = "fail_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8));
        var entry = {
            id: id,
            type: "failure",
            tool: tool,
            error: error,
            context: context,
            timestamp: new Date().toISOString(),
            useCount: 0,
            attemptCount: attemptCount,
            improvementTrajectory: trajectory,
            executionFeedback: executionFeedback ? [executionFeedback] : [],
        };
        this.learnings.push(entry);
        this.saveLearnings();
        if (attemptCount > 1) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] RISE: Attempt #".concat(attemptCount, " for ").concat(tool, " - ").concat(error.slice(0, 40), "..."));
        }
        else {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info("[foundry] Recorded failure: ".concat(tool, " - ").concat(error.slice(0, 50), "..."));
        }
        return id;
    };
    // SelfEvolve: Add interpreter feedback to existing failure
    LearningEngine.prototype.addExecutionFeedback = function (failureId, feedback) {
        var entry = this.learnings.find(function (l) { return l.id === failureId; });
        if (entry) {
            entry.executionFeedback = entry.executionFeedback || [];
            entry.executionFeedback.push(feedback);
            this.saveLearnings();
        }
    };
    LearningEngine.prototype.recordResolution = function (failureId, resolution) {
        var _a;
        var entry = this.learnings.find(function (l) { return l.id === failureId; });
        if (entry) {
            entry.resolution = resolution;
            entry.type = "pattern";
            // RISE: Mark success in trajectory
            if (entry.improvementTrajectory &&
                entry.improvementTrajectory.length > 0) {
                var lastIdx = entry.improvementTrajectory.length - 1;
                entry.improvementTrajectory[lastIdx] = 1.0;
            }
            this.saveLearnings();
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Pattern created (attempt #".concat(entry.attemptCount || 1, "): ").concat(entry.tool));
        }
    };
    // HexMachina: Check if pattern should be crystallized
    LearningEngine.prototype.shouldCrystallize = function (pattern) {
        return (pattern.type === "pattern" &&
            pattern.useCount >= 3 &&
            !pattern.crystallizedTo &&
            !!pattern.resolution);
    };
    LearningEngine.prototype.getCrystallizationCandidates = function () {
        var _this = this;
        return this.learnings.filter(function (l) { return _this.shouldCrystallize(l); });
    };
    LearningEngine.prototype.markCrystallized = function (patternId, artifactId) {
        var _a;
        var entry = this.learnings.find(function (l) { return l.id === patternId; });
        if (entry) {
            entry.crystallizedTo = artifactId;
            entry.crystallizedAt = new Date().toISOString();
            this.saveLearnings();
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] HexMachina: Crystallized ".concat(patternId, " \u2192 ").concat(artifactId));
        }
    };
    // RISE: Calculate pattern effectiveness score
    LearningEngine.prototype.calculatePatternScore = function (entry) {
        var score = entry.useCount || 0;
        var trajectory = entry.improvementTrajectory || [];
        if (trajectory.length > 0) {
            var avgSuccess = trajectory.reduce(function (a, b) { return a + b; }, 0) / trajectory.length;
            score += avgSuccess * 5;
        }
        if (entry.crystallizedTo)
            score += 10;
        return score;
    };
    LearningEngine.prototype.recordPatternUse = function (patternId) {
        var entry = this.learnings.find(function (l) { return l.id === patternId; });
        if (entry) {
            entry.useCount = (entry.useCount || 0) + 1;
            this.saveLearnings();
        }
    };
    // RISE: Record that a pattern-assisted retry succeeded
    LearningEngine.prototype.recordPatternSuccess = function (patternId) {
        var _a;
        var entry = this.learnings.find(function (l) { return l.id === patternId; });
        if (entry) {
            // Update improvement trajectory to show success
            if (!entry.improvementTrajectory)
                entry.improvementTrajectory = [];
            entry.improvementTrajectory.push(1.0);
            this.saveLearnings();
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] RISE: Pattern ".concat(patternId, " success recorded (trajectory: ").concat(entry.improvementTrajectory.length, ")"));
        }
    };
    // RISE: Check if pattern should auto-crystallize based on successful uses
    LearningEngine.prototype.shouldAutoCrystallize = function (pattern) {
        if (pattern.crystallizedTo)
            return false; // Already crystallized
        if (!pattern.resolution)
            return false; // No resolution to crystallize
        // Auto-crystallize after 3 successful RISE-assisted retries
        var trajectory = pattern.improvementTrajectory || [];
        var successCount = trajectory.filter(function (v) { return v === 1.0; }).length;
        return successCount >= 3;
    };
    // Get a specific pattern by ID
    LearningEngine.prototype.getPattern = function (patternId) {
        return this.learnings.find(function (l) { return l.id === patternId; });
    };
    // Get all learnings
    LearningEngine.prototype.getAll = function () {
        return this.learnings;
    };
    // Self-Improving Coding Agent: Overseer mechanism
    // Takes AUTONOMOUS ACTION - not just reporting
    LearningEngine.prototype.runOverseer = function (dataDir) {
        var _a, _b;
        var report = {
            timestamp: new Date().toISOString(),
            patternsAnalyzed: this.learnings.filter(function (l) { return l.type === "pattern"; })
                .length,
            crystallizationCandidates: this.getCrystallizationCandidates(),
            recurringFailures: [],
            evolutionCandidates: [],
            actionsExecuted: [],
        };
        // ADAS: Identify underperforming tools for evolution
        var EVOLUTION_THRESHOLD = 0.4; // Tools below 40% fitness
        var MIN_SAMPLES = 5; // Need at least 5 executions
        for (var _i = 0, _c = this.toolMetrics; _i < _c.length; _i++) {
            var _d = _c[_i], toolName = _d[0], metrics = _d[1];
            var totalCalls = metrics.successCount + metrics.failureCount;
            if (totalCalls >= MIN_SAMPLES && metrics.fitness < EVOLUTION_THRESHOLD) {
                report.evolutionCandidates.push(metrics);
            }
        }
        // Find recurring failures (same error signature 3+ times without resolution)
        var failureCounts = new Map();
        for (var _e = 0, _f = this.learnings.filter(function (l) { return l.type === "failure" && !l.resolution; }); _e < _f.length; _e++) {
            var l = _f[_e];
            var sig = "".concat(l.tool, ":").concat(this.extractErrorSignature(l.error || ""));
            var existing = failureCounts.get(sig) || [];
            existing.push(l);
            failureCounts.set(sig, existing);
        }
        for (var _g = 0, failureCounts_1 = failureCounts; _g < failureCounts_1.length; _g++) {
            var _h = failureCounts_1[_g], sig = _h[0], entries = _h[1];
            if (entries.length >= 3) {
                report.recurringFailures.push({
                    signature: sig,
                    count: entries.length,
                    entries: entries,
                });
            }
        }
        // AUTONOMOUS ACTION 1: Auto-crystallize high-value patterns
        // Only when we have a dataDir to write hooks to
        if (dataDir) {
            var hooksDir = (0, node_path_1.join)(dataDir, "hooks");
            if (!(0, node_fs_1.existsSync)(hooksDir))
                (0, node_fs_1.mkdirSync)(hooksDir, { recursive: true });
            for (var _j = 0, _k = report.crystallizationCandidates; _j < _k.length; _j++) {
                var candidate = _k[_j];
                // Auto-crystallize patterns that have been used 5+ times (very high value)
                if (candidate.useCount >= 5 && candidate.resolution) {
                    var hookId = "auto_crystallized_".concat(candidate.tool, "_").concat(Date.now());
                    var escapedError = (candidate.error || "")
                        .replace(/`/g, "'")
                        .slice(0, 100);
                    var escapedResolution = (candidate.resolution || "")
                        .replace(/`/g, "'")
                        .slice(0, 200);
                    var hookCode = "\n    // Auto-crystallized by Overseer from pattern: ".concat(candidate.id, "\n    api.on(\"before_tool_call\", async (event, ctx) => {\n      if (event.toolName === \"").concat(candidate.tool, "\") {\n        // Original error: ").concat(escapedError, "\n        // Learned resolution: ").concat(escapedResolution, "\n        if (ctx?.injectSystemMessage) {\n          ctx.injectSystemMessage(`\n[AUTO-CRYSTALLIZED PATTERN]\nBefore calling ").concat(candidate.tool, ", apply this learned approach:\n").concat(escapedResolution, "\n`);\n        }\n      }\n    });");
                    var hookPath = (0, node_path_1.join)(hooksDir, "".concat(hookId, ".ts"));
                    (0, node_fs_1.writeFileSync)(hookPath, hookCode);
                    this.markCrystallized(candidate.id, hookId);
                    report.actionsExecuted.push("Auto-crystallized pattern ".concat(candidate.id, " \u2192 ").concat(hookId));
                }
            }
        }
        // AUTONOMOUS ACTION 2: Prune stale patterns (no uses in 30 days, never crystallized)
        var thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        var stalePruned = this.learnings.filter(function (l) {
            if (l.type !== "pattern" || l.crystallizedTo)
                return false;
            var ts = new Date(l.timestamp).getTime();
            return ts < thirtyDaysAgo && (l.useCount || 0) === 0;
        });
        if (stalePruned.length > 0) {
            this.learnings = this.learnings.filter(function (l) { return !stalePruned.includes(l); });
            this.saveLearnings();
            report.actionsExecuted.push("Pruned ".concat(stalePruned.length, " stale patterns"));
        }
        // AUTONOMOUS ACTION 3: Consolidate duplicate failures into patterns
        for (var _l = 0, _m = report.recurringFailures; _l < _m.length; _l++) {
            var _o = _m[_l], signature = _o.signature, count = _o.count, entries = _o.entries;
            if (count >= 5) {
                // This failure is recurring enough to warrant attention
                // Create an insight about it
                var latest = entries[entries.length - 1];
                this.recordInsight("Recurring failure (".concat(count, "x): ").concat(signature.slice(0, 80)), "Tool: ".concat(latest.tool, ", Error: ").concat((_a = latest.error) === null || _a === void 0 ? void 0 : _a.slice(0, 100)));
                report.actionsExecuted.push("Created insight for recurring failure: ".concat(signature.slice(0, 50), "..."));
            }
        }
        // AUTONOMOUS ACTION 4: Auto-promote known error patterns
        var autoPromoted = this.autoPromoteKnownPatterns();
        if (autoPromoted > 0) {
            report.actionsExecuted.push("Auto-promoted ".concat(autoPromoted, " known error patterns"));
        }
        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info("[foundry] Overseer: ".concat(report.patternsAnalyzed, " patterns, ").concat(report.crystallizationCandidates.length, " candidates, ").concat(report.recurringFailures.length, " recurring failures, ").concat(report.evolutionCandidates.length, " evolution candidates, ").concat(report.actionsExecuted.length, " actions taken"));
        // Save report for proactive evolution injection
        this.lastOverseerReport = report;
        return report;
    };
    LearningEngine.prototype.getLastOverseerReport = function () {
        return this.lastOverseerReport;
    };
    // Start autonomous overseer
    LearningEngine.prototype.startOverseer = function (intervalMs, dataDir) {
        var _this = this;
        var _a;
        if (intervalMs === void 0) { intervalMs = 60 * 60 * 1000; }
        if (this.overseerInterval)
            return;
        this.overseerInterval = setInterval(function () {
            _this.runOverseer(dataDir);
        }, intervalMs);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Autonomous overseer started (interval: ".concat(intervalMs, "ms)"));
    };
    LearningEngine.prototype.stopOverseer = function () {
        if (this.overseerInterval) {
            clearInterval(this.overseerInterval);
            this.overseerInterval = null;
        }
    };
    // Auto-promote known error patterns with standard resolutions
    LearningEngine.prototype.autoPromoteKnownPatterns = function () {
        var _a;
        var KNOWN_PATTERNS = [
            {
                match: /Cannot use import statement outside a module/i,
                resolution: "Use inline code only. Do not use import/require statements. All dependencies must be inlined or use global APIs available in the plugin context.",
            },
            {
                match: /BLOCKED: Child process import/i,
                resolution: "Do not import child_process, exec, spawn, or execSync. Use HTTP APIs or built-in Node APIs instead of shell commands.",
            },
            {
                match: /BLOCKED: Shell execution/i,
                resolution: "Do not use exec(), spawn(), or shell commands. Use direct API calls or the plugin SDK methods instead.",
            },
            {
                match: /BLOCKED: Dynamic code execution/i,
                resolution: "Do not use eval() or new Function(). Use static code patterns only.",
            },
            {
                match: /Sandbox.*failed|runtime.*error/i,
                resolution: "Ensure all variables are defined before use, handle null/undefined cases, and use try/catch for async operations.",
            },
        ];
        var promoted = 0;
        var unresolved = this.learnings.filter(function (l) { return l.type === "failure" && !l.resolution; });
        for (var _i = 0, unresolved_1 = unresolved; _i < unresolved_1.length; _i++) {
            var failure = unresolved_1[_i];
            var error = failure.error || "";
            for (var _b = 0, KNOWN_PATTERNS_1 = KNOWN_PATTERNS; _b < KNOWN_PATTERNS_1.length; _b++) {
                var _c = KNOWN_PATTERNS_1[_b], match = _c.match, resolution = _c.resolution;
                if (match.test(error)) {
                    failure.resolution = resolution;
                    failure.type = "pattern";
                    promoted++;
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Auto-promoted pattern: ".concat(error.slice(0, 50), "..."));
                    break;
                }
            }
        }
        if (promoted > 0) {
            this.saveLearnings();
        }
        return promoted;
    };
    LearningEngine.prototype.recordSuccess = function (tool, context) {
        var entry = {
            id: "success_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)),
            type: "success",
            tool: tool,
            context: context,
            timestamp: new Date().toISOString(),
            useCount: 1,
        };
        this.learnings.push(entry);
        // Keep only last 100 success entries to avoid bloat
        var successEntries = this.learnings.filter(function (l) { return l.type === "success"; });
        if (successEntries.length > 100) {
            var oldest_1 = successEntries[0];
            this.learnings = this.learnings.filter(function (l) { return l.id !== oldest_1.id; });
        }
        this.saveLearnings();
    };
    LearningEngine.prototype.recordInsight = function (insight, context) {
        var _a;
        var entry = {
            id: "insight_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)),
            type: "insight",
            context: "".concat(insight).concat(context ? "\n\nContext: ".concat(context) : ""),
            timestamp: new Date().toISOString(),
            useCount: 0,
        };
        this.learnings.push(entry);
        this.saveLearnings();
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Recorded insight: ".concat(insight.slice(0, 50), "..."));
    };
    // ── Query learnings ──────────────────────────────────────────────────────
    // RISE: Sort by improvement trajectory success rate
    LearningEngine.prototype.findRelevantLearnings = function (tool, errorPattern) {
        var _this = this;
        var relevant = this.learnings.filter(function (l) {
            if (tool && l.tool !== tool)
                return false;
            if (errorPattern && l.error && !l.error.includes(errorPattern))
                return false;
            return l.type === "pattern" || l.type === "insight";
        });
        // Sort by RISE effectiveness score
        return relevant
            .sort(function (a, b) { return _this.calculatePatternScore(b) - _this.calculatePatternScore(a); })
            .slice(0, 10);
    };
    LearningEngine.prototype.getRecentFailures = function (limit) {
        if (limit === void 0) { limit = 5; }
        return this.learnings
            .filter(function (l) { return l.type === "failure" && !l.resolution; })
            .slice(-limit);
    };
    LearningEngine.prototype.getPatterns = function () {
        return this.learnings.filter(function (l) { return l.type === "pattern"; });
    };
    LearningEngine.prototype.getInsights = function () {
        return this.learnings.filter(function (l) { return l.type === "insight"; });
    };
    LearningEngine.prototype.getLearningsSummary = function () {
        var failures = this.learnings.filter(function (l) { return l.type === "failure"; }).length;
        var patterns = this.learnings.filter(function (l) { return l.type === "pattern"; }).length;
        var crystallized = this.learnings.filter(function (l) { return l.crystallizedTo; }).length;
        var insights = this.learnings.filter(function (l) { return l.type === "insight"; }).length;
        var successes = this.learnings.filter(function (l) { return l.type === "success"; }).length;
        var pending = this.getCrystallizationCandidates().length;
        return "".concat(patterns, " patterns (").concat(crystallized, " crystallized, ").concat(pending, " pending), ").concat(insights, " insights, ").concat(failures, " unresolved, ").concat(successes, " successes");
    };
    // ── Pending session management ───────────────────────────────────────────
    LearningEngine.prototype.savePendingSession = function (session) {
        var _a;
        this.pendingSession = __assign(__assign({}, session), { createdAt: new Date().toISOString() });
        (0, node_fs_1.writeFileSync)(this.pendingSessionPath, JSON.stringify(this.pendingSession, null, 2));
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Saved pending session: ".concat(session.reason));
    };
    LearningEngine.prototype.getPendingSession = function () {
        return this.pendingSession;
    };
    LearningEngine.prototype.clearPendingSession = function () {
        var _a;
        this.pendingSession = null;
        if ((0, node_fs_1.existsSync)(this.pendingSessionPath)) {
            var fs = require("node:fs");
            fs.unlinkSync(this.pendingSessionPath);
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Cleared pending session");
    };
    LearningEngine.prototype.hasPendingSession = function () {
        return this.pendingSession !== null;
    };
    // ── Outcome-based Learning ────────────────────────────────────────────────
    // Track real-world feedback signals (e.g., TikTok views, tweet engagement)
    LearningEngine.prototype.loadOutcomes = function () {
        var _a, _b;
        try {
            if ((0, node_fs_1.existsSync)(this.outcomesPath)) {
                this.outcomes = JSON.parse((0, node_fs_1.readFileSync)(this.outcomesPath, "utf-8"));
            }
            if ((0, node_fs_1.existsSync)(this.insightsPath)) {
                var insights = JSON.parse((0, node_fs_1.readFileSync)(this.insightsPath, "utf-8"));
                this.taskTypeInsights = new Map(Object.entries(insights));
            }
        }
        catch (err) {
            (_b = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, "[foundry] Failed to load outcomes: ".concat(err));
        }
    };
    LearningEngine.prototype.saveOutcomes = function () {
        (0, node_fs_1.writeFileSync)(this.outcomesPath, JSON.stringify(this.outcomes, null, 2));
        (0, node_fs_1.writeFileSync)(this.insightsPath, JSON.stringify(Object.fromEntries(this.taskTypeInsights), null, 2));
    };
    // Register a task for outcome tracking
    LearningEngine.prototype.trackOutcome = function (taskType, taskDescription, taskParams, successThreshold) {
        var _a;
        var outcome = {
            id: "outcome_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)),
            taskType: taskType,
            taskDescription: taskDescription,
            taskParams: taskParams,
            executedAt: new Date().toISOString(),
            metrics: {},
            insights: [],
            successThreshold: successThreshold,
        };
        this.outcomes.push(outcome);
        this.saveOutcomes();
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Tracking outcome: ".concat(taskType, " - ").concat(outcome.id));
        return outcome.id;
    };
    // Record feedback for a tracked outcome
    LearningEngine.prototype.recordFeedback = function (outcomeId, metrics, feedbackSource) {
        var _a, _b, _c;
        var outcome = this.outcomes.find(function (o) { return o.id === outcomeId; });
        if (!outcome) {
            (_b = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, "[foundry] Outcome not found: ".concat(outcomeId));
            return null;
        }
        outcome.metrics = __assign(__assign({}, outcome.metrics), metrics);
        outcome.feedbackCollectedAt = new Date().toISOString();
        outcome.feedbackSource = feedbackSource;
        // Determine success based on threshold
        if (outcome.successThreshold) {
            outcome.success = Object.entries(outcome.successThreshold).every(function (_a) {
                var key = _a[0], threshold = _a[1];
                return (outcome.metrics[key] || 0) >= threshold;
            });
        }
        this.saveOutcomes();
        (_c = this.logger) === null || _c === void 0 ? void 0 : _c.info("[foundry] Recorded feedback for ".concat(outcomeId, ": ").concat(JSON.stringify(metrics), " (success: ").concat(outcome.success, ")"));
        // Trigger insight regeneration for this task type
        this.regenerateInsights(outcome.taskType);
        return outcome;
    };
    // Get outcomes pending feedback collection
    LearningEngine.prototype.getPendingFeedback = function (taskType) {
        return this.outcomes.filter(function (o) {
            if (o.feedbackCollectedAt)
                return false; // Already collected
            if (taskType && o.taskType !== taskType)
                return false;
            // Only collect feedback after some time has passed (e.g., 1 hour)
            var executedAt = new Date(o.executedAt).getTime();
            var hourAgo = Date.now() - 60 * 60 * 1000;
            return executedAt < hourAgo;
        });
    };
    // Regenerate insights for a task type based on all outcomes
    LearningEngine.prototype.regenerateInsights = function (taskType) {
        var _a, _b;
        var typeOutcomes = this.outcomes.filter(function (o) { return o.taskType === taskType && o.feedbackCollectedAt; });
        if (typeOutcomes.length === 0) {
            var empty = {
                taskType: taskType,
                totalTasks: 0,
                successfulTasks: 0,
                avgMetrics: {},
                topPerformers: [],
                patterns: { successful: [], unsuccessful: [] },
                recommendations: [],
                lastUpdated: new Date().toISOString(),
            };
            this.taskTypeInsights.set(taskType, empty);
            return empty;
        }
        // Calculate averages
        var avgMetrics = {};
        var metricSums = {};
        for (var _i = 0, typeOutcomes_1 = typeOutcomes; _i < typeOutcomes_1.length; _i++) {
            var outcome = typeOutcomes_1[_i];
            for (var _c = 0, _d = Object.entries(outcome.metrics); _c < _d.length; _c++) {
                var _e = _d[_c], key = _e[0], value = _e[1];
                if (!metricSums[key])
                    metricSums[key] = { sum: 0, count: 0 };
                metricSums[key].sum += value;
                metricSums[key].count += 1;
            }
        }
        for (var _f = 0, _g = Object.entries(metricSums); _f < _g.length; _f++) {
            var _h = _g[_f], key = _h[0], _j = _h[1], sum = _j.sum, count = _j.count;
            avgMetrics[key] = Math.round(sum / count);
        }
        // Find top performers (by first metric or 'views' or 'engagement')
        var primaryMetric = Object.keys(avgMetrics)[0] || "views";
        var sorted = __spreadArray([], typeOutcomes, true).sort(function (a, b) {
            return (b.metrics[primaryMetric] || 0) - (a.metrics[primaryMetric] || 0);
        });
        var topPerformers = sorted.slice(0, 3);
        // Extract patterns from successful vs unsuccessful
        var successful = typeOutcomes.filter(function (o) { return o.success === true; });
        var unsuccessful = typeOutcomes.filter(function (o) { return o.success === false; });
        var successfulPatterns = this.extractPatterns(successful);
        var unsuccessfulPatterns = this.extractPatterns(unsuccessful);
        // Generate recommendations
        var recommendations = [];
        if (topPerformers.length > 0) {
            var topParams = topPerformers[0].taskParams;
            if (topParams.time || topParams.postTime) {
                recommendations.push("Best performing time: ".concat(topParams.time || topParams.postTime));
            }
            if (topParams.hashtags) {
                recommendations.push("Top hashtags: ".concat(topParams.hashtags));
            }
            if (topParams.contentType) {
                recommendations.push("Best content type: ".concat(topParams.contentType));
            }
            if (topParams.length || topParams.duration) {
                recommendations.push("Optimal length: ".concat(topParams.length || topParams.duration));
            }
        }
        if (successfulPatterns.length > 0) {
            recommendations.push("Successful pattern: ".concat(successfulPatterns[0]));
        }
        if (unsuccessfulPatterns.length > 0) {
            recommendations.push("Avoid: ".concat(unsuccessfulPatterns[0]));
        }
        var insights = {
            taskType: taskType,
            totalTasks: typeOutcomes.length,
            successfulTasks: successful.length,
            avgMetrics: avgMetrics,
            topPerformers: topPerformers,
            patterns: {
                successful: successfulPatterns,
                unsuccessful: unsuccessfulPatterns,
            },
            recommendations: recommendations,
            lastUpdated: new Date().toISOString(),
        };
        // Generate improvement suggestion if patterns are strong enough
        var MIN_SAMPLES_FOR_IMPROVEMENT = 5;
        var MIN_SUCCESS_RATE_FOR_CONFIDENCE = 0.6;
        if (typeOutcomes.length >= MIN_SAMPLES_FOR_IMPROVEMENT) {
            var successRate = successful.length / typeOutcomes.length;
            var confidence = Math.min(successRate * (typeOutcomes.length / 10), // More samples = higher confidence
            1.0);
            if (confidence >= 0.5 && successfulPatterns.length > 0) {
                // Generate suggested changes based on successful patterns
                var suggestedChanges = [];
                // Parse patterns into actionable changes
                for (var _k = 0, _l = successfulPatterns.slice(0, 3); _k < _l.length; _k++) {
                    var pattern = _l[_k];
                    var match = pattern.match(/^(\w+):\s*(.+?)\s*\(/);
                    if (match) {
                        var param = match[1], value = match[2];
                        suggestedChanges.push("Set default ".concat(param, " to \"").concat(value, "\""));
                    }
                }
                // Add recommendations as changes
                for (var _m = 0, _o = recommendations.slice(0, 2); _m < _o.length; _m++) {
                    var rec = _o[_m];
                    if (rec.includes(":")) {
                        suggestedChanges.push(rec);
                    }
                }
                if (suggestedChanges.length > 0) {
                    // Try to infer target skill from task type
                    var targetSkill = this.inferSkillFromTaskType(taskType);
                    insights.improvementSuggestion = {
                        confidence: confidence,
                        targetSkill: targetSkill,
                        suggestedChanges: suggestedChanges,
                    };
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Generated improvement suggestion for ".concat(taskType, " (confidence: ").concat((confidence * 100).toFixed(0), "%): ").concat(suggestedChanges.length, " changes"));
                }
            }
        }
        this.taskTypeInsights.set(taskType, insights);
        this.saveOutcomes();
        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info("[foundry] Regenerated insights for ".concat(taskType, ": ").concat(insights.recommendations.length, " recommendations"));
        return insights;
    };
    // Extract common patterns from a set of outcomes
    LearningEngine.prototype.extractPatterns = function (outcomes) {
        if (outcomes.length < 2)
            return [];
        var patterns = [];
        var paramCounts = {};
        // Count occurrences of each param value
        for (var _i = 0, outcomes_1 = outcomes; _i < outcomes_1.length; _i++) {
            var outcome = outcomes_1[_i];
            for (var _a = 0, _b = Object.entries(outcome.taskParams); _a < _b.length; _a++) {
                var _c = _b[_a], key = _c[0], value = _c[1];
                if (!paramCounts[key])
                    paramCounts[key] = {};
                var strValue = typeof value === "string" ? value : JSON.stringify(value);
                paramCounts[key][strValue] = (paramCounts[key][strValue] || 0) + 1;
            }
        }
        // Find params that appear in >50% of outcomes
        var threshold = outcomes.length * 0.5;
        for (var _d = 0, _e = Object.entries(paramCounts); _d < _e.length; _d++) {
            var _f = _e[_d], param = _f[0], valueCounts = _f[1];
            for (var _g = 0, _h = Object.entries(valueCounts); _g < _h.length; _g++) {
                var _j = _h[_g], value = _j[0], count = _j[1];
                if (count >= threshold) {
                    patterns.push("".concat(param, ": ").concat(value, " (").concat(Math.round((count / outcomes.length) * 100), "%)"));
                }
            }
        }
        return patterns.slice(0, 5); // Limit to top 5 patterns
    };
    // Get insights for a task type
    LearningEngine.prototype.getTaskInsights = function (taskType) {
        return this.taskTypeInsights.get(taskType) || null;
    };
    // Get all task types with insights
    LearningEngine.prototype.getAllTaskTypes = function () {
        return Array.from(this.taskTypeInsights.keys());
    };
    // Get insights formatted for injection into agent context
    LearningEngine.prototype.getInsightsForContext = function (taskType) {
        var insights = this.taskTypeInsights.get(taskType);
        if (!insights || insights.totalTasks === 0) {
            return "";
        }
        var context = "\n## \uD83D\uDCCA Learned Insights: ".concat(taskType, "\n\n");
        context += "Based on ".concat(insights.totalTasks, " tracked outcomes (").concat(insights.successfulTasks, " successful):\n\n");
        if (insights.avgMetrics && Object.keys(insights.avgMetrics).length > 0) {
            context += "**Average metrics**: ".concat(Object.entries(insights.avgMetrics)
                .map(function (_a) {
                var k = _a[0], v = _a[1];
                return "".concat(k, ": ").concat(v);
            })
                .join(", "), "\n\n");
        }
        if (insights.recommendations.length > 0) {
            context += "**Recommendations**:\n";
            for (var _i = 0, _a = insights.recommendations; _i < _a.length; _i++) {
                var rec = _a[_i];
                context += "- ".concat(rec, "\n");
            }
            context += "\n";
        }
        if (insights.patterns.successful.length > 0) {
            context += "**What works**: ".concat(insights.patterns.successful.slice(0, 3).join("; "), "\n");
        }
        if (insights.patterns.unsuccessful.length > 0) {
            context += "**What to avoid**: ".concat(insights.patterns.unsuccessful.slice(0, 2).join("; "), "\n");
        }
        return context;
    };
    // Start periodic feedback collection
    LearningEngine.prototype.startFeedbackCollection = function (collectFn, intervalMs) {
        var _this = this;
        var _a;
        if (intervalMs === void 0) { intervalMs = 60 * 60 * 1000; }
        if (this.feedbackCollectionInterval)
            return;
        this.feedbackCollectionInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var pending, _i, pending_1, outcome, metrics, err_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pending = this.getPendingFeedback();
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Checking feedback for ".concat(pending.length, " pending outcomes"));
                        _i = 0, pending_1 = pending;
                        _d.label = 1;
                    case 1:
                        if (!(_i < pending_1.length)) return [3 /*break*/, 6];
                        outcome = pending_1[_i];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, collectFn(outcome)];
                    case 3:
                        metrics = _d.sent();
                        if (metrics) {
                            this.recordFeedback(outcome.id, metrics, "auto_collection");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _d.sent();
                        (_c = (_b = this.logger) === null || _b === void 0 ? void 0 : _b.warn) === null || _c === void 0 ? void 0 : _c.call(_b, "[foundry] Failed to collect feedback for ".concat(outcome.id, ": ").concat(err_3));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }); }, intervalMs);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Feedback collection started (interval: ".concat(intervalMs, "ms)"));
    };
    LearningEngine.prototype.stopFeedbackCollection = function () {
        if (this.feedbackCollectionInterval) {
            clearInterval(this.feedbackCollectionInterval);
            this.feedbackCollectionInterval = null;
        }
    };
    // Get all outcomes for a task type
    LearningEngine.prototype.getOutcomes = function (taskType) {
        if (taskType) {
            return this.outcomes.filter(function (o) { return o.taskType === taskType; });
        }
        return this.outcomes;
    };
    // Infer which skill should be modified based on task type
    LearningEngine.prototype.inferSkillFromTaskType = function (taskType) {
        // Common mappings from task type to skill name
        var mappings = {
            tiktok_post: "tiktok",
            tiktok_video: "tiktok",
            tweet: "twitter",
            twitter_post: "twitter",
            linkedin_post: "linkedin",
            instagram_post: "instagram",
            email_campaign: "email",
            blog_post: "blog",
            youtube_video: "youtube",
        };
        var normalized = taskType.toLowerCase().replace(/[^a-z_]/g, "");
        return mappings[normalized];
    };
    // Get improvement suggestions that should be surfaced to the agent
    LearningEngine.prototype.getImprovementSuggestions = function () {
        var suggestions = [];
        for (var _i = 0, _a = this.taskTypeInsights; _i < _a.length; _i++) {
            var _b = _a[_i], taskType = _b[0], insights = _b[1];
            if (insights.improvementSuggestion &&
                insights.improvementSuggestion.confidence >= 0.5 &&
                !insights.improvementSuggestion.appliedAt) {
                suggestions.push({
                    taskType: taskType,
                    suggestion: insights.improvementSuggestion,
                });
            }
        }
        return suggestions.sort(function (a, b) { return b.suggestion.confidence - a.suggestion.confidence; });
    };
    // Mark an improvement as applied
    LearningEngine.prototype.markImprovementApplied = function (taskType) {
        var _a;
        var insights = this.taskTypeInsights.get(taskType);
        if (insights === null || insights === void 0 ? void 0 : insights.improvementSuggestion) {
            insights.improvementSuggestion.appliedAt = new Date().toISOString();
            this.taskTypeInsights.set(taskType, insights);
            this.saveOutcomes();
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Marked improvement applied for ".concat(taskType));
        }
    };
    // ── Workflow Learning ─────────────────────────────────────────────────────
    LearningEngine.prototype.loadWorkflows = function () {
        if ((0, node_fs_1.existsSync)(this.workflowsPath)) {
            try {
                this.workflows = JSON.parse((0, node_fs_1.readFileSync)(this.workflowsPath, "utf-8"));
            }
            catch (_a) {
                this.workflows = [];
            }
        }
        if ((0, node_fs_1.existsSync)(this.workflowPatternsPath)) {
            try {
                var data = JSON.parse((0, node_fs_1.readFileSync)(this.workflowPatternsPath, "utf-8"));
                this.workflowPatterns = new Map(Object.entries(data));
            }
            catch (_b) {
                this.workflowPatterns = new Map();
            }
        }
    };
    LearningEngine.prototype.saveWorkflows = function () {
        (0, node_fs_1.writeFileSync)(this.workflowsPath, JSON.stringify(this.workflows, null, 2));
        var patternsObj = Object.fromEntries(this.workflowPatterns);
        (0, node_fs_1.writeFileSync)(this.workflowPatternsPath, JSON.stringify(patternsObj, null, 2));
    };
    // Start tracking a new workflow when user sends first message
    LearningEngine.prototype.startWorkflow = function (goal) {
        var _a;
        this.currentWorkflow = {
            goal: goal,
            tools: [],
            startedAt: Date.now(),
        };
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Started tracking workflow: ".concat(goal.slice(0, 50), "..."));
    };
    // Track tool call within current workflow
    LearningEngine.prototype.trackWorkflowTool = function (toolName) {
        if (this.currentWorkflow && !toolName.startsWith("foundry_")) {
            this.currentWorkflow.tools.push(toolName);
        }
    };
    // Complete and record the workflow
    LearningEngine.prototype.completeWorkflow = function (outcome, context) {
        var _a;
        if (!this.currentWorkflow || this.currentWorkflow.tools.length < 2) {
            this.currentWorkflow = null;
            return;
        }
        var entry = {
            id: "wf_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)),
            goal: this.currentWorkflow.goal,
            toolSequence: this.currentWorkflow.tools,
            startedAt: this.currentWorkflow.startedAt,
            completedAt: Date.now(),
            outcome: outcome,
            context: context,
        };
        this.workflows.push(entry);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Recorded workflow: ".concat(entry.toolSequence.length, " tools, outcome=").concat(outcome));
        // Update patterns
        this.updateWorkflowPatterns(entry);
        this.saveWorkflows();
        this.currentWorkflow = null;
    };
    // Create normalized signature from tool sequence
    LearningEngine.prototype.createWorkflowSignature = function (tools) {
        return tools.slice(0, 10).join("→");
    };
    // Extract keywords from goal text
    LearningEngine.prototype.extractGoalKeywords = function (goal) {
        var stopWords = new Set([
            "a",
            "an",
            "the",
            "to",
            "for",
            "of",
            "and",
            "or",
            "in",
            "on",
            "with",
            "is",
            "it",
            "i",
            "me",
            "my",
            "can",
            "you",
            "please",
            "want",
            "need",
            "help",
        ]);
        return goal
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter(function (w) { return w.length > 2 && !stopWords.has(w); })
            .slice(0, 10);
    };
    // Update workflow patterns after recording a workflow
    LearningEngine.prototype.updateWorkflowPatterns = function (entry) {
        var signature = this.createWorkflowSignature(entry.toolSequence);
        var existing = this.workflowPatterns.get(signature);
        var keywords = this.extractGoalKeywords(entry.goal);
        if (existing) {
            // Update existing pattern
            existing.occurrences++;
            existing.lastOccurrence = Date.now();
            var successCount = existing.successRate * (existing.occurrences - 1) +
                (entry.outcome === "success" ? 1 : 0);
            existing.successRate = successCount / existing.occurrences;
            existing.avgDuration =
                (existing.avgDuration * (existing.occurrences - 1) +
                    (entry.completedAt - entry.startedAt)) /
                    existing.occurrences;
            // Merge keywords
            var keywordSet = new Set(__spreadArray(__spreadArray([], existing.goalKeywords, true), keywords, true));
            existing.goalKeywords = Array.from(keywordSet).slice(0, 20);
            this.workflowPatterns.set(signature, existing);
        }
        else {
            // Create new pattern
            var pattern = {
                id: "wp_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)),
                signature: signature,
                goalKeywords: keywords,
                occurrences: 1,
                successRate: entry.outcome === "success" ? 1 : 0,
                avgDuration: entry.completedAt - entry.startedAt,
                lastOccurrence: Date.now(),
            };
            this.workflowPatterns.set(signature, pattern);
        }
    };
    // Find workflow patterns that match user's goal
    LearningEngine.prototype.findMatchingWorkflows = function (userMessage) {
        var userKeywords = this.extractGoalKeywords(userMessage);
        if (userKeywords.length === 0)
            return [];
        var suggestions = [];
        var _loop_1 = function (pattern) {
            // Only suggest patterns with enough occurrences and good success rate
            if (pattern.occurrences < 3 ||
                pattern.successRate < 0.5 ||
                pattern.crystallizedTo)
                return "continue";
            // Calculate keyword overlap
            var overlap = userKeywords.filter(function (k) {
                return pattern.goalKeywords.includes(k);
            }).length;
            if (overlap === 0)
                return "continue";
            var confidence = (overlap / userKeywords.length) *
                pattern.successRate *
                Math.min(pattern.occurrences / 5, 1);
            if (confidence < 0.3)
                return "continue";
            suggestions.push({
                patternId: pattern.id,
                signature: pattern.signature,
                description: "You've done \"".concat(pattern.signature, "\" ").concat(pattern.occurrences, "x (").concat((pattern.successRate * 100).toFixed(0), "% success) when working with: ").concat(pattern.goalKeywords.slice(0, 5).join(", ")),
                confidence: confidence,
            });
        };
        for (var _i = 0, _a = this.workflowPatterns.values(); _i < _a.length; _i++) {
            var pattern = _a[_i];
            _loop_1(pattern);
        }
        return suggestions.sort(function (a, b) { return b.confidence - a.confidence; }).slice(0, 3);
    };
    // Get patterns ready for crystallization (convert to a single tool)
    LearningEngine.prototype.getWorkflowCrystallizationCandidates = function () {
        return Array.from(this.workflowPatterns.values()).filter(function (p) { return p.occurrences >= 5 && p.successRate >= 0.7 && !p.crystallizedTo; });
    };
    // Mark a workflow pattern as crystallized into a tool
    LearningEngine.prototype.markWorkflowCrystallized = function (patternId, toolId) {
        var _a;
        for (var _i = 0, _b = this.workflowPatterns.values(); _i < _b.length; _i++) {
            var pattern = _b[_i];
            if (pattern.id === patternId) {
                pattern.crystallizedTo = toolId;
                this.saveWorkflows();
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Workflow pattern ".concat(patternId, " crystallized to tool ").concat(toolId));
                return;
            }
        }
    };
    // Get workflow stats for display
    LearningEngine.prototype.getWorkflowStats = function () {
        var candidateCount = this.getWorkflowCrystallizationCandidates().length;
        return {
            totalWorkflows: this.workflows.length,
            patterns: this.workflowPatterns.size,
            suggestions: candidateCount,
        };
    };
    // Check if this is the first run (no workflows recorded yet)
    LearningEngine.prototype.isFirstRun = function () {
        return this.workflows.length === 0;
    };
    // Get recent workflows for context
    LearningEngine.prototype.getRecentWorkflows = function (limit) {
        if (limit === void 0) { limit = 5; }
        return this.workflows.slice(-limit);
    };
    return LearningEngine;
}());
var CodeValidator = /** @class */ (function () {
    function CodeValidator(logger) {
        this.logger = logger;
    }
    /**
     * Validate generated code before writing.
     */
    CodeValidator.prototype.validate = function (code, type) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, warnings, securityFlags, securityPatterns;
            var _a;
            return __generator(this, function (_b) {
                errors = [];
                warnings = [];
                securityFlags = [];
                // 1. Basic syntax check - try to parse as function
                try {
                    // Wrap in function to check syntax
                    new Function(code);
                }
                catch (err) {
                    errors.push("Syntax error: ".concat(err.message));
                }
                securityPatterns = this.staticSecurityScan(code);
                if (securityPatterns.blocked.length > 0) {
                    errors.push.apply(errors, securityPatterns.blocked.map(function (p) { return "BLOCKED: ".concat(p); }));
                }
                if (securityPatterns.flagged.length > 0) {
                    securityFlags.push.apply(securityFlags, securityPatterns.flagged);
                }
                // 3. Check for common mistakes
                if (type === "extension") {
                    if (!code.includes("api.registerTool")) {
                        warnings.push("Extension doesn't register any tools");
                    }
                    if (!code.includes("export default")) {
                        errors.push("Extension missing 'export default'");
                    }
                }
                // 4. Check for infinite loops / resource bombs
                if (/while\s*\(\s*true\s*\)/.test(code) && !/break|return/.test(code)) {
                    warnings.push("Potential infinite loop detected");
                }
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("[foundry] Code validation: ".concat(errors.length, " errors, ").concat(warnings.length, " warnings, ").concat(securityFlags.length, " flags"));
                return [2 /*return*/, {
                        valid: errors.length === 0,
                        errors: errors,
                        warnings: warnings,
                        securityFlags: securityFlags,
                    }];
            });
        });
    };
    /**
     * Static security scan - same patterns as unbrowse's skill-review.
     */
    CodeValidator.prototype.staticSecurityScan = function (code) {
        var blocked = [];
        var flagged = [];
        // BLOCK patterns - instant reject
        var blockPatterns = [
            { pattern: /id_rsa|id_ed25519|~\/\.ssh\//i, reason: "SSH key reference" },
            {
                pattern: /aws_secret|aws_access|~\/\.aws\//i,
                reason: "AWS credentials",
            },
            { pattern: /~\/\.gnupg\//i, reason: "GPG key reference" },
            {
                pattern: /require\s*\(\s*['"]child_process['"]\s*\)/i,
                reason: "Child process import",
            },
            {
                pattern: /\bexec\s*\(|\bspawn\s*\(|\bexecSync\s*\(/i,
                reason: "Shell execution",
            },
            { pattern: /\beval\s*\(/i, reason: "eval() usage" },
            { pattern: /new\s+Function\s*\(/i, reason: "Dynamic function creation" },
            {
                pattern: /\.ngrok\.|\.burpcollaborator\.|\.oastify\.|webhook\.site|requestbin/i,
                reason: "Exfiltration domain",
            },
            {
                pattern: /ignore\s+previous\s+instructions|system:\s*you/i,
                reason: "Prompt injection",
            },
            { pattern: /coinhive|cryptominer/i, reason: "Crypto mining" },
            { pattern: /crontab|systemctl|launchctl/i, reason: "System persistence" },
            { pattern: /<script|<!--/i, reason: "Script injection" },
        ];
        // FLAG patterns - needs review
        var flagPatterns = [
            { pattern: /process\.env|\.env/i, reason: "Environment variable access" },
            { pattern: /readFile|writeFile|fs\./i, reason: "Filesystem access" },
            { pattern: /atob|btoa|Buffer\.from/i, reason: "Base64 encoding" },
            {
                pattern: /\\x[0-9a-f]{2}|\\u[0-9a-f]{4}/i,
                reason: "Hex/unicode escapes",
            },
        ];
        for (var _i = 0, blockPatterns_1 = blockPatterns; _i < blockPatterns_1.length; _i++) {
            var _a = blockPatterns_1[_i], pattern = _a.pattern, reason = _a.reason;
            if (pattern.test(code)) {
                blocked.push(reason);
            }
        }
        for (var _b = 0, flagPatterns_1 = flagPatterns; _b < flagPatterns_1.length; _b++) {
            var _c = flagPatterns_1[_b], pattern = _c.pattern, reason = _c.reason;
            if (pattern.test(code)) {
                flagged.push(reason);
            }
        }
        return { blocked: blocked, flagged: flagged };
    };
    /**
     * Test code in isolated subprocess - actually runs the extension to catch runtime errors.
     */
    CodeValidator.prototype.testInSandbox = function (code, tempDir) {
        return __awaiter(this, void 0, void 0, function () {
            var spawn, fs, testId, testDir, indexFile, runnerFile, runnerCode;
            return __generator(this, function (_a) {
                spawn = require("node:child_process").spawn;
                fs = require("node:fs");
                if (!fs.existsSync(tempDir))
                    fs.mkdirSync(tempDir, { recursive: true });
                testId = "sandbox_".concat(Date.now());
                testDir = (0, node_path_1.join)(tempDir, testId);
                fs.mkdirSync(testDir, { recursive: true });
                indexFile = (0, node_path_1.join)(testDir, "index.ts");
                runnerFile = (0, node_path_1.join)(testDir, "runner.mjs");
                try {
                    // Write extension code
                    fs.writeFileSync(indexFile, code);
                    runnerCode = "\nimport { pathToFileURL } from \"url\";\n\n// Mock OpenClaw API\nconst mockApi = {\n  logger: { info: () => {}, warn: () => {}, error: () => {} },\n  pluginConfig: {},\n  registerTool: (tools) => {\n    // Try to instantiate each tool\n    if (Array.isArray(tools)) {\n      for (const tool of tools) {\n        if (typeof tool.execute !== \"function\") {\n          throw new Error(`Tool ${tool.name || \"unknown\"} has no execute function`);\n        }\n      }\n    } else if (typeof tools === \"function\") {\n      const result = tools({});\n      if (Array.isArray(result)) {\n        for (const tool of result) {\n          if (typeof tool.execute !== \"function\") {\n            throw new Error(`Tool ${tool.name || \"unknown\"} has no execute function`);\n          }\n        }\n      }\n    }\n    return true;\n  },\n  on: () => {},\n};\n\ntry {\n  // Dynamic import of TypeScript - use tsx or ts-node\n  const mod = await import(pathToFileURL(\"".concat(indexFile, "\").href);\n  const plugin = mod.default || mod;\n\n  if (typeof plugin.register === \"function\") {\n    plugin.register(mockApi);\n  } else {\n    throw new Error(\"Extension missing register() function\");\n  }\n\n  console.log(\"SANDBOX_OK\");\n  process.exit(0);\n} catch (err) {\n  console.error(\"SANDBOX_ERROR:\", err.message);\n  process.exit(1);\n}\n");
                    fs.writeFileSync(runnerFile, runnerCode);
                    // Run with tsx (TypeScript executor)
                    return [2 /*return*/, new Promise(function (resolve) {
                            var _a, _b;
                            var proc = spawn("npx", ["tsx", runnerFile], {
                                cwd: testDir,
                                timeout: 15000,
                                stdio: ["ignore", "pipe", "pipe"],
                            });
                            var stdout = "";
                            var stderr = "";
                            (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                                stdout += data.toString();
                            });
                            (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
                                stderr += data.toString();
                            });
                            proc.on("close", function (code) {
                                // Clean up
                                try {
                                    fs.rmSync(testDir, { recursive: true, force: true });
                                }
                                catch (_a) { }
                                if (code === 0 && stdout.includes("SANDBOX_OK")) {
                                    resolve({ success: true });
                                }
                                else {
                                    var errorMatch = stderr.match(/SANDBOX_ERROR:\s*(.+)/);
                                    var error = (errorMatch === null || errorMatch === void 0 ? void 0 : errorMatch[1]) || stderr.slice(0, 500) || "Exit code ".concat(code);
                                    resolve({ success: false, error: error });
                                }
                            });
                            proc.on("error", function (err) {
                                try {
                                    fs.rmSync(testDir, { recursive: true, force: true });
                                }
                                catch (_a) { }
                                resolve({ success: false, error: err.message });
                            });
                            // Timeout fallback
                            setTimeout(function () {
                                proc.kill();
                                resolve({ success: false, error: "Sandbox timeout (15s)" });
                            }, 15000);
                        })];
                }
                catch (err) {
                    // Clean up on error
                    try {
                        fs.rmSync(testDir, { recursive: true, force: true });
                    }
                    catch (_b) { }
                    return [2 /*return*/, { success: false, error: err.message }];
                }
                return [2 /*return*/];
            });
        });
    };
    return CodeValidator;
}());
// ── Helpers ──────────────────────────────────────────────────────────────────
function toPascalCase(s) {
    return s
        .split(/[-_\s]+/)
        .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
        .join("");
}
function toMethodName(method, path) {
    var parts = path
        .split("/")
        .filter(Boolean)
        .map(function (p) {
        if (p.startsWith("{"))
            return "By" + toPascalCase(p.slice(1, -1));
        return toPascalCase(p);
    });
    return method.toLowerCase() + parts.join("");
}
// ── Plugin ───────────────────────────────────────────────────────────────────
exports.default = {
    id: "foundry-openclaw",
    name: "Foundry",
    description: "Self-writing coding subagent — researches and implements capabilities",
    register: function (api) {
        var _this = this;
        var logger = api.logger;
        var cfg = api.pluginConfig || {};
        var dataDir = cfg.dataDir || (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "foundry");
        var openclawPath = cfg.openclawPath || "/Users/lekt9/Projects/aiko/openclaw";
        if (!(0, node_fs_1.existsSync)(dataDir))
            (0, node_fs_1.mkdirSync)(dataDir, { recursive: true });
        var writer = new CodeWriter(dataDir, openclawPath, logger);
        var docsFetcher = new DocsFetcher();
        var learningEngine = new LearningEngine(dataDir, logger);
        var codeValidator = new CodeValidator(logger);
        // Track current failure for resolution matching
        var lastFailureId = null;
        // RISE: Track pattern used for injection (to detect successful retries)
        var lastInjectedPatternId = null;
        var lastInjectedForTool = null;
        // Track failures per extension/skill ID for learning resolution
        var pendingFailures = new Map();
        // ── Tools ───────────────────────────────────────────────────────────────
        var tools = function (_ctx) {
            var toolList = [
                // ── foundry_research ──────────────────────────────────────────────────
                {
                    name: "foundry_research",
                    label: "Research Documentation",
                    description: "Search docs.openclaw.ai for best practices. Use before implementing to understand " +
                        "the OpenClaw API, patterns, and conventions.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "What to research (e.g., 'how to write hooks', 'browser automation', 'skill structure')",
                            },
                            topic: {
                                type: "string",
                                enum: [
                                    "plugin",
                                    "hooks",
                                    "tools",
                                    "browser",
                                    "skills",
                                    "agent",
                                    "gateway",
                                    "channels",
                                    "memory",
                                    "models",
                                    "automation",
                                    "nodes",
                                    "security",
                                ],
                                description: "Specific topic to fetch docs for (optional, faster than query)",
                            },
                            page: {
                                type: "string",
                                description: "Specific doc page path (e.g., '/tools/plugin', '/automation/hooks')",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, content;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        p = params;
                                        if (!p.page) return [3 /*break*/, 2];
                                        return [4 /*yield*/, docsFetcher.fetchPage(p.page)];
                                    case 1:
                                        content = _a.sent();
                                        return [3 /*break*/, 7];
                                    case 2:
                                        if (!p.topic) return [3 /*break*/, 4];
                                        return [4 /*yield*/, docsFetcher.fetchForTopic(p.topic)];
                                    case 3:
                                        content = _a.sent();
                                        return [3 /*break*/, 7];
                                    case 4:
                                        if (!p.query) return [3 /*break*/, 6];
                                        return [4 /*yield*/, docsFetcher.search(p.query)];
                                    case 5:
                                        content = _a.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        content =
                                            "## Available Documentation Topics\n\n" +
                                                Object.entries(DOC_PAGES)
                                                    .map(function (_a) {
                                                    var topic = _a[0], pages = _a[1];
                                                    return "- **".concat(topic, "**: ").concat(pages.join(", "));
                                                })
                                                    .join("\n") +
                                                "\n\nUse `topic` for specific docs, `query` for search, or `page` for a specific path.";
                                        _a.label = 7;
                                    case 7: return [2 /*return*/, { content: [{ type: "text", text: content }] }];
                                }
                            });
                        });
                    },
                },
                // ── foundry_implement ─────────────────────────────────────────────────
                {
                    name: "foundry_implement",
                    label: "Implement Capability",
                    description: "Research best practices and implement a capability. Describe what you need and this tool " +
                        "will research documentation, patterns, and implement it as an extension or skill.",
                    parameters: {
                        type: "object",
                        properties: {
                            capability: {
                                type: "string",
                                description: "What capability to implement (e.g., 'OAuth token refresh', 'rate limiting', 'webhook handler')",
                            },
                            type: {
                                type: "string",
                                enum: ["extension", "skill", "tool", "hook"],
                                description: "What to create: extension (full plugin), skill (API client), tool (single tool), hook (event handler)",
                            },
                            targetExtension: {
                                type: "string",
                                description: "For tool/hook: which extension to add it to",
                            },
                        },
                        required: ["capability", "type"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, context, relevantTopics, _i, relevantTopics_1, topic, topicDocs, err_4, docs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        p = params;
                                        context = "## Implementation: ".concat(p.capability, "\n\n");
                                        context += "**Type**: ".concat(p.type, "\n\n");
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 6, , 7]);
                                        relevantTopics = [];
                                        if (p.type === "extension" || p.type === "tool")
                                            relevantTopics.push("plugin");
                                        if (p.type === "hook" || p.type === "extension")
                                            relevantTopics.push("hooks");
                                        if (p.type === "skill")
                                            relevantTopics.push("skills");
                                        _i = 0, relevantTopics_1 = relevantTopics;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < relevantTopics_1.length)) return [3 /*break*/, 5];
                                        topic = relevantTopics_1[_i];
                                        return [4 /*yield*/, docsFetcher.fetchForTopic(topic)];
                                    case 3:
                                        topicDocs = _a.sent();
                                        context += "### ".concat(topic.charAt(0).toUpperCase() + topic.slice(1), " API\n\n");
                                        context += topicDocs.slice(0, 2000) + "\n\n";
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        err_4 = _a.sent();
                                        docs = writer.getDocs();
                                        if (docs.plugin) {
                                            context += "### Plugin API (local)\n\n";
                                            context += docs.plugin.slice(0, 3000) + "\n\n";
                                        }
                                        return [3 /*break*/, 7];
                                    case 7:
                                        // Implementation guidance
                                        context += "## Implementation Guide\n\n";
                                        switch (p.type) {
                                            case "extension":
                                                context += "Use `foundry_write_extension` with:\n";
                                                context += "- id: kebab-case identifier\n";
                                                context += "- name: Human-readable name\n";
                                                context += "- description: What it does\n";
                                                context += "- tools: Array of tool definitions\n";
                                                context += "- hooks: Array of hook definitions\n\n";
                                                context += "Each tool needs: name, label, description, properties, required, code\n";
                                                context += "Each hook needs: event (before_agent_start, after_tool_call, before_tool_call, agent_end), code\n";
                                                break;
                                            case "skill":
                                                context += "Use `foundry_write_skill` with:\n";
                                                context += "- name: Skill name\n";
                                                context += "- description: What it does\n";
                                                context += "- baseUrl: API base URL\n";
                                                context += "- endpoints: Array of { method, path, description }\n";
                                                context += "- authHeaders: Optional auth headers to store\n";
                                                break;
                                            case "tool":
                                                if (!p.targetExtension) {
                                                    return [2 /*return*/, {
                                                            content: [
                                                                {
                                                                    type: "text",
                                                                    text: "Error: targetExtension required for type=tool",
                                                                },
                                                            ],
                                                        }];
                                                }
                                                context += "Use `foundry_add_tool` with:\n";
                                                context += "- extensionId: \"".concat(p.targetExtension, "\"\n");
                                                context += "- name: tool_name (snake_case)\n";
                                                context += "- description: What it does\n";
                                                context += "- properties: Input parameters\n";
                                                context += "- code: The execute function body\n";
                                                break;
                                            case "hook":
                                                if (!p.targetExtension) {
                                                    return [2 /*return*/, {
                                                            content: [
                                                                {
                                                                    type: "text",
                                                                    text: "Error: targetExtension required for type=hook",
                                                                },
                                                            ],
                                                        }];
                                                }
                                                context += "Use `foundry_add_hook` with:\n";
                                                context += "- extensionId: \"".concat(p.targetExtension, "\"\n");
                                                context += "- event: One of before_agent_start, after_tool_call, before_tool_call, agent_end\n";
                                                context += "- code: The handler function body (has access to event, ctx)\n";
                                                break;
                                        }
                                        context += "\n## Next Steps\n\n";
                                        context += "1. Review the docs above\n";
                                        context += "2. Design the implementation\n";
                                        context += "3. Call the appropriate foundry_write_* tool with the code\n";
                                        return [2 /*return*/, { content: [{ type: "text", text: context }] }];
                                }
                            });
                        });
                    },
                },
                // ── foundry_write_extension ───────────────────────────────────────────
                {
                    name: "foundry_write_extension",
                    label: "Write Extension",
                    description: "Write a new OpenClaw extension to ~/.openclaw/extensions/. Use foundry_restart to load and resume.",
                    parameters: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "Extension ID (kebab-case)",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable name",
                            },
                            description: {
                                type: "string",
                                description: "What this extension does",
                            },
                            tools: {
                                type: "array",
                                description: "Tools to include",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        label: { type: "string" },
                                        description: { type: "string" },
                                        properties: { type: "object" },
                                        required: {
                                            type: "array",
                                            items: { type: "string" },
                                        },
                                        code: {
                                            type: "string",
                                            description: "Execute function body",
                                        },
                                    },
                                },
                            },
                            hooks: {
                                type: "array",
                                description: "Hooks to include",
                                items: {
                                    type: "object",
                                    properties: {
                                        event: { type: "string" },
                                        code: { type: "string" },
                                    },
                                },
                            },
                        },
                        required: ["id", "name", "description"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, tools, hooks, _a, extDir, validation, output, pendingKey, pending, resolution, err_5, errorMsg, isSandboxError, isValidationError, failureId, feedback;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = params;
                                        tools = (p.tools || []).map(function (t) { return ({
                                            name: t.name,
                                            label: t.label,
                                            description: t.description || "",
                                            properties: t.properties || {},
                                            required: t.required || [],
                                            code: t.code ||
                                                "return { content: [{ type: 'text', text: 'Not implemented' }] };",
                                        }); });
                                        hooks = (p.hooks || []).map(function (h) { return ({
                                            event: h.event,
                                            code: h.code || "// No-op",
                                        }); });
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, writer.writeExtension({
                                                id: p.id,
                                                name: p.name,
                                                description: p.description,
                                                tools: tools,
                                                hooks: hooks,
                                            }, codeValidator)];
                                    case 2:
                                        _a = _b.sent(), extDir = _a.path, validation = _a.validation;
                                        output = "## Extension Written\n\n" +
                                            "**".concat(p.name, "** (`").concat(p.id, "`)\n\n") +
                                            "- Location: `".concat(extDir, "`\n") +
                                            "- Tools: ".concat(tools.length, "\n") +
                                            "- Hooks: ".concat(hooks.length, "\n");
                                        if (validation.warnings.length > 0) {
                                            output += "\n**Warnings:**\n".concat(validation.warnings.map(function (w) { return "- ".concat(w); }).join("\n"), "\n");
                                        }
                                        if (validation.securityFlags.length > 0) {
                                            output += "\n**Security flags (review recommended):**\n".concat(validation.securityFlags.map(function (f) { return "- ".concat(f); }).join("\n"), "\n");
                                        }
                                        pendingKey = "ext:".concat(p.id);
                                        pending = pendingFailures.get(pendingKey);
                                        if (pending) {
                                            resolution = "Fixed by: ".concat(tools.map(function (t) { return t.name; }).join(", "), " tools, avoiding: ").concat(pending.error.slice(0, 100));
                                            learningEngine.recordResolution(pending.failureId, resolution);
                                            pendingFailures.delete(pendingKey);
                                            logger.info("[foundry] Learned pattern from ".concat(p.id, ": ").concat(pending.error.slice(0, 50), "..."));
                                            output += "\n**Learned**: Pattern created from previous failure.\n";
                                        }
                                        output += "\n**Next**: Call `foundry_restart` to reload gateway and auto-resume this conversation.";
                                        return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                                    case 3:
                                        err_5 = _b.sent();
                                        errorMsg = err_5.message || String(err_5);
                                        isSandboxError = errorMsg.includes("Sandbox");
                                        isValidationError = errorMsg.includes("validation");
                                        failureId = learningEngine.recordFailure("foundry_write_extension", errorMsg, "Extension: ".concat(p.id, ", Tools: ").concat(tools.length, ", Hooks: ").concat(hooks.length), isSandboxError ? "sandbox_runtime_error" : "validation_error");
                                        // Track for resolution linking when extension succeeds later
                                        pendingFailures.set("ext:".concat(p.id), { failureId: failureId, error: errorMsg, timestamp: Date.now() });
                                        feedback = "## Extension FAILED - SelfEvolve Feedback\n\n";
                                        feedback += "**Extension**: ".concat(p.name, " (`").concat(p.id, "`)\n\n");
                                        feedback += "### Error Type\n";
                                        feedback += isSandboxError
                                            ? "**Runtime Error** - The code compiled but failed during execution.\n"
                                            : "**Validation Error** - The code failed static analysis.\n";
                                        feedback += "\n### Error Details\n```\n".concat(errorMsg, "\n```\n\n");
                                        // Provide specific guidance based on error type
                                        feedback += "### How to Fix\n";
                                        if (isSandboxError) {
                                            feedback += "1. Check for undefined variables or missing imports\n";
                                            feedback += "2. Ensure all async functions are properly awaited\n";
                                            feedback += "3. Verify the code handles edge cases (null, undefined, empty)\n";
                                            feedback += "4. Check that external dependencies are available\n";
                                        }
                                        else if (isValidationError) {
                                            feedback += "1. Review the validation rules in the error message\n";
                                            feedback += "2. Remove any blocked patterns (dangerous code, etc.)\n";
                                            feedback += "3. Ensure proper types and structure\n";
                                        }
                                        feedback += "\n### Retry Instructions\n";
                                        feedback += "Fix the issues above and call `foundry_write_extension` again with corrected code.\n";
                                        feedback += "The code should be self-contained and not rely on external state.\n";
                                        return [2 /*return*/, { content: [{ type: "text", text: feedback }] }];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        });
                    },
                },
                // ── foundry_write_skill (OpenClaw/AgentSkills-compatible) ───────────────
                {
                    name: "foundry_write_skill",
                    label: "Write Skill",
                    description: "Write an OpenClaw/AgentSkills-compatible skill (SKILL.md) to ~/.openclaw/skills/. Supports both general skills and API-based skills.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Skill name (kebab-case recommended, e.g., 'my-skill')",
                            },
                            description: {
                                type: "string",
                                description: "What this skill does (appears in frontmatter)",
                            },
                            content: {
                                type: "string",
                                description: "Markdown content for the skill (after frontmatter)",
                            },
                            // OpenClaw frontmatter options
                            homepage: {
                                type: "string",
                                description: "URL for skill documentation/website",
                            },
                            userInvocable: {
                                type: "boolean",
                                description: "Whether skill is exposed as user slash command (default: true)",
                            },
                            disableModelInvocation: {
                                type: "boolean",
                                description: "Exclude from model prompt (default: false)",
                            },
                            commandDispatch: {
                                type: "string",
                                enum: ["tool"],
                                description: "Bypass model and dispatch directly to tool",
                            },
                            commandTool: {
                                type: "string",
                                description: "Tool name when command-dispatch is 'tool'",
                            },
                            commandArgMode: {
                                type: "string",
                                enum: ["raw"],
                                description: "How to forward args to tool",
                            },
                            metadata: {
                                type: "object",
                                description: "OpenClaw metadata for gating (requires.bins, requires.env, etc.)",
                                properties: {
                                    openclaw: {
                                        type: "object",
                                        properties: {
                                            always: {
                                                type: "boolean",
                                                description: "Always include skill (skip gates)",
                                            },
                                            emoji: {
                                                type: "string",
                                                description: "Emoji for macOS Skills UI",
                                            },
                                            homepage: {
                                                type: "string",
                                                description: "URL for macOS Skills UI",
                                            },
                                            os: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                    enum: ["darwin", "linux", "win32"],
                                                },
                                            },
                                            primaryEnv: {
                                                type: "string",
                                                description: "Env var for apiKey mapping",
                                            },
                                            skillKey: {
                                                type: "string",
                                                description: "Config key override",
                                            },
                                            requires: {
                                                type: "object",
                                                properties: {
                                                    bins: {
                                                        type: "array",
                                                        items: { type: "string" },
                                                        description: "Required binaries on PATH",
                                                    },
                                                    anyBins: {
                                                        type: "array",
                                                        items: { type: "string" },
                                                        description: "At least one required",
                                                    },
                                                    env: {
                                                        type: "array",
                                                        items: { type: "string" },
                                                        description: "Required env vars",
                                                    },
                                                    config: {
                                                        type: "array",
                                                        items: { type: "string" },
                                                        description: "Required config paths",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            // Legacy API-based skill support
                            baseUrl: {
                                type: "string",
                                description: "(Legacy) API base URL for API-based skills",
                            },
                            endpoints: {
                                type: "array",
                                description: "(Legacy) API endpoints for API-based skills",
                                items: {
                                    type: "object",
                                    properties: {
                                        method: {
                                            type: "string",
                                            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                                        },
                                        path: {
                                            type: "string",
                                            description: "Path with {param} placeholders",
                                        },
                                        description: { type: "string" },
                                    },
                                },
                            },
                            authHeaders: {
                                type: "object",
                                description: "(Legacy) Auth headers for API-based skills",
                            },
                        },
                        required: ["name", "description"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, skillDir, isApiSkill, summary, req;
                            var _a, _b, _c, _d, _e, _f;
                            return __generator(this, function (_g) {
                                p = params;
                                skillDir = writer.writeSkill({
                                    name: p.name,
                                    description: p.description,
                                    content: p.content,
                                    homepage: p.homepage,
                                    userInvocable: p.userInvocable,
                                    disableModelInvocation: p.disableModelInvocation,
                                    commandDispatch: p.commandDispatch,
                                    commandTool: p.commandTool,
                                    commandArgMode: p.commandArgMode,
                                    metadata: p.metadata,
                                    baseUrl: p.baseUrl,
                                    endpoints: p.endpoints,
                                    authHeaders: p.authHeaders,
                                });
                                isApiSkill = p.baseUrl && ((_a = p.endpoints) === null || _a === void 0 ? void 0 : _a.length) > 0;
                                summary = "## Skill Written (OpenClaw-compatible)\n\n" +
                                    "**".concat(p.name, "**\n\n") +
                                    "- Location: `".concat(skillDir, "`\n") +
                                    "- Format: AgentSkills/OpenClaw SKILL.md\n";
                                if (isApiSkill) {
                                    summary +=
                                        "- Type: API-based skill\n" +
                                            "- Base URL: `".concat(p.baseUrl, "`\n") +
                                            "- Endpoints: ".concat(p.endpoints.length, "\n");
                                }
                                else {
                                    summary += "- Type: General skill\n";
                                }
                                if ((_c = (_b = p.metadata) === null || _b === void 0 ? void 0 : _b.openclaw) === null || _c === void 0 ? void 0 : _c.requires) {
                                    req = p.metadata.openclaw.requires;
                                    if ((_d = req.bins) === null || _d === void 0 ? void 0 : _d.length)
                                        summary += "- Required bins: ".concat(req.bins.join(", "), "\n");
                                    if ((_e = req.env) === null || _e === void 0 ? void 0 : _e.length)
                                        summary += "- Required env: ".concat(req.env.join(", "), "\n");
                                    if ((_f = req.config) === null || _f === void 0 ? void 0 : _f.length)
                                        summary += "- Required config: ".concat(req.config.join(", "), "\n");
                                }
                                summary += "\nSkill is ready. Restart gateway or start new session to load.";
                                return [2 /*return*/, { content: [{ type: "text", text: summary }] }];
                            });
                        });
                    },
                },
                // ── foundry_write_browser_skill ─────────────────────────────────────────
                {
                    name: "foundry_write_browser_skill",
                    label: "Write Browser Skill",
                    description: "Write a browser automation skill that uses the OpenClaw browser tool. Automatically gates on browser.enabled config.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Skill name (kebab-case, e.g., 'twitter-poster')",
                            },
                            description: {
                                type: "string",
                                description: "What this skill automates",
                            },
                            targetUrl: {
                                type: "string",
                                description: "Primary URL this skill interacts with",
                            },
                            actions: {
                                type: "array",
                                description: "Documented browser actions",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            description: "Action name (e.g., 'Post Tweet')",
                                        },
                                        description: {
                                            type: "string",
                                            description: "What this action does",
                                        },
                                        steps: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "Step-by-step instructions",
                                        },
                                    },
                                },
                            },
                            authMethod: {
                                type: "string",
                                enum: ["manual", "cookie", "header", "oauth"],
                                description: "How authentication is handled",
                            },
                            authNotes: {
                                type: "string",
                                description: "Additional auth instructions",
                            },
                            content: {
                                type: "string",
                                description: "Additional markdown content",
                            },
                            metadata: {
                                type: "object",
                                description: "Additional OpenClaw metadata",
                            },
                        },
                        required: ["name", "description"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, skillDir, summary;
                            var _a;
                            return __generator(this, function (_b) {
                                p = params;
                                skillDir = writer.writeBrowserSkill({
                                    name: p.name,
                                    description: p.description,
                                    targetUrl: p.targetUrl,
                                    actions: p.actions,
                                    authMethod: p.authMethod,
                                    authNotes: p.authNotes,
                                    content: p.content,
                                    metadata: p.metadata,
                                });
                                summary = "## Browser Skill Written\n\n" +
                                    "**".concat(p.name, "**\n\n") +
                                    "- Location: `".concat(skillDir, "`\n") +
                                    "- Type: Browser automation skill\n" +
                                    "- Target: ".concat(p.targetUrl || "Not specified", "\n") +
                                    "- Auth: ".concat(p.authMethod || "none", "\n") +
                                    "- Gated on: `browser.enabled` config\n";
                                if ((_a = p.actions) === null || _a === void 0 ? void 0 : _a.length) {
                                    summary += "- Actions: ".concat(p.actions.map(function (a) { return a.name; }).join(", "), "\n");
                                }
                                summary += "\nSkill is ready. Enable browser in config and restart gateway to use.";
                                return [2 /*return*/, { content: [{ type: "text", text: summary }] }];
                            });
                        });
                    },
                },
                // ── foundry_write_hook ──────────────────────────────────────────────────
                {
                    name: "foundry_write_hook",
                    label: "Write Hook",
                    description: "Write a standalone OpenClaw hook (HOOK.md + handler.ts) to ~/.openclaw/hooks/. Hooks trigger on events like command:new, gateway:startup, etc.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Hook name (kebab-case, e.g., 'welcome-message')",
                            },
                            description: {
                                type: "string",
                                description: "What this hook does",
                            },
                            events: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: [
                                        "command:new",
                                        "command:reset",
                                        "command:stop",
                                        "agent:bootstrap",
                                        "gateway:startup",
                                        "tool_result_persist",
                                    ],
                                },
                                description: "Events that trigger this hook",
                            },
                            code: {
                                type: "string",
                                description: "Handler code (TypeScript). Should define a `handler` const of type HookHandler.",
                            },
                            metadata: {
                                type: "object",
                                description: "OpenClaw metadata (emoji, requires, etc.)",
                            },
                        },
                        required: ["name", "description", "events"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, hookDir, summary;
                            return __generator(this, function (_a) {
                                p = params;
                                hookDir = writer.writeHook({
                                    name: p.name,
                                    description: p.description,
                                    events: p.events,
                                    code: p.code,
                                    metadata: p.metadata,
                                });
                                summary = "## Hook Written\n\n" +
                                    "**".concat(p.name, "**\n\n") +
                                    "- Location: `".concat(hookDir, "`\n") +
                                    "- Events: ".concat(p.events.join(", "), "\n") +
                                    "- Files: HOOK.md, handler.ts\n\n" +
                                    "Enable with: `openclaw hooks enable ".concat(p.name, "`");
                                return [2 /*return*/, { content: [{ type: "text", text: summary }] }];
                            });
                        });
                    },
                },
                // ── foundry_add_tool ──────────────────────────────────────────────────
                {
                    name: "foundry_add_tool",
                    label: "Add Tool",
                    description: "Add a new tool to an existing extension",
                    parameters: {
                        type: "object",
                        properties: {
                            extensionId: {
                                type: "string",
                                description: "Extension to add tool to",
                            },
                            name: {
                                type: "string",
                                description: "Tool name (snake_case)",
                            },
                            label: { type: "string", description: "Display label" },
                            description: {
                                type: "string",
                                description: "What the tool does",
                            },
                            properties: {
                                type: "object",
                                description: "Input properties",
                            },
                            required: {
                                type: "array",
                                items: { type: "string" },
                            },
                            code: {
                                type: "string",
                                description: "Execute function body",
                            },
                        },
                        required: ["extensionId", "name", "description", "code"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, success;
                            return __generator(this, function (_a) {
                                p = params;
                                success = writer.addTool(p.extensionId, {
                                    name: p.name,
                                    label: p.label,
                                    description: p.description,
                                    properties: p.properties || {},
                                    required: p.required || [],
                                    code: p.code,
                                });
                                if (!success) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Extension \"".concat(p.extensionId, "\" not found."),
                                                },
                                            ],
                                        }];
                                }
                                return [2 /*return*/, {
                                        content: [
                                            {
                                                type: "text",
                                                text: "Added tool **".concat(p.name, "** to **").concat(p.extensionId, "**.\n\nCall `foundry_restart` to load and resume."),
                                            },
                                        ],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_add_hook ──────────────────────────────────────────────────
                {
                    name: "foundry_add_hook",
                    label: "Add Hook",
                    description: "Add a new hook to an existing extension",
                    parameters: {
                        type: "object",
                        properties: {
                            extensionId: {
                                type: "string",
                                description: "Extension to add hook to",
                            },
                            event: {
                                type: "string",
                                enum: [
                                    "before_agent_start",
                                    "after_tool_call",
                                    "before_tool_call",
                                    "agent_end",
                                ],
                                description: "Hook event",
                            },
                            code: {
                                type: "string",
                                description: "Handler function body",
                            },
                        },
                        required: ["extensionId", "event", "code"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, success;
                            return __generator(this, function (_a) {
                                p = params;
                                success = writer.addHook(p.extensionId, {
                                    event: p.event,
                                    code: p.code,
                                });
                                if (!success) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Extension \"".concat(p.extensionId, "\" not found."),
                                                },
                                            ],
                                        }];
                                }
                                return [2 /*return*/, {
                                        content: [
                                            {
                                                type: "text",
                                                text: "Added **".concat(p.event, "** hook to **").concat(p.extensionId, "**.\n\nCall `foundry_restart` to load and resume."),
                                            },
                                        ],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_list ──────────────────────────────────────────────────────
                {
                    name: "foundry_list",
                    label: "List Written Code",
                    description: "List all extensions and skills written by foundry",
                    parameters: {
                        type: "object",
                        properties: {
                            showCode: {
                                type: "boolean",
                                description: "Show generated code",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, extensions, skills, output, _i, extensions_1, ext, codePath, _a, skills_1, skill;
                            var _b, _c;
                            return __generator(this, function (_d) {
                                p = params;
                                extensions = writer.getExtensions();
                                skills = writer.getSkills();
                                output = "## Foundry: Written Code\n\n";
                                output += "### Extensions (".concat(extensions.length, ")\n\n");
                                for (_i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                                    ext = extensions_1[_i];
                                    output += "**".concat(ext.name, "** (`").concat(ext.id, "`)\n");
                                    output += "- Tools: ".concat(ext.tools.map(function (t) { return t.name; }).join(", ") || "none", "\n");
                                    output += "- Hooks: ".concat(ext.hooks.map(function (h) { return h.event; }).join(", ") || "none", "\n");
                                    output += "- Created: ".concat(ext.createdAt, "\n\n");
                                    if (p.showCode) {
                                        codePath = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "extensions", ext.id, "index.ts");
                                        if ((0, node_fs_1.existsSync)(codePath)) {
                                            output +=
                                                "```typescript\n" +
                                                    (0, node_fs_1.readFileSync)(codePath, "utf-8").slice(0, 2000) +
                                                    "\n```\n\n";
                                        }
                                    }
                                }
                                output += "### Skills (".concat(skills.length, ")\n\n");
                                for (_a = 0, skills_1 = skills; _a < skills_1.length; _a++) {
                                    skill = skills_1[_a];
                                    output += "**".concat(skill.name, "**\n");
                                    if (skill.baseUrl) {
                                        output += "- Base URL: `".concat(skill.baseUrl, "`\n");
                                        output += "- Endpoints: ".concat((_c = (_b = skill.endpoints) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0, "\n");
                                    }
                                    output += "- Created: ".concat(skill.createdAt, "\n\n");
                                }
                                if (extensions.length === 0 && skills.length === 0) {
                                    output +=
                                        "No code written yet. Use `foundry_implement` to get started.\n";
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_docs ──────────────────────────────────────────────────────
                {
                    name: "foundry_docs",
                    label: "Read OpenClaw Docs",
                    description: "Read OpenClaw plugin/hooks documentation for writing extensions",
                    parameters: {
                        type: "object",
                        properties: {
                            section: {
                                type: "string",
                                enum: ["plugin", "hooks", "both"],
                                description: "Which docs to show",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, docs, section, output;
                            return __generator(this, function (_a) {
                                p = params;
                                docs = writer.getDocs();
                                section = p.section || "both";
                                output = "## OpenClaw Extension Docs\n\n";
                                if (!docs.plugin && !docs.hooks) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Could not load OpenClaw docs. Check openclawPath config.",
                                                },
                                            ],
                                        }];
                                }
                                if (section === "plugin" || section === "both") {
                                    output += "### Plugin API\n\n";
                                    output += docs.plugin
                                        ? docs.plugin.slice(0, 8000) + "\n\n[truncated]\n\n"
                                        : "Not loaded\n\n";
                                }
                                if (section === "hooks" || section === "both") {
                                    output += "### Hooks API\n\n";
                                    output += docs.hooks
                                        ? docs.hooks.slice(0, 5000) + "\n\n[truncated]\n\n"
                                        : "Not loaded\n\n";
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_extend_self ───────────────────────────────────────────────
                {
                    name: "foundry_extend_self",
                    label: "Extend Self",
                    description: "Write new code into the foundry extension itself. Add new tools or modify existing ones. " +
                        "This is true self-modification — the extension rewrites its own source code.",
                    parameters: {
                        type: "object",
                        properties: {
                            action: {
                                type: "string",
                                enum: ["add_tool", "add_code", "read_self"],
                                description: "What to do: add_tool (add a new tool), add_code (inject code), read_self (view current source)",
                            },
                            toolName: {
                                type: "string",
                                description: "For add_tool: name of the new tool (snake_case)",
                            },
                            toolLabel: {
                                type: "string",
                                description: "For add_tool: display label",
                            },
                            toolDescription: {
                                type: "string",
                                description: "For add_tool: what the tool does",
                            },
                            toolParameters: {
                                type: "object",
                                description: "For add_tool: parameter schema",
                            },
                            toolCode: {
                                type: "string",
                                description: "For add_tool/add_code: the code to add",
                            },
                            insertAfter: {
                                type: "string",
                                description: "For add_code: marker text to insert after",
                            },
                        },
                        required: ["action"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, selfPath, altPath, actualPath, content, content, newTool, toolsArrayEnd, toolNamesMatch, oldToolNames, newToolNames, content, insertPos;
                            return __generator(this, function (_a) {
                                p = params;
                                selfPath = (0, node_path_1.join)(__dirname, "index.ts");
                                // Check if we can find ourselves
                                if (!(0, node_fs_1.existsSync)(selfPath)) {
                                    altPath = "/Users/lekt9/Projects/aiko/extensions/foundry/index.ts";
                                    if (!(0, node_fs_1.existsSync)(altPath)) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Cannot find self at ".concat(selfPath, " or ").concat(altPath),
                                                    },
                                                ],
                                            }];
                                    }
                                }
                                actualPath = (0, node_fs_1.existsSync)(selfPath)
                                    ? selfPath
                                    : "/Users/lekt9/Projects/aiko/extensions/foundry/index.ts";
                                if (p.action === "read_self") {
                                    content = (0, node_fs_1.readFileSync)(actualPath, "utf-8");
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "## Self Source (".concat(actualPath, ")\n\n```typescript\n").concat(content.slice(0, 10000), "\n```\n\n[").concat(content.length, " chars total]"),
                                                },
                                            ],
                                        }];
                                }
                                if (p.action === "add_tool") {
                                    if (!p.toolName || !p.toolDescription || !p.toolCode) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Missing required: toolName, toolDescription, toolCode",
                                                    },
                                                ],
                                            }];
                                    }
                                    content = (0, node_fs_1.readFileSync)(actualPath, "utf-8");
                                    newTool = "\n      // \u2500\u2500 ".concat(p.toolName, " (self-written) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n      {\n        name: \"").concat(p.toolName, "\",\n        label: \"").concat(p.toolLabel || p.toolName, "\",\n        description: \"").concat(p.toolDescription.replace(/"/g, '\\"'), "\",\n        parameters: ").concat(JSON.stringify(p.toolParameters || { type: "object", properties: {}, required: [] }, null, 10)
                                        .replace(/^/gm, "        ")
                                        .trim(), ",\n        async execute(_toolCallId: string, params: unknown) {\n          const p = params as any;\n").concat(p.toolCode
                                        .split("\n")
                                        .map(function (l) { return "          " + l; })
                                        .join("\n"), "\n        },\n      },");
                                    toolsArrayEnd = content.lastIndexOf("    ];\n\n    const toolNames = [");
                                    if (toolsArrayEnd === -1) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Could not find tools array end marker",
                                                    },
                                                ],
                                            }];
                                    }
                                    // Insert the new tool before the ];
                                    content =
                                        content.slice(0, toolsArrayEnd) +
                                            newTool +
                                            "\n" +
                                            content.slice(toolsArrayEnd);
                                    toolNamesMatch = content.match(/const toolNames = \[\n([\s\S]*?)\n    \];/);
                                    if (toolNamesMatch) {
                                        oldToolNames = toolNamesMatch[0];
                                        newToolNames = oldToolNames.replace(/\n    \];/, "\n      \"".concat(p.toolName, "\",\n    ];"));
                                        content = content.replace(oldToolNames, newToolNames);
                                    }
                                    (0, node_fs_1.writeFileSync)(actualPath, content);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "## Self-Modified\n\n" +
                                                        "Added tool **".concat(p.toolName, "** to foundry extension.\n\n") +
                                                        "- Location: ".concat(actualPath, "\n") +
                                                        "- Lines added: ~".concat(newTool.split("\n").length, "\n\n") +
                                                        "**Call `foundry_restart` to load and resume.**",
                                                },
                                            ],
                                        }];
                                }
                                if (p.action === "add_code") {
                                    if (!p.toolCode || !p.insertAfter) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Missing required: toolCode, insertAfter",
                                                    },
                                                ],
                                            }];
                                    }
                                    content = (0, node_fs_1.readFileSync)(actualPath, "utf-8");
                                    insertPos = content.indexOf(p.insertAfter);
                                    if (insertPos === -1) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Could not find marker: \"".concat(p.insertAfter.slice(0, 50), "...\""),
                                                    },
                                                ],
                                            }];
                                    }
                                    content =
                                        content.slice(0, insertPos + p.insertAfter.length) +
                                            "\n" +
                                            p.toolCode +
                                            content.slice(insertPos + p.insertAfter.length);
                                    (0, node_fs_1.writeFileSync)(actualPath, content);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "## Self-Modified\n\n" +
                                                        "Inserted code after marker.\n\n" +
                                                        "**Call `foundry_restart` to load and resume.**",
                                                },
                                            ],
                                        }];
                                }
                                return [2 /*return*/, {
                                        content: [{ type: "text", text: "Unknown action: ".concat(p.action) }],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_restart ────────────────────────────────────────────────────
                {
                    name: "foundry_restart",
                    label: "Restart with Resume",
                    description: "Restart the gateway to load new code, while saving the current conversation context " +
                        "so the agent can automatically resume after restart. Use this after writing new extensions.",
                    parameters: {
                        type: "object",
                        properties: {
                            reason: {
                                type: "string",
                                description: "Why we're restarting (e.g., 'load new oauth-refresh extension')",
                            },
                            resumeContext: {
                                type: "string",
                                description: "Context to resume with after restart (what we were doing)",
                            },
                            lastMessage: {
                                type: "string",
                                description: "The user's last message/request to continue after restart",
                            },
                        },
                        required: ["reason", "resumeContext"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, exec;
                            return __generator(this, function (_a) {
                                p = params;
                                exec = require("node:child_process").exec;
                                // Save pending session for resume
                                learningEngine.savePendingSession({
                                    agentId: "current", // Will be replaced with actual ID if available
                                    lastMessage: p.lastMessage || "Continue from where we left off",
                                    context: p.resumeContext,
                                    reason: p.reason,
                                });
                                // Schedule restart after returning
                                setTimeout(function () {
                                    exec("openclaw gateway restart", function (error) {
                                        var _a;
                                        if (error) {
                                            (_a = logger.error) === null || _a === void 0 ? void 0 : _a.call(logger, "[foundry] Restart failed: ".concat(error.message));
                                        }
                                    });
                                }, 500);
                                return [2 /*return*/, {
                                        content: [
                                            {
                                                type: "text",
                                                text: "## Gateway Restart Scheduled\n\n" +
                                                    "**Reason**: ".concat(p.reason, "\n\n") +
                                                    "Session context saved. The conversation will automatically resume after restart.\n\n" +
                                                    "Restarting in 500ms...",
                                            },
                                        ],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_learnings ──────────────────────────────────────────────────
                {
                    name: "foundry_learnings",
                    label: "View Learnings",
                    description: "View what foundry has learned from successes, failures, and patterns",
                    parameters: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: ["all", "patterns", "failures", "insights"],
                                description: "What type of learnings to show",
                            },
                            tool: {
                                type: "string",
                                description: "Filter by tool name",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, filterType, entries, output, _i, entries_1, entry;
                            return __generator(this, function (_a) {
                                p = params;
                                filterType = p.type || "all";
                                entries = [];
                                if (filterType === "patterns")
                                    entries = learningEngine.getPatterns();
                                else if (filterType === "failures")
                                    entries = learningEngine.getRecentFailures(10);
                                else if (filterType === "insights")
                                    entries = learningEngine.getInsights();
                                else
                                    entries = learningEngine.findRelevantLearnings(p.tool);
                                output = "## Foundry: Learnings\n\n";
                                output += "**Summary**: ".concat(learningEngine.getLearningsSummary(), "\n\n");
                                if (entries.length === 0) {
                                    output += "No learnings found for this filter.\n";
                                }
                                else {
                                    for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                                        entry = entries_1[_i];
                                        output += "### ".concat(entry.type.toUpperCase(), ": ").concat(entry.tool || "general", "\n");
                                        if (entry.error)
                                            output += "- **Error**: ".concat(entry.error.slice(0, 100), "...\n");
                                        if (entry.resolution)
                                            output += "- **Resolution**: ".concat(entry.resolution, "\n");
                                        if (entry.context)
                                            output += "- **Context**: ".concat(entry.context.slice(0, 200), "...\n");
                                        output += "- **When**: ".concat(entry.timestamp, "\n\n");
                                    }
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_publish_ability ─────────────────────────────────────────
                {
                    name: "foundry_publish_ability",
                    label: "Publish to Brain Marketplace",
                    description: "Publish a pattern, extension, technique, insight, or agent design to the brain marketplace. " +
                        "Patterns are free to share (crowdsourced learning), other abilities earn USDC. " +
                        "Requires a creator wallet (set up via unbrowse_wallet).",
                    parameters: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: ["pattern", "extension", "technique", "insight", "agent"],
                                description: "Type of ability to publish",
                            },
                            name: {
                                type: "string",
                                description: "Name/title for the ability",
                            },
                            description: {
                                type: "string",
                                description: "Description of what this ability does",
                            },
                            content: {
                                type: "object",
                                description: "The ability content (varies by type)",
                            },
                            patternId: {
                                type: "string",
                                description: "ID of an existing pattern to publish (for type=pattern)",
                            },
                        },
                        required: ["type", "name"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, configPath, creatorWallet, config, skillIndexUrl, config, content, patterns, pattern, resp, text, result, err_6;
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0:
                                        p = params;
                                        configPath = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "openclaw.json");
                                        creatorWallet = null;
                                        try {
                                            config = JSON.parse((0, node_fs_1.readFileSync)(configPath, "utf-8"));
                                            creatorWallet =
                                                (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.plugins) === null || _a === void 0 ? void 0 : _a.entries) === null || _b === void 0 ? void 0 : _b.unbrowse) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.creatorWallet;
                                        }
                                        catch (_l) { }
                                        if (!creatorWallet) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        {
                                                            type: "text",
                                                            text: "No creator wallet configured. Use unbrowse_wallet to set up a wallet first.",
                                                        },
                                                    ],
                                                }];
                                        }
                                        skillIndexUrl = "https://api.claw.getfoundry.app";
                                        try {
                                            config = JSON.parse((0, node_fs_1.readFileSync)(configPath, "utf-8"));
                                            skillIndexUrl =
                                                (_j = (_h = (_g = (_f = (_e = config === null || config === void 0 ? void 0 : config.plugins) === null || _e === void 0 ? void 0 : _e.entries) === null || _f === void 0 ? void 0 : _f.unbrowse) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.skillIndexUrl) !== null && _j !== void 0 ? _j : skillIndexUrl;
                                        }
                                        catch (_m) { }
                                        content = p.content;
                                        // For patterns, look up from learnings
                                        if (p.type === "pattern" && p.patternId) {
                                            patterns = learningEngine.getPatterns();
                                            pattern = patterns.find(function (pat) { return pat.id === p.patternId; });
                                            if (!pattern) {
                                                return [2 /*return*/, {
                                                        content: [
                                                            { type: "text", text: "Pattern not found: ".concat(p.patternId) },
                                                        ],
                                                    }];
                                            }
                                            content = {
                                                errorPattern: pattern.error || "",
                                                resolution: pattern.resolution || "",
                                                tool: pattern.tool,
                                                context: pattern.context,
                                                useCount: pattern.useCount || 1,
                                            };
                                        }
                                        if (!content) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        {
                                                            type: "text",
                                                            text: "Provide content or patternId for the ability.",
                                                        },
                                                    ],
                                                }];
                                        }
                                        _k.label = 1;
                                    case 1:
                                        _k.trys.push([1, 6, , 7]);
                                        return [4 /*yield*/, fetch("".concat(skillIndexUrl, "/skills/publish"), {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    abilityType: p.type,
                                                    service: p.name,
                                                    content: content,
                                                    creatorWallet: creatorWallet,
                                                    baseUrl: "",
                                                    authMethodType: "none",
                                                    endpoints: [],
                                                    skillMd: p.description || "",
                                                    apiTemplate: "",
                                                }),
                                                signal: AbortSignal.timeout(30000),
                                            })];
                                    case 2:
                                        resp = _k.sent();
                                        if (!!resp.ok) return [3 /*break*/, 4];
                                        return [4 /*yield*/, resp.text()];
                                    case 3:
                                        text = _k.sent();
                                        return [2 /*return*/, {
                                                content: [{ type: "text", text: "Publish failed: ".concat(text) }],
                                            }];
                                    case 4: return [4 /*yield*/, resp.json()];
                                    case 5:
                                        result = (_k.sent());
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: [
                                                            "Published ".concat(p.type, ": ").concat(p.name),
                                                            "",
                                                            "ID: ".concat(result.id),
                                                            "Version: ".concat(result.version),
                                                            "Status: ".concat(result.reviewStatus),
                                                            "",
                                                            p.type === "pattern"
                                                                ? "Patterns are free to share — thanks for contributing to the brain!"
                                                                : "Others can download this ".concat(p.type, " via foundry_marketplace. You earn USDC per download."),
                                                        ].join("\n"),
                                                    },
                                                ],
                                            }];
                                    case 6:
                                        err_6 = _k.sent();
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Publish error: ".concat(err_6.message),
                                                    },
                                                ],
                                            }];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        });
                    },
                },
                // ── Foundry Marketplace Tool ───────────────────────────────────────────
                // Search and install abilities from the crowdsourced marketplace
                {
                    name: "foundry_marketplace",
                    label: "Foundry Marketplace",
                    description: "Search and install abilities from the Foundry marketplace. " +
                        "Abilities include skills (APIs), patterns (failure resolutions), extensions (plugins), " +
                        "techniques (code snippets), insights (approaches), and agent designs. " +
                        "Use action='search' with query, action='leaderboard' to see top abilities, " +
                        "or action='install' with id to download (costs vary by type).",
                    parameters: {
                        type: "object",
                        properties: {
                            action: {
                                type: "string",
                                enum: ["search", "leaderboard", "install"],
                                description: "Action to perform",
                            },
                            query: {
                                type: "string",
                                description: "Search query (for action='search')",
                            },
                            type: {
                                type: "string",
                                enum: [
                                    "skill",
                                    "pattern",
                                    "extension",
                                    "technique",
                                    "insight",
                                    "agent",
                                ],
                                description: "Filter by ability type",
                            },
                            id: {
                                type: "string",
                                description: "Ability ID to install (for action='install')",
                            },
                            limit: {
                                type: "number",
                                description: "Number of results (default: 10)",
                            },
                        },
                        required: ["action"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, configPath, BrainIndexClient, brainClient, result, lines, _i, _a, ability, price, result, lines, _b, _c, ability, price, ability, abilityType, content, patternId, content, extId, result, err_7;
                            var _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        p = params;
                                        configPath = (0, node_path_1.join)((0, node_os_1.homedir)(), ".openclaw", "openclaw.json");
                                        return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/brain-index.js"); })];
                                    case 1:
                                        BrainIndexClient = (_g.sent()).BrainIndexClient;
                                        brainClient = new BrainIndexClient({
                                            indexUrl: skillIndexUrl,
                                            solanaPrivateKey: solanaPrivateKey,
                                        });
                                        _g.label = 2;
                                    case 2:
                                        _g.trys.push([2, 11, , 12]);
                                        if (!(p.action === "leaderboard")) return [3 /*break*/, 4];
                                        return [4 /*yield*/, brainClient.getLeaderboard({
                                                type: p.type,
                                                limit: (_d = p.limit) !== null && _d !== void 0 ? _d : 20,
                                            })];
                                    case 3:
                                        result = _g.sent();
                                        if (result.abilities.length === 0) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        {
                                                            type: "text",
                                                            text: "No abilities in leaderboard yet. Be the first to publish!",
                                                        },
                                                    ],
                                                }];
                                        }
                                        lines = [
                                            "## Foundry Marketplace Leaderboard",
                                            "",
                                            "Showing top ".concat(result.abilities.length, " abilities by rank score:"),
                                            "",
                                        ];
                                        for (_i = 0, _a = result.abilities; _i < _a.length; _i++) {
                                            ability = _a[_i];
                                            price = ability.priceCents === 0
                                                ? "FREE"
                                                : "$".concat((ability.priceCents / 100).toFixed(2));
                                            lines.push("**".concat(ability.service, "** (").concat(ability.abilityType, ")"), "  ID: ".concat(ability.id, " | Payers: ").concat(ability.uniquePayers, " | Score: ").concat(ability.rankScore, " | ").concat(price), "");
                                        }
                                        lines.push("Use foundry_marketplace with action=\"install\" and id=\"<id>\" to download.");
                                        return [2 /*return*/, { content: [{ type: "text", text: lines.join("\n") }] }];
                                    case 4:
                                        if (!(p.action === "search")) return [3 /*break*/, 6];
                                        if (!p.query) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        { type: "text", text: "Provide a query for search." },
                                                    ],
                                                }];
                                        }
                                        return [4 /*yield*/, brainClient.searchAbilities(p.query, {
                                                type: p.type,
                                                limit: (_e = p.limit) !== null && _e !== void 0 ? _e : 10,
                                            })];
                                    case 5:
                                        result = _g.sent();
                                        if (result.skills.length === 0) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        {
                                                            type: "text",
                                                            text: "No abilities found for: ".concat(p.query),
                                                        },
                                                    ],
                                                }];
                                        }
                                        lines = [
                                            "## Search Results: \"".concat(p.query, "\""),
                                            "",
                                            "Found ".concat(result.total, " abilities:"),
                                            "",
                                        ];
                                        for (_b = 0, _c = result.skills; _b < _c.length; _b++) {
                                            ability = _c[_b];
                                            price = ability.priceCents === 0
                                                ? "FREE"
                                                : "$".concat((ability.priceCents / 100).toFixed(2));
                                            lines.push("**".concat(ability.service, "** (").concat(ability.abilityType, ")"), "  ID: ".concat(ability.id, " | Downloads: ").concat(ability.downloadCount, " | ").concat(price), "");
                                        }
                                        lines.push("Use foundry_marketplace with action=\"install\" and id=\"<id>\" to download.");
                                        return [2 /*return*/, { content: [{ type: "text", text: lines.join("\n") }] }];
                                    case 6:
                                        if (!(p.action === "install")) return [3 /*break*/, 10];
                                        if (!p.id) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        { type: "text", text: "Provide an id to install." },
                                                    ],
                                                }];
                                        }
                                        return [4 /*yield*/, brainClient.downloadAbility(p.id)];
                                    case 7:
                                        ability = _g.sent();
                                        abilityType = ability.abilityType ||
                                            ability.type ||
                                            "skill";
                                        if (abilityType === "pattern") {
                                            content = ability.content;
                                            if ((content === null || content === void 0 ? void 0 : content.errorPattern) && (content === null || content === void 0 ? void 0 : content.resolution)) {
                                                patternId = learningEngine.recordFailure("imported", content.errorPattern, content.context);
                                                learningEngine.recordResolution(patternId, content.resolution);
                                                return [2 /*return*/, {
                                                        content: [
                                                            {
                                                                type: "text",
                                                                text: [
                                                                    "Installed pattern: ".concat(ability.service),
                                                                    "",
                                                                    "Error: ".concat(content.errorPattern),
                                                                    "Resolution: ".concat(content.resolution),
                                                                    "",
                                                                    "Pattern recorded \u2014 will be suggested when similar errors occur.",
                                                                ].join("\n"),
                                                            },
                                                        ],
                                                    }];
                                            }
                                        }
                                        if (!(abilityType === "extension")) return [3 /*break*/, 9];
                                        content = ability.content;
                                        if (!(content === null || content === void 0 ? void 0 : content.code)) return [3 /*break*/, 9];
                                        extId = ((_f = ability.service) === null || _f === void 0 ? void 0 : _f.toLowerCase().replace(/[^a-z0-9]+/g, "-")) || "imported-ext";
                                        return [4 /*yield*/, writer.writeExtension({
                                                id: extId,
                                                name: ability.service,
                                                description: content.description || "",
                                                tools: [],
                                                hooks: [],
                                            })];
                                    case 8:
                                        result = _g.sent();
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: [
                                                            "Installed extension: ".concat(ability.service),
                                                            "",
                                                            "Path: ".concat(result.path),
                                                            "",
                                                            "Run foundry_restart to load the new extension.",
                                                        ].join("\n"),
                                                    },
                                                ],
                                            }];
                                    case 9: 
                                    // Default: return raw ability info
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: [
                                                        "Downloaded: ".concat(ability.service || p.id),
                                                        "Type: ".concat(abilityType),
                                                        "",
                                                        "Content:",
                                                        JSON.stringify(ability.content || ability, null, 2).slice(0, 2000),
                                                    ].join("\n"),
                                                },
                                            ],
                                        }];
                                    case 10: return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Unknown action: ".concat(p.action, ". Use search, leaderboard, or install."),
                                                },
                                            ],
                                        }];
                                    case 11:
                                        err_7 = _g.sent();
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Marketplace error: ".concat(err_7.message),
                                                    },
                                                ],
                                            }];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        });
                    },
                },
                // ── foundry_overseer ────────────────────────────────────────────────────
                // Self-Improving Coding Agent (arXiv:2504.15228): Autonomous overseer
                {
                    name: "foundry_overseer",
                    label: "Run Overseer",
                    description: "Run the autonomous overseer to analyze patterns, identify crystallization candidates, " +
                        "find recurring failures, and get self-improvement recommendations.",
                    parameters: {
                        type: "object",
                        properties: {},
                        required: [],
                    },
                    execute: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var report, metrics, output, sorted, _i, _a, m, bar, _b, _c, c, _d, _e, f, _f, _g, action;
                            var _h;
                            return __generator(this, function (_j) {
                                report = learningEngine.runOverseer(dataDir);
                                metrics = learningEngine.getAllToolMetrics();
                                output = "## Foundry Overseer Report\n\n";
                                output += "**Generated**: ".concat(report.timestamp, "\n");
                                output += "**Patterns analyzed**: ".concat(report.patternsAnalyzed, "\n\n");
                                // Tool fitness (ADAS)
                                if (metrics.length > 0) {
                                    output += "### Tool Fitness (ADAS)\n";
                                    sorted = metrics.sort(function (a, b) { return b.fitness - a.fitness; });
                                    for (_i = 0, _a = sorted.slice(0, 10); _i < _a.length; _i++) {
                                        m = _a[_i];
                                        bar = "█".repeat(Math.floor(m.fitness * 10)) +
                                            "░".repeat(10 - Math.floor(m.fitness * 10));
                                        output += "- **".concat(m.toolName, "**: ").concat(bar, " ").concat((m.fitness * 100).toFixed(0), "% (").concat(m.successCount, "/").concat(m.successCount + m.failureCount, ")\n");
                                    }
                                    output += "\n";
                                }
                                // Crystallization candidates (HexMachina)
                                if (report.crystallizationCandidates.length > 0) {
                                    output += "### Crystallization Candidates (HexMachina)\n";
                                    output += "Patterns ready to become executable hooks:\n\n";
                                    for (_b = 0, _c = report.crystallizationCandidates; _b < _c.length; _b++) {
                                        c = _c[_b];
                                        output += "- **".concat(c.tool, "**: \"").concat((_h = c.error) === null || _h === void 0 ? void 0 : _h.slice(0, 50), "...\" (used ").concat(c.useCount, "x)\n");
                                        output += "  \u2192 `foundry_crystallize patternId=\"".concat(c.id, "\"`\n");
                                    }
                                    output += "\n";
                                }
                                // Recurring failures
                                if (report.recurringFailures.length > 0) {
                                    output += "### Recurring Failures (Need Attention)\n";
                                    for (_d = 0, _e = report.recurringFailures; _d < _e.length; _d++) {
                                        f = _e[_d];
                                        output += "- **".concat(f.signature, "**: ").concat(f.count, " occurrences\n");
                                    }
                                    output += "\n";
                                }
                                // Actions taken (autonomous behavior)
                                if (report.actionsExecuted.length > 0) {
                                    output += "### Actions Executed\n";
                                    for (_f = 0, _g = report.actionsExecuted; _f < _g.length; _f++) {
                                        action = _g[_f];
                                        output += "- ".concat(action, "\n");
                                    }
                                    output += "\n";
                                }
                                if (report.crystallizationCandidates.length === 0 &&
                                    report.recurringFailures.length === 0 &&
                                    report.actionsExecuted.length === 0) {
                                    output += "No immediate actions needed.\n";
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_crystallize ─────────────────────────────────────────────────
                // HexMachina (arXiv:2506.04651): LLM-driven crystallization
                // Returns pattern context and asks LLM to generate hook code
                {
                    name: "foundry_crystallize",
                    label: "Crystallize Pattern",
                    description: "Start crystallization of a learned pattern. Returns pattern details and instructions " +
                        "for generating hook code. After reviewing, call foundry_save_hook with the generated code.",
                    parameters: {
                        type: "object",
                        properties: {
                            patternId: {
                                type: "string",
                                description: "ID of the pattern to crystallize (from foundry_overseer)",
                            },
                        },
                        required: ["patternId"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, pattern, output;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                p = params;
                                pattern = learningEngine
                                    .getPatterns()
                                    .find(function (l) { return l.id === p.patternId; });
                                if (!pattern) {
                                    return [2 /*return*/, {
                                            content: [
                                                { type: "text", text: "Pattern not found: ".concat(p.patternId) },
                                            ],
                                        }];
                                }
                                if (!pattern.resolution) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Pattern has no resolution to crystallize",
                                                },
                                            ],
                                        }];
                                }
                                if (pattern.crystallizedTo) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Already crystallized to: ".concat(pattern.crystallizedTo),
                                                },
                                            ],
                                        }];
                                }
                                output = "## Crystallize Pattern: ".concat(pattern.id, "\n\n");
                                output += "### Pattern Details\n";
                                output += "- **Tool**: `".concat(pattern.tool, "`\n");
                                output += "- **Error Pattern**: ".concat(pattern.error, "\n");
                                output += "- **Learned Resolution**: ".concat(pattern.resolution, "\n");
                                output += "- **Context**: ".concat(pattern.context || "N/A", "\n");
                                output += "- **Use Count**: ".concat(pattern.useCount, "\n");
                                output += "- **Success Trajectory**: ".concat((pattern.improvementTrajectory || []).join(", ") || "N/A", "\n\n");
                                output += "### Generate Hook Code\n\n";
                                output += "Create a `before_tool_call` hook that:\n";
                                output += "1. Triggers when `".concat(pattern.tool, "` is about to be called\n");
                                output += "2. Detects conditions that would lead to: \"".concat((_a = pattern.error) === null || _a === void 0 ? void 0 : _a.slice(0, 100), "\"\n");
                                output += "3. Applies the resolution proactively: \"".concat(pattern.resolution, "\"\n");
                                output += "4. Uses `ctx.injectSystemMessage()` to guide the LLM\n\n";
                                output += "### Hook Template\n";
                                output += "```typescript\n";
                                output += "api.on(\"before_tool_call\", async (event, ctx) => {\n";
                                output += "  if (event.toolName === \"".concat(pattern.tool, "\") {\n");
                                output += "    // TODO: Add detection logic for the error condition\n";
                                output += "    // TODO: Apply resolution proactively\n";
                                output += "    if (ctx?.injectSystemMessage) {\n";
                                output += "      ctx.injectSystemMessage(`[CRYSTALLIZED] Apply: ".concat((_b = pattern.resolution) === null || _b === void 0 ? void 0 : _b.slice(0, 100), "`);\n");
                                output += "    }\n";
                                output += "  }\n";
                                output += "});\n";
                                output += "```\n\n";
                                output += "### Next Step\n";
                                output += "Generate the complete hook code based on the pattern above, then call:\n";
                                output += "```\n";
                                output += "foundry_save_hook(\n";
                                output += "  patternId: \"".concat(pattern.id, "\",\n");
                                output += "  hookCode: \"<your generated code>\"\n";
                                output += ")\n";
                                output += "```\n";
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_save_hook ──────────────────────────────────────────────────
                // HexMachina: Save LLM-generated hook code
                {
                    name: "foundry_save_hook",
                    label: "Save Crystallized Hook",
                    description: "Save the LLM-generated hook code from crystallization. " +
                        "Call this after foundry_crystallize with the generated code.",
                    parameters: {
                        type: "object",
                        properties: {
                            patternId: {
                                type: "string",
                                description: "ID of the pattern being crystallized",
                            },
                            hookCode: {
                                type: "string",
                                description: "The generated hook code (TypeScript)",
                            },
                            hookName: {
                                type: "string",
                                description: "Optional name for the hook (defaults to pattern-based name)",
                            },
                        },
                        required: ["patternId", "hookCode"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, pattern, hookId, hooksDir, hookPath, fullCode, output;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                p = params;
                                pattern = learningEngine
                                    .getPatterns()
                                    .find(function (l) { return l.id === p.patternId; });
                                if (!pattern) {
                                    return [2 /*return*/, {
                                            content: [
                                                { type: "text", text: "Pattern not found: ".concat(p.patternId) },
                                            ],
                                        }];
                                }
                                if (pattern.crystallizedTo) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Already crystallized to: ".concat(pattern.crystallizedTo),
                                                },
                                            ],
                                        }];
                                }
                                // Validate the hook code has basic structure
                                if (!p.hookCode.includes("api.on") &&
                                    !p.hookCode.includes("event") &&
                                    !p.hookCode.includes("ctx")) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Invalid hook code - must include api.on(), event, and ctx",
                                                },
                                            ],
                                        }];
                                }
                                hookId = p.hookName || "crystallized_".concat(pattern.tool, "_").concat(Date.now());
                                hooksDir = (0, node_path_1.join)(dataDir, "hooks");
                                if (!(0, node_fs_1.existsSync)(hooksDir))
                                    (0, node_fs_1.mkdirSync)(hooksDir, { recursive: true });
                                hookPath = (0, node_path_1.join)(hooksDir, "".concat(hookId, ".ts"));
                                fullCode = "// HexMachina crystallized from pattern: ".concat(pattern.id, "\n// Tool: ").concat(pattern.tool, "\n// Error: ").concat((_a = pattern.error) === null || _a === void 0 ? void 0 : _a.slice(0, 100), "\n// Resolution: ").concat((_b = pattern.resolution) === null || _b === void 0 ? void 0 : _b.slice(0, 100), "\n// Generated by LLM\n\n").concat(p.hookCode, "\n");
                                (0, node_fs_1.writeFileSync)(hookPath, fullCode);
                                learningEngine.markCrystallized(p.patternId, hookId);
                                output = "## Hook Saved\n\n";
                                output += "**Pattern**: ".concat(pattern.id, "\n");
                                output += "**Hook ID**: ".concat(hookId, "\n");
                                output += "**Path**: ".concat(hookPath, "\n\n");
                                output += "The pattern is now executable code.\n";
                                output += "Run `foundry_restart` to activate the hook.\n";
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_metrics ─────────────────────────────────────────────────────
                // ADAS (arXiv:2408.08435): View tool performance metrics
                {
                    name: "foundry_metrics",
                    label: "Tool Metrics",
                    description: "View tool performance metrics and fitness scores for agent evolution.",
                    parameters: {
                        type: "object",
                        properties: {
                            toolName: {
                                type: "string",
                                description: "Specific tool to get metrics for (optional)",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, metrics, m, sorted, output, _i, sorted_1, m, avgLatency;
                            return __generator(this, function (_a) {
                                p = params;
                                metrics = learningEngine.getAllToolMetrics();
                                if (p.toolName) {
                                    m = metrics.find(function (m) { return m.toolName === p.toolName; });
                                    if (!m)
                                        return [2 /*return*/, {
                                                content: [
                                                    { type: "text", text: "No metrics for: ".concat(p.toolName) },
                                                ],
                                            }];
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "\n## ".concat(m.toolName, " Metrics\n\n- **Fitness**: ").concat((m.fitness * 100).toFixed(1), "%\n- **Success**: ").concat(m.successCount, "\n- **Failure**: ").concat(m.failureCount, "\n- **Avg Latency**: ").concat(m.successCount + m.failureCount > 0 ? (m.totalLatencyMs / (m.successCount + m.failureCount)).toFixed(0) : 0, "ms\n"),
                                                },
                                            ],
                                        }];
                                }
                                if (metrics.length === 0) {
                                    return [2 /*return*/, {
                                            content: [
                                                { type: "text", text: "No tool metrics recorded yet." },
                                            ],
                                        }];
                                }
                                sorted = metrics.sort(function (a, b) { return b.fitness - a.fitness; });
                                output = "## Tool Performance Metrics (ADAS)\n\n";
                                output += "| Tool | Fitness | Success | Failure | Avg Latency |\n";
                                output += "|------|---------|---------|---------|-------------|\n";
                                for (_i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
                                    m = sorted_1[_i];
                                    avgLatency = m.successCount + m.failureCount > 0
                                        ? (m.totalLatencyMs /
                                            (m.successCount + m.failureCount)).toFixed(0)
                                        : 0;
                                    output += "| ".concat(m.toolName, " | ").concat((m.fitness * 100).toFixed(0), "% | ").concat(m.successCount, " | ").concat(m.failureCount, " | ").concat(avgLatency, "ms |\n");
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_evolve ─────────────────────────────────────────────────────
                // ADAS (arXiv:2408.08435): Evolve underperforming tools
                {
                    name: "foundry_evolve",
                    label: "Evolve Tools",
                    description: "Identify underperforming tools and generate improved versions using ADAS patterns. " +
                        "Returns analysis and improvement prompts for the LLM to generate better implementations.",
                    parameters: {
                        type: "object",
                        properties: {
                            fitnessThreshold: {
                                type: "number",
                                description: "Tools below this fitness (0-1) will be flagged for evolution. Default: 0.5",
                            },
                            toolName: {
                                type: "string",
                                description: "Specific tool to evolve (optional)",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, threshold, metrics, underperforming, m, patterns, failures, output, _loop_2, _i, underperforming_1, tool;
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                p = params;
                                threshold = (_a = p.fitnessThreshold) !== null && _a !== void 0 ? _a : 0.5;
                                metrics = learningEngine.getAllToolMetrics();
                                underperforming = metrics.filter(function (m) {
                                    return m.fitness < threshold && m.successCount + m.failureCount >= 3;
                                });
                                if (p.toolName) {
                                    underperforming = underperforming.filter(function (m) { return m.toolName === p.toolName; });
                                }
                                if (underperforming.length === 0) {
                                    if (p.toolName) {
                                        m = metrics.find(function (m) { return m.toolName === p.toolName; });
                                        if (m) {
                                            return [2 /*return*/, {
                                                    content: [
                                                        {
                                                            type: "text",
                                                            text: "Tool \"".concat(p.toolName, "\" has fitness ").concat((m.fitness * 100).toFixed(0), "% (above threshold ").concat((threshold * 100).toFixed(0), "%)"),
                                                        },
                                                    ],
                                                }];
                                        }
                                        return [2 /*return*/, {
                                                content: [
                                                    { type: "text", text: "No metrics for: ".concat(p.toolName) },
                                                ],
                                            }];
                                    }
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "No underperforming tools found (threshold: ".concat((threshold * 100).toFixed(0), "%)"),
                                                },
                                            ],
                                        }];
                                }
                                patterns = learningEngine.getPatterns();
                                failures = learningEngine
                                    .getAll()
                                    .filter(function (l) { return l.type === "failure"; });
                                output = "## ADAS Tool Evolution\n\n";
                                output += "Found ".concat(underperforming.length, " tool(s) below ").concat((threshold * 100).toFixed(0), "% fitness.\n\n");
                                _loop_2 = function (tool) {
                                    output += "### ".concat(tool.toolName, "\n\n");
                                    output += "**Current Performance:**\n";
                                    output += "- Fitness: ".concat((tool.fitness * 100).toFixed(0), "%\n");
                                    output += "- Success: ".concat(tool.successCount, " | Failure: ").concat(tool.failureCount, "\n");
                                    output += "- Avg Latency: ".concat(tool.successCount + tool.failureCount > 0 ? (tool.totalLatencyMs / (tool.successCount + tool.failureCount)).toFixed(0) : 0, "ms\n\n");
                                    // Find related failures
                                    var toolFailures = failures
                                        .filter(function (f) { return f.tool === tool.toolName; })
                                        .slice(-5);
                                    if (toolFailures.length > 0) {
                                        output += "**Recent Failures:**\n";
                                        for (var _f = 0, toolFailures_1 = toolFailures; _f < toolFailures_1.length; _f++) {
                                            var f = toolFailures_1[_f];
                                            output += "- ".concat((_b = f.error) === null || _b === void 0 ? void 0 : _b.slice(0, 80), "...\n");
                                        }
                                        output += "\n";
                                    }
                                    // Find related patterns (resolutions)
                                    var toolPatterns = patterns.filter(function (p) { return p.tool === tool.toolName; });
                                    if (toolPatterns.length > 0) {
                                        output += "**Known Solutions:**\n";
                                        for (var _g = 0, toolPatterns_1 = toolPatterns; _g < toolPatterns_1.length; _g++) {
                                            var p_1 = toolPatterns_1[_g];
                                            output += "- Error: ".concat((_c = p_1.error) === null || _c === void 0 ? void 0 : _c.slice(0, 50), "... \u2192 Resolution: ").concat((_d = p_1.resolution) === null || _d === void 0 ? void 0 : _d.slice(0, 80), "\n");
                                        }
                                        output += "\n";
                                    }
                                    output += "**Evolution Strategy:**\n";
                                    output += "Based on the failure patterns, consider:\n";
                                    output += "1. Adding pre-validation of inputs\n";
                                    output += "2. Adding retry logic with backoff\n";
                                    output += "3. Adding fallback behavior\n";
                                    output += "4. Improving error messages\n\n";
                                };
                                for (_i = 0, underperforming_1 = underperforming; _i < underperforming_1.length; _i++) {
                                    tool = underperforming_1[_i];
                                    _loop_2(tool);
                                }
                                output += "### Next Steps\n\n";
                                output += "To evolve a tool, analyze the failures above and:\n";
                                output += "1. Design an improved implementation\n";
                                output += "2. Use `foundry_add_tool` to add a new version, or\n";
                                output += "3. Use `foundry_extend_self` to add a wrapper/improvement\n\n";
                                output += "The new version should address the failure patterns while maintaining the original functionality.\n";
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_track_outcome ──────────────────────────────────────────────
                // Outcome-based learning: register a task for feedback tracking
                {
                    name: "foundry_track_outcome",
                    label: "Track Outcome",
                    description: "Register a task (e.g., TikTok post, tweet, email campaign) for outcome tracking. " +
                        "Later, collect real-world feedback (views, engagement) to learn what works.",
                    parameters: {
                        type: "object",
                        properties: {
                            taskType: {
                                type: "string",
                                description: "Type of task (e.g., 'tiktok_post', 'tweet', 'linkedin_post', 'email_campaign')",
                            },
                            taskDescription: {
                                type: "string",
                                description: "Brief description of what was done",
                            },
                            taskParams: {
                                type: "object",
                                description: "Parameters used (content, hashtags, timing, audience, etc.)",
                            },
                            successThreshold: {
                                type: "object",
                                description: "Optional: metrics thresholds for success (e.g., { views: 1000, likes: 50 })",
                            },
                        },
                        required: ["taskType", "taskDescription", "taskParams"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, outcomeId;
                            return __generator(this, function (_a) {
                                p = params;
                                outcomeId = learningEngine.trackOutcome(p.taskType, p.taskDescription, p.taskParams, p.successThreshold);
                                return [2 /*return*/, {
                                        content: [
                                            {
                                                type: "text",
                                                text: "Tracking outcome: **".concat(p.taskType, "**\n\n") +
                                                    "**ID**: `".concat(outcomeId, "`\n") +
                                                    "**Description**: ".concat(p.taskDescription, "\n") +
                                                    "**Params**: ".concat(JSON.stringify(p.taskParams, null, 2), "\n\n") +
                                                    "Use `foundry_record_feedback` with this ID once you have engagement metrics, " +
                                                    "or the system will automatically attempt to collect feedback after 1 hour.",
                                            },
                                        ],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_record_feedback ────────────────────────────────────────────
                // Manually record feedback metrics for a tracked outcome
                {
                    name: "foundry_record_feedback",
                    label: "Record Feedback",
                    description: "Record real-world feedback metrics for a tracked outcome. " +
                        "This updates the outcome with engagement data and triggers insight regeneration.",
                    parameters: {
                        type: "object",
                        properties: {
                            outcomeId: {
                                type: "string",
                                description: "The outcome ID returned by foundry_track_outcome",
                            },
                            metrics: {
                                type: "object",
                                description: "Engagement metrics (e.g., { views: 5000, likes: 120, comments: 15, shares: 8 })",
                            },
                            feedbackSource: {
                                type: "string",
                                description: "Source of the metrics (e.g., 'tiktok_analytics', 'twitter_api', 'manual')",
                            },
                        },
                        required: ["outcomeId", "metrics", "feedbackSource"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, outcome, insights;
                            return __generator(this, function (_a) {
                                p = params;
                                outcome = learningEngine.recordFeedback(p.outcomeId, p.metrics, p.feedbackSource);
                                if (!outcome) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Outcome not found: `".concat(p.outcomeId, "`"),
                                                },
                                            ],
                                        }];
                                }
                                insights = learningEngine.getTaskInsights(outcome.taskType);
                                return [2 /*return*/, {
                                        content: [
                                            {
                                                type: "text",
                                                text: "Feedback recorded for **".concat(outcome.taskType, "**\n\n") +
                                                    "**Metrics**: ".concat(JSON.stringify(outcome.metrics), "\n") +
                                                    "**Success**: ".concat(outcome.success === true ? "✅ Yes" : outcome.success === false ? "❌ No" : "⏳ Pending", "\n\n") +
                                                    (insights
                                                        ? "**Updated Insights** (".concat(insights.totalTasks, " tasks tracked):\n") +
                                                            insights.recommendations.map(function (r) { return "- ".concat(r); }).join("\n")
                                                        : ""),
                                            },
                                        ],
                                    }];
                            });
                        });
                    },
                },
                // ── foundry_get_insights ───────────────────────────────────────────────
                // Get learned insights for a task type
                {
                    name: "foundry_get_insights",
                    label: "Get Outcome Insights",
                    description: "Get learned insights and recommendations for a task type based on past outcomes. " +
                        "Use this before executing a task to apply what worked before.",
                    parameters: {
                        type: "object",
                        properties: {
                            taskType: {
                                type: "string",
                                description: "Type of task (e.g., 'tiktok_post', 'tweet'). Leave empty to list all task types.",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, taskTypes, output_1, _i, taskTypes_1, type, insights_1, insights, output, _a, _b, _c, key, value, _d, _e, rec, _f, _g, pat, _h, _j, pat, _k, _l, top_1;
                            return __generator(this, function (_m) {
                                p = params;
                                if (!p.taskType) {
                                    taskTypes = learningEngine.getAllTaskTypes();
                                    if (taskTypes.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No outcome insights yet. Use `foundry_track_outcome` to start tracking tasks.",
                                                    },
                                                ],
                                            }];
                                    }
                                    output_1 = "## Task Types with Insights\n\n";
                                    for (_i = 0, taskTypes_1 = taskTypes; _i < taskTypes_1.length; _i++) {
                                        type = taskTypes_1[_i];
                                        insights_1 = learningEngine.getTaskInsights(type);
                                        if (insights_1) {
                                            output_1 += "- **".concat(type, "**: ").concat(insights_1.totalTasks, " tasks (").concat(insights_1.successfulTasks, " successful)\n");
                                        }
                                    }
                                    output_1 += "\nUse `foundry_get_insights` with a specific taskType for detailed recommendations.";
                                    return [2 /*return*/, { content: [{ type: "text", text: output_1 }] }];
                                }
                                insights = learningEngine.getTaskInsights(p.taskType);
                                if (!insights || insights.totalTasks === 0) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "No insights for **".concat(p.taskType, "** yet. Track some outcomes first."),
                                                },
                                            ],
                                        }];
                                }
                                output = "## Insights: ".concat(p.taskType, "\n\n");
                                output += "**Total Tasks**: ".concat(insights.totalTasks, " (").concat(insights.successfulTasks, " successful)\n\n");
                                if (Object.keys(insights.avgMetrics).length > 0) {
                                    output += "**Average Metrics**:\n";
                                    for (_a = 0, _b = Object.entries(insights.avgMetrics); _a < _b.length; _a++) {
                                        _c = _b[_a], key = _c[0], value = _c[1];
                                        output += "- ".concat(key, ": ").concat(value, "\n");
                                    }
                                    output += "\n";
                                }
                                if (insights.recommendations.length > 0) {
                                    output += "**Recommendations**:\n";
                                    for (_d = 0, _e = insights.recommendations; _d < _e.length; _d++) {
                                        rec = _e[_d];
                                        output += "- ".concat(rec, "\n");
                                    }
                                    output += "\n";
                                }
                                if (insights.patterns.successful.length > 0) {
                                    output += "**Successful Patterns**:\n";
                                    for (_f = 0, _g = insights.patterns.successful; _f < _g.length; _f++) {
                                        pat = _g[_f];
                                        output += "- ".concat(pat, "\n");
                                    }
                                    output += "\n";
                                }
                                if (insights.patterns.unsuccessful.length > 0) {
                                    output += "**Patterns to Avoid**:\n";
                                    for (_h = 0, _j = insights.patterns.unsuccessful; _h < _j.length; _h++) {
                                        pat = _j[_h];
                                        output += "- ".concat(pat, "\n");
                                    }
                                    output += "\n";
                                }
                                if (insights.topPerformers.length > 0) {
                                    output += "**Top Performers**:\n";
                                    for (_k = 0, _l = insights.topPerformers; _k < _l.length; _k++) {
                                        top_1 = _l[_k];
                                        output += "- ".concat(top_1.taskDescription.slice(0, 50), "... (").concat(JSON.stringify(top_1.metrics), ")\n");
                                    }
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_pending_feedback ───────────────────────────────────────────
                // List outcomes pending feedback collection
                {
                    name: "foundry_pending_feedback",
                    label: "Pending Feedback",
                    description: "List outcomes that are awaiting feedback collection. " +
                        "These are tasks that were tracked but haven't had metrics recorded yet.",
                    parameters: {
                        type: "object",
                        properties: {
                            taskType: {
                                type: "string",
                                description: "Filter by task type (optional)",
                            },
                        },
                        required: [],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, pending, output, _i, _a, outcome, age;
                            return __generator(this, function (_b) {
                                p = params;
                                pending = learningEngine.getPendingFeedback(p.taskType);
                                if (pending.length === 0) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "No outcomes pending feedback collection.",
                                                },
                                            ],
                                        }];
                                }
                                output = "## Pending Feedback Collection\n\n";
                                output += "".concat(pending.length, " outcomes awaiting metrics:\n\n");
                                for (_i = 0, _a = pending.slice(0, 10); _i < _a.length; _i++) {
                                    outcome = _a[_i];
                                    age = Math.round((Date.now() - new Date(outcome.executedAt).getTime()) /
                                        (60 * 60 * 1000));
                                    output += "- **".concat(outcome.taskType, "** (`").concat(outcome.id, "`)\n");
                                    output += "  - ".concat(outcome.taskDescription.slice(0, 60), "...\n");
                                    output += "  - Executed: ".concat(age, "h ago\n");
                                }
                                if (pending.length > 10) {
                                    output += "\n...and ".concat(pending.length - 10, " more.");
                                }
                                output += "\n\nUse `foundry_record_feedback` to record metrics for these outcomes.";
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
                // ── foundry_apply_improvement ──────────────────────────────────────────
                // Apply learned improvements to skills/extensions
                {
                    name: "foundry_apply_improvement",
                    label: "Apply Improvement",
                    description: "Apply a learned improvement suggestion to a skill or extension. " +
                        "This generates the necessary code changes based on outcome-based learnings.",
                    parameters: {
                        type: "object",
                        properties: {
                            taskType: {
                                type: "string",
                                description: "The task type with the improvement suggestion",
                            },
                            confirm: {
                                type: "boolean",
                                description: "Set to true to apply the changes (default: preview only)",
                            },
                        },
                        required: ["taskType"],
                    },
                    execute: function (_toolCallId, params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var p, insights, suggestion, output, _i, _a, change, _b, _c, change;
                            return __generator(this, function (_d) {
                                p = params;
                                insights = learningEngine.getTaskInsights(p.taskType);
                                if (!(insights === null || insights === void 0 ? void 0 : insights.improvementSuggestion)) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "No improvement suggestion available for **".concat(p.taskType, "**.\n\n") +
                                                        "Available suggestions:\n" +
                                                        learningEngine
                                                            .getImprovementSuggestions()
                                                            .map(function (s) {
                                                            return "- **".concat(s.taskType, "**: ").concat(s.suggestion.suggestedChanges[0], "...");
                                                        })
                                                            .join("\n") || "None",
                                                },
                                            ],
                                        }];
                                }
                                suggestion = insights.improvementSuggestion;
                                if (suggestion.appliedAt) {
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Improvement for **".concat(p.taskType, "** was already applied on ").concat(suggestion.appliedAt, "."),
                                                },
                                            ],
                                        }];
                                }
                                output = "## Improvement Suggestion for ".concat(p.taskType, "\n\n");
                                output += "**Confidence**: ".concat((suggestion.confidence * 100).toFixed(0), "%\n");
                                output += "**Based on**: ".concat(insights.totalTasks, " tracked outcomes (").concat(insights.successfulTasks, " successful)\n\n");
                                output += "**Suggested Changes**:\n";
                                for (_i = 0, _a = suggestion.suggestedChanges; _i < _a.length; _i++) {
                                    change = _a[_i];
                                    output += "- ".concat(change, "\n");
                                }
                                output += "\n";
                                if (suggestion.targetSkill) {
                                    output += "**Target Skill**: ".concat(suggestion.targetSkill, "\n\n");
                                }
                                if (p.confirm) {
                                    // Generate improvement prompt for the LLM to implement
                                    output += "---\n\n";
                                    output += "## Implementation Prompt\n\n";
                                    output += "Apply these improvements to the ".concat(suggestion.targetSkill || p.taskType, " skill/tool:\n\n");
                                    for (_b = 0, _c = suggestion.suggestedChanges; _b < _c.length; _b++) {
                                        change = _c[_b];
                                        output += "1. ".concat(change, "\n");
                                    }
                                    output += "\nBased on outcome data:\n";
                                    output += "- Best performers had: ".concat(insights.patterns.successful.slice(0, 2).join("; "), "\n");
                                    if (insights.patterns.unsuccessful.length > 0) {
                                        output += "- Avoid: ".concat(insights.patterns.unsuccessful[0], "\n");
                                    }
                                    output += "\nUse `foundry_extend_self` or `foundry_add_hook` to implement these changes.\n";
                                    output += "After implementation, use `foundry_restart` to apply.\n\n";
                                    // Mark as applied (LLM is now responsible for implementing)
                                    learningEngine.markImprovementApplied(p.taskType);
                                    output += "\u2705 Improvement marked as applied.";
                                }
                                else {
                                    output += "\nRun with `confirm: true` to generate the implementation prompt.";
                                }
                                return [2 /*return*/, { content: [{ type: "text", text: output }] }];
                            });
                        });
                    },
                },
            ];
            return toolList;
        };
        var toolNames = [
            "foundry_research",
            "foundry_implement",
            "foundry_write_extension",
            "foundry_write_skill",
            "foundry_add_tool",
            "foundry_add_hook",
            "foundry_list",
            "foundry_docs",
            "foundry_extend_self",
            "foundry_restart",
            "foundry_learnings",
            "foundry_publish_ability",
            "foundry_marketplace",
            "foundry_overseer",
            "foundry_crystallize",
            "foundry_save_hook",
            "foundry_metrics",
            "foundry_evolve",
            // Outcome-based learning
            "foundry_track_outcome",
            "foundry_record_feedback",
            "foundry_get_insights",
            "foundry_pending_feedback",
            "foundry_apply_improvement",
        ];
        api.registerTool(tools, { names: toolNames });
        // ── before_agent_start Hook ─────────────────────────────────────────────
        // Check for pending session (resume after restart) and inject learnings
        // Start workflow tracking and inject proactive suggestions
        api.on("before_agent_start", function (event, ctx) { return __awaiter(_this, void 0, void 0, function () {
            var extensions, skills, pendingSession, userMessage, resumeContext, workflowContext, suggestions, patterns, insights, learningsContext, overseerReport, evolutionContext, topCandidates, topFailures, outcomeInsights, taskTypes, _i, _a, taskType, typeInsights, pendingFeedback, improvementSuggestions, _b, _c, _d, taskType, suggestion, _e, _f, change, workflowStats;
            return __generator(this, function (_g) {
                extensions = writer.getExtensions();
                skills = writer.getSkills();
                pendingSession = learningEngine.getPendingSession();
                userMessage = (event === null || event === void 0 ? void 0 : event.userMessage) || (ctx === null || ctx === void 0 ? void 0 : ctx.lastUserMessage) || "";
                // Start tracking this workflow
                if (userMessage) {
                    learningEngine.startWorkflow(userMessage);
                }
                resumeContext = "";
                if (pendingSession) {
                    resumeContext = "\n## \u26A1 RESUMED SESSION\n\n**Gateway restarted**: ".concat(pendingSession.reason, "\n\n**Previous context**: ").concat(pendingSession.context, "\n\n**Continue with**: ").concat(pendingSession.lastMessage, "\n\n---\n\n");
                    // Clear the pending session after injecting
                    learningEngine.clearPendingSession();
                    logger.info("[foundry] Resumed session: ".concat(pendingSession.reason));
                }
                workflowContext = "";
                if (userMessage && !pendingSession) {
                    suggestions = learningEngine.findMatchingWorkflows(userMessage);
                    if (suggestions.length > 0) {
                        workflowContext = "\n## \uD83D\uDD04 WORKFLOW SUGGESTIONS\n\nBased on your request, I've done similar workflows before:\n\n".concat(suggestions.map(function (s) { return "- **".concat(s.signature, "** (").concat((s.confidence * 100).toFixed(0), "% match)\n  ").concat(s.description); }).join("\n\n"), "\n\nI can follow one of these proven approaches, or we can try something new.\n\n");
                        logger.info("[foundry] Injected ".concat(suggestions.length, " workflow suggestions"));
                    }
                    // First-run onboarding
                    if (learningEngine.isFirstRun()) {
                        workflowContext += "\n## \uD83D\uDC4B FOUNDRY LEARNING\n\nThis is our first session! I'll start learning your workflows:\n- I observe which tools you use and in what order\n- After 3+ repetitions of a pattern, I'll suggest automating it\n- The more we work together, the better I get at anticipating your needs\n\n";
                        logger.info("[foundry] First run - injected onboarding message");
                    }
                }
                patterns = learningEngine.getPatterns().slice(-3);
                insights = learningEngine.getInsights().slice(-2);
                learningsContext = "";
                if (patterns.length > 0 || insights.length > 0) {
                    learningsContext = "\n## Learned Patterns\n\n".concat(patterns.map(function (p) { var _a, _b; return "- **".concat(p.tool, "**: ").concat((_a = p.error) === null || _a === void 0 ? void 0 : _a.slice(0, 50), "... \u2192 ").concat((_b = p.resolution) === null || _b === void 0 ? void 0 : _b.slice(0, 100)); }).join("\n"), "\n").concat(insights.map(function (i) { var _a; return "- **Insight**: ".concat((_a = i.context) === null || _a === void 0 ? void 0 : _a.slice(0, 100)); }).join("\n"), "\n\n");
                }
                overseerReport = learningEngine.getLastOverseerReport();
                evolutionContext = "";
                if ((overseerReport === null || overseerReport === void 0 ? void 0 : overseerReport.evolutionCandidates) &&
                    overseerReport.evolutionCandidates.length > 0) {
                    topCandidates = overseerReport.evolutionCandidates.slice(0, 3);
                    evolutionContext = "\n## \u26A0\uFE0F PROACTIVE EVOLUTION NEEDED\n\nThe following tools are underperforming and may benefit from evolution:\n\n".concat(topCandidates
                        .map(function (t) {
                        var totalCalls = t.successCount + t.failureCount;
                        var avgLatency = totalCalls > 0 ? (t.totalLatencyMs / totalCalls).toFixed(0) : "N/A";
                        return "- **".concat(t.toolName, "**: ").concat((t.fitness * 100).toFixed(0), "% fitness (").concat(t.successCount, "/").concat(totalCalls, " success, avg ").concat(avgLatency, "ms)");
                    })
                        .join("\n"), "\n\nConsider using `foundry_evolve` to analyze and improve these tools, or investigate why they're failing.\n\n");
                }
                // Include recurring failures that need attention
                if ((overseerReport === null || overseerReport === void 0 ? void 0 : overseerReport.recurringFailures) &&
                    overseerReport.recurringFailures.length > 0) {
                    topFailures = overseerReport.recurringFailures.slice(0, 2);
                    evolutionContext += "\n## \uD83D\uDD01 Recurring Failures\n\n".concat(topFailures.map(function (f) { return "- **".concat(f.signature, "**: ").concat(f.count, "x failures - needs resolution pattern"); }).join("\n"), "\n\nConsider using `foundry_crystallize` after resolving these to prevent future occurrences.\n\n");
                }
                outcomeInsights = "";
                taskTypes = learningEngine.getAllTaskTypes();
                if (taskTypes.length > 0) {
                    outcomeInsights = "\n## \uD83D\uDCCA Outcome-Based Learnings\n\nYou have feedback data for: ".concat(taskTypes.join(", "), "\n\n");
                    // Include top 2 task type summaries
                    for (_i = 0, _a = taskTypes.slice(0, 2); _i < _a.length; _i++) {
                        taskType = _a[_i];
                        typeInsights = learningEngine.getTaskInsights(taskType);
                        if (typeInsights && typeInsights.recommendations.length > 0) {
                            outcomeInsights += "**".concat(taskType, "** (").concat(typeInsights.totalTasks, " tracked, ").concat(typeInsights.successfulTasks, " successful):\n");
                            outcomeInsights +=
                                typeInsights.recommendations
                                    .slice(0, 3)
                                    .map(function (r) { return "- ".concat(r); })
                                    .join("\n") + "\n\n";
                        }
                    }
                    outcomeInsights += "Use `foundry_get_insights` for detailed recommendations before executing similar tasks.\nUse `foundry_track_outcome` after executing tasks to continue learning.\n\n";
                }
                pendingFeedback = learningEngine.getPendingFeedback();
                if (pendingFeedback.length > 0) {
                    outcomeInsights += "**\u23F3 ".concat(pendingFeedback.length, " outcomes awaiting feedback** - consider collecting metrics.\n\n");
                }
                improvementSuggestions = learningEngine.getImprovementSuggestions();
                if (improvementSuggestions.length > 0) {
                    outcomeInsights += "## \uD83D\uDD27 SKILL IMPROVEMENTS READY\n\n";
                    outcomeInsights += "Based on outcome data, these skills should be upgraded:\n\n";
                    for (_b = 0, _c = improvementSuggestions.slice(0, 2); _b < _c.length; _b++) {
                        _d = _c[_b], taskType = _d.taskType, suggestion = _d.suggestion;
                        outcomeInsights += "- **".concat(taskType, "** (").concat((suggestion.confidence * 100).toFixed(0), "% confidence):\n");
                        for (_e = 0, _f = suggestion.suggestedChanges.slice(0, 2); _e < _f.length; _e++) {
                            change = _f[_e];
                            outcomeInsights += "  - ".concat(change, "\n");
                        }
                    }
                    outcomeInsights += "\nUse `foundry_apply_improvement` to implement these upgrades.\n\n";
                }
                workflowStats = learningEngine.getWorkflowStats();
                return [2 /*return*/, {
                        prependContext: "".concat(resumeContext).concat(workflowContext).concat(evolutionContext).concat(outcomeInsights).concat(learningsContext, "\n## Foundry: Self-Writing Coding Subagent\n\nGrounded in **docs.molt.bot** \u2014 fetches documentation on demand. Can modify its own source code.\n\n**Written**: ").concat(extensions.length, " extensions, ").concat(skills.length, " skills | **Learnings**: ").concat(learningEngine.getLearningsSummary(), " | **Workflows**: ").concat(workflowStats.totalWorkflows, " recorded, ").concat(workflowStats.patterns, " patterns\n\n**Tools**:\n- `foundry_research` \u2014 Search docs.molt.bot for best practices\n- `foundry_implement` \u2014 Research + implement a capability (fetches docs)\n- `foundry_write_extension` \u2014 Create an OpenClaw extension\n- `foundry_write_skill` \u2014 Create a skill package\n- `foundry_extend_self` \u2014 **Write new tools into foundry itself**\n- `foundry_restart` \u2014 Restart gateway and resume conversation\n- `foundry_evolve` \u2014 **ADAS**: Analyze underperforming tools and generate evolved versions\n- `foundry_crystallize` \u2014 **HexMachina**: Convert learned patterns into permanent hooks\n\n**Outcome Learning**:\n- `foundry_track_outcome` \u2014 Register a task (TikTok post, tweet, etc.) for feedback tracking\n- `foundry_record_feedback` \u2014 Record engagement metrics (views, likes, etc.)\n- `foundry_get_insights` \u2014 Get learned recommendations for a task type\n\nWhen you need a new capability:\n1. `foundry_research` \u2014 understand the API\n2. `foundry_implement` \u2014 get implementation guidance\n3. `foundry_write_*` or `foundry_extend_self` \u2014 write the code\n4. `foundry_restart` \u2014 restart gateway to load, auto-resumes\n\n**Feedback Loop**: After tasks like social posts, track outcomes and collect metrics. Insights will improve future runs.\n**Workflow Learning**: I observe your tool sequences and suggest automation after repeated patterns.\n"),
                    }];
            });
        }); });
        // ── after_tool_call Hook ─────────────────────────────────────────────────
        // RISE: Recursive introspection with context injection
        // ADAS: Tool performance tracking for fitness evolution
        // Workflow: Track tool sequence for pattern detection
        api.on("after_tool_call", function (event, ctx) { return __awaiter(_this, void 0, void 0, function () {
            var toolName, result, error, startTime, latencyMs, isError, errorMsg, errorStr, existingPattern, feedback, pattern, hookId, hooksDir, escapedError, escapedResolution, hookCode, hookPath;
            var _a, _b;
            return __generator(this, function (_c) {
                toolName = event.toolName, result = event.result, error = event.error, startTime = event.startTime;
                latencyMs = startTime ? Date.now() - startTime : 0;
                // Skip our own tools to avoid recursive learning
                if (toolName === null || toolName === void 0 ? void 0 : toolName.startsWith("foundry_"))
                    return [2 /*return*/];
                // Track tool in current workflow
                learningEngine.trackWorkflowTool(toolName || "unknown");
                isError = error ||
                    (result && typeof result === "object" && result.error);
                // ADAS: Record tool execution metrics
                learningEngine.recordToolExecution(toolName || "unknown", !isError, latencyMs);
                if (isError) {
                    errorMsg = error || result.error || "Unknown error";
                    errorStr = typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg);
                    existingPattern = learningEngine.findSimilarPattern(toolName || "unknown", errorStr);
                    if (existingPattern && existingPattern.resolution) {
                        // RISE: We have a learned pattern! Inject context for retry
                        logger.info("[foundry] RISE: Injecting learned pattern for ".concat(toolName));
                        learningEngine.recordPatternUse(existingPattern.id);
                        // Track which pattern was injected so we can detect success
                        lastInjectedPatternId = existingPattern.id;
                        lastInjectedForTool = toolName || "unknown";
                        // Inject resolution into conversation context
                        if (ctx === null || ctx === void 0 ? void 0 : ctx.injectSystemMessage) {
                            ctx.injectSystemMessage("\n[FOUNDRY LEARNED PATTERN]\nSimilar error was previously resolved:\nTool: ".concat(existingPattern.tool, "\nError pattern: ").concat((_a = existingPattern.error) === null || _a === void 0 ? void 0 : _a.slice(0, 100), "\nResolution: ").concat(existingPattern.resolution, "\n\nApply this resolution to the current failure.\n"));
                        }
                    }
                    feedback = (result === null || result === void 0 ? void 0 : result.stderr) || (result === null || result === void 0 ? void 0 : result.trace);
                    lastFailureId = learningEngine.recordFailure(toolName || "unknown", errorStr, (_b = ctx === null || ctx === void 0 ? void 0 : ctx.lastUserMessage) === null || _b === void 0 ? void 0 : _b.slice(0, 200), feedback);
                }
                else {
                    // RISE: Check if this success followed a pattern injection
                    if (lastInjectedPatternId && lastInjectedForTool === toolName) {
                        // Pattern was used and retry succeeded!
                        logger.info("[foundry] RISE: Pattern ".concat(lastInjectedPatternId, " succeeded for ").concat(toolName));
                        learningEngine.recordPatternSuccess(lastInjectedPatternId);
                        pattern = learningEngine.getPattern(lastInjectedPatternId);
                        if (pattern && learningEngine.shouldAutoCrystallize(pattern)) {
                            logger.info("[foundry] RISE: Auto-crystallizing pattern ".concat(lastInjectedPatternId, " after ").concat(pattern.useCount, " successful uses"));
                            hookId = "rise_crystallized_".concat(pattern.tool, "_").concat(Date.now());
                            hooksDir = (0, node_path_1.join)(dataDir, "hooks");
                            if (!(0, node_fs_1.existsSync)(hooksDir))
                                (0, node_fs_1.mkdirSync)(hooksDir, { recursive: true });
                            escapedError = (pattern.error || "")
                                .replace(/`/g, "'")
                                .slice(0, 100);
                            escapedResolution = (pattern.resolution || "")
                                .replace(/`/g, "'")
                                .slice(0, 200);
                            hookCode = "\n    // RISE auto-crystallized from pattern: ".concat(pattern.id, "\n    // Triggered after ").concat(pattern.useCount, " successful retry uses\n    api.on(\"before_tool_call\", async (event, ctx) => {\n      if (event.toolName === \"").concat(pattern.tool, "\") {\n        // Original error: ").concat(escapedError, "\n        // Learned resolution: ").concat(escapedResolution, "\n        if (ctx?.injectSystemMessage) {\n          ctx.injectSystemMessage(`\n[RISE CRYSTALLIZED PATTERN]\nBefore calling ").concat(pattern.tool, ", apply this proven approach:\n").concat(escapedResolution, "\n`);\n        }\n      }\n    });");
                            hookPath = (0, node_path_1.join)(hooksDir, "".concat(hookId, ".ts"));
                            (0, node_fs_1.writeFileSync)(hookPath, hookCode);
                            learningEngine.markCrystallized(lastInjectedPatternId, hookId);
                            logger.info("[foundry] RISE: Wrote crystallized hook to ".concat(hookPath));
                        }
                        lastInjectedPatternId = null;
                        lastInjectedForTool = null;
                    }
                    // Record success and potential resolution
                    if (lastFailureId && toolName) {
                        learningEngine.recordResolution(lastFailureId, "Succeeded after retry with ".concat(toolName));
                        lastFailureId = null;
                    }
                }
                return [2 /*return*/];
            });
        }); });
        // ── agent_end Hook ───────────────────────────────────────────────────────
        // Learn from completed sessions and record workflows
        api.on("agent_end", function (event, ctx) { return __awaiter(_this, void 0, void 0, function () {
            var outcome, toolsUsed, workflowOutcome, combo;
            var _a, _b;
            return __generator(this, function (_c) {
                outcome = event.outcome, toolsUsed = event.toolsUsed;
                workflowOutcome = outcome === "success"
                    ? "success"
                    : outcome === "failure"
                        ? "failure"
                        : "partial";
                learningEngine.completeWorkflow(workflowOutcome, ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.summary) === null || _a === void 0 ? void 0 : _a.slice(0, 200)) || "");
                if (outcome === "success" && (toolsUsed === null || toolsUsed === void 0 ? void 0 : toolsUsed.length) > 2) {
                    combo = toolsUsed.slice(0, 5).join(" → ");
                    learningEngine.recordInsight("Successful tool sequence: ".concat(combo), (_b = ctx === null || ctx === void 0 ? void 0 : ctx.summary) === null || _b === void 0 ? void 0 : _b.slice(0, 200));
                }
                // Clear any pending failure tracking
                lastFailureId = null;
                return [2 /*return*/];
            });
        }); });
        var features = [
            "".concat(toolNames.length, " tools"),
            "docs.molt.bot grounded",
            "self-modification",
            "proactive learning",
            "restart resume",
        ].join(", ");
        logger.info("[foundry] Plugin registered (".concat(features, ")"));
        logger.info("[foundry] Written: ".concat(writer.getExtensions().length, " extensions, ").concat(writer.getSkills().length, " skills"));
        logger.info("[foundry] Learnings: ".concat(learningEngine.getLearningsSummary()));
        // Check for pending session on startup
        if (learningEngine.hasPendingSession()) {
            var pending = learningEngine.getPendingSession();
            logger.info("[foundry] \u26A1 Pending session found: ".concat(pending === null || pending === void 0 ? void 0 : pending.reason));
        }
        // Self-Improving Coding Agent (arXiv:2504.15228): Start autonomous overseer
        // Runs every hour to auto-crystallize patterns and report recurring failures
        // Run immediately once to populate lastOverseerReport for proactive evolution injection
        var initialReport = learningEngine.runOverseer(dataDir);
        logger.info("[foundry] Initial overseer run: ".concat(initialReport.evolutionCandidates.length, " evolution candidates, ").concat(initialReport.recurringFailures.length, " recurring failures"));
        learningEngine.startOverseer(60 * 60 * 1000, dataDir);
        logger.info("[foundry] Autonomous overseer scheduled (1h interval)");
    },
};
