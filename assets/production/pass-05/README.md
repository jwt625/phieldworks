# Pass 05: precision workpiece state continuation

Continues commit `58b7db4` after reviewing its directional sources, the production tracker and tranche-A asset contract. Generated with the built-in `image_gen.imagegen` tool. All seven original PNGs are preserved without pixel edits; every `.png.source.json` contains the exact prompt, references and original output location.

Open [the review gallery](index.html) for 32/48/96 px previews on light, dark and terrain-color backgrounds. [Measured review](review.json) records dimensions, hashes, actual alpha fractions and unregistered landmarks. Rebuild with `python3 assets/tools/review_pass_05.py` from the repository root (Pillow required).

| Output | Review |
| --- | --- |
| Blank v1 | Real alpha; simple unprocessed disk |
| Accepted part v1 | Rejected: opaque painted checkerboard |
| Accepted part v2 | Real alpha; broad optical rings; changed carrier tabs/projection need matching |
| Recoverable reject v1 | Real alpha; half-processed intact disk; size/projection drift needs registration |
| Process scrap v1 | Real alpha; three large broken fragments |
| Fabrication cell r3 v1/v2 | Rejected: opaque checkerboard persists after background correction; enclosure geometry also drifts |

These are inventory/process concepts, not registered animation frames or runtime-approved sprites. Real alpha alone does not establish clean edges, small-size readability or alignment. Existing sources and loader selections remain authoritative. Damage and tooling poses still depend on a stable registered chassis; the failed r3 sources do not satisfy that gate.

The [catalog coverage inventory](../../planning/catalog-asset-coverage.json) covers all 99 canonical products and separates physical artwork from dynamic status and event-driven animation. Regenerate with `node_modules/.bin/tsx scripts/asset-coverage.ts`. Its `pending-source-mapping` entries deliberately do not claim that existing artwork is missing: reconcile the earlier manifests before producing duplicate families.

Next production work: correct cell side geometry and alpha; register its four views; match item carrier/projection and fixture transforms; then generate per-direction damage and tooling poses. Review mechanism motion against stable base/port landmarks, pause and reduced-motion rules before runtime promotion. Full-catalog state and animation coverage remains unfinished.
