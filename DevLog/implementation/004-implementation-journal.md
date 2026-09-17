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

Implemented the plan in [005 — Ports, routing and presentation](features/005-ports-routing-and-presentation.md): independent art mappings, rotated footprints and port normals, stored grid paths with optional diagonals/waypoints, real material transit/backpressure, explicit generator wires, and geometric phase/loss with a separate bend-radiation ledger. Save v2 retains routes/packets/orientation; legacy layouts migrate when routable. Blueprint capture includes external routes and placement validates before committing.

The range power bus and instant material transfers described above are historical behavior and are superseded. Shared assembly/crystal output, effective optical units, dense solver, and whole-outpost blueprints remain prototype choices. Rotated artwork currently uses canvas rotation; dedicated oblique views are still TODO.

Validation: 30 headless tests and three browser scenarios pass; production build passes. Reviewed starter and rotated-routing screenshots. Added regression coverage for diagonal paths cutting through footprint corners and blueprint route failures leaving the world unchanged. See 005 for current controls, effective bend equations, limitations and next priorities.


## 2026-09-12 — PHIELDWORKS world interaction and onboarding

Applied the user's decisions: direct camera control; tutorial around the established outpost; initially investigating creatures, with aggression gated behind a powered defense and sustained field exposure. Introduced a wired perimeter sentry and a 30-second grace period. Physics and simulation never import presentation/UI modules.

Resource and creature inspection, categorized construction with explicit requirements, minimap/pan/zoom, backdrop dismissal, eleven contextual tutorial lessons, and object-focused diagnostics are implemented. Save v3 restores ecology and supports v1/v2 migration. Main UI, gallery and docs use PHIELDWORKS; the legacy local-storage key remains for compatibility.

Generated the terrain/prop/crawler assets and nine equipment turnaround sheets. Dedicated fixed-camera source rectangles supersede the canvas-rotation fallback recorded above. Opaque output from the image tool required dark-matte assets and runtime compositing; final alpha and animation are art-polish follow-ups. Exact prompts, source provenance and the workspace deliverables are linked from `assets/world-generation-notes.md`.

Final validation: all 35 simulation tests, eight browser scenarios (including the full tutorial with defense and recovery), and the production build pass. See [006](features/006-world-interaction-and-onboarding.md) for final results and next steps.


## 2026-09-12 — Repo recheck and asset continuation

Reviewed committed progress at `5c65d26` with a clean working tree. Continued the requested map/animation/technology art pass in [010](../production/010-map-animation-and-technology-assets.md). Eleven generated source files add four terrain variants, depletion/debris, 48 motion frames, eighteen technology illustrations and eight industrial science packages. Runtime animation follows production/movement state; a cached terrain layer and source-frame metadata keep presentation separate from the core. Technology dependency/status review is an asset-design surface, not a research unlock implementation. Exact prompts and source paths are preserved under assets.

Final asset-pass verification: production build and all 11 browser scenarios pass. Source-frame registration corrected clipped mechanisms without modifying generated PNGs. See 010 and the linked review pages for the delivered assets, prototype limitations and next priorities.


## 2026-09-13 — Devlog reconciliation and route editing

Reconciled the DevLogs against HEAD. The historical test counts (16, 30, 35, 41 headless; 3, 8, 10, 11 browser) were each accurate at their own commit but are stale now: `npm test` passes **51** headless checks and `npm run test:browser` passes **14** scenarios; the production build passes. DevLog 011's S1–S5 checklist was corrected: S1, S2, S4 and the S5 review surface were already committed (`26bc305`, `245fb43`), while the S3 operation/damage-cycle/transported-item sheets are still missing and are silently skipped by the shipping renderer (`generator-cycle-v1`, `sentry-fire-v1`, `transport-items-v1`). A visual-verification queue is recorded in [011](../production/011-equipment-state-and-damage-animation.md).

Continued the pure-coding follow-up from [005](features/005-ports-routing-and-presentation.md): installed routes can now be selected and reshaped in place (`editRoute`, `Renderer.hitRoute`, route inspector card, editing waypoints) without disconnecting, with atomic validation, material-packet clamping/scrap accounting and qualification invalidation. Four headless cases and one browser case were added. Splitters, crossing layers/bridges, paid segments and multi-source power remain open; research, recipes and unlock gates remain out of scope for this pass. Screenshot for vision review: `test-results/route-editing.png`.

Also closed the two [011](../production/011-equipment-state-and-damage-animation.md) verification gaps: `src/state-review.ts` no longer requests the absent `transport-items-v1.png` (item cards render only when the sprite exists, otherwise a labelled placeholder), and the state laboratory now has a browser regression (`tests/browser/assets.spec.ts`, `test-results/equipment-state-lab.png`).

Second coding batch (same day): connected-component power allocation with overload isolation and a provisional wire-capacity ledger (`Stats.overload`/`wireOverload`, diagnostics + ledger rows); prototype caps raised to 120 machines / 400 field ports / 512 links with schema validation; and client-side diagnostics telemetry (rolling target/heat series, sparkline, copyable report). Details and the behavior change are in [005](features/005-ports-routing-and-presentation.md). Current totals: **52 headless**, **16 browser**, production build passing.

Remaining work was left deliberately unfinished and documented as **Open decisions / TBD** in [005](features/005-ports-routing-and-presentation.md): the paid-transport-segment cost formula, splitters/underground crossings/bridges/power poles (need art and are research-gated), true multi-source buses, individual segment deletion, diagnostics gating, and bend calibration. Hard-to-validate items (allocation balance, raised-cap performance, the wire-capacity path without poles) are flagged for later benchmarking/playtest review.


## 2026-09-13 — P0 capacity and solver reliability

