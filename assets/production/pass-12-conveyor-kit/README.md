# Pass 12 — Conveyor artwork and planning handoff

2026-09-17. **Source-art delivery; packed seam-qualified belt atlas still pending.**
No application, simulation, generation-script or test code authored.

- Decisions B1–B4 and composition contract: [037](../../../DevLog/planning/037-conveyor-asset-decisions.md).
- Source review and seam-gate status: [038](../../../DevLog/verification/038-conveyor-asset-review.md).
- Original request: [036](../../../DevLog/production/036-conveyor-belt-asset-request.md).

## Files

| File | Role |
| --- | --- |
| `belt-straights-source-v4.png` | Alternate simpler-chevron concept; still has haze and end-side blocks. Rejected for direct runtime use. |
| `belt-corners-source-v1.png` | Eight directed corners. Top row W→S, W→N, N→E, E→S; bottom row reverse travel. |
| `belt-straights-source-v1.png` | Rejected first iteration: terminal rollers/caps and background haze. |
| `belt-straights-source-v2.png` | Preferred **interior material reference**: end rollers removed; background haze still present, so not a transparent route cutout. |
| `belt-straights-source-v3.png` | Rejected background-extraction attempt: haze remains. |
| `atlas.json` | Twelve keyed **target** entries, with explicit source-sheet cell references and world geometry. `rect:null`, `ready:false`: not a loadable packed atlas. |
| `items.json` | Exact four-item registrations and one-file promotion allowlist for existing transparent transport-items-v1. |
| `prompts.json`, `prompt-background-extraction.json`, `prompt-clean-straights.json` | Exact imagegen prompts, edits and references. Built-in imagegen only, no CLI fallback. |
| `review.json` | Source hashes, dimensions and explicit gate status. |

Source sheets are supplied unchanged from imagegen. They contain separated, padded
objects; those sheet borders are **not repeat edges**. Do not concatenate cells,
stretch entire source cells to a route length, or treat image dimensions as a world
scale. Exact registered masks/aprons and sampling gutters still need production work.
The atlas metadata intentionally leaves unmeasured runtime rectangles null.

All four straight attempts fail direct route-sprite acceptance. V2 is referenced
only for its interior rubber/rail/marking material, to be used inside an exact mask.
V4 simplifies the arrows but does not fix the outside haze. No clean straight
cutout or periodic straight body is claimed from these attempts.

## Frozen decisions

World casing .50 tile; core .32; directional marking period .50. Proposed exact
authoring scale 200px/tile. Static belt surfaces, moving existing packets. Cardinal
art only in v1; whole-route native fallback for diagonal routes, including newly
placed diagonals, and for unreviewed overlapping/short corner slots.

The a→b travel rule still requires E/W/N/S markings and eight directed corner poses.
No new part definitions are implied by the asset keys. Body direction and item
motion must agree at every segment and corner.

## Item promotion instruction for coding

Use **only** `../assets/animations/candidates/transport-items-v1.png` in the explicit
promoted-file glob, retaining asset ID `transport-items-v1`. Do not include the folder
or v2. No file copy or runtime loader edit was made by the asset agent.

| Key | Source rectangle x,y,w,h | Existing frame |
| --- | --- | --- |
| ore | 0,0,627,627 | 0 |
| assembly | 627,0,627,627 | 1 |
| crystal | 0,627,627,627 | 2 |
| scrap | 627,627,627,627 | 3 |

Draw each complete quadrant at .32×.32 tile centered on the current packet point;
preserve its padding. Use scoped source-over composition. Current untyped packets
remain ore. The other keys make artwork available without adding new material types.
V1 is approved as source art after inspection, with in-game scale/background review
still pending. V2 is rejected because it has no alpha channel.

## Next owner actions

Coding: fit source detail inside exact native casing/core masks, export/register
packed sources, implement cropping and whole-route fallbacks, load the item allowlist,
and provide the numerical seam/scale fixture. Parent: review those actual renders.
No belt source is promoted until the report's open gates pass. Machine aprons,
diagonal sprites, animated surfaces and damaged belts are outside v1.
