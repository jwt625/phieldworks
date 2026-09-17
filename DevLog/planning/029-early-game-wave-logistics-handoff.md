# 029 — Early-game physical wave logistics: coding-agent handoff

Date: 2026-09-16. Status: **specified; no implementation or visual acceptance**.
User decision: **Physical pieces: straights, elbows, explicit junctions.** Dragging
a route automatically places pieces; each piece can be inspected and upgraded.
Asset production is tracked separately in [031](../production/031-wave-logistics-assets.md):
pilot images are candidates, not approved geometry or runtime registrations.
Read [032 modular seam contract](../production/032-modular-route-seams.md) before
R-02/R-06: repeat bodies and shared capless interfaces must connect in assembled
routes; endpoint caps and joint sleeves are separately owned renderer elements.
Working reference: [pass10 kit](../../assets/production/pass-10-connected-kit/README.md)
and [033 seam validation](../verification/033-connected-route-kit-review.md).
Use the tested interface/assembly method; cardinal prototype junction needs an
explicit adaptation to actual runtime machine ports before art promotion.
The parent agent owns orchestration and independent multimodal validation. The
coding agent implements the packages below and supplies reproducible evidence.

This refines the early-game subset of [017 B/C](017-industrial-gameplay-tranches.md)
under [016](../design/016-coherence-industry-and-lightsail-design.md). It supersedes
[012 P3](012-next-coding-handoffs.md)'s whole-route-only ownership for **new field
routes**, not existing material/power rules. Numerical balance and the precise
starter sequence below are working defaults, not additional user decisions.
Do not implement the full 27/99 preview catalog, fusion, or sails in this tranche.

## Outcome and bounded scope

Play the loop: produce assemblies → construct a physical two-branch field network
→ tune a precision cell → earn accepted parts → manufacture a better elbow or
junction → replace installed hardware → measure improved delivery/production →
qualify and copy the upgraded cell.

First delivery (R-01–R-07): physical wave pieces and a closed manufactured-upgrade
loop using existing shared process inputs. Second delivery (R-08): local cell
material logistics. R-09 validates the complete workflow; R-10 is the independent
release gate. Do not call the first delivery a complete belt-fed factory.

Existing evidence: `world.ts:connect` installs free paths; `geometry.ts` assigns
bend loss from nominal radius; `network.ts:hybrid` is ideal/lossless; process
accepted output is a counter; `fabrication-cell` has only a power port. Existing
two-zone target projection is not multimode guide propagation. Preserve the
working frontier and local-cell behavior through explicit compatibility handling.

## Non-negotiable contracts

### Physical construction and identity

- A new field route is an ordered assembly of installed physical pieces, with
  stable piece IDs, definition/version, pose, footprint, ports and condition.
  Route IDs remain useful UI containers; one authoritative piece topology drives
  geometry, cost, physics, selection, saves and blueprints. No divergent second graph.
- Basic straights occupy half-tile lattice intervals; elbow templates consume
  declared entry/exit runs and swept clearance. Never charge/count the same run
  as both straight and bend. Validate full swept footprint, not only centerline.
- Start new physical routes with 90° templates. Legacy diagonal routes retain their
  behavior; unsupported new diagonal construction has an explicit explanation.
  A larger-radius elbow occupies more land. A radius toggle cannot improve physics
  without replacing hardware and validating its space/cost.
- Dragging previews pieces and the bill of materials before a single atomic commit.
  Branch/merge requires a four-port junction; no implicit T connections. New
  wave-wave crossings require an explicit two-layer crossing piece. Parallel shared
  runs are disallowed unless explicitly supported by a later layer system. Existing
  material/electrical crossings retain their separate abstract layers this tranche.
- Delete/replace a piece locally; a gap opens the optical path and exposes physical
  open ports. Repairing a gap reconnects only compatible, coincident interfaces.
  Replacement failure leaves stock, topology, IDs, certificates and geometry intact.
- Manufacture hardware into inventory. Installation transfers inventory to the map;
  healthy recovery returns the same item, damaged recovery follows a declared scrap
  rule. Editing reuses unchanged pieces and accounts for every removed/new piece.
  No inventory creation through preview, cancellation, disconnect or blueprint copy.

### Wave behavior and accounting

