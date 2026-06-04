<p align="center">
  <img src="assets/logo.png" alt="Foundry" width="120" />
</p>

# Foundry

**The forge that forges itself.**

Foundry is a self-writing meta-extension for [OpenClaw](https://github.com/lekt9/openclaw) that learns how you work, researches documentation, and writes new capabilities into itself. It observes your workflows, crystallizes patterns into tools, and upgrades itself to match how you operate.

> **Fork notice.** This is a maintained, self-enclosed fork of the original [Foundry](https://github.com/lekt9/openclaw-foundry) (formerly `getfoundry.app`) by **lekt9**, which appears abandoned. This version **removes the crowdsourced marketplace, x402/Solana payments, and the `$FDRY` token** — Foundry now only researches docs, learns from your workflows, and writes local extensions/skills/hooks. There is **no third-party publish or install**.

```
┌─────────────────────────────────────────────────────────────┐
│                         FOUNDRY                             │
│                                                             │
│   Observe ──► Research ──► Learn ──► Write ──► Deploy      │
│       │          │          │          │          │         │
│       ▼          ▼          ▼          ▼          ▼         │
│   workflows   docs.openclaw  patterns  extensions  gateway  │
│   tool calls  arXiv papers   insights  tools       restart  │
│   outcomes    GitHub repos   workflows hooks       resume   │
│                                        skills              │
└─────────────────────────────────────────────────────────────┘
```

## OpenClaw vs Foundry

**OpenClaw** (originally Clawdbot) is the platform — an open-source agent runtime with:
- Gateway, channels, memory, sessions
- Tool execution and skill loading
- Model providers and routing
- The infrastructure everything runs on

**Foundry** is a plugin that runs *on* OpenClaw:
- Observes how you work → learns your patterns
- Researches docs → writes new extensions/skills/hooks
- Has its own learning engine (not part of OpenClaw core)
- Can modify itself via `foundry_extend_self`

```
OpenClaw (platform)
├── Gateway
├── Channels (Discord, Slack, Telegram...)
├── Skills & Tools
└── Plugins
    └── Foundry (this repo)
        ├── observes → your workflows
        ├── researches → docs, papers, repos
        ├── writes → extensions, skills, hooks
        ├── learns → from outcomes
        └── crystallizes → patterns into tools
```

**Key distinction:** OpenClaw doesn't have built-in self-learning. Foundry adds that capability on top. Foundry is an "agent that builds agents" — it uses OpenClaw's infrastructure to create new OpenClaw capabilities, and upgrades itself to match how you work.

## Why Self-Writing Matters

The key insight isn't "LLM writes code for you" — it's "the system upgrades itself."

### Knowledge vs Behavior

| Knowledge (Patterns) | Behavior (Self-Written Code) |
|---------------------|------------------------------|
| Stored as text | Baked into the system |
| LLM must read and apply each time | Runs automatically |
| Uses tokens every invocation | Zero token cost |
| Can be forgotten or ignored | Always executes |

A pattern says: *"When X happens, do Y."*
Self-written code **does** Y automatically when X happens.

### Workflow Learning

Foundry tracks every workflow you run:

```
Goal: "deploy to staging"
Tools: git → build → test → deploy
Outcome: success
Duration: 45s
```

Over time, patterns emerge. When a pattern hits 5+ uses with 70%+ success rate, Foundry **crystallizes** it into a dedicated tool.

What took 8 tool calls now takes 1.

### The Recursive Loop

```
Foundry observes how you work
    ↓
Learns patterns, researches docs
    ↓
Writes tool/hook to match your workflow
    ↓
That code becomes part of Foundry
    ↓
Foundry is now better at working like you
    ↓
Better Foundry learns more, writes more
    ↓
Repeat
```

The system that writes the code IS the code being written.

### Why This Compounds

| Traditional Agents | Foundry |
|-------------------|---------|
| Same logic every time | Learns your patterns |
| You adapt to the agent | Agent adapts to you |
| Each capability is isolated | Each upgrade improves the upgrader |
| Linear improvement | Compound improvement |

**Example:**
1. You deploy to staging 5 times using git→build→test→deploy
2. Foundry recognizes the pattern (87% success rate)
3. Crystallizes into `deploy_staging` tool
4. Now "deploy to staging" is a single command
5. You save time → do more deploys → pattern strengthens
6. Foundry learns variations (deploy to prod, deploy with migrations)
7. Loop

### The Bet

Traditional software: Human improves software → software does more

Foundry: Software upgrades software → software upgrades faster

This is **recursive self-improvement** — each capability makes acquiring the next capability easier.

## Features

### Self-Writing Code Generation
- Writes OpenClaw extensions with tools and hooks
- Generates API skills following AgentSkills format with YAML frontmatter
- Generates browser automation skills with CDP integration
- Generates standalone hooks with HOOK.md + handler.ts pattern
- Can extend itself with new capabilities
- Validates code in isolated sandbox before deployment

### Workflow Learning & Crystallization
- Tracks goal → tool sequence → outcome for every workflow
- Extracts keywords from goals for pattern matching
- Calculates success rates and average durations
- Crystallizes high-value patterns (5+ uses, 70%+ success) into dedicated tools
- Suggests relevant patterns when you start similar tasks

### The Overseer
- Runs autonomously on hourly interval
- Identifies crystallization candidates
- Auto-generates tools from high-value patterns
- Prunes stale patterns (30+ days unused)
- Tracks tool performance metrics (ADAS-style evolution)
- Reports actions taken

### Native OpenClaw Integration
- **AgentSkills Format**: Proper YAML frontmatter with metadata (emoji, requires, events)
- **Browser Automation**: CDP-based browser tool integration for authenticated workflows
- **Skill Gating**: Auto-generates requires.config, requires.bins, requires.env for dependencies
- **Hook System**: Full support for OpenClaw hook events (gateway:startup, command:new, etc.)
- **ClawdHub Ready**: Skills can be published to the ClawdHub registry

### Proactive Learning
- Records tool outcomes (success/failure) with context
- Builds patterns from repeated workflows
- Injects relevant context into agent conversations

### Sandbox Validation
- Runs generated code in isolated Node process
- Catches runtime errors before they crash the gateway
- Static security scanning (blocks shell exec, eval, credential access)
- Only deploys code that passes all checks

### Restart Resume
- Saves conversation context before gateway restart
- Automatically resumes after restart via managed hook
- No lost work when self-modifying

## Setup Guide

Get Foundry running on OpenClaw — written for both humans and coding agents. There's a [TL;DR for agents](#tldr-for-coding-agents) at the end.

### Prerequisites

- A working **OpenClaw** install with a runnable `openclaw` CLI — check with `openclaw gateway status`.
- **Node.js 18+** on `PATH`. Foundry uses the global `fetch`/`AbortSignal.timeout`, and its code sandbox shells out to `npx tsx` to validate generated extensions.
- No build step is needed to *use* Foundry — the gateway loads its TypeScript (`index.ts`) directly. A build is only needed when publishing to npm (`npm run build` → `dist/`).

### 1. Install

**Recommended — via OpenClaw:**

```bash
openclaw plugins install openclaw-foundry-core
```

Downloads, enables, and loads Foundry automatically. Then restart the gateway (below).

**From GitHub source** — add to `~/.openclaw/openclaw.json` (a build runs automatically on source installs via the `prepare` script):

```json
{ "plugins": { "entries": { "openclaw-foundry-core": {
  "enabled": true,
  "source": "github:xdemocle/openclaw-foundry"
}}}}
```

**Manual clone:**

```bash
git clone https://github.com/xdemocle/openclaw-foundry ~/.openclaw/extensions/openclaw-foundry-core
cd ~/.openclaw/extensions/openclaw-foundry-core && npm install   # installs devDeps + builds dist/
```

Apply any of the above with a restart:

```bash
openclaw gateway restart
```

> ⚠️ The plugin id is **`openclaw-foundry-core`**. Use that exact key in `openclaw.json` and as the install directory name (not `foundry`).

### 2. Configure (optional — Foundry runs with zero config)

All keys live under `plugins.entries.openclaw-foundry-core.config`:

| Key | Default | What it does |
|-----|---------|--------------|
| `dataDir` | `~/.openclaw/foundry` | Where learnings, workflows, and the ADAS archive are stored |
| `openclawPath` | *(unset)* | Path to a local OpenClaw checkout for offline doc loading; skipped when unset |
| `llmApiKey` | *(unset)* | API key for LLM-backed features (`foundry_meta_search`) — prefer the env var |
| `llmBaseUrl` | `https://api.anthropic.com` | Anthropic-compatible `/v1/messages` endpoint |
| `llmModel` | `claude-3-5-sonnet-latest` | Model id for LLM-backed features |

Minimal example:

```json
{ "plugins": { "entries": { "openclaw-foundry-core": {
  "enabled": true,
  "config": {
    "dataDir": "~/.openclaw/foundry"
  }
}}}}
```

### 3. (Optional) Enable LLM-backed ADAS — `foundry_meta_search`

The Meta Agent Search tool calls an LLM to design and score candidate agents. **Every other feature works without this** — only `foundry_meta_search` (non-status mode) is gated on a key.

Resolution order (config wins over env): `llmApiKey` → `ANTHROPIC_API_KEY` → `FOUNDRY_LLM_API_KEY`.

**Anthropic (default):**

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Any Anthropic-compatible endpoint (e.g. MiniMax)** — you must also set the base URL **and** the model (the default `claude-*` id won't exist on other providers):

```bash
export ANTHROPIC_BASE_URL="https://api.minimax.io/anthropic"   # client appends /v1/messages
export ANTHROPIC_API_KEY="<your-key>"
export FOUNDRY_LLM_MODEL="<provider-model-id>"
```

| Setting | Env var | Config key |
|---------|---------|-----------|
| Base URL | `ANTHROPIC_BASE_URL` | `llmBaseUrl` |
| API key | `ANTHROPIC_API_KEY` (or `FOUNDRY_LLM_API_KEY`) | `llmApiKey` |
| Model | `FOUNDRY_LLM_MODEL` | `llmModel` |

The client speaks the Anthropic Messages wire format (`x-api-key` + `anthropic-version` headers, `{system, messages, max_tokens}` body), so any endpoint that mirrors that will work.

### 4. Verify

```bash
openclaw gateway restart
tail -f ~/.openclaw/logs/gateway.log | grep foundry     # expect a foundry registration line, no errors
```

Then, in a session, confirm the tools respond:

- `foundry_list` → lists written extensions/skills (empty on a fresh install).
- `foundry_research query="hooks"` → fetches docs from `docs.openclaw.ai`.
- `foundry_meta_search status=true` → reports the ADAS archive **without needing an API key**.

### TL;DR for coding agents

1. Confirm OpenClaw is up: `openclaw gateway status`.
2. Install: `openclaw plugins install openclaw-foundry-core` (or add a `openclaw-foundry-core` entry to `~/.openclaw/openclaw.json`).
3. `openclaw gateway restart`, then verify: `grep foundry ~/.openclaw/logs/gateway.log`.
4. Leave config empty unless asked — defaults are sane.
5. Only set the LLM key if the user wants `foundry_meta_search`, and prefer the `ANTHROPIC_API_KEY` **env var** over writing secrets into `openclaw.json`.

## Tools

### Research & Learning

| Tool | Description |
|------|-------------|
| `foundry_research` | Search docs.openclaw.ai for best practices and patterns |
| `foundry_docs` | Read specific documentation pages (plugin, hooks, tools, etc.) |
| `foundry_learnings` | View recorded patterns, workflows, insights |

### Code Generation

| Tool | Description |
|------|-------------|
| `foundry_implement` | Research + implement a capability end-to-end |
| `foundry_write_extension` | Write a new OpenClaw extension with tools/hooks |
| `foundry_write_skill` | Write an API skill package (SKILL.md + api.ts) |
| `foundry_write_browser_skill` | Write a browser automation skill with CDP integration |
| `foundry_write_hook` | Write a standalone hook (HOOK.md + handler.ts) |
| `foundry_add_tool` | Add a tool to an existing extension |
| `foundry_add_hook` | Add a hook to an existing extension |
| `foundry_extend_self` | Add capabilities to Foundry itself |

### Management

| Tool | Description |
|------|-------------|
| `foundry_list` | List all written extensions and skills |
| `foundry_restart` | Restart gateway with context preservation |

### Autonomous / LLM-backed

| Tool | Description |
|------|-------------|
| `foundry_meta_search` | ADAS: an LLM designs and scores novel agent architectures (needs an LLM key; `status=true` needs none) |
| `foundry_self_write` | Write a tool/hook/technique into the self-written code store |

## Bundled Skills

Foundry ships with built-in skills that are automatically available:

### `foundry-browser-helper`
Helper skill for browser automation patterns. Provides guidance on using the OpenClaw `browser` tool effectively.

```
# Quick reference
browser open https://example.com
browser snapshot           # AI-readable format
browser click ref=btn_submit
browser type ref=input_email "user@example.com"
```

## How It Works

### 1. Observe Phase
```
Foundry watches every workflow:
  - Goal: What the user is trying to do
  - Tools: Sequence of tool calls
  - Outcome: Success, failure, or partial
  - Duration: How long it took
```

### 2. Research Phase
```
User: "Add a tool that fetches weather data"

Foundry:
  1. Searches docs.openclaw.ai for tool registration patterns
  2. Finds examples of API-calling tools
  3. Identifies best practices for error handling
```

### 3. Learn Phase
```
Foundry:
  1. Records workflow patterns
  2. Tracks success rates per pattern
  3. Identifies crystallization candidates
  4. Builds knowledge base of what works
```

### 4. Write Phase
```
Foundry:
  1. Generates extension code following patterns
  2. Includes proper TypeScript types
  3. Adds error handling and logging
  4. Validates in isolated sandbox
```

### 5. Deploy Phase
```
Foundry:
  1. Writes to ~/.openclaw/extensions/
  2. Creates openclaw.plugin.json
  3. Triggers gateway restart
  4. Resumes conversation automatically
```

## Skill Generation

Foundry generates skills in the AgentSkills format with proper YAML frontmatter:

```yaml
---
name: my-api-skill
description: Integrates with My API service
metadata: {"openclaw":{"emoji":"🔌","requires":{"env":["MY_API_KEY"]}}}
---

# My API Skill

## Authentication
This skill requires the `MY_API_KEY` environment variable.

## Endpoints
- `GET /users` - List all users
- `POST /users` - Create a new user
```

### Browser Skills

Browser automation skills automatically gate on `browser.enabled`:

```yaml
---
name: my-browser-skill
description: Automates login workflow
metadata: {"openclaw":{"emoji":"🌐","requires":{"config":["browser.enabled"]}}}
---

# My Browser Skill

## Workflow
1. Open login page
2. Fill credentials
3. Submit form
4. Verify success
```

### Standalone Hooks

Hooks follow the HOOK.md + handler.ts pattern:

```
my-hook/
├── HOOK.md          # Frontmatter + documentation
└── handler.ts       # Event handler code
```

## Sandbox Security

Generated code is validated before deployment:

### Blocked Patterns (Instant Reject)
- `child_process` / `exec` / `spawn` — Shell execution
- `eval()` / `new Function()` — Dynamic code execution
- `~/.ssh/` / `id_rsa` — SSH key access
- `~/.aws/` / `aws_secret` — Cloud credentials
- Exfiltration domains (ngrok, webhook.site, etc.)

### Flagged Patterns (Warning)
- `process.env` — Environment variable access
- `fs.readFile` / `fs.writeFile` — Filesystem access
- Base64 encoding — Potential obfuscation

### Runtime Validation
```
1. Write extension to temp directory
2. Spawn isolated Node process with tsx
3. Mock OpenClaw API
4. Try to import and run register()
5. If fails → reject with error message
6. If passes → deploy to real extensions directory
```

## Configuration

All options live under `plugins.entries.openclaw-foundry-core.config` — see the [Setup Guide](#setup-guide) for walkthroughs. The full schema:

```json
{ "plugins": { "entries": { "openclaw-foundry-core": {
  "enabled": true,
  "config": {
    "dataDir": "~/.openclaw/foundry",
    "openclawPath": "/path/to/openclaw",
    "llmBaseUrl": "https://api.anthropic.com",
    "llmModel": "claude-3-5-sonnet-latest"
  }
}}}}
```

| Option | Description | Default |
|--------|-------------|---------|
| `dataDir` | Directory to store forged artifacts | `~/.openclaw/foundry` |
| `openclawPath` | Local OpenClaw checkout for offline doc loading | *(unset — remote docs used)* |
| `llmApiKey` | API key for LLM features (prefer the `ANTHROPIC_API_KEY` env var) | *(unset)* |
| `llmBaseUrl` | Anthropic-compatible LLM endpoint | `https://api.anthropic.com` |
| `llmModel` | Model id for LLM features | `claude-3-5-sonnet-latest` |

## Research Foundations

Foundry's self-improvement mechanisms draw from recent advances in autonomous learning agents:

### Self-Improving Code Agents

| Paper | Key Insight | Foundry Application |
|-------|-------------|---------------------|
| [Self-Improving Coding Agent](https://arxiv.org/abs/2504.15228) (Robeyns et al., 2025) | Agent systems with coding tools can autonomously edit themselves, achieving 17-53% improvement through "non-gradient learning via LLM reflection and code updates" | `foundry_extend_self` — the agent modifies its own codebase |
| [From Language Models to Practical Self-Improving Computer Agents](https://arxiv.org/abs/2404.11964) (Shinn et al., 2024) | LLM agents can "systematically generate software to augment themselves" starting from minimal capabilities | Self-written tools/hooks that expand Foundry's capabilities |
| [SelfEvolve](https://arxiv.org/abs/2306.02907) (Jiang et al., 2023) | Two-step pipeline: knowledge generation + self-reflection debugging using interpreter feedback | LearningEngine records outcomes → patterns → crystallization |

### Recursive Introspection

| Paper | Key Insight | Foundry Application |
|-------|-------------|---------------------|
| [RISE: Recursive Introspection](https://arxiv.org/abs/2407.18219) (Qu et al., 2024) | Iterative fine-tuning teaches models to "alter responses after unsuccessful attempts" via multi-turn MDPs | Workflow tracking learns from outcomes, suggests improvements |
| [HexMachina](https://arxiv.org/abs/2506.04651) (Liu et al., 2025) | "Artifact-centric continual learning" — separates discovery from strategy evolution through code refinement | Patterns (knowledge) crystallize into hooks/tools (behavior) |

### Meta-Agent Search

| Paper | Key Insight | Foundry Application |
|-------|-------------|---------------------|
| [ADAS: Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435) (Hu et al., 2024) | Meta-agent iteratively discovers improved agent designs through archive-based evolution | Overseer tracks tool fitness, evolves patterns |

### Core Principle

> "An agent system, equipped with basic coding tools, can autonomously edit itself, and thereby improve its performance" — Robeyns et al.

Foundry operationalizes this: the system that writes the code IS the code being written.

## Key Directories

```
~/.openclaw/foundry/            — Data directory
  ├── workflows.json            — Recorded workflows
  ├── workflow-patterns.json    — Crystallization candidates
  ├── learnings.json            — Patterns, insights, outcomes
~/.openclaw/extensions/         — Generated extensions go here
~/.openclaw/skills/             — Generated skills go here
~/.openclaw/hooks/foundry-resume/ — Restart resume hook
```

## Development

```bash
npx tsc --noEmit        # type check (reads tsconfig.json)
npm run build           # compile to dist/ (JS + d.ts + sourcemaps)
npm run clean           # rm -rf dist

# Test live — the gateway loads index.ts directly, so no build is needed:
openclaw gateway restart
tail -f ~/.openclaw/logs/gateway.log | grep foundry
```

## License

MIT

---

*Built with OpenClaw. Forged by Foundry.*