A new handoff queue arrived in [012](../planning/012-next-coding-handoffs.md) with a verified failure in [013](../verification/013-verification-review.md): placement/save allowed 400 field ports while `solveNetwork` hard-rejected over 128. Started P0.

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
- Results (M4 Pro): p95 step control-off 18.0→8.5 ms and control-on 191.5→24.3 ms at 120 machines/1 source; browser real-app pacing restored to real-time (120/16 control-on 33.4 ms p95 vs ~1117 ms before, 3.0 sim s in 3.0 wall s). Full table and caveats in [015](../verification/015-connected-world-validation.md); evidence `DevLog/evidence/015-p0.1-connected-step.json` and `015-p0.1-connected-browser.json`.
- Added the requested connected numeric-reference test (shared source group, split/recombine, reflective loads → finite per-port fields, zero residual).
- Validation: 58 headless, 19 browser, build, `git diff --check` all pass.

Still open: ≤16 ms p95 step is unmet for control-on and 16-group connected cases (topology/assembly caching or low-rank phase-trial updates, or a performance cap distinct from the 256 validity bound). P1–P5 not started. Uncommitted.

## 2026-09-13 — Industrial gameplay design iteration C

The user approved the discussion outline and requested documentation of the new design and planning. Created [016](../design/016-coherence-industry-and-lightsail-design.md) for decisions/contracts and [017](../planning/017-industrial-gameplay-tranches.md) for A–E delivery gates. Accepted direction links material production to field-assisted processing, develops both beam-drive and sail engineering, replaces global control/qualification with local domains, specializes wave connections, investigates boundary-port reduction and reorganizes the HUD around menus/contextual inspection.

The unanswered setting, manual-tuning and challenge-emphasis questions are recorded as provisional working defaults, not individual user selections. The campaign recommendation is one planet plus an orbital launch layer. Exact recipe balance and mission parameters remain open.

Linked the new authority from 000, 001, 003, 007, 012 and README. The old handoff contracts and historical evidence remain available; 017 replaces their future ordering and accounts for already implemented P0.1 improvements. The existing research catalog/generated diagrams and assets await the scoped implementation passes. No simulation, UI, catalog or asset changes were made.

Documentation validation: local Markdown file targets and whitespace checked. Simulation/build/browser suites were not rerun for this documentation-only change; prior regression/performance evidence is attributed to its recorded checkpoint in 017.


## 2026-09-13 — Fusion energy and shared infrastructure

The user added a NIF-inspired fusion energy pillar and explicitly selected fusion as required for final launch and manufactured fuel cartridges as the initial fuel model. A further instruction requires manufacturing, fusion and propulsion to share infrastructure, equipment and research wherever possible.

Created [018](../design/018-fusion-energy-roadmap.md) with primary-source physics references, proposed equipment/asset families, research dependencies, a shared-platform capability matrix, shot/plant energy accounting and staged delivery. Updated 016/017, the technology/handoff entry points and README. The roadmap separates optical coherence from pulse synchronization/smoothing and separates target ignition from sustained net electricity. D-F1/D-F2 add experimental and energy-plant milestones while preserving the first precision cell as next implementation.

No runtime catalog, recipes, code or assets changed. Remaining choices include commercial target architecture, fuel feedstock access and repetition/cooling balance. Documentation link and change-whitespace checks apply; no simulation tests or new performance claims belong to this planning pass.


## 2026-09-13 — Tranche A research and file-level execution package

The user authorized targeted background research, caching core references, and detailed tranche-A documents/manifests/TODOs. Added [019](../planning/tranche-a/019-tranche-a-plan.md) for scope/gates, [020](../planning/tranche-a/020-tranche-a-contracts.md) for simulation/persistence/UI contracts, [021](../planning/tranche-a/021-tranche-a-coding-tasks.md) for 12 A work packages plus an independent performance investigation, and [022](../planning/tranche-a/022-tranche-a-assets.md) for gated cell art production. JSON manifests record coding dependencies and seven asset jobs with 28 proposed selected raster outputs; none has been generated or implemented by this pass.

Resolved planning defaults include exclusive emitter assignment, orthonormal useful/guard target modes, explicit source-group identity, globally bounded local tuning, shared-stock recipe reservations, one cumulative-dose rework attempt, local qualification dependencies, v4 migration and transactional selected blueprints. Dose/cost/thermal numbers remain provisional. The two-cell budget is arithmetic, not a demonstrated route-valid bootstrap or playtest result.

Cached four primary references (laser-processing paper, MIT optics notes, W3C modal pattern, LLNL energy boundary) with URLs, byte counts and SHA-256 checksums under [references/tranche-a](../references/tranche-a/README.md). Notes distinguish external evidence from game abstractions. Updated README and 012/014/017 entry points.

Validation: `node scripts/validate-tranche-a-plan.mjs` passes task/asset DAGs, IDs, existing/prerequisite paths, local document links, planned source/measurement status, output counts, analytic example arithmetic and all four cached-file hashes. `node --check scripts/validate-tranche-a-plan.mjs` and `git diff --check` pass. [Planning validation output](../evidence/tranche-a-planning-validation.json) is distinct from gameplay evidence. Game code and runtime assets are unchanged; simulation/build/browser suites were not rerun. Human playtesting, actual no-cheat bootstrap and new performance measurements remain implementation gates.


## 2026-09-13 — Tranche A-01 local records and save v4

Implemented the dependency root of [021](../planning/tranche-a/021-tranche-a-coding-tasks.md). Extracted the shared simulation types/constants to `src/sim/world-types.ts`, so `ecology.ts` no longer imports the world façade at all. Added `src/sim/persistence.ts` owning `serialize`, all schema validation, the v1/v2/v3→v4 migration and a bounded `ProcessInventory`; `world.ts` keeps a public `serialize` re-export and a thin `deserialize` that delegates to `deserializeCore` then calls `evaluate`. That removes the façade↔persistence runtime cycle.

