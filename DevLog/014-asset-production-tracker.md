# Asset production and review status

2026-09-13. Resumed after the documentation pause. Remote changes through `0c7cc54` were pulled cleanly; validation and coding handoffs were pushed first as `b23d112` and `11d2987`, as requested. The historical paused checkpoint is preserved in Git.

## Completed work

- [x] Reconcile objectives and coding status; [012](012-next-coding-handoffs.md) contains owner, dependency, TODO and verification contracts. No coding subagents were launched.
- [x] Run the open complex/visual checks in [013](013-verification-review.md) and [015](015-connected-world-validation.md). Cap consistency is fixed; connected-world performance acceptance fails. P0.1 is the next simulation priority.
- [x] Generate and inspect illustrations for **all 27 canonical technologies**. These are concepts, not 99 finished product sprites or implemented research.
- [x] Generate nine animation candidate sheets and one four-item atlas, then finish all **16 planned corrections**: six technology illustrations and ten animation/item sheets.
- [x] Recover the previously completed generator and transport-item corrections from tool output provenance. Generate the remaining sentry, guardian idle/collapse and crawler attack/death corrections with the built-in image tool. Inspect all ten revised animation/item sources.
- [x] Add explicit source selection and per-asset review notes to the canonical gallery and audit. The game panel uses only `reviewed-concept` node selections; new filename versions are never automatically promoted.
- [x] Inspect the six corrected node illustrations at 48/96 px in 1280×800 and 1440×1000 browser viewports. Silhouettes remain distinguishable, upper photonics mechanism is contained, and removed lettering/people do not recur. Detail content scrolls within the viewport.

## Saved outputs and provenance

There are **53 PNG sources** in this pass: 27 original node illustrations, ten original animation/item sheets and 16 corrections. Original pixels and previous versions are preserved; all sources have `.png.source.json` provenance sidecars.

- Node sources: `assets/technology/nodes/<technology-id>-v1.png`, with six reviewed v2 replacements.
- Animation/item sources: `assets/animations/candidates/*-v1.png` and `*-v2.png`. The candidate folder is outside the world's automatic sprite loader.
- Exact prompts: `assets/technology/generation-pass-03.json` and `corrections-pass-03.json`. Stable animation review IDs retain their original `-v1` suffix; the selected `path` records the actual v2 PNG.
- Selection authority: `assets/technology/art-review-status.json`, consumed by the gallery, node panel and audit.
- Measured manifest: `assets/technology/pass-03-manifest.json`, with selected source, SHA-256, actual dimensions, alpha, proposed frame rectangles, provisional anchors, playback intent and review notes.
- Refresh measurements with `node scripts/audit-art-pass.mjs` while Vite runs on 5175; `PHIELDWORKS_REVIEW_URL` overrides the URL. The audit reads pixels without editing/re-encoding artwork.

## Review outcomes

| Sources | Outcome | Remaining work |
| --- | --- | --- |
| All 27 technology concepts; crystal/fabrication/adaptive/distributed/photonics/sail use v2 | Reviewed concept | Separate product icons, turnarounds and operating states when corresponding tiers are implemented |
| Extractor severe v2 | Needs motion correction | Weak severe-damage distinction; subtle drill phases; similar front/rear views; scale and chassis drift |
| Assembler light/severe v2 | Needs motion correction | First-row hopper/chassis changes facing between columns; stable four-direction sequences and anchor correction required |
| Generator v2 | Needs registration | Fan/rotor motion is subtle; verify running/off contrast, foundation and fixed port positions |
| Sentry fire v2 | Needs registration | Four aim views and recoil read; verify base registration and actual shot event binding |
| Transport items v2 | Reviewed item concept | Four distinct silhouettes; individual crop/scale and terrain compositing before packet integration |
| Guardian idle/collapse v2 | Needs registration | Breathing and four-stage collapse read; fix ground contacts and persist held rubble after load |
| Crawler attack v2 | Needs motion correction | First-row strike reverses facing and shifts center; preserve camera and anatomy throughout the strike |
| Crawler death v2 | Needs motion correction | Clear terminal collapse, but first two rows are near-duplicate directions; correct quarter-turn views and contacts |

All selected sheets are **opaque**, measured transparent fraction 0. The corrections replace painted checkerboards/fringes with a dark matte; they do not deliver true alpha. All ten revised sheets measure 1254×1254. The equal-cell audit flags bright pixels within three pixels of frame boundaries on extractor, both assemblers, generator and crawler attack. These are crop/padding warnings, not measured port registration. Do not enable those equal-cell crops in the world without adjustment and visual checks. Sentry, guardian and crawler death having zero such warnings does not prove motion registration.

No revised animation is integrated into world playback. Per-asset `needs-registration` means the motion concept is usable for further preparation, not production approval. Current in-game condition-row bleed and world-time event behavior remain P4 work.

## Verification and next work

Synced baseline: **57 headless checks, 19 browser scenarios and production build pass**. After explicit art selection and gallery changes, build and all five targeted canonical-art/technology browser scenarios pass, including terminal-frame hold, unchanged inspection stock and remote zoom/pan behavior. The audit resolves all 37 selected assets and checks their provenance. Review screenshots are in ignored `test-results/corrected-tech-thumbnails-{1280,1440}.png` and `corrected-tech-detail-{1280,1440}.png`; original full sources were opened separately. Automated pixel holds do not establish animation quality.

1. P0.1: bound automatic control and reuse invariant work; rerun connected fixtures from 015. Keep the consistent 256-port validity cap distinct from demonstrated performance.
2. P4: fix directions and crop/anchor registration for the failed sheets above. Work one direction at a time against a fixed foundation/contact reference; do not repeat a whole 4×4 correction that retains a bad source layout. Verify port/contact drift and loop seam in both the gallery and world, then bind actual events.
3. Missing families from 008 remain: reference/tuner/emitter/dump mechanisms; sentry scan; crawler idle/hit and six-frame gait polish; guardian stress; workbench/laboratory/processor motion when their runtime tier exists. Existing four-frame assembler/crawler candidates do not meet the larger original frame budgets.
4. Generate item/equipment art for the 99-product catalog as corresponding gameplay tiers are implemented. Capabilities need UI symbols rather than invented machines. No research economy or new machinery is implemented by this pass.
