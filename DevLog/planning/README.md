# Planning

Forward work: the current implementation sequence, handoff queues, and file-level
packages. Read before writing code. Nothing here is implemented unless the document
itself records implementation and evidence.

| Doc | What it is | Authority |
| --- | --- | --- |
| [029 — Early-game wave logistics](029-early-game-wave-logistics-handoff.md) | Physical guide pieces, manufactured upgrades, local cell belts; R-01–R-10 coding and independent validation gates | User chose physical pieces; specified, not implemented |
| [028 — Equipment animation handoff](028-equipment-animation-handoff.md) | Parallel animation/state-art production and integration tasks, per-kind gates | Active; exact completion in 027 |
| [026 — Compact UI tranche](026-compact-ui-tranche.md) | Next frontend cleanup: canvas budgets, eight coding/validation packages, completion gates | Specified; U-01–U-07 implemented and validated, U-08 independent acceptance pending |
| [017 — Industrial gameplay tranches](017-industrial-gameplay-tranches.md) | Tranche sequence A–E plus fusion D-F1/D-F2, acceptance gates, mapping of the old P1–P5 queue | **Current sequence** |
| [012 — Next coding handoffs](012-next-coding-handoffs.md) | Historical P0–P5 handoff queue and reconciliation notes | Historical; superseded by 017 for ordering, retains applicable contracts |
| [tranche-a/](tranche-a/README.md) | Tranche A execution package: plan, contracts, coding TODOs, asset contract (019–022) | Current for the first precision cell |

## How to use

- For the early-game routing/upgrade loop, start with `029`; independent review is `../verification/030`.
- Start with `017` for where the project is going, then `tranche-a/021` for the
  concrete code tasks currently in scope.
- `012` retains applicable accounting and performance contracts (notably P0.1 and
  the ≤16 ms step gate) but not the ordering.
- Hand open balance/design questions to the planning agent; do not invent numbers.
