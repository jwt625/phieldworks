# Asset production checkpoint

2026-09-13. Paused at the user's request to document and commit. No further generation should start until work resumes.

## Completed work

- [x] Read the updated objectives and reconcile commits through `0bd3935`.
- [x] Write coding handoffs, dependencies, TODOs and verification gates in [012](012-next-coding-handoffs.md). No coding subagents were launched; the queue is ready to hand off.
- [x] Execute the open visual/complex review and preserve findings in [013](013-verification-review.md). Baseline: 52 headless checks, 16 browser scenarios and build passed. Raw measurements are preserved in `DevLog/evidence/013-*.json`.
- [x] Generate dedicated illustrations for all **27 canonical technology IDs**. These are node concepts, not 99 completed item/equipment sprites or implemented research.
- [x] Generate **nine animation candidate sheets plus one four-item atlas**: severe extractor; light/severe assembler; generator; sentry firing; guardian idle/collapse; crawler attack/death; ore/assembly/crystal/scrap icons.
- [x] Add a canonical review gallery at `/assets/technology/nodes/index.html`, using real prerequisites and concrete product unlocks. Includes search, 48/96 px previews, background selector, direction/step controls and one-shot terminal-frame holds.
- [x] Add lazy node/inspector illustrations to the in-game Technology panel. Recipes, simulation, research gates and saves are unchanged by this presentation pass.

## Saved outputs and provenance

There are **46 new PNG sources**: 27 initial node illustrations, 10 initial animation/item sheets, and 9 saved corrections. All generated with the built-in image tool; originals are preserved.

- Node illustrations: `assets/technology/nodes/<technology-id>-v1.png`.
- Animation/item sources: `assets/animations/candidates/*-v1.png`. This subdirectory is deliberately outside the world's automatic sprite loader.
- Exact initial prompts: `assets/technology/generation-pass-03.json`; reproducible prompt preparation in `scripts/prepare-art-pass.ts`.
- Exact correction prompts: `assets/technology/corrections-pass-03.json`.
- Each PNG has a `.png.source.json` provenance sidecar. `assets/technology/pass-03-manifest.json` records selected source paths, SHA-256, actual dimensions, alpha measurements, proposed frame rectangles, provisional anchors and playback intent.
- Run `node scripts/audit-art-pass.mjs` against Vite on 5175 to refresh read-only measurements. `PHIELDWORKS_REVIEW_URL` overrides the server. Source PNG pixels are never edited by the audit.

## Review and correction status

All 27 initial node illustrations were inspected in a contact sheet; representative large sources were also opened. Six needed correction: unwanted lettering/logos on crystal, fabrication, adaptive control, distributed infrastructure and sail; photonics was clipped at its upper edge. Their **v2 files are saved**, and the panel/gallery prefer them. Detailed visual approval of these revisions remains pending at this pause.

Initial animation review found painted checkerboard backgrounds on eight of ten sheets. Only light assembler and transported items had nonzero transparency, and their edge fringe still needs cleanup. The light assembler also changed orientation within its first row. These are source-quality failures, not acceptable transparent production sprites. A correction pass requests a deliberate uniform opaque dark teal matte and retained motion/identity; this does not claim true-alpha delivery.

| Correction | Saved at pause | Remaining verification |
| --- | --- | --- |
| crystal, fabrication, adaptive, distributed, photonics, sail v2 | Yes, 6 node sources | No printed text/logos; full silhouette in frame; 48/96 px readability |
| extractor-severe-cycle-v2 | Yes | Matte, persistent damage, four directions, stationary anchor and drill motion |
| assembler-light-cycle-v2 | Yes | Fixed orientation within each row, damage continuity, matte and registration |
| assembler-severe-cycle-v2 | Yes | Damage continuity, matte, arm phases and registration |
| generator-cycle-v2 | No | Resume correction, then inspect fan/rotor phases |
| sentry-fire-v2 | No | Resume correction, then inspect recoil and fixed aim |
| transport-items-v2 | No | Resume fringe/background correction; check four distinct small silhouettes |
| guardian-idle-v2 / guardian-collapse-v2 | No | Resume correction; anchored breathing and one-shot collapse |
| crawler-attack-v2 / crawler-death-v2 | No | Resume correction; anatomy, directions, strike and collapse |

The interrupted correction queue has **7 unsaved outputs**. Check workspace and tool output provenance before resubmitting; an interrupted request is not proof that generation failed, and only copied workspace PNGs count as delivered. Nine correction outputs are saved, not all sixteen. No revised animation is integrated into world playback.

## Resume in this order

1. Inspect the nine saved v2 revisions and refresh the manifest. Keep candidate/rejected states honest; do not mark PNG existence as approval.
2. Recover or resume the seven unsaved correction outputs from the persisted prompt list. Inspect alpha/matte, frame bounds and loop/one-shot behavior in the gallery.
3. Hand P0 in 012 to the simulation coder: the 400-port placement cap contradicts the 128-port solver, and 128 ports / 16 source groups measured about 168 ms p95. P4 owns condition-sheet cropping and animation registration/event bindings.
4. Finish missing animation families from 008: reference/tuner/emitter/dump mechanisms; sentry scan; crawler idle/hit and six-frame gait polish; guardian stress; research workbench/lab/processor motion. Existing four-frame assembler/crawler loops remain provisional against the larger original frame budgets.
5. Generate equipment turnarounds, item icons and operating states for the remaining **99-product catalog** as the corresponding gameplay tiers are implemented. Node illustrations alone do not satisfy these product-level assets.

No simulated research economy or new technology machinery is implemented by this asset pass. No new commit has been pushed remotely.