- Straight propagation, elbows and interfaces carry complex transmission; reflective
  components are explicit scattering elements. Junctions keep useful AND reject
  outputs and are reciprocal unless explicitly defined otherwise.
- Every passive definition must satisfy passivity for arbitrary simultaneous inputs,
  not only unit excitation at one port. Record phase convention and terminal ordering.
  Ideal legacy behavior remains available for migrated components.
- Keep intended splitting distinct from excess loss. Lower IL and reflected power
  are improvements; return loss in dB increases. Display zero reflection as infinity
  or a clear bounded display, not NaN. Do not report RL on a dark port as measured.
- Account once for transmitted, reflected, absorbed, radiated and escaped energy.
  Scattering radiation is not automatically component heat. Temperature/condition
  should follow actual local absorption when modeled; do not double-count old link loss.
- A phase tuner cannot recover radiated power or eliminate amplitude imbalance.
  Passive guides do not lock independent sources. Independent cells need coherence
  internally, not a global phase relationship.
- Avoid one solver port per straight segment. Compose unchanged serial runs exactly
  where practical, reconstructing local readings and losses. Compare against explicit
  small networks; do not sacrifice reflections or silently drop pieces to meet caps.

### Inventory, saves and qualification

- Preserve `process.accepted` as lifetime production history; introduce separately
  spendable precision-part inventory. Qualification reads cycle events, not balance.
- Save physical pieces, inventory, unlocks and local recipe jobs with bounded input
  validation. Advance the schema from the actual integrated head, not a guessed version.
- Legacy paths migrate to free, immutable-physics legacy assemblies preserving exact
  route behavior (including diagonals/overlaps). Convert only by explicit whole-route
  rebuild with space/BOM validation. Legacy recovery yields no new hardware; it must
  not be a free-item exploit. New legacy routes cannot be constructed.
- Old accepted totals migrate once to the corresponding shared precision inventory;
  later saves persist stock explicitly and never regenerate stock from lifetime totals.
- Upgrade/configuration changes invalidate only dependent qualifications. Include
  piece definitions/versions/topology in signatures; thermal/control evolution retains
  existing intended semantics. Copies get fresh identities and local qualification.
- Blueprint capture includes all internal physical pieces and hardware costs, strips
  inventory/jobs/certificates, and exposes cut boundary services. Partial-junction and
  crossing capture must fail clearly or declare a resolvable boundary, never duplicate.

## Component and technology progression

All new coefficients/recipes go in versioned data with a recorded balance fixture.
Coding agent may tune provisional values against the gates below; report the chosen
numbers and their measured effect. They are compressed game values, not calibrated optics.

| Stage | Hardware / teaching event | Unlock / real payoff |
| --- | --- | --- |
| Starter | Basic straight, compact elbow, larger swept elbow, basic four-port junction, crossing, existing dump/tuner | Assemblies suffice; spacious short network can make first accepted parts |
| First precision output | Manufacture precision elbow and matched junction variants | First accepted cycle unlocks recipes; spend actual precision parts plus assemblies; no global stat bonus |
| Repeatable cell | Replace a lossy elbow or imbalanced junction, then retune | Better delivery margin and accepted output per input energy on the same demanding fixture |
| Local factory | Cell inputs/outputs on material belts | Input shortage and output blockage are visible; production feeds upgrade manufacture |
| Later extension, outside first release | Restricted-mode guides, mode adapters/filters, reference distribution | Introduce at least two propagating modes only when a process exposes the distinction |
| Later scale | Rated combiners/dumps, isolation, amplifier and cooled duct hardware | Returns, thermal limits and useful/reject handling constrain increased power |

Use the same four-port equipment in split and combine configurations; recipe variants
upgrade its physical properties. Require one combine demonstration with a real reject
dump. Early stages can use a matched source; do not claim source destabilization until
source feedback is actually modeled. Return power itself is already a useful diagnostic.

Mode extension must have a separate contract and reference tests: bounded vector fields,
passive mode-coupling matrices at bends/interfaces, downstream mode-sensitive acceptance,
and conserved unwanted-mode power. Target useful/guard readings alone cannot satisfy it.
Pulse dispersion waits for finite-bandwidth gameplay. Fusion synchronization must not
be universally equated with mutual optical coherence.

## Coding packages and dependencies

