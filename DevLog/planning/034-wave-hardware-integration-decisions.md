# 034 — Wave hardware v1 integration decisions

2026-09-16. Planning/asset owner decision; coding implementation and parent visual
acceptance remain separate. Supersedes pass-10 authoring-unit assumptions for v1.

| Request | Decision / coding handoff |
| --- | --- |
| P1 | **Keep runtime geometry.** Author a 2×2 body with A=(0,.5), B=(0,1.5), C=(2,.5), D=(2,1.5), outward normals W,W,E,E. Rotate geometry clockwise around (1,1). No cardinal-port migration or save remap. This is matching artwork, not an invisible optical adapter. |
| P2 | **Runtime owns dimensions:** width .24 tiles, plane z=0. Port center/normal follow `geometry.ports()` for entities and `piecePorts()` for pieces. Port plane is n·(p−center)=0. Straights remain any permitted half-tile length. Reuse accepted straight source at **.0075 tile/pixel isotropically**, giving 32 px = .24 tile and 128 px = **.96-tile repeat period**. Crop/repeat to spans/2; never stretch to piece length. Future exact registered sources may use 200 px/tile (48 px width), but generated concept sheets have no implied world scale. |
| P3 | **Keep existing progression.** Precision maps only to elbow-precision@1 and junction-matched@1. Defer straight-precision, crossing-precision and precision swept: no versioned runtime definitions, recipe, inventory or demonstrated progression need. Do not register decorative precision sprites as new hardware. |
| P4 | Expose basic compact/swept choice before placement with actual BOM and clearance preview; default compact. Precision remains manufacture→replace. Radius selection must buy/replace hardware and revalidate space, never mutate optical performance in place. This restores 029's starter spacious alternative. |
| P5 | Commission basic swept at real radius/footprint, **blocked for runtime promotion by P9 below**. Precision swept out of v1. Scaling a compact body changes connector width and is rejected. Keep truthful native fallback until P9 is implemented. |
| P6 | Make crossing buildable after registered art and palette/browser checks, preserving existing shortcuts by appending the entry. Runtime rotation 0 means two horizontal offset channels A↔C and B↔D; rotation 1 means vertical offset channels. These are NOT pass-10 cardinal cross-h/cross-v. Register all four world-lit entity rotations because terminal IDs rotate even where the outline is symmetric. |
| P7 | Coding owns renderer composition and topology-conditioned draw order. Assets own source rectangles, world anchors, profiles, gutters and decorations. No required runtime asset module. One sleeve per actual interface (stable sorted endpoint IDs), none for missing interfaces; terminal mouth on the surviving side only. Sampling repair cannot create connectivity. |
| P8 | Retain absorption of returned power at a matched source; matching does not mean zero absorption. Do not call this source destabilization. Keep provisional coefficients until a reproducible normal-play thermal sweep supports a change. Do not promise 'never trips': source power, topology and cooling must be bounded. Test returned-power accounting against source emission separately before accepting balance. No balance/source changes from this asset task. |

## P9 — Newly found finite-bend registration blocker (P0 coding)

`piecePorts()` returns **the same (x,y) for both elbow terminals**. `compileRoute()`
charges/retains the full straight runs up to that vertex. This contradicts 029's
requirement that a bend consume entry/exit runs, and the requested finite-footprint
edge-mated elbow. `partPorts()` is not authoritative for installed pieces and also
disagrees with the entity four-port map. Do not build a manifest from it.

Concrete example: path (0,0)→(2,0)→(2,2) contains straight (0,0)→(2,0), an elbow
whose two terminals are (2,0), then straight (2,0)→(2,2). Removing the elbow leaves
both straight bodies touching. A sleeve cannot fix this while preserving a visible
deleted-elbow gap. The existing sprite's separated terminals cannot be registered
with one rigid transform.

Required coding follow-up: propose a versioned finite-bend construction contract,
with compact reach .5 tile and swept reach 1 tile as candidate dimensions. Consume
those lengths exactly once, store enough geometry for deletion to leave a real gap,
and handle short legs, adjacent bends, replacement footprint/BOM and old saves.
Planning approves these target reaches, but does not silently change installed
version-1 ports or author a misleading adapter. This requires a separate coding
change outside the asset-side prohibition on simulation/footprint/save changes.
Until then, compact/precision/swept art can only be design candidates; no elbow is
in the promoted subset and no all-route seam acceptance is claimed.

## Condition and terminal scope

Use one intact body plus condition decals 1/2/3 (light scorch, stronger scorch/crack,
heavy scorch/crack). Clip decals to the opaque interior and exclude a .08-tile
terminal apron. Condition 3 does not remove material or invent broken topology.
Condition-to-level mapping belongs to runtime state presentation; no new art physics.
Straight decals place once per physical piece, not once per repeat period.

Open-end, socket, generic dump attachment and joint sleeve are separate orientation-
authored overlay candidates. Socket/dump geometry is generic at the guide interface;
machine-specific body seams and large-radius adapters remain outside this delivery.
No sleeve/cap is baked into repeat edges or piece bodies.

R-07 remains required for first delivery. R-06 browser guide-flow and parent V-01–V-04
remain open. R-09 delivered-fixture and route-heavy p95 ≤16 ms evidence remains a
release gate; earlier test counts and +29.6% are coding-agent evidence, not rerun here.

Assets and measured subset limits: [pass-11](../../assets/production/pass-11-runtime-kit/README.md).
