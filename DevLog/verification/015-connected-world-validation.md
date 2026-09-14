# Connected-world validation and next priorities

2026-09-13. Reviewed `6f4e40f` against actual code after the user resumed work, then pulled remote navigation update `0c7cc54` before publishing these handoffs. README changes merged cleanly and no manual conflict resolution was needed. The previous planning/art checkpoint was committed externally as `deb2242`; its history is preserved. The field-port contradiction is fixed, and the manual now correctly describes overload isolation. Research remains a design preview and candidate animation sheets are still outside world playback.

## Validation performed

- Baseline regression: 55 headless checks, 18 browser scenarios and production build pass.
- After pulling `0c7cc54`: all **57 headless checks, 19 browser scenarios and production build pass**; `git diff --check` is clean. This includes the new zoom/pan scenario. The connected performance evidence below predates that UI-only update; no simulation files changed in the pull.
- Added two verification tests: exact 255/256/257-port behavior across placement, save load and solver; reused complex LU versus independent Gaussian elimination across 3/7/31-dimensional matrices and 16 right-hand sides, including pivoting and input immutability. Both pass.
- `npx tsx scripts/benchmark-connected.ts` builds actual route-valid worlds and round-trips each through save validation before timing. Fixtures contain one connected serpentine chain of hybrids, seven tuners, an emitter and 1/4/16 separately powered sources; extra sentries bring machine counts to 40/80/120. Setup/pathfinding/load time is excluded from step measurements.
- Apple M5 / Node v25.9.0. Ten warmups + thirty measured world steps per case. No thermal trips during sampling; finite conservation residuals. This is a synthetic stress test, not balanced gameplay or a cross-hardware claim.

## Performance gate failed

| Machines | Field ports | Sources | p95 step, control off | p95 step, control on |
| --- | --- | --- | ---: | ---: |
| 40 | 136 | 1 | 6.11 ms | 57.08 ms |
| 80 | 256 | 1 | 17.97 ms | 198.45 ms |
| 120 | 256 | 1 | 18.01 ms | 191.52 ms |
| 120 | 256 | 4 | 24.45 ms | 288.71 ms |
| 120 | 256 | 16 | 60.68 ms | 643.32 ms |

The 256-port cap is consistent, but these connected worlds do **not** meet the 16 ms p95 world-step target. Several controlled cases also exceed the actual `DT=.1` (100 ms) fixed-step interval. The earlier 013 text saying 50 ms was incorrect; the simulation uses 100 ms.

Code explains the additional cost: `automaticControl` evaluates baseline/plus/minus for every tuner, evaluates again at its end, and `step` evaluates before and after the rest of simulation. Seven tuners can cause 24 full evaluations per step. Factorization reuse within one solve does not reuse topology, routing metrics or power allocation across these evaluations. Do not extrapolate the independent-chain solver-only benchmark to connected-world performance.

## Coding clarification: P0.1 before raising scale further

- [ ] Owner: simulation/performance. Cache topology, block membership and route metrics with explicit invalidation on connect/edit/disconnect/build/remove/load. Reuse power allocation and invariant assembly during phase search where safe; phase/temperature changes still update affected coefficients.
- [ ] Bound automatic control work per simulation interval: schedule a limited number of tuner candidates, retain deterministic cursor/progress, and expose convergence time. Avoid evaluating unchanged candidate baselines repeatedly. Do not skip conservation/error checks or invent free capacity to meet timings.
- [ ] Keep 256 as a consistent validity bound for now; do not call it a proven performance bound. If reducing the playable cap is necessary, define behavior for valid existing larger saves rather than silently dropping machinery.
- [ ] Verification: rerun the same saved connected fixtures, control off/on and 1/4/16 groups. Record median/p95/max step and real app frame intervals, simulation seconds versus wall time, tuning convergence and power residuals. Target ≤16 ms p95 step and readable responsive interaction; retain current tutorial commissioning success and thermal behavior.
- [ ] Add a connected numerical-reference case with split/recombine, return reflection and several sources sharing a group, then compare per-port complex fields and ledger before/after any caching/control changes. Existing LU equivalence tests cover linear algebra, not every network topology.

P1 research contracts and persistence work can proceed independently, using the small starter scenario. Large-factory acceptance remains blocked on P0.1. P4 crop/anchor and event binding work is also independent. Human pacing, true shared power feeds and wire-overload verification remain outstanding feature-dependent tasks.

## P0.1 progress — 2026-09-13

