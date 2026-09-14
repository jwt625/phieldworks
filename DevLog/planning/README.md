# Planning

Forward work: the current implementation sequence, handoff queues, and file-level
packages. Read before writing code. Nothing here is implemented unless the document
itself records implementation and evidence.

| Doc | What it is | Authority |
| --- | --- | --- |
| [017 — Industrial gameplay tranches](017-industrial-gameplay-tranches.md) | Tranche sequence A–E plus fusion D-F1/D-F2, acceptance gates, mapping of the old P1–P5 queue | **Current sequence** |
| [012 — Next coding handoffs](012-next-coding-handoffs.md) | Historical P0–P5 handoff queue and reconciliation notes | Historical; superseded by 017 for ordering, retains applicable contracts |
| [tranche-a/](tranche-a/README.md) | Tranche A execution package: plan, contracts, coding TODOs, asset contract (019–022) | Current for the first precision cell |

## How to use

- Start with `017` for where the project is going, then `tranche-a/021` for the
  concrete code tasks currently in scope.
- `012` retains applicable accounting and performance contracts (notably P0.1 and
  the ≤16 ms step gate) but not the ordering.
- Hand open balance/design questions to the planning agent; do not invent numbers.
