# 032 — Modular route kit and periodic seam contract

Date: 2026-09-16. User clarification: elements must connect continuously along a
route, including left/right and top/bottom periodic straight sections.
Status: **contract and raw repeat pilots; production seamless kit not complete**.
Follow-up: [033](../verification/033-connected-route-kit-review.md) now records a
passing compact hybrid kit (18 exported sprites, exact matching interfaces, native
and PNG assembly tests). Raw pass09 files below retain their failed status;
live-game machine interfaces and larger swept parts remain pending.
Refines [031](031-wave-logistics-assets.md) and [029 R-02/R-06](../planning/029-early-game-wave-logistics-handoff.md).

## Correction to previous pilot scope

The first elbow/crossing images were material/silhouette masters with padded canvases
and terminal collars. They were not edge-matched route tiles. Do not concatenate
their whole canvases, rotate horizontal art into vertical art, or use per-axis
stretching to make incompatible terminals meet.

## Required kit

| Element | Repeat / connection rule |
| --- | --- |
| Horizontal straight body | Left/right boundary cross sections match; no horizontal padding or end cap |
| Vertical straight body | Top/bottom boundary cross sections match; independently lit world orientation |
| Compact elbow, four orientations | Two open connection interfaces matching straight bodies; decoration fits owned footprint |
| Swept elbow, four orientations | Same terminal interface; larger real footprint and clearance |
| Basic/precision junction | All four declared terminal locations/normals match connectors; no implied extra branching |
| Two crossing orientations | Separate layers; same ground-level external interfaces, bridge entirely within footprint |
| Endpoint socket / open end / dump adapter | Separate cap only at a real terminal or gap, never repeated on every segment |
| Joint sleeve | One sleeve per physical mating joint, not one per adjoining sprite; passive decoration unless modeled hardware |
| Upgrade variants | Identical compatible terminal interfaces; different interior casing/detail; adapters for genuinely different sizes |

## Geometry and rendering contract

- Coding agent freezes world-unit interface center, normal, width, visual height,
  connection plane, source scale and footprint before final asset generation.
  Suggested authoring coordinates: square normalized tile, straight axis at 0.5,
  guide cross section width 0.24, ports at opposing edge midpoints. These are
  prototype targets, not new authoritative world dimensions. Larger machines retain
  their own port maps with standardized terminal cross sections.
- Straight body source reaches its repeat edges; transparent padding exists only
  perpendicular to the run. Shadow/trim must have matching edge profiles too.
  Source canvas period and physical construction piece length are separate metadata:
  do not force a whole world tile per half-tile piece merely because art is square.
- Each elbow/junction/crossing uses identical mating cross sections. In connected
  state do not draw an open black mouth between bodies. Caps/socket overlays are
  conditional on actual connectivity. Joints render once with deterministic ownership.
- Prefer deterministic renderer-owned outer silhouette and connector sleeves, with
  generated interior skin. This guarantees alignment while preserving detailed art.
  If a bare raster is used edge-to-edge, it must pass the pixel seam tests below.
  Neither masks nor sleeves excuse a mismatched physical width/centerline.
- Fix lighting in world coordinates; H/V and turns are authored independently.
  Use a declared render scale/rigid placement, never anisotropic stretching.
- Atlas packing needs extruded sampling gutters and clipped source rectangles; render
  adjacent boundaries from the same world→screen transform to avoid fractional-zoom
  cracks. Sampling gutters are not empty physical padding. Do not bridge real gaps.
- Registration metadata: source rect, repeat axis/period, cross-section profile,
  ground anchor, each port center/normal/width, optional sleeve/cap attachment,
  visual extent and compatibility family. Runtime physics remains authoritative.

## TODO / handoff

- [x] Generate raw H and V repeat pilots using built-in imagegen; preserve originals.
- [x] Provide browser gallery repeating unmodified sources and an edge audit.
- [ ] Coding R-01/R-02: freeze one connector interface and export geometry templates.
- [ ] Asset WA-02: regenerate/correct H/V width and edge profiles to those templates.
- [ ] Asset WA-02/03: derive capless elbows/junctions/crossings with matching interfaces.
- [ ] Coding R-06: body/connector/cap composition, sampling gutters and joint ownership.
- [ ] Parent WA-08 / V-03: approve assembled route, not isolated thumbnails.

## Validation gates

1. H: compare left/right edge alpha and premultiplied RGB over occupied rows; V:
   compare top/bottom over occupied columns. Report profile span/center differences,
   mean/max differences and actual source resolution. Disconnected masks fail.
2. Production bare-raster edges: identical alpha support at the interface and no
   visible discontinuity; target mean premultiplied channel error ≤2/255. Report
   high-frequency texture mismatch separately; don't average it away with transparent
   canvas. Exact periodic edge values are preferred. Raw generators are not trusted.
3. Render 10 repeats H and V, straight→each turn→straight, S/U loops, junction branches,
   crossing, endpoint and mixed-tier replacement. Verify all compatible interfaces
   across rotations, including expected non-connections.
4. Inspect light/dark/terrain at actual working zoom, 0.5/1/1.25/2 scale and DPR 1/2.
   No cracks, doubled collars, width jumps, end caps inside a run, texture discontinuity
   or shadow bands. Ensure disconnected gaps remain visible.
5. Record source hashes, screenshot paths, connector measurements and pass/fail.
   Parent image review and numerical checks both required before runtime promotion.

## Current evidence

Sources: `assets/production/pass-09-wave-logistics/straight-{h,v}-repeat-v1.png`.
Exact prompts: `prompt-repeat.json`. Gallery: `repeat-review.html`.
Machine report: `repeat-edge-audit.json`. Screenshot: `repeat-review.png`.
Both are new orientation-specific images, not rotated copies. Raw generation
reaches repeat boundaries, but shared H/V width and periodic pixel matching must be
measured; these sources are candidates and are not integrated into gameplay.

Measured initial audit (1254×1254 originals):

| Candidate | Opposing edge body span | Mean premultiplied RGB difference /255 | Verdict |
| --- | --- | --- | --- |
| H | 257 vs 256 pixels | 6.93 | Fails exact alpha support and ≤2 color gate |
| V | 215 vs 215 pixels | 7.89 | Support matches; fails ≤2 color gate |

H/V widths also differ (~20.5% vs ~17.1% of source). Parent inspected repeated
runs on light/terrain in `repeat-review.png`: continuous-looking at overview, but
not a production-matched kit. Do not hide these failures with nonuniform scaling.
Next correction must use frozen silhouette templates/renderer-owned connectors and
repeat this audit; seamless status remains unapproved.

See also: coding requests [034](../planning/034-wave-logistics-integration-request.md) (geometry/authoring-space decisions) and [035](035-wave-logistics-asset-request.md) (runtime-keyed kit brief); both depend on this contract.
