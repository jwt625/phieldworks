# Tranche A — first precision industry

The file-level execution package for tranche A: build a precision cell, make an
accepted part, fail and recover a batch, qualify the cell locally, and deploy an
independently controlled copy. Read `019` first.

| Doc | Role |
| --- | --- |
| [019 — Plan](019-tranche-a-plan.md) | Outcome, decisions/defaults, scope boundaries, delivery gates A0–A6, constraints and risks |
| [020 — Contracts](020-tranche-a-contracts.md) | Simulation/persistence/UI contracts: records, conserved delivery equations, material lifecycle, control/qualification, save v4 migration, blueprint rules |
| [021 — Coding tasks](021-tranche-a-coding-tasks.md) | Dependency-ordered A-01…A-12 work packages with status notes and a verification matrix; also the B-AUDIT performance investigation |
| [022 — Assets](022-tranche-a-assets.md) | Precision-cell asset production/integration contract, job gates, measured review record, runtime event contract |

Machine-readable companions: `DevLog/planning/tranche-a-tasks.json` (dependencies)
and `assets/planning/tranche-a-assets.json` (asset jobs). External references are
cached under `DevLog/references/tranche-a/`.

## Status (2026-09-13)

A-01…A-08 and the automated half of A-12 are implemented; A-09–A-11 (cell art) and
the human/visual A-12 gates remain open. The game renders a labeled
`FAB CELL / PLACEHOLDER`. See `021` per-task notes and `implementation/004`.
