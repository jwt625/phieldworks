# Ports, transport, and presentation separation

Started 2026-09-12. Continued from local Codex rollout 01a09422-253b-7911-96fd-eea0e41fd004 and DevLogs 000–004.

## Milestones

- [x] P1: Move sprite mapping outside simulation; explicit physical port contracts and quarter-turn geometry.
- [x] P2: Persist obstacle-aware grid paths, validate endpoint direction and route geometry, support optional diagonals.
- [x] P3: Drive field phase/loss from route geometry; expose bend radius penalties and separate radiation accounting.
- [x] P4: Material packets with travel time, spacing, backpressure, and conservation on disconnect.
- [x] P5: Route/rotation UI, save migration, blueprint geometry, headless and browser regression checks.

## Decisions

Simulation owns footprint, orientation, typed ports, route centerlines, inventories, and physical model parameters. Presentation owns sprites, anchors, camera and hit testing; physical port positions remain authoritative. Field port indices retain their scattering-matrix order; indices are scoped by transport type. Material and power interfaces use explicit input/output roles. Quarter turns rotate physical geometry; artwork may supply orientation variants independently.

Half-tile routing lattice accommodates multiple ports per two-tile device. Buildings stay on whole tiles. Routes leave and enter along port normals. Cardinal routing is the default; optional 45-degree segments use the same geometry validation. Crossings are insulated/grade-separated in this prototype, never implicit junctions; route sharing/crossing costs and dedicated bridge/splitter elements remain follow-ups. Building interiors block routes and routes block subsequent building placement.

Waveguide centerlines have a nominal bend radius with locally constrained effective radius. The initial bend penalty is a tunable game model, not material-specific electromagnetic data. Phase uses centerline length in effective radians/tile. Radiation and straight propagation loss subdivide existing link loss, preserving the energy balance. Wires now use explicit generator-to-load routes. Each generator supplies 240 units and permits output fan-out; each load permits one input feed. Generator overload shuts its connected loads down independently of other generators. Fuel, resistance, ampacity, poles and multi-source buses remain abstracted.

## Follow-ups

- Dedicated rotated sprite views and adjustable sprite/port presentation anchors. (Served by milestone [006](006-world-interaction-and-onboarding.md).)
- Route segment construction costs, crossing layers, bridges, splitters, and per-tile editing. **Route selection and in-place reshaping are implemented (2026-09-13);** costs, crossings, bridges, splitters and individual segment deletion remain open (see open decisions).
- Material-specific bend calibration, true arc geometry/clearance, optical delay and thermal environment. **Open — needs agreed parameters.**
- Wire resistance/capacity, poles, and multi-source connected-component power allocation. **Overload isolation and a wire-capacity ledger are implemented (2026-09-13);** resistance, poles and true multi-source sharing remain open.

## Progress — 2026-09-13 (power, limits, diagnostics)

Power allocation rewritten in `powerGrid` (src/sim/world.ts): wired components share the aggregate supply of their healthy generators and serve loads in stable build-id order. An overload now isolates only the excess loads instead of shutting every load on the generator down. `Stats` gained `overload` and `wireOverload`; diagnostics raises "Power bus overloaded" / "Power wire over capacity" with remedies, and the energy ledger shows isolated loads and overloaded wires. `WIRE_CAPACITY` is a provisional 240 per wire. No new equipment or save-schema change.

Prototype scale raised from 40 machines / 128 field ports to `MACHINE_LIMIT=120`, `FIELD_PORT_LIMIT=400`, `LINK_LIMIT=512`, exported from the sim and used by placement and save validation. A headless case checks the cap boundaries.

Diagnostics telemetry added in the UI layer only (`src/main.ts`): a rolling (120-sample, 1 s) client-side series of target power/heat/demand with an inline SVG trend, a min/max/avg summary, and a copyable report. It is not serialized and carries no research gate; baseline errors stay visible.

Tests: 52 headless (power overload isolation, cap boundaries, editRoute, state resolver) and 16 browser (route editing, state laboratory, diagnostics trend) pass; the production build passes.

## Open decisions / TBD (for the user or planning agent)

These were intentionally not implemented to avoid inventing balance or art/content; each needs a decision before coding:

1. **Paid transport segments — cost formula.** Options to pick: flat cost per half-tile segment vs. per whole tile vs. distance bands; whether starter routes and blueprint-restored routes stay free; refund-on-disconnect vs. lossy refund; and whether cost is charged on `connect`, `editRoute` and blueprint stamp. Mechanism is designed (`routeMetrics` length + a single cost function) but no numbers were chosen.
2. **Splitters, underground crossings, bridges, power poles.** Need new sprites/palette entries and are research-gated in [007](007-technology-tree-design.md); implementing them now would preempt the research economy. `production-data.ts` already defines `splitter`, `underground`, and `power-pole` entries.
3. **True multi-source bus.** The component allocator is ready, but generators currently have one output and loads one input, so components remain stars. Poles/interconnects and their art are the blocker.
4. **Individual segment deletion** (splitting a route at a chosen point) vs. the current whole-route re-route. Needs a UX/ownership decision.
5. **Diagnostics precision/automation progression.** The trend is currently ungated; decide whether more advanced diagnostics should be a research unlock (design says yes, baseline must stay free).
6. **Bend/route calibration.** Needs chosen material/physics parameters for true arc geometry and routing profiles.

## Hard-to-validate (notes for later review)