Replaced the writable `w.target`/`w.controller`/`w.commission` globals with `Target`, `ReferenceBinding`, `ControlDomain` and `Qualification` records plus `frontierTarget`/`frontierDomain`/`frontierQualification` helpers. Per the user's decision this was a full consumer migration: world, ecology, renderer, minimap, tutorial, main and the benchmark fixtures now use the helpers. `world-types.ts` records `version: 4`; v1/v2/v3 saves keep their existing geometry/ecology migration and then gain explicit frontier records (original emitters bind to the frontier target, each reference keeps its own coherence group, original tuners belong to the frontier domain, first valid reference becomes the controller reference, absent reference leaves the domain disabled). **Deliberate behavior change:** loading a `qualified` qualification now marks it `stale` (a partial test resets to `idle`) instead of discarding it to `idle`, matching contract §5/§6; the affected unit and browser expectations were updated.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **66 headless** (58 existing + 8 new in `tests/local-persistence.test.ts`); `npm run build` passes; `npm run test:browser` **19/19**; `git diff --check` clean. `npx tsx scripts/benchmark-connected.ts` and `npm run bench:review` still run. Single-machine smoke numbers only; no performance claim is made for A-01.

Still open (handed to A-02/A-03/A-04): `w.frontier` remains a boolean rather than a `Milestones` record; migrated `target.emitters`/`domain.tuners` are descriptive only because field physics and automatic control still use every powered emitter/tuner until A-02/A-03 make assignment authoritative; qualification signatures/dependencies are empty and reason codes are placeholders; there is no process job yet. **Discrepancy flagged:** the working tree contains an uncommitted gated cell-asset candidate pass (`assets/animations/candidates/tranche-a/`, plus `assets/planning` review tooling and `evidence/tranche-a-asset-validation.json`) that post-dates the planning journal entry claiming no art was generated. The candidate sources are opaque (`production_ready:false`, alpha gate fail) and were deliberately left uncommitted pending A-09/A-10 review, not integrated as A-01 work.


## 2026-09-13 — Tranche A-02 conserved target delivery

Added `src/sim/targets.ts`: `coupledField` (reflectance 0.08, radiated fraction 0.92, distance capture), `projectFrontier` (historical single mode with `n=max(2, assigned emitter count)`) and `projectTwoZone` (orthonormal useful/guard modes, generalised so `useful+guard=Σ|x|²` for any emitter count and exactly `u=(x0+x1)/√2`, `v=(x0−x1)/√2` for the standard two). `evaluate` now partitions powered emitters by `target.emitters`, so each emitter delivers to at most one target; unassigned emitters still radiate into `offTarget`. It exposes `stats.targets[id]` (`useful`/`guard`/`captured`/`emitters`), `stats.protectiveAbsorption` and keeps the existing `targetPower`/`offTarget` totals. `assignEmitter(w,id,targetId|null)` moves ownership atomically; `place`/`stampBlueprint` auto-assign to the only frontier target/domain per the agreed default; `remove` releases ownership; the renderer's frontier beams now draw only assigned emitters. `network.ts` and `ecology.ts` were left unchanged: the solver already yields per-group incident fields and wildlife behaviour must not shift.

Deliberate deferral: because A-02 has no process jobs, all process-target potential capture is credited to `protectiveAbsorption`; A-04/A-05 must gate it on the job/exposure state and add workpiece absorption to the cell thermal update exactly once (contract §2). Zero/one-emitter exposure gating remains A-04/A-05 policy.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **75 headless** (66 + 9 new in `tests/process-fields.test.ts`, including the analytic (40,0)/(20,20)/(0,40) phase oracle, unequal inputs, independent-group phase insensitivity, missing emitter, reassignment, two targets and a closing ledger); `npm run build` passes; `npm run test:browser` **19/19**; `git diff --check` clean. The starter frontier fixture is unchanged.




## 2026-09-13 — First precision-cell asset candidates

The user requested starting asset tasks. Read the imagegen skill and used the built-in image tool. Prepared a code-native 3×3 footprint guide and an interactive [review gallery](../../assets/planning/tranche-a-review.html) using existing terrain/sprite references. A-05 is not implemented; this is explicitly early candidate work, with production registration and integration still gated.

Generated one intact rotation-0 cell, attempted a targeted alpha correction, then generated an opaque dark-matte version for silhouette review. All three original PNGs and exact prompt/source sidecars are saved under `assets/animations/candidates/tranche-a/`. Every source is 1254×1254 RGB with zero transparent pixels. The first two have painted checkerboards and are rejected for background; v3-matte is a silhouette reference with `needs-alpha` status. No pixels were postprocessed and no candidate was promoted into runtime loading.

Added `scripts/audit-tranche-a-assets.mjs`, measured hashes/alpha, and captured 1280×800 / 1440×1000 review pages plus light/dark/checker/terrain size panels. Browser audit reports zero page errors. Visual inspection finds clear machinery identity at 96px, reduced workpiece readability at 48px and an unacceptable matte rectangle on light/terrain backgrounds. Ground/port/workpiece registration remains unmeasured. Other directions, damage and operation batches remain planned. The next asset action is obtaining actual alpha and validating the master against the playable cell.

Validation for this asset pass: `npm run build`, `node scripts/validate-tranche-a-plan.mjs`, syntax checks and `git diff --check` pass. The candidate audit reports three source hashes verified, zero transparent pixels, and zero browser page errors. Simulation suites were not rerun because no gameplay implementation changed.


## 2026-09-13 — Corrected precision-cell transparency

The user challenged the premature transparency blocker. Audited existing PNG formats and prior prompts: the original sprite batch and some later sheets contain real alpha, including a documented successful checkerboard-removal edit. Reused the focused extraction approach with the built-in image tool. V4 produced RGBA but tight framing; v5/v6 regressed to checkerboards; v7 extraction from the original matte source retained framing and genuine transparency.

