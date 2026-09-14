# Implementation

What actually exists in the prototype and how it behaves. This is the
reconciliation layer: when a design doc and the code disagree, the code is the
source of truth, and these logs should say so.

| Doc | What it is |
| --- | --- |
| [003 — Implementation milestones](003-implementation-milestones.md) | M1–M7 milestone checklists, first-build choices, dated status snapshots, visual-verification queue |
| [004 — Implementation journal](004-implementation-journal.md) | Dated running record of every implementation pass: changes, evidence, test counts, still-open items |
| [features/](features/README.md) | Per-feature contracts and logs for ports/routing and world interaction/onboarding |

## Start here

`004` is the chronological source for "what changed and what is still open." Read
its latest entry, then follow into the relevant feature log or plan. Test counts in
old entries are accurate only at their own commit — verify against the current code.

## Dig deeper when

- You need a shipped behavior, control scheme or known limitation → the `features/` log.
- You need milestone acceptance framing → `003`.
- You are about to claim something is done → check `004` and `../verification/`.