Each package: focused change, checked TODOs only after evidence exists, test commands
and results, remaining issues. Read local changes first: UI/animation work is already
in progress in `main.ts`, `renderer.ts`, `style.css` and DevLog indexes. Preserve it.
Integrate shared files sequentially. No art generation is necessary for first coding:
use renderer-native geometry with truthful component silhouettes and status.

### R-01 — Definitions, balance fixture and construction contract (P0)

Files: new `src/sim/wave-parts.ts`, `world-types.ts`, `definitions.ts`; new fixture
`scripts/wave-logistics-fixture.ts`; existing `scripts/precision-cell-fixture.ts`.

- [ ] Define starter/improved part records, explicit geometry/ports, versioned optical
  properties, inventory recipes and recovery rules. Distinguish crossings from junctions.
- [ ] Record a complete starter BOM/resource budget with a recovery reserve and no
  advanced-item dependency. Fixture uses real production after declared initial stock.
- [ ] Freeze a short bootstrap layout and demanding two-branch layout before tuning
  component coefficients. Record phase sweeps, useful/guard exposure, source energy,
  part counts and space occupied. No invisible bonus keyed to mission or component tier.
- [ ] Establish a measured target: upgraded demanding layout meets process contract
  for three consecutive cycles and improves useful/source-energy ratio by ≥15%
  relative to the best-tuned basic layout. Keep source power, target positions, recipe,
  duration and environmental schedule identical. This is a provisional gameplay gate.

Done: reproducible baseline report and explicit data contract. Basic short layout can
bootstrap; demanding layout illustrates loss/imbalance that phase alone cannot repair.

### R-02 — Physical route construction/editing (P0; R-01)

Files: `routing.ts`, `geometry.ts`, new `wave-construction.ts`, `world.ts`.

- [ ] Compile drag/waypoints into deterministic piece templates with swept occupancy.
- [ ] One transaction handles preview/install/replace/delete/recover and aggregate BOM.
- [ ] Explicit branch and crossing compatibility; gap repair; stable unaffected IDs.
- [ ] Preserve existing belt packet/backpressure and power behavior.

Code gate: obstructed swept bends, insufficient stock, occupied crossings and invalid
port attachment fail atomically; deleting one elbow opens only that path; recovery and
rebuild conserve inventory; unchanged pieces retain identity. Rotation 0–3 fixtures.

### R-03 — Component physics and meaningful diagnostics (P0; R-01, R-02)

Files: `network.ts`, `world.ts:waveLinks/evaluate`, `diagnostics.ts`, new part evaluator.

- [ ] Nonideal elbows/junction variants with documented passive coefficients; exact
  serial composition or bounded explicit fallback with actionable size errors.
- [ ] Separate excess loss, returned power, radiation, absorption and intended division.
- [ ] Piece-level readings reconstruct from the same solve and trace to the affected cell.
- [ ] Add split/recombine fixture: phase sweeps move power between useful/reject ports;
  mismatch and loss remain distinct; attach dump and observe accounted absorption.

Code gate: analytical straight/reflection/hybrid cases; arbitrary coherent input
passivity checks; independent groups add powers; explicit vs composed field results
agree at relative 1e-8 (absolute 1e-10 near zero); normalized conservation residual
≤1e-8 on declared nonsingular fixtures. Singular cases yield diagnostics, not NaNs.
Do not count reflected power as dissipation or require power to vanish at a dark output.

### R-04 — Persistence, copy and local qualification (P0; R-02, R-03)

Files: `persistence.ts`, `blueprints.ts`, `qualification.ts`, `world-types.ts`.

- [ ] Migrate legacy routes and accepted counters according to contracts above.
- [ ] Validate bounded piece arrays, IDs, versions, footprints, topology and inventories.
- [ ] Copy/stamp physical BOM atomically; refresh domain signatures and boundary slots.

Code gate: supported old saves reproduce old optical results; repeated round trips
do not mint items; malformed/overlapping new pieces rejected; failed stamp unchanged;
upgrading cell A leaves independent cell B qualified; copied parts/control get fresh IDs.

### R-05 — Spendable precision output and hardware manufacture (P0; R-01, R-04)

Files: `process.ts`, `process-recipes.ts`, `world-types.ts`, new small manufacture module,
`src/ui/process-inspector.ts` and contextual recipe UI.

