# 033 — Connected route kit: measured and visual seam review

Date: 2026-09-16. Reviewer: parent/orchestrator agent.
Request: test actual continuous routes and iterate until connections work.
Status: **pass for the 18-sprite standalone rendering kit; live-game integration pending**.
Sources/evidence: [pass10](../../assets/production/pass-10-connected-kit/README.md).

## What changed and why

Pass09 standalone elbow/crossing masters and raw repeat images were not a compatible
tile set. The raw H/V widths differed and edge pixels failed periodicity. Repeated
generative prompts did not guarantee exact geometric constraints.

The delivered kit implements the hybrid contract in [032](../production/032-modular-route-seams.md):
renderer-native casings, canonical capless interfaces and conditional terminal details,
with original generated ceramic detail used as an interior material. No generated
source image was overwritten, anisotropically stretched, or declared seam-ready.
The native composition is also exported as an actual PNG atlas with source metadata.

Iteration 1: assembled paths had no gaps, but curved vs straight stroke rasterization
differed by one RGBA channel at some mating boundaries; enlarged texture had a visible
rectangular patch. Failed evidence is preserved in `iteration-01-failed.json`.

Iteration 2: canonical terminal aprons remove that rasterization discrepancy and
feathered material application removes the patch boundary. Both native composition
and the subsequently exported/decoded PNG atlas pass the final checks below.

## Measured verification

Command: `node assets/production/pass-10-connected-kit/verify.mjs`.
Exact browser version, implementation/atlas SHA-256 hashes and all cases are recorded
in `validation.json`; working tree was not committed or reset for this review.

| Gate | Result |
| --- | --- |
| 576 directed mating combinations, all declared ports and both tiers | Maximum RGBA channel difference **0** |
| H left/right and V top/bottom repetition | Exact RGBA matches; both support widths **32 px** |
| Per-piece continuous casing from input to output, all non-crossing variants | Flood-fill passes |
| Native route render: 9 fixtures × 5 scales × 2 DPR settings | **90 pass**, joined centerline alpha ≥250 |
| Exported PNG route render, same conditions | **90 pass**, joined centerline alpha ≥250 |
| Deliberately deleted segment | Tested missing span alpha **0**, no false bridging |
| PNG export vs separately rendered native sprites | Maximum channel difference **0** |
| Closed four-turn loop | No unmatched terminals |
| Crossing metadata vs junction metadata | Two independent opposite-port channels vs one four-port group |
| Browser page errors | **0** |

Scales 0.25/0.5/1/1.25/2, DPR 1/2; assembled pixel tests include fractional camera
translation (12.37, 12.19 CSS pixels). Centerline sampling proves no gaps at the joins;
full width/appearance additionally relies on exact profiles and the visual review.
These are renderer tests, not new optical/economy/gameplay acceptance results.

## Parent multimodal inspection

The parent opened the actual rendered image files with the image viewer, separately
from the automated pixel checks. Images show the PNG atlas render mode where relevant.

| Evidence | Observed result |
| --- | --- |
| `connected-kit-atlas.png` | Consistent H/V cross section; all four turns present; precision reinforcement stays inside interface; ports uncapped |
| `assembly-light-dpr1.png` | Repeated straights and all bend joins continuous; no internal black mouths; junction and overpasses distinct |
| `assembly-dark-dpr1.png` | No background cracks or bright matte; intentional overpass occlusion remains distinguishable from junction |
| `assembly-terrain-dpr1.png` | Loop, S/U, mixed-tier and branching routes remain legible and connected; deleted segment remains a clear gap |
| `loop-fractional-dpr2.png` | Four corners and long repeated runs join without visible width jumps or sampling cracks at 1.25 scale / DPR2 |
| `cross-v-2x.png` | Continuous overpass with separate under-route; no central joining hub or endpoint caps at joints |

Earlier iteration overview and H-crossing enlargement were also inspected and prompted
the material-border correction. Final automated capture set additionally includes
2× loop/junction/H-crossing and 0.25× overview; image existence alone is not a separate
claim that every capture received individual visual review.

## Coding-agent handoff and remaining limits

- Accepted: seam/connectivity presentation of this compact route kit, including its
  exported sprites and the provided assembly renderer's topology-conditioned join pass.
- Not claimed: runtime installation, actual machine-port alignment, bend physics,
  manufactured upgrades, qualification changes, full industrial art style approval,
  larger swept-radius pieces or damage-state families.
- In particular, this prototype cardinal-port junction is not a drop-in replacement
  for the current two-ports-per-side runtime hybrid. Adapt to agreed game geometry
  and repeat the route-to-machine seam tests before promotion.
- Integrator uses the atlas/source rects and shared connection interface; preserves
  actual gaps and split/crossing topology. Do not promote failed pass09 masters.
- [030](030-wave-logistics-validation.md)'s full live-game V-03 and release gates
  remain pending. This review satisfies the standalone-kit portion only.

No full simulation/build regression was rerun: changes are isolated asset tooling,
gallery code and documentation; nothing in `src/` or runtime loader was modified.
