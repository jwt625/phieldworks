# Tranche A — file-level coding TODO

2026-09-13. Gameplay work below remains **planned**. A-09/A-10 have begun limited geometry/candidate review; see [022](022-tranche-a-assets.md). Read [019](019-tranche-a-plan.md) and [020](020-tranche-a-contracts.md) first. [JSON task manifest](../tranche-a-tasks.json) carries the same task IDs and dependency graph. Deliver small reviewable commits; keep `world.ts` integrations sequential where tasks touch the same functions. No subagent execution is requested by this checklist.

## A-01 — local records and persistence

- [x] Extract shared types into `src/sim/world-types.ts`, avoiding a runtime circular import from ecology/process modules back into the world façade.
- [x] Move schema normalization/validation into `src/sim/persistence.ts`; keep public serialize/deserialize exports stable during transition.
- [x] Add local target/domain/reference/qualification records and bounded process inventory fields. Migrate v1/v2/v3 saves through their existing geometry/ecology rules into v4.
- [x] Replace writable global target/controller/commission state; temporary read adapters must derive from the frontier domain, not maintain a second authority.
- [x] Update ecology target lookup and introduce fixtures for absent reference, stale certificate, legacy blueprint, invalid identities and old malformed saves.

Files: `world.ts`, `world-types.ts`, `persistence.ts`, `ecology.ts`; new `tests/local-persistence.test.ts`. Gate: runtime build and existing frontier tests pass before changing process physics. A transitional record may have no process jobs, but v4 loader changes in A-04 must retain compatibility with these saves.

**A-01 implementation note — 2026-09-13.** Implemented on baseline `cd002b4` (planning package committed first). `World.version` is now `4` with `targets`, `references`, `domains`, `qualifications` and a bounded `process` inventory; `w.target`/`w.controller`/`w.commission` are gone and all consumers (world, ecology, renderer, minimap, tutorial, main, benchmark fixtures) read `frontierTarget`/`frontierDomain`/`frontierQualification`. Per the user's direction this was a full consumer migration, not temporary getters. `persistence.ts` imports no world runtime and `world.ts` exports a thin `deserialize` that delegates normalization/migration to `deserializeCore` then calls `evaluate`, so the façade↔persistence runtime cycle is avoided.

Deliberate behavior change: loading any save with a `qualified` qualification now sets it to `stale` (partial tests reset to `idle`), per contract §5/§6. The previous loader discarded the certificate to `idle`. Tests and browser specs were updated accordingly.

Honest gaps left for later tasks: `w.frontier` is still a boolean milestone rather than a `Milestones` record; migration fills `target.emitters` and `domain.tuners` but field physics and automatic control still operate on all powered emitters/tuners until A-02/A-03 make the assignment authoritative; qualification `signature`/`dependencies` are empty and reason `code`s are only `dependency-changed`/empty until A-03. `frontierQualification.minimum` uses `-1` as the "no sample" sentinel because `Infinity` is not JSON-safe.

## A-02 — target delivery

- [x] Add pure field projection in `src/sim/targets.ts` using the two-zone equations in 020.
- [x] Route each emitter to only one target, aggregate independent source groups correctly, expose target-specific readings and world totals.
- [x] Preserve frontier projection for its assigned emitters. Update renderer/ecology lookups without changing wildlife behavior as a side effect.
- [x] Count missed radiation, emitter local heat, protective absorption and process heat exactly once. Invalid field solve suspends processing with a fault; never continue using an old successful result.
- [x] Write analytic phase cases, unequal inputs, different groups, missing emitter, reassigning emitter, two targets and integrated ledger tests in `tests/process-fields.test.ts`.

`network.ts` supplies per-group fields; avoid rewriting its LU/block solver in this task. Gate: constant captured power for analytic phase sweep, bounded target sum and unchanged starter field fixture.