Selected `fabrication-cell-r0-intact-v7-alpha.png` has 1254×1254 RGBA pixels, 52.8551% fully transparent pixels, silhouette bounds [68,110,1135,1080] and no occupied pixels in the outer three-pixel border. The gallery uses ordinary source-over compositing. Visually checked light and game-terrain size panels: no matte rectangle, dark metal remains solid at game scale. Thin source-resolution fringe remains a polish note, and final port/workpiece registration is pending. All seven original outputs and exact prompt/source sidecars are preserved. No runtime art promotion or gameplay edit performed.

Updated review selection, manifest, documentation and alpha assertions. Transparency is resolved for the master; it is no longer a reason to block directional/item candidate work. The existing A-01 commit was observed and left intact.

## 2026-09-13 — Tranche A-03 local control and qualification

Moved automatic control into `src/sim/control.ts`: one world-level budget trial-tunes exactly one eligible tuner per fixed step, round-robin over enabled referenced domains and then that domain's persisted `cursor`; process domains use `useful − 4·guard` while the frontier keeps useful target power. `automaticControl(w,evaluate)` receives the solver as a parameter, so control does not import the world façade, and it returns the exact evaluation count (2, or 3 when the `+` trial wins; the `−` trial already leaves current stats). Added `src/sim/qualification.ts` with the field/electrical dependency closure, a canonical configuration signature that excludes phase/temperature/progress, live operating issues with stable codes, and signature-based `revalidate`. `invalidate` is now dependency-aware, so an unrelated repair on an independent supply leaves other certificates intact; manual `setPhase` explicitly fails the owning domain because phase is outside the signature. `assignTuner`/`assignEmitter`/`setController` validate ownership and reference readiness. Test disturbance is now scoped to tuners owned by a frontier-testing domain; process testing uses ordinary drift. `diagnostics.ts` reports missing/unavailable references and failed/stale certificates with their code.

Honest deferral: process qualification does not accumulate or grant anything yet. `startQualification` snapshots the signature for any domain, but the three-whole-accepted-cycle counter is A-04/A-05 work; a process domain left `testing` stays `testing` and is never auto-qualified by the 20 s frontier timer. Guard/dose codes are defined but only `useful-underdose`/`dependency-changed` are exercised.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **90 headless** (75 + 15 new across `tests/local-control.test.ts` and `tests/local-qualification.test.ts`); `npm run build` passes; `npm run test:browser` **19/19**; `git diff --check` clean.

## 2026-09-13 — Tranche A-04 process lifecycle and inventory

Added `src/sim/process-recipes.ts` (`standard-cell@1`: 2 assemblies + 1 crystal, 8 s active, useful 80–640, guard fraction ≤0.10, 8 s rework; preview catalog untouched) and `src/sim/process.ts`. Reservation debits stock atomically and marks provenance `consumed` only on the first active exposure step. Doses integrate `stats.targets[target].useful/guard` over the clamped remaining active duration; suspension banks no progress. Terminal commit happens exactly once with a monotonic `eventSeq`, and one cumulative-dose rework consumes the owned reject lot atomically (a pre-exposure rework cancel returns the lot). Cancellation, dismantling and destruction share `finalizeLoss`; wildlife and thermal destruction route through `finalizeLostJobs` after damage. `World` gained `jobs`/`eventSeq`; `ProcessLot` gained `owner`/`useful`/`guard`, defaulted on load so A-01-era v4 saves still validate. `world.ts` exposes `reserveProcess`/`cancelProcess`/`reworkProcess` and re-exports `processPreview`/`processBlocker`, and calls the process step after control and before thermal integration. `ecology.ts` needed no change because the world step finalizes any job whose cell died.

Honest deferral: the three-consecutive-accepted-cycle qualification counter is not wired (A-05 integration), no UI reservation surface exists (A-06), and workpiece heat/cell cooling is A-05 so process absorption is not yet added to a cell temperature. Lot capacity is enforced by blocking reservation at the bounded count; automatic merging of identical spent provenance is not implemented.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **104 headless** (90 + 14 new in `tests/process-lifecycle.test.ts`); `npm run build` passes; `npm run test:browser` **19/19**; `git diff --check` clean.

## 2026-09-13 — Tranche A-05 buildable precision cell

Added the `fabrication-cell` kind: 3×3, 18 assemblies, 12 power, no field/material ports and an explicit top-centre `POWER IN`. Placing a cell creates its process target, `useful − 4·guard` control domain and idle qualification; dismantling removes them and converts owned reject lots to scrap. New world commands `setDomainEnabled`/`bindDomainReference`/`beginProcessQualification` keep ownership and reference validation inside the simulator. The step order is now evaluate → control trials → process exposure (which returns per-cell absorbed power) → declared cell cooling `dT/dt = 0.05·P_abs − 0.4·(T−25)` → protection/damage, with `finalizeLostJobs` after both heat and wildlife destruction. The renderer draws a clearly labeled dashed `FAB CELL / PLACEHOLDER` instead of borrowing another sprite, and equipment-state reports the cell as ready/exposing.

`scripts/precision-cell-fixture.ts` plays a fresh expedition with no stock injection: it clears the frontier, mines crystal and assembles the full 75-assembly standalone cell set from production alone, sweeps the real two-zone phase response, produces a failed batch, then completes three accepted cycles under local control and certificate monitoring (`accepted 3`, `qualified true`, remaining crystal 211, remaining assemblies 30). Peak useful delivery was ≈42 units → ≈336 p·s, inside the provisional 80–640 window; no balance constant was changed to force the gate.

Honest limitation: balanced two-emitter coherence keeps `useful + guard` constant across phase, so a recoverable underdose with ≤0.10 guard fraction only exists near the acceptance floor. The fixture therefore demonstrates rejection as an off-phase scrap and recovery to accepted parts; recoverable-reject rework is covered in `tests/process-lifecycle.test.ts`. Cell art is still the unapproved opaque candidate work, not promoted.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **107 headless** (104 + 3 in `tests/precision-cell.test.ts`, including the fixture gate and save/load); `npm run build` passes; `npm run test:browser` **19/19** (state lab now reports 9/10 condition atlases with the placeholder card); `git diff --check` clean.