- Power-allocation balance with many generators and mixed loads is unit-tested for isolation order only; it needs a playtest/benchmark, not just assertions.
- The raised 120-machine / 400-port caps are unbenchmarked; large-network render and solve performance is unknown. Treat the numbers as provisional.
- `wireOverload` cannot be exercised with current single-load feeds (each ≤125 units < 240), so the wire-capacity path is effectively untested until power poles exist.

## Progress — 2026-09-13

Route editing continuation. `editRoute(w,id,options)` (src/sim/world.ts) rebuilds an installed connection in place: it re-runs the same obstacle-aware `findRoute`, preserves the link id, endpoints, type and profile, and validates atomically (a blocked waypoint leaves the installed path untouched). Material packets are re-clamped to the new length with spacing preserved, and any packet that no longer fits is converted to scrap so mass stays accounted. Editing invalidates qualification.

Presentation/UI: `Renderer.hitRoute` selects a route from its stored polyline using `segmentDistance` (src/sim/geometry.ts); the selected route renders with a gold highlight and bend markers, and while editing an `editing` view state draws the waypoint guide and handles. The inspector shows a route card (endpoints, length, bends, tight bends, profile, radius/in-transit) with Edit waypoints, 45°/90° profile, sharp/rounded radius, Direct path, and Disconnect actions. Clicking terrain while editing appends a half-tile waypoint and immediately re-routes; `D`/`B` toggle profile/radius; `Esc` finishes. No new art, equipment kind, save schema or research gate is involved.

Tests: four headless cases cover identity/endpoint/profile preservation, atomic failure on a blocked waypoint, material mass/clamping, and qualification invalidation (`tests/transport.test.ts`). One browser case selects the starter belt, toggles its profile, adds a waypoint, clears it, and confirms no duplicate route is created (`tests/browser/outpost.spec.ts`, screenshot `test-results/route-editing.png`).

Still open from the list above: paid segments, crossing layers/bridges, splitters, and per-tile deletion.

## Progress — 2026-09-12

P1–P4 implemented. Simulation modules have no sprite/DOM/canvas imports. `presentation.ts` maps art IDs, optional orientation variants, scale and offsets independently. Core geometry defines rotated port normals and footprints. Renderer previews and hit targets consume this geometry. Existing art rotates in canvas as a temporary fallback, not a newly generated oblique camera view.

P5 implementation complete; headless and browser regression checks passed, and starter/rotated-layout screenshots were visually reviewed. R rotates build previews or disconnected equipment; D toggles diagonal routing; B selects nominal radius 0 or 0.5; terrain clicks add waypoints. Ports show outward normals. Gold packets represent actual in-flight inventory. Purple routes carry electrical supply. The inspector reports route length, bend count and tight corners; the energy ledger splits propagation loss and bend radiation.

Fixed issues found during validation: inventory tests now include in-flight ore; blueprint bounds include external port stubs; blueprint placement validates all translated routes before committing; v2 load preserves link identities and packet positions. V1 migration autoroutes old links, supplies explicit wires to formerly covered loads, and clears qualification. A physically unroutable legacy layout is rejected rather than silently losing a connection. Legacy blueprint migration adds a clearance margin.

The original full gameplay browser test passes with the added emitter wire. Target thresholds and thermal behavior were retained. Reflected energy can trip the reference source slightly earlier with the changed path lengths; the protection regression checks returned power immediately and cooling over the subsequent interval.

## Effective route model (not a physical calibration)

For polyline length L, straight power-loss exponent is 0.012 L and phase is 0.31 L rad. For each direction change theta, effective radius is the smaller of the requested radius and half the shorter neighboring straight length divided by tan(theta/2). Half-length allocation prevents adjacent corner fillets from claiming the same straight run. The bend exponent is 0.001 × (theta / (pi/2)) × [1 + 8 max(0, 1 - R/0.5)^2]. Amplitude transmission is exp[-(straight exponent + bend exponent)/2]. The link-loss ledger is split in proportion to these exponents (an aggregate allocation, not spatially resolved heating/radiation).

This version measures the lattice polyline, does not subtract fillet lengths, and does not simulate exact arcs, bend reflections or material/wavelength dependence. The parameters are intentionally replaceable. Orange markers denote radii below the nominal 0.5-tile threshold. Crossings and shared runs currently represent separate insulated/layered routes at zero extra cost.


## Validation completed

- `npm test`: 30 passing headless tests, including legacy migration, stable link IDs, packet conservation/backpressure, port normals/rotation, diagonal corner clearance, electrical disconnection/overload, energy accounting, commissioning, and atomic blueprint failure.
- `npm run build`: TypeScript and production bundle pass.
- `npm run test:browser`: three browser scenarios cover the full outpost loop, invalid placement/disconnection/manual, and rotated equipment with diagonal waypoints, sharp bends, material-port reconnection and persistence.
- Reviewed `test-results/initial-outpost.png` and `test-results/grid-routing-and-rotation.png`. Route types and rotated ports are visible; dedicated rotated artwork remains intentionally deferred.

Next implementation priority: editable transport segments and explicit crossing/splitter pieces, followed by calibrated route profiles and dedicated orientation art. Human playtesting and scaling benchmarks remain open; automated scenario success does not establish balance or large-factory performance.


### Superseded by world-interaction milestone

[006](006-world-interaction-and-onboarding.md) replaces the temporary canvas rotation with nine dedicated four-view equipment atlases, introduces save schema v3 ecology, and adds direct-camera navigation, onboarding and diagnostics. The remaining segment editing/calibrated bend work above is still deferred.
