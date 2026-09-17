# 038 — Conveyor source review and seam-gate status

2026-09-17. Request [036](../production/036-conveyor-belt-asset-request.md).
Plan [037](../planning/037-conveyor-asset-decisions.md).
Assets [pass-12](../../assets/production/pass-12-conveyor-kit/README.md).

**Verdict: planning/source artwork delivered; complete 036 asset acceptance pending.**
No new code or runtime integration. Numerical seam measurements and assembled
screenshots are not available for these generated sources. This is not a seam pass.

## Inspected sources

- Opened existing transport-items-v1 and v2. V1 has four separated item designs:
  orange nugget, intact coil, blue crystal and broken coil/steel scrap. V2 has an
  opaque dark background. `sips` confirms 1254×1254 for both, alpha present only in v1.
  Approve v1 for explicit source registration, keeping original 627×627 cells and
  .32-tile centered draw size. At-source inspection does not establish 2–8px readability.
- Opened pass-06 belt inventory icon: material/style reference only; isometric camera
  and freestanding end rollers make it unsuitable as a route sprite.
- Opened first generated straight sheet: E/W/S/N arrows correct; terminal rollers,
  bulky end blocks and visible background fail the route-body brief. Rejected.
- Opened straight v2 correction: transverse end rollers removed; haze remains outside
  silhouettes. Retained as intermediate, with targeted background extraction requested.
- Opened straight v3 extraction result: visible haze still remains, so extraction
  **failed**. Do not treat its alpha-channel presence as clean transparency. A fresh
  straight generation uses the transparent corner sheet as style reference instead
  of carrying the hazy straight master forward.
- Inspected fresh straight v4: four correct directions and simpler/larger chevrons,
  but visible haze and end-side blocks persist. Reject direct runtime use. V2 remains
  the preferred interior material reference because it removed the end hardware;
  neither v2 nor v4 is a clean cutout or periodic source. No further extraction success
  is claimed. Source rects remain null instead of inventing seam measurements.
- Opened corner sheet: all eight requested inlet/outlet directions appear in the
  specified order, with reverse markings on the second row. Two arms per corner,
  no splitter/merger hub. Metallic detail and gold arrows are readable at source size.
  Rounded/slatted beds are not evidence that the exact sharp path vertex and item
  bounds fit. Casing width equality, edge profiles and connector positions unmeasured.

## Gate matrix

Every assembled fixture requires .25/.5/1/1.25/2 scales × DPR 1/2 × three backgrounds
(light/dark/terrain), with fractional camera translation: **30 conditions per fixture**.
Record actual CSS pixels per tile; a zoom multiplier alone does not specify item size.

| Requested gate | Status / required evidence |
| --- | --- |
| Exact source resolution and hashes | Measured with `sips`/`shasum`; recorded in `review.json`. |
| Actual mating alpha support and ≤2/255 premultiplied error | **Not measured.** Generated cells have run-axis padding and no declared packed mating edges. Transparent cell boundaries are not evidence of a match. |
| Exact H/V periodicity | **Not established.** Static source chevrons/slats are design examples; no seamless period extracted or approved. |
| Directed straight↔straight and straight↔corner mates | Pending exact packed profiles and composition. Four straight directions and eight corner directions included as source concepts. |
| Corner↔corner at legal spacing | Pending; native whole-route fallback for overlapping .5-tile corner slots. This fallback does not satisfy the raster gate. |
| Diagonal↔cardinal mates | Explicitly outside v1 raster scope; diagonal route remains entirely native. |
| Half-tile through many-tile lengths; arbitrary first/last crop phases | Pending coding fixture; target period .5 tile, never stretch to installed length. |
| Item rectangles and registration | Exact full-cell rects delivered. Source selection approved; current packet position/scale retained by contract. |
| Item readability on light/dark/terrain at working scale | Pending actual renderer captures. Detailed assembly/scrap silhouettes may converge at extreme zoom-out; do not claim pass from full-size sheet. |
| No doubled collars/internal caps | Straight v1 fails; revised source removes rollers. Full assembled result unverified. No sleeve assets required in v1. |
| Fully opaque joined centerline | Pending pixel readback; require 255 at sampled centerline, not an averaged image-alpha claim. |
| Corner bed contains sharp path vertex | Pending exact native-mask/packet overlay test; no route length or pointAt change authorized. |
| Deleted span/route remains open | Pending fixture; no topology-free seam patches or overlays retained after deletion. |
| Endpoint machine alignment | Pending extractor ORE OUT/assembler ORE IN tests across rotations; no machine apron source promoted. |
| Direction legibility from body alone | Source sheet passes directional inspection; live scale matrix remains pending. |
| Extruded sampling gutters and clipped rects | **Not delivered for belts.** Target ≥2px extrusion after exact authoring/packing. |
| Browser screenshot paths | None: no new runtime assembly/gallery implementation. Generated sheets are review images, not browser evidence. |

## Promotion and completion

Asset-side selected item path: `assets/animations/candidates/transport-items-v1.png`.
Runtime item installation and browser review remain coding/parent tasks. No whole-
folder glob is authorized. No generated belt source is on a runtime promotion list.

The requested packed, seamless belt atlas is still outstanding. Coding owns the
deterministic casing composition implementation under 032; asset/planning supplies
the source designs and frozen geometry here. Return exported source rects, measured
profiles, decoded atlas hashes and the complete fixture matrix for final asset review.
Do not mark 036 done based on this source-art handoff.
