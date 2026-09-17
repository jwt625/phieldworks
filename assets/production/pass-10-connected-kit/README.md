# Pass 10 — Connected route kit

Status: **seam-tested rendering kit; not integrated into game simulation**.
Review: [033](../../../DevLog/verification/033-connected-route-kit-review.md).

## What is delivered

- `connected-kit-atlas.png`: 18 RGBA sprites, 9 geometries × basic/precision.
  H/V straight, four compact turns, junction and two independent crossing layers.
- `atlas.json`: exact source rectangles, two-pixel sampling gutters, port coordinates,
  shared width and logical channel groups. Each source rect is 128×128; do not include
  gutters in physical placement. Width is 32 authoring units, NOT a chosen world unit.
- `kit.mjs`: renderer-native geometry with generated ceramic material detail; shared
  terminal aprons, exactly one sampling patch per real join, conditional open ends.
  Supports both native drawing and exported atlas composition. Generated pass09
  images are unchanged; capped concept elbows/crossings are not used as route bodies.
- `index.html`: interactive assembled-route gallery (native/PNG, scale, background,
  boundaries). Serve through Vite, not file://, because the page imports ES modules.
- `fixtures.mjs`: ten H/V repeats, four-turn loop, S/U paths, mixed-tier bends,
  junction, both overpasses and a real missing-segment gap.
- `verify.mjs` / `validation.json`: reproducible browser checks and source hashes.
  `iteration-01-failed.json` preserves the first antialiasing mismatch.

## Replay

From repository root:

```sh
node assets/production/pass-10-connected-kit/verify.mjs
npm run dev
```

Open `http://127.0.0.1:5173/assets/production/pass-10-connected-kit/index.html`.
Verifier uses installed macOS Chrome when present, otherwise Playwright Chromium,
and launches/closes its own local static server. Requires installed project deps.

## Results

- 576 directed mating-edge comparisons: **zero RGBA difference**.
- H/V repeat boundary profiles identical; **32-pixel width for both orientations**.
- 90 native + 90 exported-PNG assembled checks: **pass** at scales
  0.25/0.5/1/1.25/2 and DPR 1/2, with fractional camera translation.
- Atlas export vs native tile pixels: **zero difference**.
- Joined centerline samples fully opaque; intentionally missing span transparent.
- Parent inspected actual exported-atlas assemblies on light/dark/terrain and
  enlarged/fractional-DPR views. No visible cracks, internal end caps or width jumps.

## Coding-agent integration contract

Use `drawAssembly` or preserve its topology-conditioned seam handling when integrating
the atlas. Atlas samples alone are not permission to add unconditional bridges.
Map actual game half-tile paths and port positions into this authoring space; do not
redefine simulation footprints around the atlas. Keep optical splitting/combining
matrices in simulation. `connections()` only describes this visual prototype's
channel topology, not a substitute physics solver.

The junction sprite here uses four cardinal ports. The existing runtime junction
uses two ports on each side; integrate only with an explicit agreed geometry mapping
or a matching adaptation. This review does **not** approve that live machine seam.

This is a simpler functional skin than the original freestanding industrial masters.
Future detailed skins must fit these interfaces and rerun this test. Large swept
bends, machine-specific adapters, damage families and live-game placement remain
separate work; no automatic promotion or simulation changes were made.
