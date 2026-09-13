# Equipment state and damage animation

Started 2026-09-12. Continue the user's request for readable power/activity/damage states. Preserve the uncommitted map/animation/technology work from 010.

## Work plan

- [x] S1: Define state matrix and presentation-only state resolver for all nine equipment kinds and transported items. (`src/equipment-state.ts`, `tests/equipment-state.test.ts`)
- [x] S2: Generate nine four-orientation condition atlases with dark LEDs/screens: intact/off, light damage, severe damage, wreck. (assets generated and renderer-mapped; see S3 for the still-missing operation sheets)
- [ ] S3: Generate damaged extractor/assembler motion loops, generator operation and sentry firing; generate distinct transported-item art. **Partial:** only `extractor-light-cycle-v1` exists; `extractor-severe-cycle-v1`, `assembler-light-cycle-v1`, `assembler-severe-cycle-v1`, `generator-cycle-v1`, `sentry-fire-v1`, `transport-items-v1` are prompted but absent.
- [x] S4: Integrate power/activity/thermal/damage selection, state-aware lights/effects and item/belt feedback; keep physics authoritative. (`src/renderer.ts` `machine()`, `src/equipment-effects.ts`)
- [x] S5: Interactive state review, transition checks, screenshot/animation review and regression validation. Review surface at `assets/states/index.html` + `src/state-review.ts`; headless coverage in `tests/equipment-state.test.ts`; browser regression added 2026-09-13 (`tests/browser/assets.spec.ts`, state-lab service/work/integrity axes, screenshot `test-results/equipment-state-lab.png`).

## Status reconciliation (2026-09-13)

The S1–S5 boxes above were previously all unchecked even though S1/S2/S4 were already committed (`26bc305`, `245fb43`) and S5's interface existed. Corrected here against HEAD. Remaining real gap: the S3 operation/damage-cycle/transported-item sheets, which the shipping renderer already references but silently falls back on (`renderer.ts` `generator-cycle-v1`, `sentry-fire-v1`, `transport-items-v1`, `renderer.ts:31,54`). The review page no longer references the absent `transport-items-v1.png`: `src/state-review.ts` now renders the item cards only when the sprite exists and otherwise shows a labelled "not generated yet" note, so the page no longer issues broken image requests.

## Visual verification queue (for a vision-capable reviewer)

No automated assertion currently checks rendered appearance; these need human/vision review:

1. `test-results/route-editing.png` — confirm the selected material belt reads clearly: gold highlight, dashed waypoint guide, square waypoint handles, and amber bend markers. Verify route identity is obvious while editing.
2. `test-results/initial-outpost.png`, `qualified-outpost.png`, `grid-routing-and-rotation.png`, `minimap-full-sector.png`, `perimeter-defense.png`, `contextual-onboarding.png`, `guided-qualified-outpost.png` — established outpost/instructional screens; re-check after any renderer change.
3. `assets/states/index.html` — nine condition atlases across all four orientations and the power/work/integrity/thermal presets. Confirm: unpowered chassis has dark native LEDs and frozen mechanisms; damaged bodies persist while operating; wrecks are static; hot/tripped is independent of damage. The "Transported material silhouettes" section now shows a labelled placeholder until `transport-items-v1.png` exists; verify the placeholder reads acceptably.
4. Missing-operation fallbacks — once S3 art lands, verify `generator-cycle-v1`, `sentry-fire-v1`, the light/severe extractor+assembler loops, and item silhouettes render instead of falling back to condition/static art.

## Orthogonal state matrix

| Axis | States | Presentation rule |
| --- | --- | --- |
| Integrity | intact = 100%; light damage = 65–99%; severe = 1–64%; destroyed = 0% | Separate geometry/surface assets, not opacity alone. Damage does not silently change core production efficiency. |
| Electrical service | powered / no power / passive | Unpowered chassis has dark native LEDs/screens and frozen mechanisms. Passive junction/tuner do not acquire imaginary electrical power requirements. |
| Work | running / ready / input-starved / output-blocked / no field / uncooled | Powered-idle keeps status illumination but stops production mechanisms. Incoming field and missing cooling can coexist on a dump. |
| Thermal | nominal / hot (>65°C) / tripped / destructive (>105°C) | Heat and trip overlays remain independent of integrity; cold damaged machines do not emit smoke. Tripped machinery stops moving. |
| Combat | sentry ready / firing | Movement/recoil and flashes require real shots; do not fire idly. |
| Items | ore / assemblies / crystal / scrap | Distinct material silhouettes. Actual belt packets determine movement and queuing; no invented per-item quality state. |

## Source and rendering contract

- Nine 4×4 condition atlases: rows = intact/off, light damage/off, severe damage/off, wreck; columns = four physically redrawn orientations. No baked illuminated LEDs, active beams, smoke or fire.
- Operating machinery reuses or adds four-direction motion sheets. Damaged extractor/assembler loops retain their damage while operating; no pristine moving machine over a damaged body.
- Dynamic status lamps, port illumination, heat shimmer/smoke and firing effects remain renderer-owned, as established in the asset plan. Power loss removes emitted light instead of merely reducing opacity.
- State resolution reads core world state; no presentation imports in simulation, no image-derived collisions/ports, no new research gate or damage physics.
- Source PNGs remain unmodified. Explicit source rectangles/anchors may correct generated grid spacing. Dark-matte RGB remains a known production-art limitation.

## Acceptance cases

Power off → no lit LEDs and no work motion. Powered but no ore → lit ready indicator, stationary arm. Output full → queued belt and blocked marker, stationary drill. Partial damage → persistent visibly changed chassis, with power independent of damage. Repair → intact art. Heat trip → alarm/stalled machinery; cooldown does not erase physical damage. Destroyed → kind-specific wreck. Sentry ready → no recoil; actual shot → firing response. Simulation pause → all time-based motion/effects hold.

- Generated `assets/states/extractor-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/assembler-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/generator-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/reference-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/junction-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/tuner-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/emitter-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/dump-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/sentry-condition-v1.png`; source recorded in state-provenance.json; review pending.

- Generated `assets/states/extractor-light-cycle-v1.png`; source recorded in state-provenance.json; review pending.


## Checkpoint — 2026-09-13

S3 now has initial sources for all six formerly absent sheets in `assets/animations/candidates/`, with three saved machinery corrections. They remain review-only: several initial sheets painted checkerboards, registration is unverified, and runtime still uses the existing fallbacks. The visual queue was reviewed with concrete failures recorded in [013](013-verification-review.md); generation/resume status is in [014](014-asset-production-tracker.md).
