# 035 — Asset-generation request: physical wave-guide hardware, v1 integration

Date: 2026-09-16. Status: **open — awaiting asset-generation feedback**. Requester: coding
agent. Companion planning decisions: [034](../planning/034-wave-logistics-integration-request.md)
(P1 geometry, P2 authoring-space, P3 tiers, P5 swept). Context and constraints:
[031](031-wave-logistics-assets.md), [032](032-modular-route-seams.md),
[033](../verification/033-connected-route-kit-review.md). **Depends on P1/P2 before final
registration.**

## What the runtime must draw

Authoritative piece fields (`src/sim/world-types.ts`): `{part, version, category, tier, x,
y, rotation, spans, turn, condition, route}`. Junction/crossing are entities with
`variant`/`kind`. Sprites must key to **runtime** identity, not art-internal names:

| Runtime identity | Orientations | Tiers | State | Priority |
| --- | --- | --- | --- | --- |
| `straight-basic` | H (rot 0/2), V (rot 1/3), periodic | basic | intact + 0–3 | P0 |
| `straight-precision` (pending P3) | H, V | precision | intact + 0–3 | P1 |
| `elbow-compact` | 4 corners W-S, W-N, N-E, E-S (rot 0–3 × turn ±1 normalise to these 4) | basic; precision = `elbow-precision` | intact + 0–3 | P0 |
| `elbow-swept` | same 4 corners | basic (and precision if P5a) | intact + 0–3 | **P0 missing** |
| `junction-basic` | entity rotation 0–3 | basic | intact + 0–3 | P0 (blocked by P1) |
| `junction-matched` | same | precision | intact + 0–3 | P1 (blocked by P1) |
| `crossing-basic` | cross-h / cross-v (rot 0/1; 2 unique) | basic | intact + 0–3 | P1 (not buildable yet) |
| `crossing-precision` (pending P3) | cross-h / cross-v | precision | intact + 0–3 | P2 |
| Endpoint socket / open end / dump adapter | terminal-conditional | basic/precision | — | P1 |
| Joint sleeve | one per physical mating joint | — | — | P1 |

Pieces have no art states today. State whether a full condition family is delivered or
whether a cost-bounded overlay (scorch/crack decal per `condition` 1–3) is acceptable;
please propose which.

## Hard interface constraints (from 032)

- One shared connector cross section across straight/elbow/junction/crossing: state the
  exact center, normal, **width**, connection plane and footprint in world units, and
  confirm which side owns the number (planning P2). Runtime frozen value is
  `GUIDE_INTERFACE.width = 0.24` tiles, no end cap; pass-10 uses 32/128 = 0.25 tile.
- Straights are periodic along the run; no end caps or run-axis padding on repeat edges.
  Register `repeatAxis` + `period` + source rect. Do not force one whole world tile per
  half-tile piece; runtime `spans` is separate metadata.
- Elbows are one of 4 corners; never draw a joint/sleeve per adjoining sprite. Junction is
  one body with exactly its declared terminals and no implied extra branching. Crossings
  are two independent layers with the bridge entirely inside the footprint and no central
  joining hub.
- Caps/sockets only at real terminals or gaps; a deleted piece must stay visibly open (no
  bridging). Joints render once with deterministic ownership.
- No anisotropic stretching. Fix lighting in world coordinates so H/V and rotations are
  authored independently. Atlas entries need extruded sampling gutters and clipped source
  rectangles for fractional-zoom seam safety.

## Deliverables

1. Updated atlas + machine-readable `atlas.json` **keyed by `partId@version` + rotation/turn**
   with `{rect, gutter, portCenter, portNormal, portWidth, footprint, tier, condition,
   repeatAxis, period}` — enough for `renderer.ts` to register without guessing.
2. The missing table entries (swept elbow, endpoint adapter, sleeve, condition treatment),
   or explicit out-of-scope calls.
3. A seam-gate report per 032/033: H/V edge-profile measurements; all directed mating
   combinations across rotations and tiers; straight→each turn→straight; S/U loops;
   junction branches; both crossings; endpoint; mixed-tier replacement; deliberate gap;
   and scales 0.25/0.5/1/1.25/2 at DPR 1/2 on light/dark/terrain.
4. A promoted-subset candidate list. I expect to register only reviewed entries with an
   explicit glob (the pass-07/08 pattern), not a whole folder.

## Acceptance gates (asset-side)

- Identical alpha support and premultiplied channel error ≤ 2/255 at every declared mating
  interface; exact periodicity where claimed; report actual source resolution.
- Zero internal end caps, doubled collars or width jumps; deleted segment stays
  transparent; joined centerline fully opaque.
- Four rotations and both turn chiralities register to the runtime port normals;
  junction/crossing channel topology matches the simulated split/cross matrices
  (`connections()` is not a physics substitute).
- Runtime remains authoritative: map game half-tile paths and port positions into the
  authoring space; do not redefine simulation footprints around the atlas.

## Explicitly not requested

No simulation, footprint, port-map, save-schema or balance change from the asset side.
Large swept-radius machine adapters, machine-specific junction seams and full industrial
style sign-off remain separate work (033). Do not promote failed pass-09 masters or draw
end caps inside runs.

See also: [036 conveyor-belt asset request](036-conveyor-belt-asset-request.md) — the material-route counterpart, since belts remain renderer-native and the item-crate sheets are not loaded.
