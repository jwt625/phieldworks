# Tranche A — asset production and integration contract

2026-09-13. Production contract; initial candidate work has now started under the user’s follow-up instruction. [Machine-readable manifest](../assets/planning/tranche-a-assets.json) records stable job IDs, prompts, reference paths, dependencies and unmeasured fields as null. [Coding tasks](021-tranche-a-coding-tasks.md) A-09–A-11 own execution. This manifest is outside the runtime loader and does not select assets for gameplay.

## Initial candidate pass and transparency correction

Seven original built-in tool outputs and prompt/provenance sidecars are saved under `assets/animations/candidates/tranche-a/`. The initial sources were opaque; a later short background-extraction request produced real RGBA. The selected [v7 master](../assets/animations/candidates/tranche-a/fabrication-cell-r0-intact-v7-alpha.png) retains the original framing, has 52.8551% fully transparent pixels and no occupied pixels in the outer three-pixel border. Its [exact prompt](../assets/animations/candidates/tranche-a/fabrication-cell-r0-intact-v7-alpha.png.source.json) records the successful request. Source pixels are unchanged.

[Review gallery](../assets/planning/tranche-a-review.html), [measured record](../assets/planning/tranche-a-review.json), and [1440px screenshot](../assets/planning/tranche-a-review-1440.png) show it composited with ordinary alpha over light/dark/checker/game-terrain backgrounds. Alpha and small-scale compositing pass for the selected master. A thin residual fringe at full source resolution remains a polish note. A-09/A-10 are partially started; final ground/port/workpiece registration and the other 27 raster outputs remain unfinished.

Earlier failures are retained for provenance, including v4 (real alpha but framing too tight) and v5/v6 (checkerboard regressions). Do not infer that the generator cannot produce transparency from an unsuccessful attempt. Prefer a focused extraction request and inspect actual alpha; the successful v7 request also explicitly preserves original size, placement and margin.

Serve the gallery through Vite. Run `node scripts/audit-tranche-a-assets.mjs` on port 5176 (`PHIELDWORKS_REVIEW_URL` overrides) to remeasure pixels and capture screenshots. It never edits source images. The now-working alpha master can support directional and item candidates; gameplay integration remains gated by the cell implementation.

> **Reconciliation — 2026-09-13 (implementation pass).** The cell gameplay implementation (A-05/A-07/A-08) now exists, so remaining integration is gated only by A-09–A-11 review/promotion, not by missing gameplay. The runtime intentionally draws a labeled `FAB CELL / PLACEHOLDER`; no candidate is promoted or registered. Final ground/port/workpiece registration and the 27 remaining raster outputs are still outstanding.

## What to produce

One precision-cell chassis and workpiece family. Reuse existing reference, junction, tuner, emitter, power and controller appearances. Integrated diagnostic tooling belongs to the cell; a new freestanding sensor or fusion-themed duplicate controller is unnecessary in A. Existing 27 technology illustrations remain concepts. Do not generate assets for all 99 preview products or revise the technology catalog merely to fit art.

| Job ID | Selected output budget | Gate |
| --- | --- | --- |
| TA-CELL-STATIC | Four intact directions; first batch is only direction 0 | Playable placeholder and footprint/ports accepted |
| TA-CELL-CONDITION | Light, severe, wreck × four directions = 12 | Intact registered views |
| TA-CELL-TOOLING | Loading and unloading pose × four directions = 8 | Actual process lifecycle events exist |
| TA-PROCESS-ITEMS | Blank, accepted part, reworkable reject, process scrap = 4 | Workpiece meaning and attachment scale fixed |
| TA-PROCESS-OVERLAYS | Code-native field, zones, dose bands, status and result feedback | Measured readings available |
| TA-REGISTER | Measured records and explicit selections | Source review |
| TA-INTEGRATE | Runtime appearance and event bindings | Registration and visual acceptance |

Budget: 28 selected raster outputs before corrections, not 28 guaranteed generation calls. Tooling can use static state/attachment changes if generated motion is unstable. Do not keep regenerating a whole sheet to fix one direction. These are task estimates, not a commitment to spend a fixed image budget.

## Geometry and interfaces

Cell footprint is 3×3 world tiles. At rotation 0, POWER IN is `(1.5, 0)` with outward normal `(0, -1)`. Other rotations use geometry's existing quarter-turn transform, not image rotation. Workpiece center is `(1.5, 1.5)` in local footprint coordinates. There are no belt or field-routing ports in A; material reservation uses existing shared-stock handling, and fields arrive from two explicitly assigned emitters. Cosmetic optical access should not resemble a clickable guide connector.

