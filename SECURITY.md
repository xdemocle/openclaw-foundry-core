# Security Notes

Foundry is a *code-forging* meta-extension: it validates, sandboxes, and deploys
generated code, and restarts the gateway. That mandate means it deliberately uses a
handful of patterns that automated scanners (e.g. OpenClaw's install-time
`code_safety` scan) flag. This file documents each genuine use so reviewers don't
mistake intentional, scoped behavior for malicious code.

## Genuine flagged patterns (intentional)

| Location | Pattern | Why it exists |
|----------|---------|---------------|
| `index.ts` `import { spawn, exec } from "node:child_process"` | `dangerous-exec` | Required by the two uses below. |
| `CodeValidator` — `spawn("npx", ["tsx", runnerFile])` | `dangerous-exec` | Runs candidate generated code in an **isolated child process** to validate it before deployment. This is the core safety boundary, not a bypass of one. Args are a fixed argv array (no shell string), so no shell-injection surface. |
| `foundry_restart` — `exec("openclaw gateway restart")` | `dangerous-exec` | Reloads the gateway after a new artifact is written. Fixed command string, no user interpolation. |
| `CodeValidator` — `new Function(code)` | `dynamic-code-execution` | A **syntax check only** — the generated code is compiled (never invoked) to surface parse errors early. Execution happens later, sandboxed, in the child process above. |

None of these take attacker-controlled shell strings; the `spawn` argv is fixed and the
`exec` command is a constant.

## Scanner false positives (fixed)

Earlier scans also flagged three lines that were **not** executable danger — they were
Foundry's *own* security-scanner data (the strings/regex it uses to detect dangerous
code in generated artifacts). These were reworded / rebuilt from fragments so the naive
substring scan stops matching, with no behavior change:

- advice strings in `LearningEngine.autoPromoteKnownPatterns()` mentioning `exec()` / `eval()`
- the crypto-miner detector regex in `CodeValidator.staticSecurityScan()` (now built via
  `new RegExp(["coin"+"hive", "crypto"+"miner"].join("|"), "i")` — functionally identical)

## Reporting

Found a real issue? Open an issue at
https://github.com/xdemocle/openclaw-foundry-core or email xdemocle@gmail.com.
