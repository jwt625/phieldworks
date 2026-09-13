# First outpost — implementation journal

## 2026-09-11 — Starting implementation

Repository contains design documents, 11 transparent sprites, and a vector UI kit; no game runtime exists yet. Implementing milestones in 003 in dependency order. Preserve simulation/rendering separation and test energy/resource accounting independently of the UI.

Current work: foundation and scattering-network model.

## Outstanding risks

- Phase sensitivity must be understandable at tile scale; use a documented effective phase-per-tile model plus fine tuning.
- Sprite projection and anchors remain approximate; gameplay footprints and ports are defined in world coordinates.
- Small-map balancing needs human playtesting even if the loop passes automated tests.

## Simulation and interaction implementation

- Implemented complex Gaussian elimination and reciprocal port networks. Matched active sources, lossless hybrids, phase tuners, weak emitter reflection, matched dumps, and bidirectional lossy links are represented explicitly. Independent source groups solve separately.
- 16 unit/integration tests pass: power conservation, phase redistribution, reflections, source independence, singular-network failure, economy accounting, build validation, controller/frontier/commissioning, blueprint placement, heat damage/repair, persistence, occupied ports.
- Local power bus has a 16-tile radius and 240-unit supply per generator. It abstracts wiring/fuel. Over-demand shuts active loads down rather than silently granting power.
- Target projection uses a normalized coherent sum with a two-mode minimum and distance-dependent coupling. It bounds useful target power by radiated power; remaining radiation is accounted as off-target. This is a gameplay approximation, not a far-field diffraction solver.
- Controller uses a bounded two-degree trial adjustment each tick. Qualification tests 20 simulated seconds with a declared additional thermal disturbance, requiring at least 32 target units.
- Found and corrected a protection-model issue: a tripped passive input must reflect rather than continue absorbing a live incident field. Bypassed cooling can still cause damage.
- UI and canvas renderer implemented; entering browser validation.

Current limitations: blueprint captures the entire outpost; loading restores physical installation but clears qualification and stored blueprint (re-record after testing). Material transport is one directed route per extractor/assembler pair with shared assembly output stock. No individual belt tiles, avatars, dispersion, ecology growth, or FDTD yet.


## 2026-09-12 — Session recovery and transport continuation

Recovered the prior project conversation from the local Codex rollout ending in `01a09422-253b-7911-96fd-eea0e41fd004`. It confirmed the frontier-first gameplay, commissioning contract, provisional single-view assets, and the request to continue into typed ports/grid transports. The earlier journal stopped before M5 validation was recorded; current implementation and browser checks now cover that milestone.

Implemented the plan in [005 — Ports, routing and presentation](005-ports-routing-and-presentation.md): independent art mappings, rotated footprints and port normals, stored grid paths with optional diagonals/waypoints, real material transit/backpressure, explicit generator wires, and geometric phase/loss with a separate bend-radiation ledger. Save v2 retains routes/packets/orientation; legacy layouts migrate when routable. Blueprint capture includes external routes and placement validates before committing.

The range power bus and instant material transfers described above are historical behavior and are superseded. Shared assembly/crystal output, effective optical units, dense solver, and whole-outpost blueprints remain prototype choices. Rotated artwork currently uses canvas rotation; dedicated oblique views are still TODO.

Validation: 30 headless tests and three browser scenarios pass; production build passes. Reviewed starter and rotated-routing screenshots. Added regression coverage for diagonal paths cutting through footprint corners and blueprint route failures leaving the world unchanged. See 005 for current controls, effective bend equations, limitations and next priorities.


## 2026-09-12 — PHIELDWORKS world interaction and onboarding

Applied the user's decisions: direct camera control; tutorial around the established outpost; initially investigating creatures, with aggression gated behind a powered defense and sustained field exposure. Introduced a wired perimeter sentry and a 30-second grace period. Physics and simulation never import presentation/UI modules.

Resource and creature inspection, categorized construction with explicit requirements, minimap/pan/zoom, backdrop dismissal, eleven contextual tutorial lessons, and object-focused diagnostics are implemented. Save v3 restores ecology and supports v1/v2 migration. Main UI, gallery and docs use PHIELDWORKS; the legacy local-storage key remains for compatibility.

