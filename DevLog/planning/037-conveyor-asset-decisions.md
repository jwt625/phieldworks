# 037 — Conveyor v1: planning and asset contract

2026-09-17. Response to [036](../production/036-conveyor-belt-asset-request.md).
Scope: planning, image generation, source review and metadata. Coding owns renderer
implementation, exact casing composition/packing and browser seam measurements.
No code, simulation, save, capacity, speed or path changes in this delivery.

## Decisions

| ID | Decision |
| --- | --- |
| B1 | World units own the interface: casing **.50 tile**, core **.32 tile**, item draw rectangle **.32×.32 tile**, centered on the existing packet position. Nominal directional marking period **.50 tile**. Target exact authoring scale **200 px/tile**: casing 100 px, core 64 px, period 100 px. Generated concept-sheet pixels are not yet at this scale. |
| B2 | V1 raster kit is **cardinal-only**. Keep ALL existing diagonal behavior, including new routes made with D, through native fallback. Fall back for the **whole route** if any non-cardinal segment occurs, avoiding unreviewed raster/native mixed seams. No save migration or placement restriction. Diagonal asset mating is explicitly out of v1. |
| B3 | **Static body and direction markings; moving items** retain current simulation positions and 2 tiles/s speed. One intact body frame, no time-driven UV scroll. Reduced motion needs no belt animation change; do not freeze or offset authoritative packet positions. |
| B4 | Select existing **transport-items-v1.png**, transparent 1254×1254, for explicit item-source promotion. Reject v2 for belt use: it has an opaque dark background. Keep full 627×627 quadrant crops and existing .32-tile draw rectangle/center. Four stable keys: ore, assembly, crystal, scrap. Source approval is not completed runtime installation or small-scale visual acceptance. |

## Direction correction

Output→input fixes ordering, not world orientation. An a→b segment may travel E, S,
W or N. Direction-painted straight art needs **four poses**, not just H/V. Each of
four physical corner shapes needs **two directed marking variants**. Geometry may
share a silhouette, but world lighting must remain fixed; do not rotate a lit raster
to reverse its arrows. Use ordered path tangent, never sorted endpoint position, to
select direction. Sorting endpoint IDs is only for joint ownership.

Straight rotation convention: 0 E, 1 S, 2 W, 3 N in screen/world coordinates (+y down).
Corner identity is explicit inlet→outlet: W→S, W→N, N→E, E→S, S→W, N→W, E→N, S→E.
Outward port normals point out of the body; inlet travel is opposite its normal.

## Geometry and packet registration

Reference straight repeat rect is 100×100 source pixels = .5×.5 tile. H centerline
y=.25, terminals (0,.25)/(.5,.25); V centerline x=.25, terminals (.25,0)/(.25,.5).
Normals are cardinal outward vectors; connection plane z=0 and n·(p−center)=0.
At repeat boundaries all geometry/alpha/color comes from one compatible profile;
direction marks remain interior to the repeat's connector aprons. Exact source rects
will be issued only after packing, not inferred from the generated source-sheet grid.

For a corner at route vertex V, the target visual slot is **1×1 tile** centered on V,
with terminals .5 tile away along inlet and outlet arms. The load-bearing bed must
cover the **existing sharp L path through V**. Use a square rubber turning pad
centered on V and rounded exterior casing; no offset circular centerline that makes
`pointAt(path, travel)` packets leave the belt. Do not move packets onto a new arc or
change route length to fit an image. This is visual ownership, not new hardware.

Isolated corner slots visually own the last .5 tile of the incoming arm and first
.5 tile of the outgoing arm. If neighboring slots overlap (including .5-tile zigzags),
or an endpoint has insufficient room, **fall back for the entire route to native
geometry** until a packed/native corner-composition case passes. Do not stretch or
shrink corner images and do not let two corner sprites overwrite one another. Such
routes remain legal and usable; exact raster corner coverage is a later acceptance
gate, not a reason to change simulation geometry.

Preserve packet draw origin `(pointAt.x−.16, pointAt.y−.16)` and extent `.32`.
Full-cell padding is part of existing registration: do not trim to visible bounds,
recenter to a perceived rock center, or rotate item images with belt direction.
Current packets are untyped numbers: render ore only. Other item keys are reserved
art availability, not permission to invent assembly/crystal/scrap transport behavior.

## Composition boundary

- Coding owns cropping first/last repeats to actual route length, source phase,
  world-to-screen transform, extrusion sampling, machine layering and real gaps.
- Carry the .5-tile marking cadence along route arc length where feasible. For static
  corner variants, place directional marks inside the turning pad; casing profiles,
  not coincident arrow phase, are the seam requirement.
- Body lighting stays upper-left in world coordinates. Use independent direction
  sprites or neutral native casing with direction-only overlays.
- No caps, roller mouths or sleeves inside repeat bodies. Optional terminal apron
  only at the extractor/assembler port, on the route-owned side, width .5; do not
  imply a new machine port or stretch the machine artwork. Terminal apron source art
  is deferred; existing native endpoint treatment is the v1 fallback.
- Whole-route deletion removes its body and all its overlays. Material routes have
  no persisted physical segment IDs; artificial test gaps must be honored by the
  composition fixture, not described as a new delete-one-segment gameplay feature.
- No joint sleeve is needed for a continuous conveyor surface. If coding adds a
  reviewed connector detail, own it once per real joint, never per sprite edge.
- Use ordinary source-over compositing for transparent item art. Existing `atlas()`
  uses lighten; provide a scoped item draw path/option rather than changing every
  machine's compositing. Parent must compare ore against the carrying surface.

## Acceptance and ordered handoff

1. Load only the exact approved item path and keys from pass-12 metadata. Verify
   packet position/scale stays unchanged; check ore on three backgrounds.
2. Use generated belt source artwork as interior material/style for **exact native
   masks and connector aprons**, as allowed by 032. Export actual packed straight/
   corner sources at the frozen dimensions with ≥2px extruded gutters. No source
   sheet is automatically a periodic runtime atlas.
3. Register four directed straights; then eight directed corners. Keep the declared
   route fallbacks until their coverage is accepted. No glob over candidates/.
4. Measure every directed mate, crop phase and .5-tile/long run; test corner↔corner,
   S/U/loop shapes, terminal alignment, deleted spans and whole-route deletion.
5. Capture scales .25/.5/1/1.25/2 × DPR 1/2 × light/dark/terrain with fractional camera
   translation. Record source hashes, exact profiles, maximum premultiplied error
   ≤2/255, identical alpha support, repeat equality and joined centerline alpha 255.
6. Parent reviews actual captures and direction legibility, including opposite travel
   and item readability. At extreme zoom-out .32-tile items become only a few pixels;
   record actual device-pixel sizes and failures rather than promise semantic detail.

Assets: [pass-12](../../assets/production/pass-12-conveyor-kit/README.md).
Evidence/status: [038](../verification/038-conveyor-asset-review.md).
