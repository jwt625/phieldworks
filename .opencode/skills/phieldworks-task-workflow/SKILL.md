---
name: phieldworks-task-workflow
description: Use when implementing coding tasks in the Phieldworks repo from the DevLog handoff queue (012 and later). Covers verifying devlog claims against real code, working in small green batches, the validation gate (npm test/build/test:browser and benchmark harnesses), evidence capture, and handing open decisions to the planning agent and visual/complex-review to inspection agents.
---

# Phieldworks coding-task workflow

This is the operating contract for implementation agents picking up coding tasks
in this repo. Follow it unless the user explicitly overrides it. The project has
planning, coding, and complex/visual-inspection agents working asynchronously on
a shared workspace, so hand-offs and evidence matter as much as the code.

## 0. Scope discipline

- Work only the tasks assigned by the current queue or directly by the user. Start
  from [`DevLog/briefing.md`](../../../DevLog/briefing.md) and
  [`DevLog/planning/README.md`](../../../DevLog/planning/README.md): `017` is the
  current tranche sequence, tranche A tasks are in
  [`DevLog/planning/tranche-a/021-tranche-a-coding-tasks.md`](../../../DevLog/planning/tranche-a/021-tranche-a-coding-tasks.md),
  and the older `012` is retained for its accounting/performance contracts. Do
  **not** start the research economy, paid-logistics balance, new equipment, or
  asset generation unless assigned.
- If a task requires a design/balance decision or missing art, **do not invent it**.
  Record an explicit TBD question in the devlog with candidate options, and leave
  the code untouched or clearly unimplemented.
- Preserve unrelated work. Keep the architecture contract: `src/sim/*` must not
  import DOM/canvas/presentation; physics/accounting changes must not be made to
  satisfy a frame budget.

## 1. Orient and verify before coding

- Read the handoff queue, the relevant feature devlogs, current source and tests
  — not just the prose. Docs drift; code is the source of truth.
- Reconcile documentation with reality: run the commands, count the tests, and
  check checkboxes, test counts, and "implemented / next priority" claims against
  the code. Report every discrepancy you find.
- A review finding is not fixed until code plus evidence say so. Conversely, a
  passing automated assertion is **not** visual approval.

## 2. Implement in small green batches

- Prefer the smallest change that satisfies the stated contract. Add or adjust
  tests with the behavior change in the same batch so every commit is green.
- Deterministic and conservation-preserving by default. Fail explicitly rather
  than silently falling back or dropping work. Do not silently change limits or
  physical models to hit a target.
- Use read-only exploration subagents for reconnaissance. Do not run concurrent
  edits against the same files.

## 3. Validation gate (run before calling anything done)

Run these and report exact results, not summaries:

- `npm test`
- `npm run build`
- `npm run test:browser`
- `git diff --check`

When performance or connected-world behavior is involved, also run the relevant
harness and record machine + Node version + sample counts + topology:

- `npm run bench:review` (solver, writes `test-results/performance-review.json`)
- `npx tsx scripts/benchmark-connected.ts` (connected world step)
- `node scripts/benchmark-browser-connected.mjs` (real-app pacing; requires a dev
  server, e.g. `npm run dev -- --port 5175`)

Rules for measurements:

- State the fixture: machines, ports, links, source groups, control on/off.
- "Solver-only" is not "world step". A synthetic fixture is not balance evidence.
- If a target is missed, report the miss with numbers; never claim success.
- Record hardware and note that single-machine numbers are not cross-hardware claims.

## 4. Capture evidence

- Save raw benchmark/report JSON under `DevLog/evidence/<id>-<topic>.json`.
- Reference screenshots from `test-results/` by filename in the devlog; do not
  commit `test-results/` (it is gitignored).
- In the handoff report, list changed files (with line refs), exact commands run,
  results, and remaining limitations.

## 5. Update the docs (required, not optional)

- Update the handoff queue and the relevant feature devlog, plus the
  implementation journal (`DevLog/implementation/004-implementation-journal.md`) with a dated
  entry: what changed, evidence, checkboxes, and an explicit **"still open"** list.
- Keep history honest: add dated follow-ups rather than rewriting prior findings.
  Do not mark a reviewed failure as fixed without code and evidence.

## 6. Hand off to the planning agent

Leave unresolved decisions as explicit, answerable questions with options and
consequences, for example:

- cost/balance formulas (list candidate values and refund semantics),
- whether a capability should be gated behind research,
- capacity/performance trade-offs, and what should happen to already-valid
  oversized saves if a cap is reduced.

Do not guess numbers. Tag each item with the blocking dependency and owner.

## 7. Hand off to complex/visual-inspection agents

- Maintain a **"Visual/complex verification needed"** list naming the artifact
  (screenshot path or review page) and exactly what to confirm. Example items:
  cursor-anchored zoom keeps the point under the cursor fixed; overload isolation
  reads as isolation, not total failure; condition sprites show no row bleed.
- Separate automated assertions from visual review. Never mark generated art or a
  screenshot as integrated or approved on the strength of a test.
- Include checks that require a real device (e.g. macOS trackpad double-tap) and
  state that the automated test uses synthetic events.
- Call out complex/numerical references needing independent review: per-port
  complex fields, residuals, conservation identities, singular-failure behavior.

## 8. Commit and push hygiene

- Commit only when the user asks. Inspect `git status` and `git diff` first, stage
  only the intended files, and never commit secrets.
- One logical batch per commit with a concise imperative message. When changes
  interleave across features (shared files across concerns), split by file/concern
  where possible and note when hunk-level splitting would be required.
- The workspace is shared and the remote may advance while you work. Re-check
  status/diff immediately before committing, and after pushing confirm the working
  tree is clean and `HEAD` matches upstream.
- Never commit `test-results/` artifacts; do commit `DevLog/evidence/` JSON.

## 9. Done report template

Keep it concise and factual:

1. **Task / scope** — which handoff item.
2. **Changed** — files with line refs and the behavior change.
3. **Impact** — before/after numbers where performance or balance is involved.
4. **Validation** — exact commands and results (tests/build/browser/benchmarks).
5. **Still open** — remaining gaps, untested paths, and TBD decisions.
6. **Verification needed** — visual/device/complex checks delegated to reviewers.

## 10. Anti-patterns (do not do these)

- Treating stale devlog counts or claims as fact without checking the code.
- Claiming a performance or visual result without a measurement/screenshot.
- Inventing balance numbers or adding equipment/art the design put behind research.
- Committing mixed, unscoped changes, or pushing without re-checking the remote.
- Marking a task complete while its verification is delegated and unanswered.
