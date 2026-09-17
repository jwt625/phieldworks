# 031 — Physical wave logistics asset production

Date: 2026-09-16. Status: **pilot generation started; runtime promotion pending**.
User requested asset planning and generation for [029](../planning/029-early-game-wave-logistics-handoff.md).
Built-in imagegen skill/tool used; parent owns generation and multimodal review.
Sources and exact prompts: [pass 09](../../assets/production/pass-09-wave-logistics/).

**Connected-kit follow-up:** [pass10](../../assets/production/pass-10-connected-kit/README.md)
delivers 18 seam-tested compact sprites plus assembly renderer/atlas metadata.
[033](../verification/033-connected-route-kit-review.md) records exact edge matches
and parent visual inspection. This completes a standalone connection pilot, not
WA-08 live-game promotion, original master approval or the swept/damage families.

## What needs generated art

**Modular connection correction:** [032](032-modular-route-seams.md) now defines
periodic H/V bodies, capless mating interfaces, separate endpoint caps, one sleeve
per joint and assembled-route acceptance. Standalone pilots are not seam-ready tiles.

Generate physical hardware skins and inventory art. Route geometry, hit areas,
construction ghosts, port markers, selection, heat/flow/fault effects remain code-owned.
Do not bake arrows, field emission, status lamps, warning text or simulation states
into intact hardware. Static guides/junctions need no invented motor animation.

Pilot masters establish material language and topology readability, not final tile
footprints. R-01/R-02 coding geometry must be fixed before production registration
or mass direction/condition generation. Art cannot override ports to fit a picture.

## Work packages

| ID | Priority / dependency | TODO | Completion criteria |
| --- | --- | --- | --- |
| WA-01 | P0 now | Generate basic elbow, precision elbow preserving terminals, and independent-layer crossing pilots | Real alpha; matching materials/camera; two-port bends, four-terminal unconnected crossing; inspect at 48/96/256 px |
| WA-02 | P0 after R-01 geometry | Generate straight master and swept elbow; correct pilot terminal registration to frozen templates | Straight repeats without doubled collars/seams; large elbow occupies genuinely larger footprint; cropped/anchor manifest agrees with simulation |
| WA-03 | P0 after junction port contract | Basic and matched four-port junction masters | Four ports at actual code positions; recognizable reject/useful routing via overlay; upgraded housing distinct; never reuse existing cross-shaped art blindly for two-ports-per-side geometry |
| WA-04 | P0 after master acceptance | Derive required orientations: straight H/V, each elbow four turns, junction r0–3, crossing two overpass orientations | Fixed world camera/light, independently authored views; no image rotation/mirroring that rotates lighting; per-view source rect, port and ground anchors |
| WA-05 | P1 after registered intact views | Damaged and wreck skins for parts that implement condition | Same footprint/anchors; dark passive hardware; no disappearing open ends or apparent new connections; intact/off share chassis |
| WA-06 | P1 R-05 | Inventory icons for basic/improved elbow, straight, junction, crossing and spendable precision part | Recognizable at 24/32/48 px, no rendered text; use approved master crops where sufficient, generate only missing silhouettes |
| WA-07 | P1 R-08 | Stock-transfer depot master/views and typed workpiece/accepted/reject packet artwork | Actual material port map frozen first; different items identifiable by shape; rework provenance code-owned; no duplicate fabrication-cell generation (coordinate 028 AN-07) |
| WA-08 | P0 release | Explicit loader/renderer registration and parent in-world review | Only accepted files loaded; no candidate glob imports; source-over compositing; V-01–V-10 in 030 exercised on integrated art |

### Progress checklist

- [x] Inspect existing junction and tuner reference art and renderer mapping.
- [x] Generate three WA-01 single-object pilots with built-in imagegen.
- [x] Preserve originals in repo and record prompt provenance and source audit.
- [x] Inspect WA-01 at game sizes/backgrounds; record limitations per candidate.
- [ ] Approve WA-01 after geometry/registration and crossing readability corrections.
- [ ] Freeze port/footprint contracts and regenerate/correct to them (WA-02/03).
- [ ] Complete registered direction/condition/item families (WA-04–07).
- [ ] Coding agent integrates accepted sources; parent validates in actual gameplay (WA-08).

## Registration and visual gates

- Match restrained pre-rendered graphite steel, ivory ceramic and copper. Basic uses
  rough segmented casings/bolts; precision uses sealed shell, machined mounts and a
  continuous copper outer band. Tier remains readable in grayscale by construction.
- Fixed oblique top-down camera and upper-left illumination. Cardinal guide terminal
  axes must map to world axes. Existing reference pictures are style references, not
  authoritative port/rotation maps; north-facing terminals need direction verification.
- Actual alpha 0 outside the object, no opaque matte/checkerboard, no clipped pixels.
  Inspect normal source-over on light, dark and actual terrain, not black alone.
- At 48/96 px inspect topology and tier; at 256 px inspect outline/fringe/collars.
  At final scale, anchor drift between upgrade variants must be ≤1 screen pixel for
  each terminal. Record measured positions; visual similarity alone is insufficient.
- Straight-to-elbow seam must remain connected through all supported rotations/zooms.
  No per-axis stretching to hide errors. Crops/rigid placement must preserve shape;
  regenerate if geometry differs. Shadows cannot look like additional occupied cells.
- Crossing must show separated casings and underpass; junction shows actual joining
  hardware. Test without explanatory labels. Add code-owned connectivity overlay for
  close inspection, but do not use it to excuse an ambiguous primary silhouette.
- No unearned optical-performance claims in art; lower loss belongs to definition and
  measured gameplay. Decorative bands do not grant capability automatically.

## Pilot production record

All four files are candidates, not loaded by runtime. Alpha/dimensions/hashes are
in `source-audit.json`; exact prompts and source paths in `prompts.json`.

| Source | Initial full-size inspection | Remaining gate |
| --- | --- | --- |
| basic-elbow-r0-v1.png | Clear L shape, two terminal collars, restrained existing material family | Small-size/terrain readability, actual code port registration, all other directions |
| precision-elbow-r0-v1.png | Continuous outer copper band and smoother casing clearly differentiate upgrade; terminal placement appears close | Measure terminal anchor match; full runtime dimensions not fixed |
| crossing-r0-v1.png | Raised E/W housing and visible N/S underpass convey separate paths at full size | North port perspective and small-size non-connectivity need independent review; not runtime accepted |
| crossing-r0-v2.png | Targeted edit enlarges bridge opening; north mouth perspective remains incorrect and lateral terminals shifted | Do not promote; fix against frozen geometry, then repeat topology/seam review |

Parent gallery inspection: 48/96/256 px full canvases on light/dark/basalt. Elbows
read at 96/256 px; 48 px tier distinctions are weak with current source padding.
Crossing v1 is ambiguous at small size. V2 is a correction candidate, not a pass.
Body alpha is mostly 253; low-alpha outliers enlarge bounds. Real transparency is
verified, but exact crops/anchors and in-world source-over remain separate gates.
See the pass09 README for findings and the saved gallery for observed presentation.

Next generation order: corrected geometry masters → straight/swept elbow → junction
variants → orientation set → required conditions and depot/items. Avoid producing
dozens of unregistered sheets before the first guide-to-machine seam is proven.

See also: [034 integration request](../planning/034-wave-logistics-integration-request.md) (planning decisions blocking registration) and [035 asset request](../production/035-wave-logistics-asset-request.md) (runtime-keyed sprite brief and seam gates).
