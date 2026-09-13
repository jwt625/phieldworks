# Tranche A — file-level coding TODO

2026-09-13. Gameplay work below remains **planned**. A-09/A-10 have begun limited geometry/candidate review; see [022](022-tranche-a-assets.md). Read [019](019-tranche-a-plan.md) and [020](020-tranche-a-contracts.md) first. [JSON task manifest](planning/tranche-a-tasks.json) carries the same task IDs and dependency graph. Deliver small reviewable commits; keep `world.ts` integrations sequential where tasks touch the same functions. No subagent execution is requested by this checklist.

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

- [ ] Add pure field projection in `src/sim/targets.ts` using the two-zone equations in 020.
- [ ] Route each emitter to only one target, aggregate independent source groups correctly, expose target-specific readings and world totals.
- [ ] Preserve frontier projection for its assigned emitters. Update renderer/ecology lookups without changing wildlife behavior as a side effect.
- [ ] Count missed radiation, emitter local heat, protective absorption and process heat exactly once. Invalid field solve suspends processing with a fault; never continue using an old successful result.
- [ ] Write analytic phase cases, unequal inputs, different groups, missing emitter, reassigning emitter, two targets and integrated ledger tests in `tests/process-fields.test.ts`.

`network.ts` supplies per-group fields; avoid rewriting its LU/block solver in this task. Gate: constant captured power for analytic phase sweep, bounded target sum and unchanged starter field fixture.

## A-03 — control and qualification

- [ ] Move automatic control into `src/sim/control.ts`; commands validate ownership before any mutation.
- [ ] Implement global fair trial scheduling with one selected tuner per world step. Domain cursor and restored trial stats must agree after plus/minus comparisons.
- [ ] Add `src/sim/qualification.ts` for dependency closures, configuration signatures, current validity and stable reason codes. Keep cache invalidation separate.
- [ ] Preserve frontier acceptance requirements; process qualification tracks three new whole accepted cycles once A-04 supplies events.
- [ ] Remove global test-induced thermal drift from unrelated tuners; any test disturbance applies only to the declared domain and is recorded in the test contract. Use ordinary drift for the initial process qualification.
- [ ] Test ownership conflicts, on/off independence, deterministic scheduling/load, unrelated repair, shared source and changed power load. Snapshot material/job/event/thermal state around trial evaluation.

Files: `world.ts`, `control.ts`, `qualification.ts`, `diagnostics.ts`; `tests/local-control.test.ts`, `tests/local-qualification.test.ts`. Gate: two domains retain separate state with bounded evaluation count. A-03 process-outcome hooks are completed with A-05 integration, not marked working early.

## A-04 — process lifecycle and inventory

- [ ] Add versioned starter recipe constants to `src/sim/process-recipes.ts`. Keep the preview catalog untouched.
- [ ] Add `src/sim/process.ts` with atomic reservation, consume-on-first-exposure, dose accumulation, suspend/resume, terminal commit and one cumulative-dose rework.
- [ ] Store batch provenance and separate process waste from legacy scrap. Enforce capacity before consuming inputs; expose full storage as a blocker.
- [ ] Clamp final exposure integration to the remaining active duration rather than integrating a whole step beyond eight seconds. Do not bank progress while suspended.
- [ ] Finalize batch loss through one helper from thermal destruction, wildlife destruction, dismantling and cancellation.
- [ ] Extend persistence validation/roundtrip fixtures to all stages, terminal-event boundaries and rework ownership.
- [ ] Test missing one ingredient, two simultaneous cells competing for last stock, double cancel/complete, no-dose batch, threshold boundaries, changed dt partition, pause, repair, reload and exhausted reject storage.

Files: `process.ts`, `process-recipes.ts`, `world.ts`, `ecology.ts`, `persistence.ts`; `tests/process-lifecycle.test.ts`. Gate: batch/output audit closes across every interruption; no positive result from a pure preview.

## A-05 — buildable first cell

- [ ] Add `fabrication-cell` to Kind/DEFS with 3×3 footprint, 18-assembly cost, 12-unit feed and no wave/material routing ports.
- [ ] Define explicit power-port placement in geometry; preserve existing kinds' port locations and four rotations.
- [ ] Add target/job creation and deletion to world commands. Integrate target absorption with declared cell cooling and process step ordering.
- [ ] Use a visibly labeled placeholder in `presentation.ts`/renderer until reviewed art exists; do not accidentally fall back to an unrelated generator sprite.
- [ ] Add a reusable no-stock-injection fixture in `scripts/precision-cell-fixture.ts` that starts with `createWorld`, completes frontier/crystal access, builds legal routes, makes a reject, recovers and makes accepted parts.
- [ ] Audit actual resource spend, remaining recovery stock, input power, useful/guard margins and thermal equilibrium; revise provisional constants if needed and document the measured reason.