**A-02 implementation note — 2026-09-13.** Added `src/sim/targets.ts` with `captureEfficiency`/`coupledField`, the frontier single-mode projection (`n = max(2, assigned emitter count)`) and the process two-mode projection `u=(x0+x1)/√2`, `v=(x0−x1)/√2` generalised as `useful=|Σx|²/n`, `guard=Σ|x−mean|²` so `useful+guard=Σ|x|²` for any count. `evaluate` now partitions emitters by `target.emitters`, builds per-target per-group coupled fields, and reports `stats.targets[id]` plus `stats.protectiveAbsorption` alongside the existing world totals. The frontier fixture is unchanged because every original emitter is assigned and `projectFrontier` reproduces the old denominator. `network.ts` was **not** modified: its existing `ports[id][0].fields[group].a` already supplies the incident per-group amplitude the contract asks for, and the LU/block solver is untouched as instructed.

Emitter ownership: `assignEmitter(w,id,targetId|null)` moves an emitter between targets atomically; `place` and `stampBlueprint` auto-assign new emitters to the frontier while it is the only target (and new tuners to the only domain), and `remove` releases ownership. This is the transitional default agreed with the user; A-07 will bind copied cells to their own targets.

Deferred honestly: process/workpiece heat and shutter behaviour are not wired because there are no process jobs yet; `protectiveAbsorption` currently receives all process-target potential capture (no exposure can be active in A-02), and A-04/A-05 must make that conditional on the job state and add workpiece absorption to the cell thermal update exactly once. Zero/one-emitter exposure gating is likewise A-04/A-05 policy; A-02 only reports the bounded reading.

## A-03 — control and qualification

- [x] Move automatic control into `src/sim/control.ts`; commands validate ownership before any mutation.
- [x] Implement global fair trial scheduling with one selected tuner per world step. Domain cursor and restored trial stats must agree after plus/minus comparisons.
- [x] Add `src/sim/qualification.ts` for dependency closures, configuration signatures, current validity and stable reason codes. Keep cache invalidation separate.
- [x] Preserve frontier acceptance requirements; process qualification tracks three new whole accepted cycles once A-04 supplies events.
- [x] Remove global test-induced thermal drift from unrelated tuners; any test disturbance applies only to the declared domain and is recorded in the test contract. Use ordinary drift for the initial process qualification.
- [x] Test ownership conflicts, on/off independence, deterministic scheduling/load, unrelated repair, shared source and changed power load. Snapshot material/job/event/thermal state around trial evaluation.

Files: `world.ts`, `control.ts`, `qualification.ts`, `diagnostics.ts`; `tests/local-control.test.ts`, `tests/local-qualification.test.ts`. Gate: two domains retain separate state with bounded evaluation count. A-03 process-outcome hooks are completed with A-05 integration, not marked working early.

**A-03 implementation note — 2026-09-13.** `control.ts` owns one world-level scheduling budget: one eligible tuner is trial-tuned per fixed step, round-robin over enabled referenced domains (`floor(time/dt) % domains`) and then that domain's persisted `cursor`. `automaticControl(w,evaluate)` takes the solver as a parameter so `control.ts` does not import the world façade, and it returns the exact evaluation count (2, or 3 when the `+` trial wins because the `-` trial already left current stats). Process domains use the `useful − 4·guard` objective; frontier keeps useful target power. `qualification.ts` computes the field/electrical dependency closure, a canonical configuration signature that excludes phase/temperature/progress, and live operating issues with stable codes. `invalidate` now revalidates by signature, so an unrelated repair on an independent supply leaves other certificates intact; manual `setPhase` explicitly fails the owning domain even though phase is outside the signature. `assignTuner`/`assignEmitter`/`setController` validate ownership and reference readiness before mutating. Per-domain test disturbance means only tuners owned by a frontier-testing domain get the artificial 4·sin drift; process testing uses ordinary drift. `diagnostics.ts` now reports missing/unavailable references and failed/stale certificates with their code.

Honest deferral: process qualification does not accumulate or grant anything yet. `startQualification` snapshots the signature for any domain, but the three-whole-accepted-cycle counter is A-04/A-05 work; a process domain left `testing` stays `testing` and is never auto-qualified by the 20 s frontier timer. Guard/dose reason codes are defined but only the frontier `useful-underdose`/`dependency-changed` paths are exercised.

## A-04 — process lifecycle and inventory