- [ ] Accepted event grants exactly one spendable precision item, independently of
  lifetime accepted history. Reject/rework/cancel never grants duplicate accepted output.
- [ ] First accepted cycle unlocks two hardware recipes. A powered assembler tooling
  mode manufactures them using explicit reserved inputs, finite time and output inventory.
  Preserve ore→assembly operation as its default mode; switching waits for active job.
- [ ] Pause/power loss suspend; cancel before consumption refunds; after consumption
  scraps declared material. Destruction and reload share exactly-once ownership rules.
- [ ] Installation consumes manufactured hardware, not research points or invisible bonuses.

Code gate: earn → manufacture → install → improve loop uses no runtime stock injection;
consuming precision stock leaves qualification history intact; saved active manufacture
resumes once; every cancel/destruction stage conserves ownership with declared losses.

### R-06 — Routing interaction and rendering (P0; R-02–R-05)

Files: `main.ts`, `renderer.ts`, `style.css`; prefer new small route UI modules.

- [ ] Drag preview shows actual straights/elbows, invalid footprints, BOM/affordability
  and compatible endpoints. Automatic placement never silently buys a higher tier.
- [ ] Piece selection offers inspect/replace/recover, with route-level selection available.
- [ ] Distinguish compact/swept/improved bends and crossing/junction by shape, not color
  alone. Ports line up with drawn guide ends at all rotations.
- [ ] Inspector leads with actionable loss/return and affected delivery; advanced IL/RL
  details are expandable. Show split ratio separately from dissipated loss.
- [ ] Preserve compact HUD budgets from 026, keyboard escape/focus and no click-through.

Code gate: actual browser drag→commit→select elbow→replace→undo via recovery workflow;
invalid replacement keeps old route; readings update from world state. No console or
asset errors. Visual acceptance belongs to R-10, not screenshot existence.

### R-07 — Guided early-game scenario (P1; R-05, R-06)

Files: `world.ts:createWorld`, `src/ui/tutorial.ts`, objective/operations UI, fixture.

- [ ] Starter construction supply plus real production afford a first physical network,
  one failed trial and recovery. Preserve frontier access and finite-resource accounting.
- [ ] Teach one action at a time: deliver → split → tune → produce → manufacture → replace
  → retest. Offer roomy swept-bend alternative to the compact precision solution.
- [ ] Expose before/after measured delivery and production, with no forced tutorial
  completion or manual phase setting required for ordinary play.

Code gate: fresh-world no-injection fixture reaches upgrade and three accepted cycles;
the same gameplay completes through browser controls. Record simulation and wall time,
materials consumed and recovery reserve. Pacing is measured, not asserted as balanced.

### R-08 — Local workpiece and output belts (P1; first delivery R-01–R-07)

Files: `geometry.ts:ports`, `definitions.ts`, `world-types.ts`, `world.ts` material step,
`process.ts`, persistence/blueprints and process UI.

- [ ] Add bounded typed material packets without breaking legacy ore packets. Define
  cell assembly/crystal input buffers and accepted/reject output handling; retain lot
  provenance/rework eligibility rather than treating every output as fungible scrap.
- [ ] Add one small stock-transfer depot: explicit withdraw-to-belt and belt-to-stock
  modes with bounded buffers. It bridges existing shared assembly/crystal production
  to local cell logistics; it does not pretend the entire economy is already local.
- [ ] New cells reserve from local input buffers, never silently fall back to shared
  stock. Reserve output capacity before exposure; blocked output cannot duplicate or
  discard product. Typed filter/output choice must be visible and deterministic.
- [ ] Accepted items enter spendable shared inventory only on explicit depot receipt;
  lifetime accepted increments at completion. Never count cell buffer AND shared stock.
- [ ] Legacy cells keep a labeled shared-feed compatibility mode until explicit
  conversion while idle. Port changes preserve existing power endpoints and art anchors.
- [ ] Save/load, destruction, belt disconnect, depot mode changes and blueprint copying
  account for in-flight/reserved/buffered items and provenance exactly once.

Code gate: depot→cell inputs→accepted output→depot→hardware manufacture via real belts;
full receiver backs up without loss; missing ingredient blocks only that cell; disconnect
accounts for packets; rework lot cannot be spent or duplicated. A disconnected cell
cannot draw shared inputs. Preserve legacy save behavior explicitly.