Remedy implemented against the same connected fixtures (Apple M4 Pro, Node v23.7.0, `npx tsx scripts/benchmark-connected.ts`):

| Machines | Sources | p95 off before → after | p95 on before → after |
| --- | ---: | --- | --- |
| 40 | 1 | 6.11 → **2.16** ms | 57.08 → **4.43** ms |
| 80 | 1 | 17.97 → **8.25** ms | 198.45 → **25.19** ms |
| 120 | 1 | 18.01 → **8.53** ms | 191.52 → **24.29** ms |
| 120 | 4 | 24.45 → **13.74** ms | 288.71 → **33.15** ms |
| 120 | 16 | 60.68 → **20.62** ms | 643.32 → **54.78** ms |

Changes (no conservation or limit change):

- `routeMetrics` is memoized by path identity and radius (`src/sim/geometry.ts`); paths are immutable after install, so per-step evaluation, material transit and diagnostics reuse the result.
- `powerGrid` computes wire flow directly from each receiver's draw instead of a per-link graph search; correct while a load has one feed and no power output, with a comment to revisit for poles/buses.
- `automaticControl` is bounded to **one tuner per step** on a deterministic cursor (derived from simulated time), reuses the step's evaluation as the baseline, compares ±2°, and only re-settles stats when a trial wins. `Stats.controlCursor` exposes the cursor. The previous code re-solved the baseline for every tuner and every step (up to ~24 full evaluations/step with 7 tuners).
- `step` skips the redundant leading `evaluate` when nothing changed since the previous end-of-step evaluation, gated by a new `statsRevision` (stripped from saves; `evaluate` stamps `w.revision`). Topology edits still invalidate and force a re-solve.

Real-app pacing (`node scripts/benchmark-browser-connected.mjs`, headless Chrome 1440×1000, 3 s samples): 40/80/120 machines and 120/16 sources control-off now hold **16.7 ms p95 frame**, no frames over 33.4 ms, and advance 3.0 simulation seconds in 3.0 wall seconds. 120/16 control-on is 33.4 ms p95 with 7/181 frames over 33.4 ms and still real-time — previously ~1117 ms p95 with 0.8 sim s in 3.32 wall s. Preserved: `DevLog/evidence/015-p0.1-connected-step.json`, `015-p0.1-connected-browser.json`.

Added the requested connected numerical-reference test: shared source group through split/recombine with reflective loads must keep finite per-port complex fields and a zero residual (`tests/network.test.ts`).

**Still not met / remaining P0.1:** the ≤16 ms p95 *step* target is met for control-off at 1 and 4 source groups and all 40-machine cases, but not for control-on at 80/120 machines nor for 120 machines / 16 groups (20.6 off, 54.8 on). Context caching for topology/block membership and invariant assembly, and cheap trial updates (e.g. low-rank phase perturbation) remain; alternatively a *performance-supported* cap distinct from the 256 validity bound must be defined without silently dropping machinery. `controlCursor` reports position, not convergence time. Browser numbers are single-machine and not GPU profiling.

## Asset continuation scope

Review the nine saved revisions from 014, recover completed interrupted outputs before generating duplicates, complete the five genuinely missing corrections, and add explicit per-asset review outcomes. New machinery/creature state sources must remain candidates until registration and event bindings pass. Node illustrations do not implement their 99 product unlocks.


## Browser pacing and repeated visual review

`node scripts/benchmark-browser-connected.mjs` loads the validated fixtures into the real app at 1440×1000 in headless Chrome. Three-second samples: 40 machines/control on had 122 frames and 50 ms p95; 80 and 120 machines/one source/control on each had only 10 frames, about 350 ms p95. At 120 machines/16 sources, control off had 143 frames and 33.4 ms p95; control on produced just 4 frames, approximately 1117 ms worst/p95, and advanced only 0.8 simulation seconds in 3.32 wall seconds. The four-frame sample is too short for a stable percentile, but clearly reproduces severe stalling. These results confirm the need for P0.1; they are not GPU profiling or cross-hardware FPS guarantees.

Preserved JSON: `DevLog/evidence/015-connected-world.json` and `015-connected-browser.json`. `scripts/visual-review.mjs` was rerun after the solver change. The overload fixture still leaves starter loads powered, isolates exactly the new reference, and shows Isolated loads 1 with POWER OFF; screenshot opened and reviewed. Connected-cap screenshot also reviewed: routing renders, but status labels overlap densely. P2 should prioritize labels for selected/faulted/nearby machinery at map scale.