- [x] Add versioned starter recipe constants to `src/sim/process-recipes.ts`. Keep the preview catalog untouched.
- [x] Add `src/sim/process.ts` with atomic reservation, consume-on-first-exposure, dose accumulation, suspend/resume, terminal commit and one cumulative-dose rework.
- [x] Store batch provenance and separate process waste from legacy scrap. Enforce capacity before consuming inputs; expose full storage as a blocker.
- [x] Clamp final exposure integration to the remaining active duration rather than integrating a whole step beyond eight seconds. Do not bank progress while suspended.
- [x] Finalize batch loss through one helper from thermal destruction, wildlife destruction, dismantling and cancellation.
- [x] Extend persistence validation/roundtrip fixtures to all stages, terminal-event boundaries and rework ownership.
- [x] Test missing one ingredient, two simultaneous cells competing for last stock, double cancel/complete, no-dose batch, threshold boundaries, changed dt partition, pause, repair, reload and exhausted reject storage.

Files: `process.ts`, `process-recipes.ts`, `world.ts`, `ecology.ts`, `persistence.ts`; `tests/process-lifecycle.test.ts`. Gate: batch/output audit closes across every interruption; no positive result from a pure preview.

**A-04 implementation note — 2026-09-13.** `process-recipes.ts` holds the versioned `standard-cell@1` constants (2 assemblies + 1 crystal, 8 s, useful 80–640, guard fraction ≤0.10, 8 s rework); the preview catalog is untouched. `process.ts` owns reservation (stock debited immediately, provenance marked `consumed` only on the first active exposure step), dose integration reading `stats.targets[target].useful/guard`, suspension with no banked progress, terminal commit once with a monotonic `eventSeq`, one cumulative-dose rework that consumes the owned reject lot atomically, and a single `finalizeLoss` path used by cancellation, dismantling and destruction. The final tick clamps `activeDt` to the remaining duration. `World` gained `jobs` and `eventSeq`; `ProcessLot` gained `owner`/`useful`/`guard`, all defaulted on load so A-01-era v4 saves still validate. `world.ts` exposes `reserveProcess`/`cancelProcess`/`reworkProcess` plus `processPreview`/`processBlocker`, calls the process step after control and before thermal integration, and finalizes lost jobs after heat and wildlife destruction. `ecology.ts` needed no change: wildlife sets health to zero and the world step routes that through `finalizeLostJobs`, so both destruction paths share the helper.

Honest deferral: process qualification still does not consume completed-cycle events (three consecutive accepted cycles remain A-05 integration), and no UI/reservation surface exists yet (A-06). Workpiece heat/cell cooling is A-05, so `finalizeLoss` covers loss but process thermal absorption is not yet added to a cell's temperature. `ProcessLot` capacity is enforced by blocking reservation at the bounded lot count; automatic merging of identical spent provenance summaries is not implemented.

## A-05 — buildable first cell

- [x] Add `fabrication-cell` to Kind/DEFS with 3×3 footprint, 18-assembly cost, 12-unit feed and no wave/material routing ports.
- [x] Define explicit power-port placement in geometry; preserve existing kinds' port locations and four rotations.
- [x] Add target/job creation and deletion to world commands. Integrate target absorption with declared cell cooling and process step ordering.
- [x] Use a visibly labeled placeholder in `presentation.ts`/renderer until reviewed art exists; do not accidentally fall back to an unrelated generator sprite.
- [x] Add a reusable no-stock-injection fixture in `scripts/precision-cell-fixture.ts` that starts with `createWorld`, completes frontier/crystal access, builds legal routes, makes a reject, recovers and makes accepted parts.
- [x] Audit actual resource spend, remaining recovery stock, input power, useful/guard margins and thermal equilibrium; revise provisional constants if needed and document the measured reason.

Files: definitions, geometry, world, equipment-state, presentation; `tests/precision-cell.test.ts`. Gate: complete three valid standard cycles under local control and certificate monitoring. A failure in this fixture blocks production-art generation, not merely the final test report.