## 2026-09-13 — Tranche A-06 contextual cell workflow

Added `src/ui/domain-inspector.ts` (certificate status, test counters, signature and stable reason code plus live operating issue) and `src/ui/process-inspector.ts`, which composes it with the cell workflow: batch stage, reserved-vs-consumed material, a textual useful/guard dose forecast against the 80–640 band and 10% guard limit, labeled emitter/tuner selects, manual phase slider, Run once, Run continuously, Auto tune, Start 3-cycle test / Cancel, and the last two results. `fabrication-cell` is now in the build palette; selecting one opens the process inspector, and `main.ts` re-reserves idle continuous cells each simulated frame. The renderer marks process targets with a `WORKPIECE` box and assigned-emitter beams, and `diagnostics.ts` attaches domain faults/certificate codes to the owning cell so `Locate & inspect` selects it. The tutorial gained a skippable final first-cell lesson without changing existing anchor IDs.

The browser spec drives the real UI: place a cell, bind the existing emitter and a built tuner through native selects with keyboard activation, nudge the phase slider with the keyboard, and click Run once to see the real missing-crystal blocker. Full qualified-cell execution remains covered by the A-05 no-injection headless fixture; full keyboard world placement is A-08.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **107 headless**; `npm run build` passes; `npm run test:browser` **21/21** (19 prior + 2 new) with screenshot `test-results/precision-cell-inspector.png`; `git diff --check` clean.

## 2026-09-13 — Tranche A-07 module capture and second cell

Moved blueprint capture, cost and placement into `src/sim/blueprints.ts`. `Blueprint` is now `version:2` with template-local ids plus `targets`/`references`/`domains` and external `slots` (power/reference/controller); runtime inventory, progress, heat, packets and qualifications are stripped, and copied internal sources get a fresh coherence group. Capture works on a selection or the whole outpost and detects excluded reference sources, partially selected tuners and power islands. Placement stages all footprint/route/cost/id validation against a copied draft and commits once, leaving world, `nextId`, bindings and stock untouched on failure; unresolved required slots block unless `allowDisconnected`, which deploys a disabled, never-qualified domain. Frontier identities are never copied, so the original certificate survives while the copy starts idle. A `Select module` tool renders the selection box and excluded crossing routes, and `src/ui/blueprint-inspector.ts` resolves slots. Persistence normalizes old template-geometry blueprints to v2.

Honest deferral: resolving a power slot does not auto-build wires; the copy deploys disconnected until the player wires it (no cost-free external wires). The browser spec covers select/record/place of a whole-outpost template and asserts no certificate transfer; the cell-specific second-commissioning path is covered headlessly.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **115 headless** (107 + 8 in `tests/local-blueprints.test.ts`); `npm run build` passes; `npm run test:browser` **22/22** (21 + `tests/browser/local-blueprints.spec.ts`) with screenshot `test-results/blueprint-selection.png`; `git diff --check` clean.

## 2026-09-13 — Tranche A-08 menu shell and keyboard placement

Added `src/ui/pause-state.ts` with independent `user`/`hidden`/`modal` reasons; the frame gate, runtime status and pause button read it, so closing a modal clears only the modal reason and a user pause survives. Esc now cancels build/route/selection first and otherwise opens a session dialog; native modal Esc is handled by `<dialog>`. Added an operations dialog (`src/ui/operations.ts`) listing control domains, qualifications and recorded modules with Locate buttons plus the read-only research preview (opening the technology map spends nothing). Added a palette search field, focus return to dialog openers, and a keyboard placement cursor: choosing a build focuses the canvas, arrows move the grid cursor, R rotates, Enter places and Esc cancels, while non-build arrows still pan. Hidden-tab pause, copy diagnostics, technology wheel/pan and minimap recenter are unchanged.

Honest gaps: keyboard selection of an arbitrary route's endpoint list is not implemented (equipment inspectors remain the binding surface); the operations Locate for a module switches tools rather than centering a template.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` **115 headless**; `npm run build` passes; `npm run test:browser` **26/26** (22 + 4 in `tests/browser/menus.spec.ts`) with screenshots `test-results/operations-menu.png` and `test-results/keyboard-placement.png`; `git diff --check` clean.

## 2026-09-13 — Tranche A-12 automated completion

Ran the integrated gate and added the automated completion evidence. `npm test` **115**, `npm run build` and `npm run test:browser` **27/27** pass. Added `tests/browser/precision-expedition.spec.ts`, which plays a fresh expedition and manages two independent precision cells (one auto-tuned, one disabled) through the real UI and operations menu, separate from the headless A-05 no-injection qualification fixture. Added `scripts/benchmark-two-cells.ts`: the qualified standalone set is captured and stamped as a blueprint copy with real commands, both domains are enabled, and 600 steps (100 warmup) were measured at p50 0.27 ms / p95 0.49 ms / max 1.12 ms, 60 simulated seconds in 0.19 s wall, residual 0, with both cells converging to identical readings. Evidence files: `DevLog/evidence/tranche-a/two-cell-benchmark.json`, `connected-benchmark.json` and `performance-review.json`. Updated README and 017 with the actual A checkpoint.

Still open and delegated, not claimed: explicit visual review of the cell placeholder at 1280×800/1440×1000 and 48/96 px with real terrain and four rotations, and an unprompted human "explain and fix a failed part" observation. Cell production art (A-09–A-11) remains gated and unapproved. Also fixed the A-07 test expectation (`tests/world.test.ts`) that the A-07 commit missed: placing a disconnected copy leaves the original frontier certificate qualified instead of failing it, matching the A-03 signature-based contract.

Evidence / validation: `npx tsc --noEmit` clean; `npm test` 115; `npm run build`; `npm run test:browser` 27/27; `git diff --check` clean.

