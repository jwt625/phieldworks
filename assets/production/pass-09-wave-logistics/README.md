# Pass 09 — Physical wave logistics pilots

Use [pass10](../pass-10-connected-kit/README.md) for the corrected, seam-tested
compact rendering kit. Pass09 originals remain preserved failed/unregistered sources.

Built-in imagegen, 2026-09-16. Plan: [031](../../../DevLog/production/031-wave-logistics-assets.md).

Open [gallery](index.html) directly or through Vite. Four preserved candidates:
basic elbow, precision elbow, crossing v1 and crossing correction v2. Exact initial
prompts in `prompts.json`; correction in `prompt-crossing-v2.json`; source metadata
and hashes in `source-audit.json`. `review-gallery.png` captures the review layout.

Parent inspection: elbow silhouettes/material language are useful at 96/256 px on
light/dark/basalt; 48 px source canvases shrink the hardware considerably and tier
detail is weak. Actual alpha is present, but most body pixels are alpha 253 rather
than 255; faint low-alpha outliers enlarge the full alpha bounding box. No obvious
opaque matte appears in the gallery. Do not use alpha>0 bounds for automatic crops.

Crossing v1 is too junction-like at small size. V2 increases the arch opening, but
the north terminal still looks upward-facing and lateral terminals moved despite
the preservation request. It is an exploratory improvement, not a registered replacement.
All runtime promotion remains pending: geometry contracts, actual terminal anchors,
seam tests, directions and final in-world review. No runtime files were changed.

## Repeat tile follow-up

Two additional sources: `straight-h-repeat-v1.png`, `straight-v-repeat-v1.png`.
[Repeat gallery](repeat-review.html) shows raw horizontal/vertical repetition.
Exact built-in imagegen prompts are in `prompt-repeat.json`; reproducible Pillow
measurement is `audit-repeat.py`, output `repeat-edge-audit.json`.
Parent inspected `repeat-review.png`. Both appear continuous at overview but fail
strict production seam gates: edge color differences and H/V width mismatch.
See [032](../../../DevLog/production/032-modular-route-seams.md) for measured results
and the connector/capless-body contract. No originals were pixel-edited.