**A-05 implementation note — 2026-09-13.** `fabrication-cell` is a 3×3, 18-assembly, 12-power load with no field or material ports and an explicit top-centre `POWER IN` `(1.5,0)` normal `(0,−1)` per 022. Placing one creates its process target, control domain (`useful − 4·guard`) and idle qualification; dismantling removes them and converts owned reject lots to scrap. `setDomainEnabled`, `bindDomainReference` and `beginProcessQualification` are the world commands that keep ownership/reference validation in the simulator. A cell absorbs its target's captured power; step order is evaluate → control trials → process exposure (returning per-cell absorbed power) → declared cell cooling `dT/dt = 0.05·P_abs − 0.4·(T−25)` → protection/damage, with `finalizeLostJobs` after both heat and wildlife destruction. Renderer draws an explicit dashed `FAB CELL / PLACEHOLDER` card for the kind instead of borrowing another sprite; equipment-state reports the cell as ready/exposing.

Measured fixture (same machine, `scripts/precision-cell-fixture.ts`, no stock injection): a fresh `createWorld` playthrough reached the frontier, mined crystal and assembled the full 75-assembly standalone cell set from production alone, swept two-zone phase, produced one failed batch off-phase, then completed **three accepted cycles** and a qualified local certificate (`accepted 3`, `qualified true`, remaining crystal 211, remaining assemblies 30). Peak useful delivery over the sweep was ≈42 power units → ≈336 power·seconds, comfortably inside the 80–640 acceptance window with room on both sides; the provisional dose/guard constants were therefore **not** changed, and no constant was tuned to make the test pass.

Honest limitation: with balanced two-emitter coherence, `useful + guard` is constant across phase, so a *recoverable* underdose with a ≤0.10 guard fraction only exists when captured power sits near the acceptance floor. The fixture therefore demonstrates rejection as an off-phase scrap and recovery to accepted parts; the recoverable-reject → rework path is covered by `tests/process-lifecycle.test.ts`. Reviewed cell art remains A-09/A-11 (the candidate pass is still opaque and unapproved).

## A-06 — contextual workflow

- [x] Build `src/ui/process-inspector.ts` and `domain-inspector.ts`; expose labeled assignment selectors, manual phase values, Run once/continuous, Auto tune, test/cancel and last two results.
- [x] Add useful/guard/dose preview and an accessible textual equivalent. Explain ingredients reserved versus consumed and distinguish current readiness from certificate validity.
- [x] Route diagnostics to the selected owner; use stable reason codes from simulation.
- [x] Update tutorial to use local frontier records and add a skippable first-cell lesson. Keep existing tutorial anchor IDs through the transition or update them and browser tests together.
- [x] Browser test the actual interaction path, not direct world manipulation masquerading as user completion.

Files: main, style, renderer, tutorial, diagnostics; new inspectors and `tests/browser/precision-cell.spec.ts`. Gate: a keyboard user can select/bind/tune/run/inspect a placed cell; full keyboard placement lands in A-08.

**A-06 implementation note — 2026-09-13.** `domain-inspector.ts` renders the certificate/operating block (status, test counters, stable reason code) and `process-inspector.ts` composes it with the cell workflow: batch stage, reserved-vs-consumed material, a textual useful/guard dose forecast against the 80–640 band and 10% guard limit, labeled emitter/tuner selects, a manual phase slider, Run once, Run continuously, Auto tune, Start 3-cycle test / Cancel, and the last two results. A placed `fabrication-cell` is now in the build palette and selecting it routes to the process inspector; `main.ts` owns a `continuousTargets` set that re-reserves an idle cell each simulated frame. The renderer marks process targets as `WORKPIECE` boxes with assigned-emitter beams. `diagnostics.ts` now attaches domain faults and certificate codes to the owning cell so `Locate & inspect` selects it. The tutorial gained a skippable final `precision cell` lesson while keeping every existing anchor ID.

Honest deferral: full keyboard world placement/navigation is A-08. The browser spec places with the mouse and then uses native keyboard activation for selection, assignment, tuning and Run; the full qualified run is proven by the headless fixture, and the browser "Run once" path intentionally demonstrates the missing-crystal blocker rather than a completed cell.

## A-07 — module capture and second cell