## 2026-09-14 — Equipment animation pass 07 integration

Promoted five single-direction equipment clips into gameplay for rotation 0: severe damaged extractor and assembler (plus the light assembler), generator and sentry. New `src/equipment-animation.ts` selects a clip by kind/integrity/rotation; `src/assets.ts` explicitly loads the five pass-07 sources; `src/renderer.ts` draws them with real-alpha source-over using registered source crops and an actual-firing burst timer; `equipment-state.ts` exposes `shotAge`. Damaged chassis holds when stopped or unpowered, generator moves only under a connected load, sentry recoil follows real ecology shots, reduced-motion mode holds frame zero, and loading a world clears burst history. The older matte/lighten path is not used for these clips.

Evidence / validation: `npm test` **117** (115 + 2 in `tests/equipment-animation.test.ts`); `npm run build`; `npm run test:browser` **30/30** (27 + 3 in `tests/browser/equipment-animation.spec.ts`); `git diff --check` clean. Screenshot `test-results/pass-07-gameplay.png`; browser record and validation under `assets/production/pass-07/`; integration notes in [024](../production/024-equipment-animation-continuation.md).

Still open: only rotation 0 is promoted — other directions keep their existing views. Final edge cleanup, the generator's baked cyan display, base/port anchor registration, the reference/tuner/emitter/dump mechanisms and the fabrication-cell family remain. Prototype promotion is not visual approval.

## 2026-09-16 — 026 U-01 shell and geometry

Started the [026 compact UI tranche](../planning/026-compact-ui-tranche.md) with package **U-01**. The 79 px header, 79 px resource bar and 30 px footer are replaced by one 40 px status bar: the existing logo mark is now the session-menu opener, resources are icon+value chips (`#assemblies`, `#power`, `#target`, `#crystal`), and pause/speed plus a diagnostics badge stay directly reachable while manufactured total, elapsed time, save/load/new, tutorial and manual moved behind the logo menu (`#menu` → `#session`, wired to existing `saveGame`/`loadGame`/`requestNewGame` paths). The persistent 328 px sidebar is gone: the inspector now lives in a fixed right drawer absent without a selection (`#inspector-drawer`, `#close-inspector`), objectives/commissioning collapsed into a compact `#objective-toggle` chip that expands a small panel, and energy accounting + expedition log moved into the diagnostics panel. `revealInspector()` now opens the drawer instead of scrolling a column, and a `drawerDismissed` flag keeps the 150 ms render loop from reopening it.

`Renderer.resize()` is dimensions-only and `Renderer.fit()` recomputes the intrinsic scale; `start()` calls `fit()` so the initial framing uses the settled canvas size, and `resizeViewport()` compensates pan on window resize to keep the world center and pixels-per-tile. The tutorial panel now reserves drawer width when clamping its position so it cannot be covered.

Evidence / validation: `npm test` **120**; `npm run build` passes; `npm run test:browser` **31/31**; `git diff --check` clean. Geometry and camera evidence: `DevLog/evidence/ui-cleanup/u01-geometry.json` (camera preserved on selection at 1024×768, 1366×768, 1440×1000, 1920×1080; DPR 2 backing store 2732×674 for 1366×337 CSS). Interim screenshots `DevLog/verification/ui-cleanup/u01-after-{1024x768,1366x768,1440x1000}.png`. Raw canvas share improved from 24.7%→43.9% (1366×768), 32.5%→56.9% (1440×1000), 23.3%→44.4% (1024×768), 38.5%→60.1% (1920×1080).

Still open (this is an interim package, not visual approval): the 345 px build dock, full-width map toolbar, expanded minimap/legend, idle hint sentence and tutorial overlays still consume area, so the ≥85% / ≥82% normal-state budgets are **not** met yet — U-02/U-03/U-04 own those. No independent visual review has been performed; 025's P0/P1 findings on the build strip, objective workflow, text reduction and minimap remain.

## 2026-09-16 — 026 U-02 through U-07 compact HUD, onboarding and secondary screens

**U-02 icon build strip and map controls.** The 345 px dock became a 48 px single-row strip of ten icon buttons (art + numeric cost + shortcut badge 1–9, distinct ▣ fallback glyph for the fabrication cell) with a catalog opener; search, categories and requirements moved into a dismissible anchored `#catalog-popover` that filters by category AND query. All nine map tools became a floating 32 px icon row (inspect, field/material/power routing, module, blueprint, field view, grid, home) with aria-pressed state and accessible names. The minimap collapsed to a one-click toggle with a 144×84 expanded map. `#map-hint` now only shows an active build/route/edit cue. `Renderer.defaultScale()` fits the whole 64×36 world so a taller canvas exposes more terrain instead of zooming in.

**U-03 contextual inspector.** The equipment drawer leads with status rows and primary controls (phase, protection, repair/recover) and collapses ports/routes and requirements into `<details>` groups; the cell inspector leads with stage, assignments, phase and run/test controls, replaces the forecast paragraph with labeled useful/guard/fraction/predicted rows, and collapses the control domain and results. Open groups survive rebuilds, and rebuilds pause while an input/select inside the drawer has focus so slider drags and select values are not reset.

**U-04 text reduction and onboarding.** First launch now offers a 260×43 Start/Skip invitation with persisted state; lessons are one short sentence with progress/next/back and anchors repointed to always-visible openers. The tutorial panel is non-interactive except its buttons so it cannot block world clicks, and it clamps below the status bar and left of the drawer. The canvas sector ribbon and permanent route legend are removed; deposit and workpiece labels reveal on hover/selection/overlay while faults and port labels stay.

**U-05 input and accessibility.** Escape priority is popover → tool/route cancel → drawer close → session menu, handled before the input guard so it works while the catalog search has focus; Space no longer hijacks a focused button. Icon buttons carry meaningful names, tooltips and aria-pressed/expanded.

