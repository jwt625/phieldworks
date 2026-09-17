# Pass 13 — Route conditions and event effects

2026-09-17. Continuation from commit `893a931`, pass 11 condition treatment and pass 12 conveyor source handoff. **Source candidates only; no runtime promotion.** Generated with built-in image_gen. Exact prompts and references: [prompts.json](prompts.json), [fresh correction](prompt-correction.json).

Open [review gallery](index.html) through Vite or directly in a browser. It previews the two event strips at 8 fps with pause and reduced-motion support. Equal-cell crops are preview assumptions, not approved runtime registration.

| Source | Contents | Review |
| --- | --- | --- |
| [belt-conditions-v2.png](belt-conditions-v2.png) | 4 columns E/W/S/N × 3 rows intact/scratched/severely damaged | Preferred condition reference. Cleaner background, visible direction and damage progression. Mostly translucent body pixels; not acceptable as opaque route bed. |
| [wave-condition-effects-v1.png](wave-condition-effects-v1.png) | Top row 4 damage strengths; middle 4 overheat-event frames; bottom 4 repair-event frames | Isolated overlay source candidates. Frame centers and silhouette extents drift; registration and small-scale review pending. Damage decals include pale chips requiring casing clipping. |
| [belt-conditions-v1.png](belt-conditions-v1.png) | First condition attempt | Rejected: inherited haze and inconsistent column widths. Preserved for provenance. |

## Validation

`node assets/production/pass-13-route-states/audit.mjs` decodes PNGs in Chromium, records dimensions, SHA-256 and alpha counts in [source-audit.json](source-audit.json), loads gallery images, and captures [review.png](review.png). All three files load. V2 belt and effects are 1448×1086. Belt v2 has 1,062,589 fully transparent pixels but only 3,285 opaque pixels out of 1,572,528; this explicitly fails opaque body acceptance. Effects have 1,413,757 fully transparent pixels and no fully opaque pixels, appropriate in principle for translucent effects but not proof of compositing acceptance. No seam, runtime registration or gameplay approval is claimed.

## State contract and next work

- Preserve 037: static conveyor surface; packets alone provide operating motion. Belt damage art is a future visual candidate, outside v1 promotion; no simulated belt integrity is added.
- Preserve pass-11 overlay rules: use intact guide body; clip damage to casing interior, exclude terminal aprons by .08 tile, one treatment per physical piece, omit on pieces too short for the exclusion.
- Overheat and repair strips are proposed one-shot event effects, not idle loops or wave propagation. Bind only to authoritative events when implemented, freeze with pause, use static reduced-motion treatment; never imply coolant simulation exists.
- Power, starvation, blocked and trip statuses stay renderer-controlled. Do not multiply every body/state combination into separate sheets or invent damage states for inert items.
- Next: opaque exact belt casing/masks with registered interior material, four directed straights and eight directed corners under 037; measured edge profiles, gutters and full scale/DPR/background gate from 038. Then register effect anchors/durations and test actual state transitions. Wrecks, corner conditions and coolant-pipe bodies remain ungenerated in this pass.
- Full catalog completion remains open. This pass adds twelve belt condition concepts, four decal strengths and eight event frames; it does not satisfy every item/equipment requirement.