- [x] Extract blueprint commands into `src/sim/blueprints.ts` with selection bounds and included-domain checks.
- [x] Create fresh keys for entities, sources/groups, targets and domains. Strip jobs, stock, telemetry and qualification.
- [x] Render selection and excluded crossing routes. Add external binding resolution to `src/ui/blueprint-inspector.ts`.
- [x] Stage all placement validations, route geometry, costs and ownership before applying one commit. Never mutate shared nested arrays through a shallow draft world.
- [x] Test unresolved and occupied external slots, disconnected deployment, blocked footprint/route, exhausted stock, ID rollback, source independence, old blueprints and second-cell commissioning.

Files: world, persistence, renderer, main; new blueprint modules, `tests/local-blueprints.test.ts` and browser counterpart. Gate: original cell keeps working and its inventory/certificate do not transfer to the copy.

**A-07 implementation note — 2026-09-13.** `src/sim/blueprints.ts` now owns capture, cost and transactional placement. A blueprint is `version:2` with template-local entity/link ids plus `targets`, `references`, `domains` and external `slots` (`power`/`reference`/`controller`); runtime inventory, progress, heat, packets, ratings and qualifications are stripped, and a copied internal source always gets a fresh coherence group equal to its new source id. Capture accepts a selection (or the whole outpost) and detects an included domain whose reference source is excluded (`reference` slot), partially selected tuners (`controller` slot) and power islands without an included generator (`power` slot). Placement stages every footprint, route, cost and id against a copied draft; on any failure the world, `nextId`, bindings and stock are untouched. Unresolved required slots block placement unless `allowDisconnected`, which deploys a disabled/stale domain that can never be qualified. Frontier targets/domains are never copied as internal identities, so the original certificate is unaffected while the copy's new qualification is idle. `src/ui/blueprint-inspector.ts` plus a `Select module` tool render the selection box, highlight excluded crossing routes and let the user resolve slots or deploy disconnected. Persistence treats a pre-v2 (old) blueprint as template geometry and normalizes it to v2 with empty targets/slots.

Honest deferral: resolving an external `power` slot does not auto-build wires — the copy deploys disconnected until the player wires it, consistent with "no cost-free external wires"; the inspector lists the slot rather than creating routes. Browser coverage selects/records/places a whole-outpost template and asserts the copy brings no certificate; the cell-specific second-commissioning path is covered in `tests/local-blueprints.test.ts`.

## A-08 — menu shell and keyboard placement

- [x] Add build search/category list, operations navigation (domains, qualification, blueprints, existing research preview), and Esc session controls.
- [x] Extract explicit pause-reason ownership into `src/ui/pause-state.ts`. Modal close must not unpause a user-paused game.
- [x] Implement focus entry/return, topmost-Esc behavior and entity/domain navigation. Add keyboard placement cursor and accessible route endpoint selection while preserving mouse operation.
- [x] Move contextual route controls out of the persistent HUD. Retain copy diagnostics, hidden-tab pause, tech-map wheel/pan and minimap double-click recenter.
- [x] Test menu nesting, missing opener fallback, tab containment, shortcuts while editing inputs, live inspector and no catch-up on resume.

Files: main, style, index, tutorial, technology; new operations/build/session/pause modules and `tests/browser/menus.spec.ts`. No global research spending is enabled by exposing the preview here.

**A-08 implementation note — 2026-09-13.** `PauseState` owns three independent reasons (`user`, `hidden`, `modal`); the frame gate, runtime status and pause button read it, so closing a dialog clears only the modal reason and a user pause survives. A session dialog opens on Esc when no build/route/dialog is active; Esc first cancels build/route/selection, and native modal Esc is handled by the dialog. The operations dialog lists control domains, qualifications and recorded modules with Locate buttons plus the read-only research preview (opening the technology map spends nothing). A `Select module`/`Build` search filters the palette. Keyboard placement now focuses the canvas when a build is chosen, moves a grid cursor with the arrow keys, rotates with R, places with Enter and cancels with Esc, while non-build arrow keys still pan. Dialogs record their opener and restore focus on close (native `<dialog>` provides tab containment, verified in the browser test). Hidden-tab pause, copy diagnostics, technology wheel/pan and minimap double-click recenter are unchanged.