Generated the terrain/prop/crawler assets and nine equipment turnaround sheets. Dedicated fixed-camera source rectangles supersede the canvas-rotation fallback recorded above. Opaque output from the image tool required dark-matte assets and runtime compositing; final alpha and animation are art-polish follow-ups. Exact prompts, source provenance and the workspace deliverables are linked from `assets/world-generation-notes.md`.

Final validation: all 35 simulation tests, eight browser scenarios (including the full tutorial with defense and recovery), and the production build pass. See [006](006-world-interaction-and-onboarding.md) for final results and next steps.


## 2026-09-12 — Repo recheck and asset continuation

Reviewed committed progress at `5c65d26` with a clean working tree. Continued the requested map/animation/technology art pass in [010](010-map-animation-and-technology-assets.md). Eleven generated source files add four terrain variants, depletion/debris, 48 motion frames, eighteen technology illustrations and eight industrial science packages. Runtime animation follows production/movement state; a cached terrain layer and source-frame metadata keep presentation separate from the core. Technology dependency/status review is an asset-design surface, not a research unlock implementation. Exact prompts and source paths are preserved under assets.

Final asset-pass verification: production build and all 11 browser scenarios pass. Source-frame registration corrected clipped mechanisms without modifying generated PNGs. See 010 and the linked review pages for the delivered assets, prototype limitations and next priorities.


## 2026-09-13 — Devlog reconciliation and route editing

Reconciled the DevLogs against HEAD. The historical test counts (16, 30, 35, 41 headless; 3, 8, 10, 11 browser) were each accurate at their own commit but are stale now: `npm test` passes **51** headless checks and `npm run test:browser` passes **14** scenarios; the production build passes. DevLog 011's S1–S5 checklist was corrected: S1, S2, S4 and the S5 review surface were already committed (`26bc305`, `245fb43`), while the S3 operation/damage-cycle/transported-item sheets are still missing and are silently skipped by the shipping renderer (`generator-cycle-v1`, `sentry-fire-v1`, `transport-items-v1`). A visual-verification queue is recorded in [011](011-equipment-state-and-damage-animation.md).

Continued the pure-coding follow-up from [005](005-ports-routing-and-presentation.md): installed routes can now be selected and reshaped in place (`editRoute`, `Renderer.hitRoute`, route inspector card, editing waypoints) without disconnecting, with atomic validation, material-packet clamping/scrap accounting and qualification invalidation. Four headless cases and one browser case were added. Splitters, crossing layers/bridges, paid segments and multi-source power remain open; research, recipes and unlock gates remain out of scope for this pass. Screenshot for vision review: `test-results/route-editing.png`.

Also closed the two [011](011-equipment-state-and-damage-animation.md) verification gaps: `src/state-review.ts` no longer requests the absent `transport-items-v1.png` (item cards render only when the sprite exists, otherwise a labelled placeholder), and the state laboratory now has a browser regression (`tests/browser/assets.spec.ts`, `test-results/equipment-state-lab.png`).

Second coding batch (same day): connected-component power allocation with overload isolation and a provisional wire-capacity ledger (`Stats.overload`/`wireOverload`, diagnostics + ledger rows); prototype caps raised to 120 machines / 400 field ports / 512 links with schema validation; and client-side diagnostics telemetry (rolling target/heat series, sparkline, copyable report). Details and the behavior change are in [005](005-ports-routing-and-presentation.md). Current totals: **52 headless**, **16 browser**, production build passing.

Remaining work was left deliberately unfinished and documented as **Open decisions / TBD** in [005](005-ports-routing-and-presentation.md): the paid-transport-segment cost formula, splitters/underground crossings/bridges/power poles (need art and are research-gated), true multi-source buses, individual segment deletion, diagnostics gating, and bend calibration. Hard-to-validate items (allocation balance, raised-cap performance, the wire-capacity path without poles) are flagged for later benchmarking/playtest review.


## 2026-09-13 — P0 capacity and solver reliability

A new handoff queue arrived in [012](012-next-coding-handoffs.md) with a verified failure in [013](013-verification-review.md): placement/save allowed 400 field ports while `solveNetwork` hard-rejected over 128. Started P0.

