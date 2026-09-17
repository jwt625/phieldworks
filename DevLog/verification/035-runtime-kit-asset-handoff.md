# 035 — Runtime kit asset handoff: partial, not promoted

2026-09-16. Scope: planning, source artwork, registration metadata and review.
No application code or asset-generation/verification code authored. No runtime
integration, simulation, balance, save, footprint or port-map change.

Decisions: [034](../planning/034-wave-hardware-integration-decisions.md).
Delivery: [pass-11](../../assets/production/pass-11-runtime-kit/README.md).

## Exact straight subset

The delivered PNG is a byte-identical copy of pass-10; SHA-256
`5eecd3fb93cd301a39621493ddcbd16cb398db987f307629466fbe0ed2c020ff`.
The new manifest registers only two source rectangles through four runtime pose keys.
The other pixels in that atlas are deliberately unregistered. Promotion is an explicit
empty list until the coding-agent render and parent review pass.

H source rect [2,2,128,128]; V [134,2,128,128]; gutter 2 source pixels.
Source cross-section center 64; nominal occupied interval [48,80], width 32 pixels.
Uniform source scale .0075 tiles/pixel yields width .24, center .48 in the source
square, repeat period .96. Source square padding transverse to the guide is transparent.
H/V and reverse travel poses reuse independently authored world-oriented H/V sources;
no raster rotation, mirroring or anisotropic scaling is required.

| Gate | Evidence / result |
| --- | --- |
| Source H/V edge support and periodicity | Pass-10 measured both 32px; exact opposing RGBA edges. Unchanged pixels, hence source result retained. |
| Cross-source channel error | Pass-10 measured maximum raw RGBA error 0 over 576 directed comparisons. Equal RGBA implies equal premultiplied values. This is historical source evidence, not a new runtime measurement. |
| Source export identity | Byte-copy hash verified for pass-11. Source PNG 1188×264 RGBA. |
| .24-tile nominal width | Exact arithmetic 32×.0075=.24; not a screen-space antialiasing measurement. |
| Half-tile clipping and .96-period world-phase repetition | Contract supplied; **not run** in runtime. Fractional clip boundaries can cut through a reinforcement band; parent must review. |
| Extruded gutters at partial-repeat clips | Existing source repeat-edge gutters retained. Interior crops need correct sampling from the same source; new renderer composition unverified. |

## Required assembled-route gate matrix

Do not inherit a pass for a changed world mapping or different entity geometry from
the cardinal prototype. Record each following gate independently in the coding
handoff, at scales .25/.5/1/1.25/2, DPR 1/2, on light/dark/terrain (30 conditions).
Use fractional camera translations and source readback, then parent image review.

| Required case | Pass-11 status / dependency |
| --- | --- |
| Ten H and V repeats; half-tile and multiple-span straights | Pending new-world-scale renderer check. |
| All directed compatible interfaces, rotations and tiers | Pending exact entity/turn registration. Measure alpha support and maximum premultiplied channel error ≤2/255. |
| Straight→each of four turns→straight; both chiralities | Blocked by P9 coincident elbow terminals. |
| S, U and closed loops | Blocked by P9. |
| Four offset junction branches, basic/matched, all rotations | New source art only; exact connector silhouettes/rects not supplied. Hybrid matrix order A,B,C,D must be checked from simulation. |
| Both crossing orientations, including reverse poses | Source art only; verify independent A↔C and B↔D channels from `partScattering()`, not `connections()`. |
| Endpoint socket/open end/dump attachment | Source concepts delivered; terminal-conditioned placement and actual machine seam pending. |
| Mixed-tier replacement | Precision elbow blocked by P9; matched junction geometry normalization pending. |
| Deleted straight | Runtime render pending; body clipping and no topology-free patch must preserve alpha 0 in missing span. |
| Deleted elbow | **Known construction-contract blocker:** neighboring straights retain common endpoint. No sprite promotion can solve this alone. |
| Condition overlays 1–3 | Treatment specified; clipping, .08-tile apron exclusion and interface invariance not implemented. |
| One sleeve per actual joint; no internal caps | Composition gate pending. Existing periodic straight band is integral reinforcement, not joint ownership evidence. |
| Joined centerline fully opaque | Pending new renderer; historical pass-10 tested alpha ≥250, which is not proof of exact 255 at all new interfaces. |

## Image inspection

Opened all three generated sheets with the image viewer. Basic swept sheet contains
the four requested corner directions and has a wider sweep than the compact source.
It is not metrically registered; radius/width and terminal edge equality are unmeasured.
Accessory sheet includes four mouths, four sockets, four dump attachments, H/V sleeves
and two scorch/crack designs. Accessories include extra guide stubs: do not overlay
their full cells onto a run or claim they are final transparent decals. The third
condition can use the heavy decal at a stronger treatment, clipped inside the body;
three separate damaged body families are unnecessary.

The first entity sheet failed: vertical junctions in columns 2 and 4 have only two
ports. It is preserved as a rejected source. Opened the targeted v2 correction:
all eight junction bodies now visibly have four terminals, two per opposing side.
The corrected sheet is the preferred visual source, but reverse-pose bridge placement
and metric connector registration are still unverified; colored/grey edge residue
remains in places and requires production cleanup.
No generated sheet has exact registered source rectangles, width measurements,
extruded gutters or seam-gate acceptance. They are art direction/source candidates.

## Ordered coding handoff

1. Resolve P9 finite-bend port/trim ownership and persisted deletion geometry. Return
   explicit compact/swept templates and migration/replacement semantics for planning.
2. Register only the four explicit straight candidates behind review; use .96-period
   cropping, actual piece spans and runtime interface connectivity.
3. Fit reviewed generated interior detail into deterministic native casings at the
   P1 offset ports and .24 width; prepare clipped atlas and connector profile metadata.
4. Implement terminal/decal/sleeve composition once per physical owner. Validate the
   full matrix above; return captures and measurements to parent for V-01–V-04.
5. Add palette exposure and guided scenario, then close R-06/R-07/R-09 gates with
   actual browser and timing evidence. No prior counts stand in for these new checks.

**Acceptance:** planning decisions and source-art handoff delivered; complete v1
runtime atlas and full assembled seam gate remain open. No failed source promoted.
