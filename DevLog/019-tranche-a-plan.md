# Tranche A — first precision industry implementation plan

2026-09-13. Baseline reviewed: `cd002b4`, including P0.1 at `2e71cec`. Status: implementation-ready planning defaults, not implemented mechanics or user-approved balance. The user authorized research, reference caching, file-level specifications and asset/task manifests. No runtime implementation or image generation is performed by this pass.

> **Implementation status — 2026-09-13 (later pass).** A-01 through A-08 are implemented and committed, and the automated half of A-12 passes (115 headless tests, 27 browser scenarios, production build, two-cell benchmark evidence under `DevLog/evidence/tranche-a/`). A-09–A-11 (cell art generation/promotion) and the human/visual A-12 gates remain open; the cell renders an explicit placeholder. The provisional balance numbers below were exercised by the no-injection fixture without being changed. See the [feature TODO](021-tranche-a-coding-tasks.md) and [journal](004-implementation-journal.md) for per-task notes.

## Outcome and reading order

Deliver a player-run experiment: assemble a precision cell, inspect useful and unwanted exposure, deliberately make a failed part, tune and automate repeatable accepted production, qualify the cell and deploy an independently controlled copy. Preserve the existing frontier expedition.

1. [020 — simulation and interaction contracts](020-tranche-a-contracts.md): records, equations, transactions, migration and UI behavior.
2. [021 — coding TODO and file ownership](021-tranche-a-coding-tasks.md): dependency-ordered work packages, tests and completion gates.
3. [022 — asset production specification](022-tranche-a-assets.md) and [asset manifest](../assets/planning/tranche-a-assets.json): footprints, generation batches, registration and integration.
4. [Research notes and cached references](references/tranche-a/README.md): evidence, bounded inferences and source provenance.
5. [Task manifest](planning/tranche-a-tasks.json): machine-readable task dependencies and paths.

016–018 retain authority over broader design. This package resolves tranche-A implementation details with explicitly provisional defaults. If code experiments disprove a number or layout, update the contracts/manifests and record why before expanding implementation. Do not silently import conflicting preview recipes from revision B.

## Decisions made for planning

| Topic | Default | Why / revisit gate |
| --- | --- | --- |
| First machine / item IDs | `fabrication-cell`, `accepted-part` | Already exist in the preview catalog; reuse identities, explicitly mark different starter recipe |
| First product meaning | Accepted precision optical blank/component | Bridges to process optics, target tooling and sail inspection; not a fully functional photonic chip |
| Material handling | Explicit reservation from current shared construction/crystal stock | Existing belts only carry ore; typed cargo belongs to later logistics work |
| Physical field delivery | Existing reference, junction, tuner and two emitters assigned to a workpiece | Preserve useful starter equipment; no advanced-source bootstrap cycle |
| Process | Two bounded exposure zones and a fixed active exposure window | Teaches pattern control without claiming diffraction or ultrafast material simulation |
| New equipment footprint | 3×3, no wave ports, one wired power input | Workpiece receives assigned emitter delivery; no invisible duplication through an extra wave input |
| Control | One objective per domain, exclusive tuner ownership; global bounded trial budget | Independent cells without multiplying per-step solves by domain count |
| Qualification | Local configuration certificate plus live range monitoring | Separates a durable achievement from current operating acceptance |
| Replication | Selection-based blueprint, visible external bindings, transactional placement | Prevent stock/identity duplication and unexpected global connections |
| UI sequence | Cell inspector first, then operations/build/Esc shell | Makes the experiment testable before completing the HUD reorganization |
| Art sequence | Placeholder → one-direction static approval → four views → states/events | Registration defects already dominate the existing art backlog |

The optional planning defaults remain one planet plus orbital deployment, prototype tuning followed by automation, and manufacturing-led early challenges. Atmospheric propagation, fuel feedstocks, commercial fusion architecture and final mission numbers do not affect A. Ask about them when D/F/E contracts need them, not as a prerequisite here.

## Scope boundaries and dependencies

A includes records/migration, one process recipe plus one bounded rework attempt, local controls/qualification, contextual explanations, replication, menu consolidation and one production asset family. Source-reference identity becomes explicit, but A does not unlock arbitrary source locking, shared actuators, multipurpose driver scheduling, pulse storage, full cooling networks, research spending, typed belts or Schur reduction.

The first cell may run before certification. Certification tests reproducibility and enables qualified blueprint capture; it is not a condition for producing the first accepted part. The frontier retains its historical gate. Crystal is mined after the frontier, which is already reachable without precision parts. Accepted parts become an explicitly recorded inventory and milestone in A; their first manufactured performance upgrade remains C. The A playtest must judge whether producing and replicating the cell is rewarding enough before that upgrade. Do not present a planned C consumer as buildable.

The new cell uses a local modeled heat sink with a declared cooling law. Shared cooling service is a later extension, not an unimplemented prerequisite. Endpoint/tooling and inventory contracts should accommodate fusion and sail work without adding empty plant subsystems now.

## Delivery gates

| Gate | Required outcome | Depends on |
| --- | --- | --- |
| A0 | Reviewed contracts, offline reference notes, valid planning manifests | This planning pass |
| A1 | Local records and versioned migration preserve frontier behavior | A0 |
| A2 | Pure process model and exactly-once material lifecycle | A1 |
| A3 | Buildable, explainable first cell with local automation and qualification | A2 |
| A4 | Second independently controlled cell from a selected module | A3 |
| A5 | Menu consolidation and reviewed asset integration | A3; replication UI uses A4 |
| A6 | Fresh expedition, failure/recovery, two cells, performance report and human playtest | A4–A5 |

A5 art contract preparation can start after A0; actual generation waits for the A3 placeholder footprint/port review. B performance investigation is separate and may proceed alongside A, but A must retain the existing solver validity caps and control budget. A6 reports supported scale rather than asserting the unmet ≤16 ms p95 gate passed.

## Known implementation constraints

`src/sim/world.ts` contains global target, control, commission, construction, inventory, step and save behavior. `src/main.ts`, renderer, tutorial, ecology and diagnostics read those globals. Migration must update all consumers, not only add arrays. `src/sim/geometry.ts` infers port layout from kind and port count; the cell needs an explicit port definition. `src/ui/production-data.ts` is a preview graph, not a runtime recipe source. `tests/production.test.ts` currently tests that preview, so new runtime tests need distinct names and assertions.

The network solver already partitions disconnected blocks and reuses each block's LU across source groups. P0.1 already memoizes immutable route paths and schedules one tuner per step. Do not reimplement those optimizations. Current generator-to-load accounting assumes no power-pole chains; keep that topology in A.

## Risks and fastest validation

| Risk | Earliest experiment | Response |
| --- | --- | --- |
| Two-zone model is too abstract | Player explains useful/guard-zone preview and a failed sample | Change inspector and workpiece visual before adding recipes |
| Heat or stock makes starter recipe unreachable | Route-valid fresh-world fixture without stock injection | Adjust declared balance and resource audit, not test cheats |
| Multiple controllers converge too slowly | Two independent cells with one world trial budget | Measure convergence; simplify tuning objective or limit advertised scale |
| Local invalidation misses shared physics | Shared-source and power-load perturbation fixtures | Conservative dependency closure plus local operating monitor |
| New art drifts across directions | One-view terrain/port overlay review | Correct the source before multiplying frames |
| Scope expands into all three endgames | Review each task against A6 | Reserve future interfaces in prose; defer unused implementations |

Planning validation checks paths, dependency cycles, IDs, JSON and reference hashes. Runtime changes must run simulation tests, build and relevant browser scenarios; visual review and human playtesting remain separate evidence.