Use the existing reference/assembler turnaround assets listed in the manifest to establish camera and material continuity. Before generation, render a footprint guide at actual game scale with the power-port landmark, target anchor and neighboring equipment. Preserve that guide and its version with the request. Do not guess a camera angle from a prompt if the existing sprites provide the reference.

The visible silhouette should be a compact enclosed precision tool: sealed optical housing, accessible tooling recess, ceramic interfaces and restrained mechanical detail. Show progression from the rough starter industry through functional construction, not ornamental glowing machinery. Keep the workpiece readable with a renderer-level close inspection overlay if it cannot be legible at map scale.

## Generation handoff

Each generation job in the JSON includes a base prompt. At execution time append the exact direction, condition, approved source paths and current footprint guide. Follow the available image-generation skill/tool workflow then; this planning pass does not invoke it. Preserve source pixels and attach a `.png.source.json` with tool provenance, exact prompt, date, reference inputs and request variant. Keep failed candidates and their review disposition, without promoting them.

Candidate outputs live under `assets/animations/candidates/tranche-a/`; current automatic sprite globs exclude that nested directory. Use descriptive versioned names such as `fabrication-cell-r0-intact-v1.png`. Registration and review records must reference actual files; nulls in this planning manifest do not become fake production measurements. Promotion is explicit through `src/assets.ts`/`src/presentation.ts` and any runtime manifest entry needed by the final asset layout.

## Required measured review record

Create `assets/planning/tranche-a-review.json` during A-09. For each candidate store job/variant, source path, provenance path, SHA-256, actual image dimensions, measured transparent/partial-alpha fractions, crop rectangle, ground anchor, power-port landmark, workpiece landmark, selected status, reviewer note and evidence image paths. Store measurements in source pixels plus the render scale; distinguish source size from displayed size. Record each view independently.

Workflow statuses: planned → generated → needs-correction / needs-registration → registered → reviewed-in-world → integrated. A generated candidate cannot skip straight to integrated. A filename suffix is never review approval. `registered` proves alignment work, not visual quality in the world.

Acceptance:

- [ ] True alpha around the silhouette, no painted checkerboard or dark matte; verify on both light and dark terrain. Preserve dark chassis material with ordinary alpha compositing rather than lighten blending.
- [ ] Crop contains the full body/shadow without atlas-cell bleed. No automatic equal-grid crops unless measured content actually fits them.
- [ ] At a 96 px rendered footprint, stationary base and power connector move no more than one display pixel between operation poses. Condition states preserve service landmarks; any wreck change must remain inside its footprint.
- [ ] Four directions are visually distinct and match port rotation. Opposite views are not near-duplicates or mirrors with impossible geometry.
- [ ] Intact, light, severe and wreck differ at 48 px; shape and overlays distinguish powered-off, trip and active operation without relying solely on hue.
- [ ] No permanent beams, acceptance marks, readable text or lamps baked into chassis art.
- [ ] Compare isolated sprites and actual neighboring machines at 48/96 px, with the two listed browser viewports. Retain screenshot evidence and human visual judgment separately from pixel checks.

The one-pixel drift target is a proposed production tolerance; if it cannot be met, use a static registered chassis plus smaller moving attachments. Do not loosen it simply to accept an unstable generated sheet.

## Runtime event contract

| State/event | Presentation | Time/ownership |
| --- | --- | --- |
| Idle / no stock | Closed or ready fixture | Static state, no fake throughput |
| Reserved / load | Workpiece enters fixture | One job-stage transition; no duplicated input icon |
| Exposing | Static chassis plus bounded process overlay | Active process time; overlay stops when shuttered |
| Suspended / power loss | Retained workpiece, closed shutter, blocker indicator | Frozen job pose; cooling may continue in simulation |
| Accepted / reject / scrap | Correct workpiece/result indication | One terminal event sequence, no replay after reload |
| Damage / trip | Condition source plus runtime warning | Equipment state, independent of recipe result |
| Wreck | Held terminal chassis | Persists through save/load until removal |

Reduced motion keeps static state, dose bars and result text while suppressing travel/tween effects. User pause, hidden tab and management modal freeze simulation-driven motion. Do not drive completion by periodic world time. Do not pulse every optical component like a recoiling gun.

## Existing backlog interaction

014 records opaque revised animation sources, crop warnings and unresolved crawler/assembler motion. This pass does not resolve that backlog. Reuse its lessons and provenance approach, but add a dedicated cell review record rather than altering canonical technology-art selections. Existing field-route art suffices for A; specialized route families wait for B's compatible interfaces.