- Single supported cap `FIELD_PORT_LIMIT=256` now lives in `src/sim/network.ts` and is shared by placement, save load and the solver. This supersedes the earlier "120 machines / 400 field ports" note above: the field-port figure is now 256, chosen from measurement.
- `solveNetwork` partitions the coupling graph (which is non-symmetric, so coupling is treated as undirected) into independent blocks and factors each once, reusing the factorization across source groups. Singular blocks still throw explicitly and the conservation ledger is unchanged. `factorLU`/`solveFactorization` added to `src/sim/complex.ts` and verified against `solveLinear` by fuzz test during development.
- Regressions added: independent disconnected regions, solver/enumeration cap agreement, save-load port cap, plus the existing singular/occupied/gain cases. `npm test` passes **55** headless; `npm run test:browser` passes **18** scenarios (`tests/browser/canonical-art.spec.ts` capitalization expectation corrected to the canonical "Research laboratory" label); build passes.
- Benchmark command added: `npm run bench:review`. Post-remedy evidence `DevLog/evidence/012-p0-solver-after.json`: 128/16 groups 1.14 ms p95 (baseline 167.71), 256/1 4.33 ms p95, 400 rejected.
- Corrected the stale in-game manual sentence that said an overloaded generator shuts all attached loads down.

Not done: a connected large-field-network world-step/render and browser frame-pacing benchmark at the cap, multi-hardware runs, and the remaining P1–P5 work. Visual/verification needs are recorded in 012 (P0 remaining verification) and 013 (follow-up).


## 2026-09-13 — Progression-map and minimap navigation

UI-only navigation pass (P2 adjacent, no simulation or save change):

- The research map (`#tech-viewport`, `src/ui/technology.ts`) now supports cursor-anchored mouse-wheel zoom (`zoomAt`) and drag-to-pan. Panning starts only after a small movement threshold and only captures the pointer mid-drag, so node clicks still work; a drag that starts on a node suppresses the resulting click. The existing `+ / − / Fit tree` buttons anchor at the viewport centre. `src/style.css` adds grab/grabbing cursors and `touch-action:none`.
- The minimap (`src/ui/minimap.ts`) recenters the main camera on double-click/double-tap, so a macOS trackpad double-tap pans to that location; drag and arrow-key navigation are unchanged.
- Tests: `tests/browser/technology.spec.ts` adds a wheel-zoom + drag-pan scenario (19 browser total) and `tests/browser/interactions.spec.ts` asserts minimap double-click moves the camera. `npm test` 55, browser 19, build pass.

**Visual verification needed:** `test-results/technology-zoom-pan.png` — confirm wheel zoom keeps the point under the cursor fixed, the grab cursor reads correctly, and panning does not fight node clicks; and manually confirm the macOS trackpad double-tap recenters the minimap (the automated test uses a synthetic double-click).


## 2026-09-13 — Connected-world performance (P0.1)

Pulled `11d2987` (connected-world validation). The 256-port cap is consistent but connected factories with automatic control failed the 16 ms p95 step target and even stalled the real app. Implemented the P0.1 remedy:

- `routeMetrics` memoized by path identity + radius; power wire flow computed directly from receiver draw; `automaticControl` bounded to one tuner per step on a deterministic cursor with the step baseline reused; `step` skips the redundant leading evaluate via a new stripped `statsRevision` field. `Stats.controlCursor` added.
- Results (M4 Pro): p95 step control-off 18.0→8.5 ms and control-on 191.5→24.3 ms at 120 machines/1 source; browser real-app pacing restored to real-time (120/16 control-on 33.4 ms p95 vs ~1117 ms before, 3.0 sim s in 3.0 wall s). Full table and caveats in [015](015-connected-world-validation.md); evidence `DevLog/evidence/015-p0.1-connected-step.json` and `015-p0.1-connected-browser.json`.
- Added the requested connected numeric-reference test (shared source group, split/recombine, reflective loads → finite per-port fields, zero residual).
- Validation: 58 headless, 19 browser, build, `git diff --check` all pass.

Still open: ≤16 ms p95 step is unmet for control-on and 16-group connected cases (topology/assembly caching or low-rank phase-trial updates, or a performance cap distinct from the 256 validity bound). P1–P5 not started. Uncommitted.

