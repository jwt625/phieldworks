# 036 — Asset-generation request: conveyor belts (material routes), v1

Date: 2026-09-16. Status: **planning feedback + source art delivered; packed seam-qualified atlas pending**.
Requester: coding agent. Sibling: [035 wave-guide asset request](035-wave-logistics-asset-request.md).
Interface contract: [032 modular route seams](032-modular-route-seams.md). Precedent:
[033 connected-kit review](../verification/033-connected-route-kit-review.md) and pass-10/11.

## Why

Material belts are the last major renderer-native surface: a dark casing stroke plus a
gold core polyline with round joins (`src/renderer.ts:62`), and packets are small gold
squares (`renderer.ts:64`). There is **no belt body asset** in `assets/manifest.json`,
and the item-crate sheets are not loaded: `transport-items-v1.png` and
`transport-items-v2.png` live under `assets/animations/candidates/`, which the explicit
`assets.ts` globs do not include, so the `sprites['transport-items-v1']` branch never
runs and the state review reports missing item art (`src/state-review.ts:26`). With the
pass-11 pipe casings now registered, the starter example mixes a detailed pipe language
with flat belt strokes.

## Runtime facts the art must fit (authoritative)

- A belt is a `Connection` of type `material`: `{path: Point[], radius, diagonal,
  packets: number[]}` on the half-tile lattice, point-to-point only (output→input).
- `connect` enforces `role==='output'` at `a` and `role==='input'` at `b`, so travel is
  always `a→b`; no reverse pose is required.
- Endpoints today: extractor `ORE OUT` at local `(w/2, h)` normal `(0,1)`; assembler
  `ORE IN` at local `(w/2, 0)` normal `(0,-1)`.
- Packets travel by arc length at 2 tiles/s (`world.ts` material step); capacity is
  `floor(length*2)+1`. The renderer places sprites with `pointAt(path, travel)`.
- Existing routes use `lineJoin='round'`; corners are lattice points and the path may also
  be **diagonal** (the UI `D` toggle and `connect({diagonal:true})` allow 45° segments).
- Belts have no condition/temperature state; only intact.

## Decisions needed before generation

**B1 — Belt interface dimensions.** Propose freezing one shared belt cross-section, e.g.
casing width 0.5 tile, core width 0.32 tile, item crate 0.32 tile, and a repeat period
(e.g. 0.5 tile chevron cadence). Confirm the numbers and that runtime world units own
them (as with the pipe `GUIDE_INTERFACE`), or state the authoring units and the exact
tile mapping. Do not stretch a sprite to a route length.

**B2 — Diagonal belts.** Keep 45° belts (requires diagonal repeat bodies and diagonal
corner-to-straight mating), or v1 is cardinal-only with the native fallback for legacy
diagonal saves? Either is acceptable; the request needs a decision, not a silent choice.

**B3 — Animated surface.** Static bodies with moving crates (current model), or a belt
surface whose chevrons scroll at 2 tiles/s driven by `world.time` (a UV/step animation)?
If animated, state frames/period and reduced-motion behavior (hold a fixed frame).

**B4 — Item crates.** Promote the existing `transport-items-v1`/`v2` 1254×1254 candidates,
or generate a new four-item sheet (ore nugget, finished assembly, precision crystal,
scrap) sized to the B2/B1 interface? Give exact source rects and a stable per-item key
(`ore`, `assembly`, `crystal`, `scrap`); the runtime currently assumes a 2×2 layout.

## Deliverables

1. Cardinal belt kit: H and V periodic straight bodies with matched left/right and
   top/bottom cross sections; 4 corner tiles (and diagonal bodies if B2 keeps them);
   optional per-port apron/connector at real machine terminals only.
2. An atlas + machine-readable manifest keyed by `{axis, rotation/turn, rect, gutter,
   profileCenter, profileWidth, period, repeatAxis, tier}` — enough for `renderer.ts` to
   register without guessing, mirroring `assets/production/pass-11-runtime-kit/atlas.json`.
3. Promoted item-crate registrations with rects and keys, behind an explicit glob.
4. A seam-gate report (see gates) with source hashes and screenshot paths.

## Hard constraints (032)

- One shared connector cross section per belt tier; straight bodies reach their repeat
  edges with no run-axis padding or end caps. Route corners mate to straight edges
  exactly; no black mouth between joined bodies.
- Coding owns composition (`renderer.ts`), including sampling gutters, conditional
  terminal detail, crop-to-length and gap fidelity. Assets own rects, anchors, profiles
  and decoration. No required runtime asset module.
- One joint sleeve/overlay per actual mating joint, owned deterministically by sorted
  endpoint ids; none for missing segments. A deleted belt must stay visibly open.
- No anisotropic stretching; world-fixed lighting. Atlas entries need extruded sampling
  gutters and clipped source rects for fractional-zoom seam safety.
- Keep the existing crate scale/registration so packet positions do not shift.

## Acceptance gates (asset-side)

- Repeat edges: identical alpha support and premultiplied channel error ≤ 2/255 at every
  declared interface; exact periodicity where claimed; report actual source resolution.
- All directed mating combinations: straight↔straight H/V, straight↔each corner in both
  orientations, corner↔corner where the runtime can produce it, and (if B2) diagonal↔
  cardinal mates.
- Arbitrary installed lengths: one half-tile up to many tiles, first/last period cropped,
  no width jump or doubled collar at joints.
- Item crates register to the belt core, sit on the run, and read as distinct ore/
  assembly/crystal/scrap at working zoom on light/dark/terrain.
- Scale matrix 0.25/0.5/1/1.25/2 at DPR 1/2 with fractional camera translation; no
  cracks, no internal end caps, joined centerline fully opaque.
- Direction legibility: travel direction is clear from the body alone.

## Explicitly not requested

No simulation, path/footprint, capacity, speed, save-schema or port-map change. No
splitters/mergers (belts are point-to-point in the runtime). No damaged-belt families.
Power ducts are a separate future kit. Do not promote the `candidates/` item sheets into a
whole-folder glob; register reviewed entries explicitly.

## Planning / asset response — 2026-09-17

Decisions B1–B4 and direction/packet geometry corrections:
[037](../planning/037-conveyor-asset-decisions.md).
Source sheets, exact existing-item registrations and target belt manifest:
[pass-12](../../assets/production/pass-12-conveyor-kit/README.md).
Measured source metadata, visual findings and all outstanding seam gates:
[038](../verification/038-conveyor-asset-review.md).

No code authored or runtime assets installed by this handoff. Item v1 is selected
for one-file promotion; generated belt sheets are unregistered source artwork.