### R-09 — Integrated regression and evidence (P0 release; R-01–R-08)

- [ ] Run `npm test`, `npm run build`, `npm run test:browser`; preserve frontier,
  two-cell, blueprints, menus, compact HUD, art/state and technology-preview scenarios.
- [ ] Benchmark full world steps with control enabled on basic/upgraded two-cell
  fixtures and a declared route-heavy fixture; record machine, sizes, p50/p95/max,
  frame timings and supported limits. Gate p95 ≤16 ms on the delivered gameplay
  fixtures. Report pre-existing larger-network failures separately, without hiding them.
- [ ] Store report JSON, deterministic action scripts, seed/start-save and environment
  under `DevLog/evidence/wave-logistics/`. Store selected captures under
  `DevLog/verification/wave-logistics/`; routine artifacts remain in `test-results/`.
- [ ] Include revision/diff identity, numerical definitions, BOM, before/after readings,
  test commands/results and the exact procedure for an independent browser replay.

Done: all relevant code gates pass; evidence is reproducible. R-10 remains open.

### R-10 — Parent/orchestrator multimodal validation (release gate)

- [ ] Independently launch the integrated app and execute the scenario through UI.
- [ ] Inspect actual images at required viewports/rotations, and temporal state sequences.
- [ ] Compare visible route, ports, component type, readings and inventory against saved
  authoritative state at the same checkpoint. Explain discrepancies and file defects.
- [ ] Record pass/fail evidence in [030 review](../verification/030-wave-logistics-validation.md).
- [ ] Return concrete defects to coding agent; rerun affected visual/behavior gates after
  fixes. Never replace this review with author assertions or DOM-only tests.

Implementation is handed off by this document; no coding agent is launched by writing
it. The parent remains responsible for the eventual review. User human playtesting is
a separate discoverability/pacing check and cannot be claimed from an agent replay.

## Coding-agent completion message

Report completed R IDs, revision, changed files, test/benchmark results, replay command,
evidence paths and outstanding defects. Distinguish implemented, code-verified and
parent visually accepted. Stop at honest intermediate milestones; do not mark R-08 or
R-10 complete merely because the first upgrade works with shared inventory.

---

## Coding-agent status 2026-09-16 (first implementation pass)

**Implemented and code-verified:** R-01 (data contract + balance fixture), R-02 (physical construction/editing), R-03 (nonideal passive physics + exact two-port composition), R-04 (schema `v5`, piece/blueprint persistence, fingerprint), R-05 (spendable precision output + hardware manufacture). R-06 is partially implemented: a `Wave guide` build tool with piece/BOM preview and atomic commit, piece rendering/selection, a piece inspector with replace/delete, and assembler tooling manufacture; the legacy `field` tool is retained for compatibility.

**Evidence:** `npm test` 143, `npm run build` pass, `npm run test:browser` 40/40, `git diff --check` clean. R-01 fixture: basic→upgraded useful/source ratio **+29.6%**, 12 accepted cycles, qualified; JSON at `DevLog/evidence/wave-logistics/r01-balance-fixture.json`. Journal entry in `../implementation/004-implementation-journal.md`.

**Not implemented / delegated:** R-07 guided scenario; R-08 local belts; R-09 integrated route-heavy benchmark and delivered-fixture ≤16 ms gate; R-10 parent multimodal validation. R-06 is not visually accepted and does not yet implement the 032 renderer-owned seam/sleeve composition; crossing art is ungenerated. R-01 values are provisional; the fixture uses declared stock/frontier preconditions.

**Integration decisions requested:** geometry/authoring-space/tier questions needed before any pass-10 art can be registered are consolidated in [034 integration request](../planning/034-wave-logistics-integration-request.md), with the companion asset brief [035](../production/035-wave-logistics-asset-request.md).

**034 feedback pass (2026-09-16):** P9 finite-bend construction contract implemented (distinct elbow terminals, reach consumed once, deletion gap, short-leg clamp, exact trimmed spans); pass-11 straight-basic atlas registered and rendered by coding-owned composition; guide tool offers compact/swept before placement. Template evidence `DevLog/evidence/wave-logistics/p9-finite-bend-templates.json`. Elbow/junction/crossing art, condition overlays, terminal/sleeve composition, R-07 and R-09 remain open. Validation: 146 headless, 42/42 browser, build pass.