Files: definitions, geometry, world, equipment-state, presentation; `tests/precision-cell.test.ts`. Gate: complete three valid standard cycles under local control and certificate monitoring. A failure in this fixture blocks production-art generation, not merely the final test report.

## A-06 — contextual workflow

- [ ] Build `src/ui/process-inspector.ts` and `domain-inspector.ts`; expose labeled assignment selectors, manual phase values, Run once/continuous, Auto tune, test/cancel and last two results.
- [ ] Add useful/guard/dose preview and an accessible textual equivalent. Explain ingredients reserved versus consumed and distinguish current readiness from certificate validity.
- [ ] Route diagnostics to the selected owner; use stable reason codes from simulation.
- [ ] Update tutorial to use local frontier records and add a skippable first-cell lesson. Keep existing tutorial anchor IDs through the transition or update them and browser tests together.
- [ ] Browser test the actual interaction path, not direct world manipulation masquerading as user completion.

Files: main, style, renderer, tutorial, diagnostics; new inspectors and `tests/browser/precision-cell.spec.ts`. Gate: a keyboard user can select/bind/tune/run/inspect a placed cell; full keyboard placement lands in A-08.

## A-07 — module capture and second cell

- [ ] Extract blueprint commands into `src/sim/blueprints.ts` with selection bounds and included-domain checks.
- [ ] Create fresh keys for entities, sources/groups, targets and domains. Strip jobs, stock, telemetry and qualification.
- [ ] Render selection and excluded crossing routes. Add external binding resolution to `src/ui/blueprint-inspector.ts`.
- [ ] Stage all placement validations, route geometry, costs and ownership before applying one commit. Never mutate shared nested arrays through a shallow draft world.
- [ ] Test unresolved and occupied external slots, disconnected deployment, blocked footprint/route, exhausted stock, ID rollback, source independence, old blueprints and second-cell commissioning.

Files: world, persistence, renderer, main; new blueprint modules, `tests/local-blueprints.test.ts` and browser counterpart. Gate: original cell keeps working and its inventory/certificate do not transfer to the copy.

## A-08 — menu shell and keyboard placement

- [ ] Add build search/category list, operations navigation (domains, qualification, blueprints, existing research preview), and Esc session controls.
- [ ] Extract explicit pause-reason ownership into `src/ui/pause-state.ts`. Modal close must not unpause a user-paused game.
- [ ] Implement focus entry/return, topmost-Esc behavior and entity/domain navigation. Add keyboard placement cursor and accessible route endpoint selection while preserving mouse operation.
- [ ] Move contextual route controls out of the persistent HUD. Retain copy diagnostics, hidden-tab pause, tech-map wheel/pan and minimap double-click recenter.
- [ ] Test menu nesting, missing opener fallback, tab containment, shortcuts while editing inputs, live inspector and no catch-up on resume.

Files: main, style, index, tutorial, technology; new operations/build/session/pause modules and `tests/browser/menus.spec.ts`. No global research spending is enabled by exposing the preview here.

## A-09 through A-11 — visual work

- [ ] A-09: validate placeholder footprint, workpiece anchor and power-port overlay with [022](022-tranche-a-assets.md); start measured review records.
- [ ] A-10: generate only the gated cell family, one approved direction before four views/states; record source prompts and measured alpha/crops/anchors.
- [ ] A-11: promote explicitly reviewed sources and bind loading/exposure/completion/fault events. Extend state review and browser art tests. Preserve reduced-motion state feedback.

Exact files, asset IDs, generation inputs and acceptance gates are in the [asset manifest](../assets/planning/tranche-a-assets.json). Existing failed crawler/assembler sheets remain separate work; do not silently mark them corrected by adding cell art.

## A-12 — integrated completion

- [ ] Run `npm test`, `npm run build`, then relevant Playwright scenarios; use the configured browser setup in `playwright.config.ts` rather than assuming a downloaded browser exists.
- [ ] Add `tests/browser/precision-expedition.spec.ts` for the fresh expedition and two independently managed cells. Separate UI-driven completion from simulation-only fixtures.
- [ ] Rerun connected benchmarks on the same machine and include a two-cell convergence case. Record median/p95/max step, evaluation count, wall/simulation time and convergence, not only FPS.
- [ ] Review at 1280×800 and 1440×1000, 48/96 px asset previews, real terrain and four rotations. Store screenshots and explicit visual findings.
- [ ] Observe a human trying to explain and fix a failed part. Record assistance, elapsed time, confusing labels and outcome. If unavailable, leave the human gate open and report that limitation; automated play is not a substitute.
- [ ] Update README, 017, journal and evidence paths with actual implementation/test checkpoint. Do not claim C research, fusion or sail content is runtime-ready.

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
