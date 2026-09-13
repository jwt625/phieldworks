# Visual and complex verification review

2026-09-13, baseline `0bd3935`. Review performed before continuing asset generation. Coding remedies are assigned in [012](012-next-coding-handoffs.md); a reviewed failure is not marked as fixed.

## Reproduction

`npm test`: 52 passed. `PHIELDWORKS_TEST_PORT=5174 npm run test:browser`: 16 passed (60 s). `npm run build`: passed. Fresh screenshots were opened and visually inspected, not only asserted by Playwright. Additional harness: start Vite on 5175, run `node scripts/visual-review.mjs`; use `PHIELDWORKS_REVIEW_URL` to select another local server. Synthetic fixtures use a separate browser context and do not overwrite the player's save.

## Appearance findings

| Queue / evidence in test-results | Result and next action |
| --- | --- |
| initial-outpost, qualified-outpost, guided-qualified-outpost | Reviewed: routes and field focus read clearly; successful acceptance and blueprint controls are legible. Texture shows through dark machine details because of lighten compositing. P4 owns final alpha/anchor integration. |
| grid-routing-and-rotation | Reviewed: diagonal route and separately drawn tuner view visible; some fixed port circles sit beyond the apparent machine. P4 needs per-view port registration. |
| minimap-full-sector | Reviewed: sector extent and resource silhouettes visible. Captured minimap zoom text can lag the main map label during UI refresh; include settled-frame checks when revising camera UI. |
| perimeter-defense, contextual-onboarding | Reviewed: sentry ready state and power route visible; tutorial leaves the selected assembler visible and explains its recipe. No unprompted human pacing/usability claim. |
| route-editing | Original test screenshot was taken after Esc and clearing the waypoints, so it cannot verify edit handles. Added route-edit-active: gold selected route, two square handles, route ID/endpoints/length and edit hint are visible. Dashed guide lies over the bright route and tight-bend markers are small; improve contrast in P3. |
| diagnostics-trends | Original screenshot had telemetry below the scroll viewport. Added diagnostics-visible-trend: summary, cyan solid target curve, amber dashed heat curve and copy control are legible. Missing legend/units for independently scaled series and absent plotted demand make interpretation ambiguous. P2 must label the curves and scales; baseline telemetry stays free. |
| equipment-state-lab + state-off-0 / light-1 / severe-2 / wreck-3 / trip-0 | Reviewed all nine kinds in these five presets across four directions. Off bodies have dark lamps; wrecks are distinct static bodies; hot/trip retains intact geometry with separate warning/heat marks. Severe damage retains exposed internals. **Fail:** neighboring-row sprite fragments appear under assembler/reference/extractor and beside reference in damaged rows. Generated row spacing does not match equal-cell runtime cropping. P4 must map explicit source rectangles for condition sheets too. |
| missing-operation fallback | Confirmed source gaps in 011. Light extractor has a cycle; damaged assembler and severe extractor hold condition art. “Running” describes simulation activity, not proof of rendered motion. Recheck after source generation with manifest and actual selected-asset evidence. |

## Overload experiment

Added a second reference at (17,18), connected to the starter generator and loaded this valid fixture through Save/Load. Demand rises to 270 / 240. Exactly one load (new reference) is isolated; all original powered machines remain served and target power remains approximately 8.8. The ledger displays “Isolated loads 1”; the new machine shows POWER OFF. `power-overload-review.png` captures ledger and error panel. This is load isolation, not a total bus failure. The field manual still says all attached loads shut down: P2 should correct that stale sentence. Wire overload remains unreachable with the existing single-load feeds; real shared-feed coverage is P3.

## Capacity and performance

Run `npx tsx scripts/benchmark-review.ts`; machine: Apple M5, macOS arm64, Node version recorded in JSON. 5 warmups + 30 solve samples; passive chains distributed across 1/4/16 independent source groups. Sources total 10 units each; link attenuation .995, phase .1; source-group residuals stay below 1.2e-13. These are engineering stress fixtures, not a production-scale playtest.

| Field ports | p95 solve, 1 group | 4 groups | 16 groups |
| --- | ---: | ---: | ---: |
| 40 | 1.54 ms | 2.45 ms | 9.59 ms |
| 80 | 3.17 ms | 10.84 ms | 40.93 ms |
| 128 | 12.51 ms | 44.32 ms | 167.71 ms |
| 130 / 256 / 400 | rejected | rejected | rejected |

**P0 failure:** world placement/save cap is 400, but `solveNetwork` rejects over 128. A world with only 33 junctions (132 ports) reports `Prototype limit: 128 wave ports`, even with no connected sources. Existing cap tests check placement but never solve the accepted large world. Do not describe 400 as supported. The 128-port/16-group solve also substantially exceeds the 50 ms fixed-step interval.

World steps with starter field network plus disconnected sentries: 40/80/120 machines p95 0.20/0.19/0.11 ms (25 warmups, 100 samples). These cheap disconnected loads do not validate large field networks. Browser canvas CPU submission at the same counts initially measured p95 1.0/1.1/1.8 ms (15 warmups, 50 samples); GPU raster/presentation and frame pacing are excluded. Full raw reports: `test-results/performance-review.json`, `visual-review.json`.

## Remaining verification

- [ ] P0: rerun after consistent capacity and solver optimization; connected large-world render/step frame pacing.
- [ ] P4: registration fixes and newly generated clips, actual event bindings, reduced motion and pause/hidden-modal behavior across every new state.
- [ ] P3: true multi-source shared feeds and wire overload once topology permits it.
- [ ] P5: unprompted human first-expedition playtest and pacing. Scripted completion does not answer whether the phase/commissioning loop is understandable or enjoyable.

## Follow-up — 2026-09-13 (P0 remedy)

The 400-vs-128 contradiction in the capacity section is resolved in code; evidence and remaining gaps are recorded in [012](012-next-coding-handoffs.md) P0 progress. Single supported cap is now `FIELD_PORT_LIMIT=256` across placement, save load and `solveNetwork`; the solver partitions disconnected components and reuses one LU factorization per block. Post-remedy benchmark (`DevLog/evidence/012-p0-solver-after.json`, Apple M4 Pro): 128 ports / 16 groups 1.14 ms p95 (was 167.71); 256 / 1 group 4.33 ms p95; 400 rejected. The stale field-manual sentence about an overloaded generator shutting all attached loads down was corrected to match isolation behavior. This does not satisfy the connected-world frame-pacing or human-pacing gates above, which remain open.
