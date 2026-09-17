# 039 — Complete asset generation and coding handoff

2026-09-17. User explicitly requests completion of all asset-generation tasks, states and animations. This expands generation beyond earlier implemented-tier-only scheduling; it does not implement future machinery or change gameplay. [Pass 14 jobs](../../assets/production/pass-14-complete-catalog/jobs.json) is the execution ledger. Earlier source files and runtime selections remain preserved.

## Work in progress

1. Reconcile all 99 products plus runtime-only crossing, wildlife and route hardware. Reuse reviewed item sources; capabilities use renderer-native symbols, not invented equipment. Construction tooling has an inventory representation, not an operating building.
2. Generate missing/replacement equipment families: each direction has intact/off, light damage, severe damage, wreck and applicable mechanism frames. Passive hardware has no fabricated motor. Keep source provenance and record correction outcomes.
3. Complete missing resource/depletion, process-state, wildlife and route families. Check decoded alpha distribution (including near-opaque 250–254), occupied bounds, direction/state semantics and animation playback. Never equate file presence with visual acceptance.
4. Publish source gallery, per-family status and a machine-readable inventory. Update this plan and production log after each batch.

## Coding tasks after source acceptance

- C-01: measure actual source crops, fixed chassis/port/workpiece anchors and direction mappings. Reject silhouette drift; do not independently scale animation frames.
- C-02: clip persistent damage overlays onto active mechanisms, preserving condition during operation. Passive devices remain static. Off, no-input, blocked, tripped and reduced-motion states hold a meaningful pose; native lamps/status show authoritative state.
- C-03: bind recipe progress, field delivery, phase adjustment, load, fan cooling, real shots, travel distance, damage and death events. Never play successful-production motion merely because a machine exists. Pause uses simulation time; one-shot death holds terminal remains.
- C-04: register routes under 037/038, exact casing/port geometry, alpha 255 centerline, compatible edge profiles, extruded gutters and whole-route fallback. Keep items on authoritative packet positions. Damage art does not create a belt-integrity mechanic.
- C-05: explicit runtime allowlist only; no candidate-folder glob. Future catalog sources stay excluded until their gameplay tier and geometry exist.
- C-06: validate four directions, applicable states, transitions, pause/reduced motion, save/load, 48/96/256-pixel review and light/dark/terrain backgrounds. Build and focused renderer tests plus independent in-game visual acceptance before promotion.

Generation, registration, visual approval and runtime integration are separate ledger fields. Open defects remain open until inspected corrections pass; this plan does not waive AN-04–08, TA-REGISTER or conveyor seam gates.
