# Next coding handoffs

2026-09-13. Baseline: `0bd3935`. Read 000–011 and current simulation, presentation, UI and tests. This is a task queue for coding subagents; unchecked work is not implemented. Execute in the dependency order below; independent owners may work in separate branches. Each handoff must report changed files, commands/results and remaining limitations.

## Objective and scope

The immediate objective is a reliable first expedition followed by a playable industrial research loop: qualify an outpost, harvest crystal, manufacture dossiers, research a useful logistics/materials improvement, and build it. The long-term objective remains manufacturing a flight sail and commissioning a planetary aperture. Preserve direct camera control, conservation-aware wave behavior, baseline diagnostics, existing starter equipment and fresh qualification for replicated outposts. The 27 technologies / 99 products in `src/ui/technology-data.ts` and `production-data.ts` define the planned slice; the older 18-node art gallery is not a second progression authority.

## P0 — Capacity and solver reliability

- [ ] Owner: simulation/performance. Reconcile `FIELD_PORT_LIMIT=400` with the hard-coded 128-port rejection in `solveNetwork`. Placement/load must never accept a layout which predictably fails solely because of contradictory limits. Start by using one supported cap; raise it only with measured evidence.
- [ ] Partition disconnected field components, reuse matrix factorization across independent source right-hand sides where justified, and keep singular-network failures explicit. Avoid changing the conservation model to meet a frame budget.
- [ ] Verification: boundary tests at cap−1/cap/cap+1 across placement, save load and solve; connected and disconnected fixtures; 1/4/16 independent source groups; compare port powers and residuals against the existing solver. Benchmark warmed median/p95 solve, world-step and render at 40/80/120 machines. Record hardware, topology, ports, links, groups and sample counts. Target ≤16 ms p95 world step at the supported cap; report failures without silently dropping ports.
- [ ] Deliverable: reproducible benchmark command, results, consistent limits and regression tests. See 013 for this review's baseline evidence.

## P1 — Persistent research and first manufacturing loop (after P0)

- [ ] Owner: research simulation. Extract runtime-safe recipe/research contracts from UI-only data. Implement durable frontier/crystal/qualification milestones, workbench/laboratory equipment, industrial dossier production, one queue and powered laboratory work sharing. Research bootstraps from crystal + recorded qualification without requiring its own dossiers.
- [ ] Spend one of every required dossier per research unit atomically; define reserved input behavior on cancellation/destruction and retain total material accounting. Pause on missing inputs/power; preserve completed units and milestones in a versioned save migration.
- [ ] First enabled research: prepared materials and structured logistics. Later technologies remain visibly planned until their gameplay is implemented. Never gate the initial nine tools or baseline error/telemetry access.
- [ ] Verification: first-crystal consumption cannot relock research; missing one pack cannot consume others; two labs cannot double-complete/spend; power loss/save/load/pause preserve progress; old v1/v2/v3 saves migrate; keyboard browser journey from qualification to one completed technology and one newly crafted product. Record inventory before/after and unlock proof.

## P2 — Research interface and authoritative art catalog (P1 integration; art mapping independent)

- [ ] Owner: UI. Bind existing research and product panels to runtime statuses/queue only when P1 exists. Show exact missing prerequisites, products, pack totals, producers and services. Full-tree development view never bypasses locks or spends inventory.
- [ ] Consolidate the legacy 18-capability gallery with the canonical 27-node art manifest delivered in 014. Keep generated concept illustrations distinct from playable buildings. Lazy-load node art when the panel opens; do not preload endgame images into the world.
- [ ] Verification: all 27 technology IDs have a documented art mapping; 99 product links remain reachable; keyboard focus returns to opener; empty search/locked node/missing optional art handled; inspect at 1280×800 and 1440×1000, 48/96 px thumbnails, with no clipped costs. Browser test queue transitions and unchanged stock while inspecting.

## P3 — Paid logistics, splitters and power distribution (after P1)

Planning decisions for a first balance pass: charge `ceil(route length / 4)` assemblies for newly built routes after structured logistics; starter and pre-migration routes are grandfathered. Edits charge only positive difference against that route's paid cost; shortening/disconnect gives no assembly refund and preserves existing packet-to-scrap accounting. Blueprint previews include all new route costs and commit atomically. No per-segment deletion in this iteration: disconnect/re-route remains the ownership model. These are provisional game balance values, not physical calibration.

- [ ] Owner: transport/grid. One cost function shared by preview/connect/edit/stamp; save each route's paid amount. Implement researched splitter and underground crossing with explicit endpoints/layers, bounded buffers and fair alternating output. Add poles/substations with explicit capacity and multi-generator connectivity; crossings never implicitly connect.
- [ ] Verification: insufficient funds leave routes/stock/qualification unchanged; repeat edit cannot double-charge; blueprint cost equals committed debit; packet counts conserved under backpressure/disconnect; crossing layer isolation and splitter fairness; two generators share a real bus; feed above 240 triggers wire capacity diagnostics. Show overload isolation and recovery visually with loads still served.

## P4 — Registered animation and state events (independent of P1)

- [ ] Owner: presentation. Consume new sources/manifest in 014, fix source rectangles and stationary anchors before enabling sheets. All four views must be physically redrawn. Support per-asset alpha/compositing and lazy decoding; preserve PNG source pixels.
- [ ] Add actual event time/sequence bindings for sentry recoil, crawler attack/hit/death and guardian collapse. Current sentry uses world-time phase and crawler rendering always walks: source generation alone does not complete these states. One-shots hold their terminal frame; load reconstructs remains; no animation-driven damage.
- [ ] Add reduced-motion preference and stop appropriate mechanisms on pause, hidden tabs, open modals, power loss, input starvation, output blockage and thermal trips. Passive field devices and powered cooling retain their distinct state rules.
- [ ] Verification: looping contact sheets + runtime scenes, all views, intact/light/severe/wreck and thermal/service axes; compare stationary base and fixed port anchors across frames; document measurable drift/clipping. No pristine moving chassis on damaged equipment; no recoil without a shot. Confirm death plays once and remains after save/load. Pixel hold checks plus visual review are both required.

## P5 — Expedition pacing and late-tier contracts (after P1/P3)

- [ ] Owner: gameplay. Run a timed fresh expedition through first research and replicated outpost. Record time to assembly surplus, sentry, frontier, qualification, first dossier and first upgrade; deaths, repair cost and confusion. Target the intended 30–45 minute slice via measured recipe/resource changes.
- [ ] Write bounded implementation contracts for precision fabrication (accepted parts versus scrap), source locking/return protection, thermal loops and pulse encounters before implementing them. Keep membrane/aperture/sail/launch art as future previews until these systems exist.
- [ ] Verification: complete without dev stock injection, recover from one damaged machine and failed acceptance, repeat after load, explain one wave-phase failure using diagnostics. Automated guided tests do not substitute for an unprompted human usability playtest.

## Shared completion gate

Run `npm test`, `npm run build`, relevant Playwright scenarios, and `git diff --check`. Regenerate `npm run docs:progression` only if design data changes. Tests must assert observable contracts, not mirror implementation. Preserve unrelated work. Update this log and the relevant feature log with evidence; never mark generated art as runtime integration or a passing automated assertion as visual approval.