Honest gaps: keyboard selection of an arbitrary route endpoint list (beyond the existing equipment inspectors) is not implemented; the browser test covers the domain/qualification navigation and the keyboard placement cursor, not a full keyboard route build. The operations "Locate" for a module switches to the module tool rather than centering a specific template.

## A-09 through A-11 — visual work

- [ ] A-09: validate placeholder footprint, workpiece anchor and power-port overlay with [022](022-tranche-a-assets.md); start measured review records.
- [ ] A-10: generate only the gated cell family, one approved direction before four views/states; record source prompts and measured alpha/crops/anchors.
- [ ] A-11: promote explicitly reviewed sources and bind loading/exposure/completion/fault events. Extend state review and browser art tests. Preserve reduced-motion state feedback.

Exact files, asset IDs, generation inputs and acceptance gates are in the [asset manifest](../../../assets/planning/tranche-a-assets.json). Existing failed crawler/assembler sheets remain separate work; do not silently mark them corrected by adding cell art.

## A-12 — integrated completion

- [x] Run `npm test`, `npm run build`, then relevant Playwright scenarios; use the configured browser setup in `playwright.config.ts` rather than assuming a downloaded browser exists.
- [x] Add `tests/browser/precision-expedition.spec.ts` for the fresh expedition and two independently managed cells. Separate UI-driven completion from simulation-only fixtures.
- [x] Rerun connected benchmarks on the same machine and include a two-cell convergence case. Record median/p95/max step, evaluation count, wall/simulation time and convergence, not only FPS.
- [ ] Review at 1280×800 and 1440×1000, 48/96 px asset previews, real terrain and four rotations. Store screenshots and explicit visual findings.
- [ ] Observe a human trying to explain and fix a failed part. Record assistance, elapsed time, confusing labels and outcome. If unavailable, leave the human gate open and report that limitation; automated play is not a substitute.
- [x] Update README, 017, journal and evidence paths with actual implementation/test checkpoint. Do not claim C research, fusion or sail content is runtime-ready.

**A-12 implementation note — 2026-09-13.** Automated completion is done: `npm test` **115**, `npm run build`, and `npm run test:browser` **27/27** pass; `tests/browser/precision-expedition.spec.ts` drives a fresh expedition through building and independently managing two cells (one auto-tuned, one disabled) and the operations menu; `scripts/benchmark-two-cells.ts` measured two qualified cells over 600 steps (warmup 100) at p50 0.27 ms / p95 0.49 ms / max 1.12 ms with 60 simulated seconds in 0.19 s wall and zero residual, evidence in `DevLog/evidence/tranche-a/two-cell-benchmark.json` alongside `connected-benchmark.json` and `performance-review.json`. The browser test separates UI-driven management from the headless A-05 no-injection qualification fixture.

**Still open (delegated, not claimed):** explicit visual review of the cell placeholder at 1280×800/1440×1000 and 48/96 px with real terrain and four rotations, and an unprompted human "explain and fix a failed part" observation. Cell production art (A-09–A-11) remains gated and unapproved, so no art is marked integrated.

## B-AUDIT — independent investigation

- [ ] Establish same-machine current baseline with existing connected fixtures before performance edits.
- [ ] Measure invariant assembly/topology costs, solver work and domain scheduling before choosing an optimization.
- [ ] Keep full-solver reference comparisons; exact reduction is an experiment, not a promised speedup or an A prerequisite.
- [ ] Preserve 256-port/120-machine guards and P0.1 route-cache assumptions. If p95 exceeds 16 ms, document supported scale and convergence plainly.

## Verification matrix

| Failure class | Primary task / test |
| --- | --- |
| Duplicated energy or false coherence | A-02 / process-fields |
| Global control leakage and unfair work | A-03 / local-control |
| Missed or excessive invalidation | A-03 / local-qualification |
| Inventory loss/duplication on interruption | A-04 / process-lifecycle + local-persistence |
| Unreachable starter economy | A-05 / precision-cell fixture |
| Unclear cause of rejection | A-06 / browser + A-12 human observation |
| Blueprint copied runtime state | A-07 / local-blueprints |
| Focus loss / accidental resume | A-08 / menus |
| Matte, port drift or repeated event | A-11 / process-art + visual review |
| Misleading scale claims | A-12 / same-machine evidence |