## 2026-09-13 — Industrial gameplay design iteration C

The user approved the discussion outline and requested documentation of the new design and planning. Created [016](016-coherence-industry-and-lightsail-design.md) for decisions/contracts and [017](017-industrial-gameplay-tranches.md) for A–E delivery gates. Accepted direction links material production to field-assisted processing, develops both beam-drive and sail engineering, replaces global control/qualification with local domains, specializes wave connections, investigates boundary-port reduction and reorganizes the HUD around menus/contextual inspection.

The unanswered setting, manual-tuning and challenge-emphasis questions are recorded as provisional working defaults, not individual user selections. The campaign recommendation is one planet plus an orbital launch layer. Exact recipe balance and mission parameters remain open.

Linked the new authority from 000, 001, 003, 007, 012 and README. The old handoff contracts and historical evidence remain available; 017 replaces their future ordering and accounts for already implemented P0.1 improvements. The existing research catalog/generated diagrams and assets await the scoped implementation passes. No simulation, UI, catalog or asset changes were made.

Documentation validation: local Markdown file targets and whitespace checked. Simulation/build/browser suites were not rerun for this documentation-only change; prior regression/performance evidence is attributed to its recorded checkpoint in 017.


## 2026-09-13 — Fusion energy and shared infrastructure

The user added a NIF-inspired fusion energy pillar and explicitly selected fusion as required for final launch and manufactured fuel cartridges as the initial fuel model. A further instruction requires manufacturing, fusion and propulsion to share infrastructure, equipment and research wherever possible.

Created [018](018-fusion-energy-roadmap.md) with primary-source physics references, proposed equipment/asset families, research dependencies, a shared-platform capability matrix, shot/plant energy accounting and staged delivery. Updated 016/017, the technology/handoff entry points and README. The roadmap separates optical coherence from pulse synchronization/smoothing and separates target ignition from sustained net electricity. D-F1/D-F2 add experimental and energy-plant milestones while preserving the first precision cell as next implementation.

No runtime catalog, recipes, code or assets changed. Remaining choices include commercial target architecture, fuel feedstock access and repetition/cooling balance. Documentation link and change-whitespace checks apply; no simulation tests or new performance claims belong to this planning pass.


## 2026-09-13 — Tranche A research and file-level execution package

The user authorized targeted background research, caching core references, and detailed tranche-A documents/manifests/TODOs. Added [019](019-tranche-a-plan.md) for scope/gates, [020](020-tranche-a-contracts.md) for simulation/persistence/UI contracts, [021](021-tranche-a-coding-tasks.md) for 12 A work packages plus an independent performance investigation, and [022](022-tranche-a-assets.md) for gated cell art production. JSON manifests record coding dependencies and seven asset jobs with 28 proposed selected raster outputs; none has been generated or implemented by this pass.

Resolved planning defaults include exclusive emitter assignment, orthonormal useful/guard target modes, explicit source-group identity, globally bounded local tuning, shared-stock recipe reservations, one cumulative-dose rework attempt, local qualification dependencies, v4 migration and transactional selected blueprints. Dose/cost/thermal numbers remain provisional. The two-cell budget is arithmetic, not a demonstrated route-valid bootstrap or playtest result.

Cached four primary references (laser-processing paper, MIT optics notes, W3C modal pattern, LLNL energy boundary) with URLs, byte counts and SHA-256 checksums under [references/tranche-a](references/tranche-a/README.md). Notes distinguish external evidence from game abstractions. Updated README and 012/014/017 entry points.

Validation: `node scripts/validate-tranche-a-plan.mjs` passes task/asset DAGs, IDs, existing/prerequisite paths, local document links, planned source/measurement status, output counts, analytic example arithmetic and all four cached-file hashes. `node --check scripts/validate-tranche-a-plan.mjs` and `git diff --check` pass. [Planning validation output](evidence/tranche-a-planning-validation.json) is distinct from gameplay evidence. Game code and runtime assets are unchanged; simulation/build/browser suites were not rerun. Human playtesting, actual no-cheat bootstrap and new performance measurements remain implementation gates.


## 2026-09-13 — Tranche A-01 local records and save v4