**U-06 secondary screens.** Technology/production modal headers, toolbars, footers and the footnote were compacted, legends moved behind a Legend toggle and the footnote behind a details summary, and the detail hero art reduced. Diagnostic rows now lead with severity/title/object plus a Locate action and expand the remedy on demand.

**U-07 regression evidence.** Added `tests/browser/compact-hud.spec.ts` (accessible names/pressed state, Escape priority, keyboard-only placement round trip, no-scroll/clipping at required viewports incl. 1093×614, exposed-area and minimap-cost budgets, no-error check with hidden panels out of tab order, DPR 2 backing store) and updated icon locators in the existing specs. Evidence: `DevLog/evidence/ui-cleanup/{u01-geometry,u02-area,u04-onboarding,u06-secondary-screens,u07-regression}.json`; screenshots under `DevLog/verification/ui-cleanup/`.

Validation: `npm test` **120**; `npm run build`; `npm run test:browser` **38/38**; `git diff --check` clean. Measured: normal exposed area 86.1% / 89.4% / 90.6% / 85.5% and active-build 85.3% at 1366×768 / 1440×1000 / 1920×1080 / 1024×768; inspecting 68.2% / 63.5%; invitation and lesson within 260×64 and 280×160; expanded minimap cost 1.7 pp; technology +26.5% and production +23.2% viewport area at 1366×768.

Still open / not claimed: **U-08 independent visual and interaction acceptance has not run**; automated numbers and screenshots are not visual approval. Node geometry in the graphs was not resized (chrome only), and the independent review of label readability at edges is outstanding. No simulation, balance, save format or art-promotion gate is changed.

## 2026-09-16 — Pass 08 reference/dump animation promotion

On user request, inspected the pass-08 candidate sheets and promoted the two accepted v2 clips. Decoded both 1254×1254 RGBA sheets: registered source rects sit inside their cells with 3 px alpha padding, occupancy is 43–47% of each quadrant, chassis drift is ≤0.94 px at 96 px, and adjacent frames differ meaningfully in the mechanism (reference stabilizer collar and dump fan), so `reference-r0-cycle-v2` and `dump-r0-cycle-v2` are loaded for rotation 0, intact condition. v1 stays unpromoted. `assets/production/pass-08/runtime-clips.json` records the registration and promotion status; `src/assets.ts` loads only those two files via an explicit glob; `src/equipment-animation.ts` merges them and gates reference on actual source field and dump on powered cooling, with unpowered/tripped falling back to dark condition art and idle/UNCOOLED holding frame zero. All motion is driven by `world.time`, so pause freezes and reduced motion holds frame zero. No simulation, balance, save, footprint or port change.

