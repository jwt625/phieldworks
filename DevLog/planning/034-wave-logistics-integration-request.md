# 034 — Wave-logistics integration request: planning feedback

Date: 2026-09-16. Status: **open — awaiting planning-agent decisions**. Author: coding
agent (R-01–R-06 of [029](029-early-game-wave-logistics-handoff.md) implemented and
code-verified). Companion asset brief: [035](../production/035-wave-logistics-asset-request.md).
Art context: [031](../production/031-wave-logistics-assets.md),
[032](../production/032-modular-route-seams.md), [033](../verification/033-connected-route-kit-review.md).

## Why this request exists

The runtime now owns an authoritative `WavePiece` topology (`src/sim/wave-construction.ts`,
`src/sim/wave-parts.ts`) rendered with **renderer-native strokes** only. Pass-10
`connected-kit-atlas.png` / `atlas.json` is a seam-tested **standalone** kit; the app does
not load it (`assets.ts` has no glob for pass-09/10, and there are no `drawAssembly`
references). Integration is blocked on the geometry decisions below. I will not promote
art or change machine geometry, port maps or save semantics without these answers.

Current evidence for the implemented side: `npm test` 143, `npm run build`, browser
40/40, R-01 fixture basic→upgraded useful/source **+29.6%**. See the implementation
journal entry (2026-09-16) and `DevLog/evidence/wave-logistics/`.

## Blocking decisions

### P1 — Canonical junction geometry: adopt pass-10 cardinal ports, or add an adapter?

- Runtime `geometry.ts` four-port ports are **two per side**: local `A(0,0.5)/B(0,1.5)`
  with normal `-x`, `C(2,0.5)/D(2,1.5)` with normal `+x`.
- Pass-10 junction uses **four cardinal midpoints** `W/N/E/S` of a 1×1 tile, and 033
  states this "prototype cardinal-port junction is not a drop-in replacement for the
  current two-ports-per-side runtime hybrid".
- Options:
  - **(a) Cardinal is canonical:** change `geometry.ts`/`ports()` and every four-port
    consumer (routing, persistence validation, placement, tests). Invalidates the
    two-ports-per-side hybrid and the port maps of existing v5 saves that use junctions.
  - **(b) Adapter:** keep runtime geometry; map the atlas body onto the runtime 2×2
    footprint with terminal offsets matching the runtime ports. No sim/save change; the
    rendered junction will differ from the standalone atlas.
- Consequence of deferral: no real-art junction/crossing can render.

### P2 — Authoring space ↔ world mapping

`GUIDE_INTERFACE.width` is frozen at **0.24 tiles** (no cap). Pass-10's atlas is a 128 px
tile with **32 authoring units (0.25 tile)** and states width is "NOT a chosen world
unit". Which is authoritative: runtime world units (kit re-registers to 0.24) or atlas
units (I change `GUIDE_INTERFACE` and the swept/preview math)? Also: do physical straights
stay periodic at any half-tile `spans` (current behavior), or are they restricted to whole
tiles to match a 128 px repeat?

### P3 — Tier policy

Atlas ships basic **and precision** for all 9 geometries, including a precision straight;
runtime has `straight-basic` only, and upgrades are elbow/junction-only. Add
`straight-precision`, ignore the atlas precision straight, or introduce precision
crossings too? (Atlas `precision` currently maps only to `elbow-precision` /
`junction-matched`.)

### P4 — Placement options vs replacement

The guide tool always compiles compact elbows (the radius toggle never reaches the swept
template); upgrades happen via piece-inspector replace after manufacture. Confirm the
intended loop is "build compact, upgrade by manufacture/replace" (consistent with 029:
"a radius toggle cannot improve physics without replacing hardware"), or expose
compact/swept/tier selection at placement with a live BOM delta.

### P5 — Swept elbow art

Pass-10 includes four compact turns only; runtime defines `elbow-swept` with a larger
footprint/clearance and 029 lists it as starter hardware. Choose: (a) commission a swept
family, (b) render swept via adapter/scale, or (c) drop swept from first delivery.

### P6 — Crossing exposure

The `crossing` kind is implemented and simulated but deliberately not in the build strip
(adding it shifted palette shortcuts and requested missing art). Once registered: should
it be buildable, and which atlas orientation (`cross-h`/`cross-v`) maps to `rotation 0`?

### P7 — Terminal ownership (032)

032 assigns caps/sockets/sleeves to the renderer and expects a topology-conditioned
`drawAssembly`-style join pass, owned once per real joint. Confirm the boundary: coding
owns composition (sampling gutters, conditional open ends, gap fidelity) in `renderer.ts`
and asset generation owns source rects/profile metadata — or does the asset side deliver a
runtime module I call?

### P8 — R-01 gate and source self-heating (balance sign-off)

Provisional coefficients clear the ≥15% gate (0.1998 → 0.2589, +29.6%, 12 accepted cycles).
Separately, high-reflection layouts raise the reference's own absorption until thermal
protection trips (observed before tuning). Is that intended source heating, or should a
matched source not heat from its own reflected emission? This decides whether playable
basic networks need looser coefficients or source cooling.

## Non-blocking confirmations

- **R-07:** still required for first delivery? Not implemented; existing tutorial indices
  are asserted by browser tests.
- **R-09:** route-heavy ≤16 ms benchmark and delivered-fixture evidence remain unrun (out
  of the R-01–R-07 scope set by the user).
- **R-06:** no automated browser guide-flow test yet; visual acceptance stays with the
  parent (V-01–V-04).

## Recommended answers (accept / reject)

P1(b) adapter · P2 runtime world units · P3 add `straight-precision` · P4
replacement-based · P5(a) if art budget allows, else drop swept · P8 keep source heating
but re-tune basic reflection so it never trips in ordinary play. This unblocks art
registration without changing physics or save semantics.