Implemented the dependency root of [021](021-tranche-a-coding-tasks.md). Extracted the shared simulation types/constants to `src/sim/world-types.ts`, so `ecology.ts` no longer imports the world façade at all. Added `src/sim/persistence.ts` owning `serialize`, all schema validation, the v1/v2/v3→v4 migration and a bounded `ProcessInventory`; `world.ts` keeps a public `serialize` re-export and a thin `deserialize` that delegates to `deserializeCore` then calls `evaluate`. That removes the façade↔persistence runtime cycle.

Replaced the writable `w.target`/`w.controller`/`w.commission` globals with `Target`, `ReferenceBinding`, `ControlDomain` and `Qualification` records plus `frontierTarget`/`frontierDomain`/`frontierQualification` helpers. Per the user's decision this was a full consumer migration: world, ecology, renderer, minimap, tutorial, main and the benchmark fixtures now use the helpers. `world-types.ts` records `version: 4`; v1/v2/v3 saves keep their existing geometry/ecology migration and then gain explicit frontier records (original emitters bind to the frontier target, each reference keeps its own coherence group, original tuners belong to the frontier domain, first valid reference becomes the controller reference, absent reference leaves the domain disabled). **Deliberate behavior change:** loading a `qualified` qualification now marks it `stale` (a partial test resets to `idle`) instead of discarding it to `idle`, matching contract §5/§6; the affected unit and browser expectations were updated.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **66 headless** (58 existing + 8 new in `tests/local-persistence.test.ts`); `npm run build` passes; `npm run test:browser` **19/19**; `git diff --check` clean. `npx tsx scripts/benchmark-connected.ts` and `npm run bench:review` still run. Single-machine smoke numbers only; no performance claim is made for A-01.

Still open (handed to A-02/A-03/A-04): `w.frontier` remains a boolean rather than a `Milestones` record; migrated `target.emitters`/`domain.tuners` are descriptive only because field physics and automatic control still use every powered emitter/tuner until A-02/A-03 make assignment authoritative; qualification signatures/dependencies are empty and reason codes are placeholders; there is no process job yet. **Discrepancy flagged:** the working tree contains an uncommitted gated cell-asset candidate pass (`assets/animations/candidates/tranche-a/`, plus `assets/planning` review tooling and `evidence/tranche-a-asset-validation.json`) that post-dates the planning journal entry claiming no art was generated. The candidate sources are opaque (`production_ready:false`, alpha gate fail) and were deliberately left uncommitted pending A-09/A-10 review, not integrated as A-01 work.



## 2026-09-13 — First precision-cell asset candidates

The user requested starting asset tasks. Read the imagegen skill and used the built-in image tool. Prepared a code-native 3×3 footprint guide and an interactive [review gallery](../assets/planning/tranche-a-review.html) using existing terrain/sprite references. A-05 is not implemented; this is explicitly early candidate work, with production registration and integration still gated.

Generated one intact rotation-0 cell, attempted a targeted alpha correction, then generated an opaque dark-matte version for silhouette review. All three original PNGs and exact prompt/source sidecars are saved under `assets/animations/candidates/tranche-a/`. Every source is 1254×1254 RGB with zero transparent pixels. The first two have painted checkerboards and are rejected for background; v3-matte is a silhouette reference with `needs-alpha` status. No pixels were postprocessed and no candidate was promoted into runtime loading.

Added `scripts/audit-tranche-a-assets.mjs`, measured hashes/alpha, and captured 1280×800 / 1440×1000 review pages plus light/dark/checker/terrain size panels. Browser audit reports zero page errors. Visual inspection finds clear machinery identity at 96px, reduced workpiece readability at 48px and an unacceptable matte rectangle on light/terrain backgrounds. Ground/port/workpiece registration remains unmeasured. Other directions, damage and operation batches remain planned. The next asset action is obtaining actual alpha and validating the master against the playable cell.

Validation for this asset pass: `npm run build`, `node scripts/validate-tranche-a-plan.mjs`, syntax checks and `git diff --check` pass. The candidate audit reports three source hashes verified, zero transparent pixels, and zero browser page errors. Simulation suites were not rerun because no gameplay implementation changed.