Evidence / validation: `npm test` **121** (120 + gating unit test); `npm run build`; `npm run test:browser` `equipment-animation.spec.ts` **6/6** (pass-08 source-over render, advance, pause freeze, reduced-motion frame zero); in-world reference and dump captures inspected for scale and anchor. Evidence file `DevLog/evidence/028-pass-08-promotion.json`; provenance in [027](../production/027-equipment-animation-audit.md#2026-09-16-follow-up--pass-08-v2-promoted-coding).

Still open: independent visual acceptance of the promoted clips (this was a coding-agent inspection, not the AN-02/AN-03 reviewer gate); directions 1–3; damaged/off variants and the full 028 validation matrix.

## 2026-09-16 — 029 R-01 through R-06 physical wave logistics (first delivery, partial)

Implemented the physical-piece foundation of [029](../planning/029-early-game-wave-logistics-handoff.md) on top of the integrated head (`aa976c9`) with schema `v5`. A note on shared-workspace hygiene: the asset agent concurrently added `031`/`032` and edited `029`/`briefing`/`README`s under `DevLog/` and `assets/production/pass-09|10/`; those files were preserved and not touched.

**R-01 data contract and balance fixture.** New `src/sim/wave-parts.ts` defines versioned starter and precision hardware (basic straight, compact/swept elbow, basic junction, crossing, precision elbow, matched junction) with explicit local port geometry, a frozen `GUIDE_INTERFACE` connector cross section (032), passive scattering matrices, recipes and recovery. `scripts/wave-logistics-fixture.ts` builds a two-branch cell from a declared initial stock and cleared-frontier precondition, then earns precision output through real accepted cycles, manufactures a precision elbow and matched junction through a real assembler tooling job, replaces the lossy bend and imbalanced junction, and re-measures on the identical source/target/recipe/duration. Frozen result: basic useful/source ratio 0.1998 → upgraded 0.2589, **+29.6%**, 12 accepted cycles, layout qualified. Provisional coefficients chosen to clear the ≥15% gate (basic elbow loss 0.09/r 0.10, basic junction loss 0.12/imbalance +0.14 rad; precision elbow loss 0.012, matched junction loss 0.02). Evidence `DevLog/evidence/wave-logistics/r01-balance-fixture.json`.

**R-02 construction/editing.** New `src/sim/wave-construction.ts` compiles a validated half-tile path into one piece per maximal straight run plus one elbow per corner (never double-charging a run as bend), with explicit piece-to-piece/endpoint interfaces, swept-bend obstruction checks, parallel-shared-run rejection and an atomic preview/commit BOM transaction. `replacePiece` preserves IDs/neighbours, consumes manufactured inventory and applies the declared recovery rule; `removePiece` opens only its path and recycles the piece. `commitFieldRoute` now keeps the preview's promised route id.

**R-03 physics/diagnostics.** `evaluate` now instantiates one passive `Component` per installed piece plus junction variants (`Entity.variant`) and the new `crossing` kind, linked through the explicit interface list; zero-reflection parts report return loss as infinity. Added exact `compose2Port` serial composition. Verified passivity for arbitrary inputs, crossing layer isolation, a bend-forcing route's real loss, and explicit-vs-composed agreement at 1e-9.

**R-04 persistence/copy/qualification.** Save schema advanced to `v5` (v1–v4 migrate, defaulting new fields); piece arrays, interfaces, `unlocked`, `hardware` and `manufacture` are bounded-validated and every piece must belong to a link. Configuration signatures now include piece definitions/versions/topology so replacing hardware invalidates only dependent qualifications. Blueprints capture internal pieces and precision hardware, and stamping assigns fresh piece/entity ids and consumes hardware.

**R-05 manufacture.** `process.accepted` stays lifetime history; an accepted event now also grants exactly one spendable `stock.precision` and unlocks the two recipes once. New `src/sim/manufacture.ts` adds assembler tooling mode with reserved inputs, finite time, suspension on power/mode loss, refund-before-consumption/scrap-after, exactly-once delivery and reload-resumes-once semantics; `installVariant` installs matched junction hardware.

**R-06 routing interaction (partial).** A new `Wave guide` tool (`#tool-guide`) previews the compiled pieces, BOM and sweep/affordability errors while dragging and commits atomically; the legacy `field` tool is retained for compatibility so existing frontier/local-cell scenarios still build. Pieces render with distinct straight/bend and basic/precision treatment, are selectable, and expose a piece inspector with loss/return readings, replace and delete. Assembler inspectors expose tooling mode and recipe manufacture, and the status bar shows spendable precision.

Validation: `npm test` **143** (new `tests/wave-logistics.test.ts`, `wave-blueprints.test.ts`, `wave-manufacture.test.ts`, `wave-logistics-fixture.test.ts`); `npm run build` passes; `npm run test:browser` **40/40** (updated the state-lab kind count for the new `crossing` kind); `git diff --check` clean; `npm run bench:review` world-step p95 ≤0.08 ms on the existing fixture (`DevLog/evidence/wave-logistics/solver-world-bench.json`).

Still open (not claimed): **R-07 guided scenario/tutorial is not implemented**; R-08 local cell belts; R-09 integrated route-heavy benchmark and the delivered-fixture ≤16 ms gate; R-10 parent multimodal validation. R-06 gaps: the 032 seam contract is frozen only at the data level (no renderer-owned joint sleeves/caps or registered art), crossing art is not generated and reuses the junction silhouette, drag preview does not re-derive swept occupancy per hover for very large routes, and no automated browser guide-flow test exists. The R-01 fixture has declared stock/frontier preconditions and is a provisional balance gate, not a full no-injection expedition; the source self-heating from reflections that tripped protection at high-reflection coefficients is recorded as a balance consequence and avoided by the provisional coefficients, not solved generally.

## 2026-09-16 — 034 feedback: P9 finite-bend contract, straight-art registration, bend choice

Planning/asset feedback arrived as [034](../planning/034-wave-hardware-integration-decisions.md), [035 verification](../verification/035-runtime-kit-asset-handoff.md) and the pass-11 kit. This pass implements the ordered coding handoff items 1–2 and part of 5; items 3–4 remain open because the generated sheets are not seam-qualified.

**P9 finite-bend construction (P0).** `piecePorts()` no longer collapses an elbow to one point. A bend now declares a finite reach (compact .5 tile, swept 1 tile, precision .5) and consumes it from both adjacent runs, so its two terminals are distinct and `removePiece` leaves a real gap (verified by test). Reach is clamped to `min(canonical, inLeg/2, outLeg/2)` for short legs, which keeps adjacent bends valid and every trimmed straight an exact multiple of a half tile. `spans` is validated as a multiple of 0.5 and piece anchors as quarter-tile (`x*4` integer) to hold trimmed ends exactly; `pieceCost` rounds fractional trimmed runs up to whole assemblies. Persistence validates `reach` for elbows and rejects it on straights. Exported template/semantics evidence: `DevLog/evidence/wave-logistics/p9-finite-bend-templates.json`.

**P2 straight-basic art + P7 composition.** Added `src/wave-kit.ts` with the four pass-11 straight poses (0.0075 tile/source pixel, 32 px = 0.24-tile width, 128 px = 0.96-tile period) and `hasRegisteredSprite` (intact basic straights only). `src/assets.ts` loads only `pass-11-runtime-kit/connected-kit-atlas.png` behind an explicit glob. `Renderer.drawStraightSprite` is the coding-owned composition: world-phase-fixed `.96`-tile tiles cropped to the installed length, transverse-centred, never rotated or stretched, with a truthful native fallback when the atlas is absent. Elbows stay native because the swept/junction/crossing sources are unregistered candidates and the elbow sheets are not seam-qualified.

**P4 bend choice.** The guide tool's `B` now toggles compact↔swept (swept uses the larger footprint/clearance template and native fallback), while other tools keep the sharp/rounded toggle. The map hint and live BOM preview reflect the selection.

**P6/P7 deferred.** Crossing stays out of the build strip: its offset independent-channel source is a concept sheet with no measured rects, and P6 requires registered art before palette exposure. Terminal mouths/sockets/sleeves and condition decals 1–3 remain unqualified; no unconditional bridging or decorative damage is drawn.

Validation: `npm test` **146** (P9 terminal/gap and short-leg tests, wave-kit registration test); `npm run build`; `npm run test:browser` **42/42** (new `tests/browser/wave-guide.spec.ts` builds a physical route through the UI with the registered atlas and exercises the compact/swept preview); `git diff --check` clean. R-01 fixture re-run: basic→upgraded useful/source **+29.4%**, 12 accepted cycles, qualified (evidence refreshed). Screenshot `test-results/wave-guide-route.png` (gitignored).

Still open: pass-11 elbow/junction/crossing registration and the full assembled seam matrix (033/035); condition overlays; terminal/sleeve composition; P6 crossing buildability; R-07 guided scenario; R-09 delivered-fixture timing. P9 changes the geometry of physical pieces, so any pre-existing uncommitted v5 physical save without `reach` is rejected on load — no released save is affected.
