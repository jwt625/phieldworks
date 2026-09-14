# Industrial gameplay — implementation tranches

Date: 2026-09-13. Planning only. The user approved documenting the discussion in [016](../design/016-coherence-industry-and-lightsail-design.md). This is the current implementation sequence; it supersedes the old P1–P5 ordering in [012](012-next-coding-handoffs.md), retaining applicable accounting and verification requirements. No tranche is marked implemented by this document.

## Fusion extension and shared-platform scope

[018](../design/018-fusion-energy-roadmap.md) adds the user-requested energy pillar. Fusion is required for final launch; fuel starts as manufactured cartridges. Share equipment families, parts, services and research across manufacturing, fusion and propulsion; specialized endpoints and explicit operating ratings preserve their different physics. Keep A first. Add D-F1 experimental fusion and D-F2 sustained net power as staged extensions, not prerequisites for a small sail demonstrator. Final launch requires D-F2 plus qualified sail/beam/mission systems.

## Baseline and scope

The first outpost loop remains implemented. The latest recorded P0.1 work in [015](../verification/015-connected-world-validation.md) includes route-metric memoization, simpler current-topology power accounting, one-tuner-per-step control and revision-gated evaluation. Do not reimplement those tasks from the older queue.

Recorded P0.1 results include 24.29 ms p95 controlled step at 120 machines/one source and 54.78 ms at 120/16, with real-time browser pacing in the sampled fixtures. The ≤16 ms p95 world-step gate is still unmet in larger controlled cases. Before/after records include different hardware; use same-machine reruns for optimization acceptance. The latest logged regression checkpoint is 58 headless tests, 19 browser scenarios and a passing build; those are prior evidence, not a test run performed for this planning edit.

Keep the 256-port validity limit distinct from a performance-supported scale. The current research/production catalog is a preview. New targets, local qualifications, field-assisted recipes, transport families and sail mechanics need implementation and save migrations.

## Sequence and dependencies

| Tranche | Primary outcome | Dependency |
| --- | --- | --- |
| A — Local industrial loop | Two independently controlled precision cells and a clear contextual UI | Existing starter production and field simulation |
| B — Network foundations | Typed wave transport and measured solver reduction | Port/module contracts from A; performance investigation can begin alongside A |
| C — Research and integrated progression | Earn, research, manufacture and operate a useful upgrade | A; only the transport subset actually used must be ready from B |
| D — Regional industry | Remote delivery and hierarchical multi-outpost operation | A–C and measured performance gate |
| D-F1 — Experimental fusion | Qualified targets, pulse delivery and a measured ignition experiment | Precision production from C and pulse contracts from B |
| D-F2 — Fusion energy plant | Sustained net export, repeated operation and fuel/service logistics | D-F1, efficient drivers, heat recovery and regional services |
| E — Sail demonstrator | Coupled beam/sail qualification with understandable tradeoffs | Materials and control branches from C/D |

HUD and art contracts begin in A and accompany each tranche. Exact block reduction is an experiment in B; do not promise a speedup before measurements. Approximate nonlinear manifold caching, full interplanetary factories and a relativistic launch simulation are future scope.

## A — Local industrial loop

Detailed execution package: [019](tranche-a/019-tranche-a-plan.md), [020 contracts](tranche-a/020-tranche-a-contracts.md), [021 file-level TODO](tranche-a/021-tranche-a-coding-tasks.md), and [022 assets](tranche-a/022-tranche-a-assets.md). These specify provisional implementation defaults; A remains unimplemented.

Goal: manufacture a useful precision part by delivering an appropriate field to a workpiece, then repeat that success in an independently managed cell.

- [ ] Define target, control-domain, qualification and selected-module contracts. Separate coherent reference identity from equipment identity; establish sensor/actuator ownership and external service bindings.
- [ ] Migrate the starter guardian/controller/commission into local records without losing the existing tutorial journey. Preserve older save migrations; restore ratings as requiring fresh local verification while preserving physical state and earned milestones as applicable.
- [ ] Implement one fabrication cell and accepted-part output with a bounded spatial process target. Specify recipe quantities, process windows, reserve/consume timing, interruption, rework and scrap behavior before coding the cycle.
- [ ] Supply a bootstrap route using existing equipment and available resources. Advanced-source research must not be required to make its own prerequisite parts.
- [ ] Add local control and qualification, including dependency-based invalidation and explicit fault reasons. A controller's enabled state and progress belong to its domain.
- [ ] Implement selected-area blueprint capture with fresh internal identities, retained internal bindings and prompted/previewed external service bindings at deployment.
- [ ] Introduce the menu shell, contextual inspector and routing controls. Consolidate operations into one navigable window; move session actions into Esc. Preserve shortcuts, camera/navigation behavior and baseline diagnostics.
- [ ] Define the cell's footprint, ports, workpiece visualization and four-view/condition/operation asset contract. Use explicit temporary art until registered assets exist.

Acceptance:

- Two cells can target different workpieces and run different enabled/control states. No actuator receives conflicting independent commands.
- At equal source power, a declared field-pattern change affects accepted production and the ledger still closes. Inspectors explain the difference.
- Missing input/power, pause, cancellation, damage and save/load preserve partial-work and inventory ownership without duplication. Waste is accounted for.
- A local edit or failure invalidates affected qualifications; an unrelated repair does not. Shared-source dependencies invalidate all relevant records.
- Replication uses fresh identities and requires local qualification; external bindings are visible before committing stock.
- The existing frontier journey still works. A keyboard-only player can build, inspect, tune, diagnose and qualify the cell. Menus restore focus and clearly indicate pause.
- Record a short human playtest: can the player explain why a part failed and make a repeatable improvement? Automated completion is separate evidence.

## B — Network foundations

Goal: wave logistics has understandable equipment choices, while larger modules avoid unnecessary repeated solving.

- [ ] Implement a shared transport-definition contract with family, supported bands/modes, physical limits, route costs and endpoint compatibility. Migrate existing routes to the basic family without changing established behavior.
- [ ] Enable basic guides plus only the next specialized family justified by a playable process. Represent later families as planned. Add explicit adapters and useful/reject routing where required.
- [ ] Retain half-tile geometry, editable link identity, packet accounting and crossing isolation. Revisit the simplified per-wire ledger before enabling poles or true shared power feeds.
- [ ] Reuse topology, block membership and invariant assembly with explicit invalidation. Preserve existing bounded control and measure convergence as domains multiply.
- [ ] Prototype exact boundary-port reduction with retained source-group contributions, return fields and internal absorption reconstruction. Use full-solver fallback for unsuitable partitions or failed elimination.
- [ ] Maintain thermal/health/inventory dynamics inside reduced modules. Parameter changes must refresh relevant coefficients; reduction is not permission to freeze internals.
- [ ] Produce registered route segments and endpoint art for enabled families, with readable power/compatibility feedback during placement.

Acceptance:

- Incompatible connections fail atomically with a remedy; new costs cannot double-charge edits or blueprint placement. Retain P3's provisional paid-route rules only after balancing confirms their fit.
- Full and reduced solves agree within declared tolerances on complex boundary/internal fields, source groups, reflections, loss and singular behavior for supported partitions.
- Exercise topology edits, thermal drift, phase trials, source changes, load changes, damage and load/restore invalidation.
- Rerun the same route-valid connected fixtures at 40/80/120 machines and 1/4/16 groups, with control off/on. Record median/p95/max step, real frame pacing, simulation/wall time, convergence and residuals on the same hardware.
- Target ≤16 ms p95 step and responsive interaction. If it fails, record the supported operating range explicitly rather than raising caps or hiding work.

Future B extension: parameterized approximate responses with explicit validity/error bounds and deterministic fallback. Defer envelope dispersion until pulses are playable, and nonlinear response caching until a bounded nonlinear component exists.

## C — Research and integrated progression

Goal: qualification and production lead to an earned upgrade that visibly improves industry, along both beam/control and materials/quality branches.

- [ ] Revise runtime-safe research, recipe, producer and service contracts around 016. Audit the existing 27/99 catalog; retain useful entries, rewrite conflicting gates, and distinguish implemented versus planned content.
- [ ] Implement persistent milestones, workbench/laboratory production and research. Reserve a complete research-unit pack set atomically; preserve partial work and unique reservation ownership across laboratories.
- [ ] Keep cancellation refunds limited to unconsumed reservations; destroyed buffers become accounted waste. Consuming first crystal cannot remove the earned milestone.
- [ ] Supply guaranteed reachable resources and a recovery reserve, using a fresh resource-demand audit rather than adopting the old catalog's quantities as balanced values.
- [ ] Enable one useful source/control upgrade and one materials/process-quality upgrade. Each must have observable value before a flight sail exists.
- [ ] Preserve a bootstrap path through conventional materials and the A cell. Check every recipe, service and research dependency for cycles.
- [ ] Bind research and product views to authoritative runtime progress. A global research queue may remain; it is separate from local engineering controllers and qualifications.
- [ ] Regenerate 009 and diagrams from catalog data when that data changes. Update illustrations by revised IDs and explicit concept/production status, one implemented tier at a time.

Acceptance:

- Play through qualification → research production → completed technology → crafted and operated upgrade without injected stock.
- Missing one required pack never consumes the others; laboratories cannot spend or complete the same unit twice. Power loss, cancellation and save/load retain correct progress.
- Both engineering tracks have a reachable useful upgrade and a measurable effect on output, yield, stability or delivery. Record inventory and process results before/after.
- Research preview and developer full-tree inspection never bypass runtime locks or spend stock.
- Time and observe a fresh expedition. Revisit the earlier 30–45 minute slice aspiration after measuring the expanded loop, including one recoverable failure.

## D — Regional industry

Goal: operate several outposts with independent purposes and coordinate them without constant manual retuning.

- [ ] Expand map/resource scope using the chosen campaign setting; one-planet regions are the working default.
- [ ] Add remote receiver targets and free-space links with bounded spreading, line-of-sight and tracking behavior. All delivered, missed, reflected and converted power remains accounted for.
- [ ] Add parent/child controllers, shared-reference distribution and explicit shared-equipment scheduling. Local failures propagate only through declared physical/control dependencies.
- [ ] Add regional logistics and power/cooling distribution required by actual recipes. Paid routes, splitters and crossings remain explicit hardware with migration/accounting contracts.
- [ ] Make operations navigation scale to named domains, targets and modules. Prioritize selected/faulted/nearby labels at map scale.
- [ ] Validate reusable module models in full worlds, including live internal failures and evolving operating conditions.

Acceptance: operate several independently qualified outposts, recover a local failure without unexplained global invalidation, and maintain the measured performance target at the advertised scale. Show the effect of distance or tracking on a remote receiver and a practical remedy. No silent field-port or material dropping.

## E — Sail demonstrator

Goal: connect the two technology tracks through a mission that can succeed or fail for understandable physical reasons.

- [ ] Implement membrane fabrication, inspection and assembly with bounded panel specifications: mass/area, optical absorption/response, thermal and structural limits. Specify defect/rework accounting.
- [ ] Implement a test-sail target with simplified motion, intercepted momentum, heating and tracking. Start with the ground/vacuum demonstrator; define orbital deployment infrastructure before depicting orbital acceleration.
- [ ] Bind beam-sector qualification and sail inspection to an integrated test profile. A stronger beam cannot automatically compensate for overheating or loss of tracking.
- [ ] Provide a mission preview showing limiting margins, then live feedback tied to actual simulation state. Record achieved impulse/trajectory and failure cause.
- [ ] Produce membrane/deployment/aperture assets against stable silhouettes, port interfaces and state-event contracts.

Acceptance: compare at least two sail/drive configurations with a meaningful tradeoff; meet a declared profile within momentum, heat and structural accounting; demonstrate and explain a recoverable failure. Exact flight mission and interstellar targets remain later decisions.

## Fusion extensions and integration gates

- [ ] A: target/domain contracts allow process, pulse diagnostic and chamber targets without a global mode switch. Do not implement fusion before the first cell.
- [ ] B: define finite electrical storage, pulse-energy/envelope summaries, timing, duty-cycle and amplifier saturation interfaces. Distinguish optical coherence from synchronized pulses and uniform illumination. Reuse transport families and cooling contracts.
- [ ] C: audit every proposed fusion capability against existing catalog entries. Prefer tooling/modules on shared chassis; add genuinely distinct chamber, injection and heat-conversion equipment. Document at least two application consumers for each shared foundational upgrade, with common research dossiers and distinct demonstration milestones.
- [ ] D-F1: provide diagnostic targets, inspected capsules/cartridges, explicit charge/fire/recover state, an experimental chamber and local shot acceptance. Demonstrate ignition while the plant can still have negative net electricity.
- [ ] D-F2: implement efficient drivers, heat capture/conversion, finite target supply, injector, service/wear and repeated-cycle scheduling. Qualify net export without depleting initial stored energy or hiding imported electricity and auxiliary demand.
- [ ] E / final launch continuation: keep small sail tests independently reachable. Require qualified sustained fusion supply for final launch, including the plant's own recirculating power, launch load and restart reserve.
- [ ] HUD/assets: add Energy within the operations window, contextual shot comparisons and plant export status. Reuse chassis art across applications and show mode/tooling through attachments and overlays. Generate distinct chamber/thermal/sail assets only for their distinct functions.

Integration acceptance: one manufactured source/pump or cooling upgrade must demonstrate benefits in at least two application domains; recipe dependencies must connect all three motivations without cycles. Sharing actual equipment requires explicit routing/scheduling and valid per-target qualifications. Test that dispatching capacity cannot double-book an actuator or count fusion export that a diverted driver no longer sustains. Test fuel and charge ownership, failed shots, save/load, conventional restart and storage-neutral repeated operation.

The detailed technology/equipment/asset proposals and remaining architecture choices are in [018](../design/018-fusion-energy-roadmap.md). These extensions add scope; they do not make A–E or fusion implemented.

## Mapping the previous queue

| Previous handoff | New home |
| --- | --- |
| P0 / remaining P0.1 performance | B, with investigation alongside A |
| P1 research persistence/manufacturing | A process accounting and C research |
| P2 research UI/art mapping | A menu architecture and C catalog/runtime binding |
| P3 paid logistics and power distribution | B connection contracts and D regional infrastructure |
| P4 registered animation/state events | Asset work accompanying each enabled tranche |
| P5 pacing and late-tier contracts | A/C playtests and D/E demonstrations |

## Shared completion requirements

Run simulation tests, build and relevant browser scenarios for implementation changes; record results at the actual checkpoint. Compare numerical reference behavior when changing solver/control code. Regenerate progression artifacts only when catalog data changes. Perform visual review separately from automated checks. Preserve existing save compatibility through explicit migrations, record remaining limitations and do not mark planned artwork or recipes as runtime features.

This planning pass changes documentation only. It does not start implementation or asset generation. Next concrete work is A's target/domain/process contract and first-cell slice, with B's remaining performance investigation able to proceed independently.

## Tranche A implementation checkpoint — 2026-09-13

A-01 through A-08 are implemented and committed on `main`; A-09–A-11 (gated cell art) and the human/visual parts of A-12 remain open. Local target/domain/qualification/process records and a `version:4` save with v1–v3 migration replaced the writable globals; target delivery is conserved and emitter assignment is authoritative; control uses one bounded tuner trial per step with signature-based qualification; the process lifecycle reserves, exposes, suspends, reworks once and commits exactly once through one loss helper; the `Fabrication cell` is buildable, cools by a declared law and is qualified by three accepted cycles in a no-injection fixture; process/domain inspectors and a menu shell expose assignment, forecasting, operations and keyboard placement; selection blueprints copy fresh identities without transferring inventory or certificates.

Automated evidence: 115 headless tests, 27 browser scenarios, production build, and `DevLog/evidence/tranche-a/` (planning validation, two-cell benchmark, connected benchmark, solver review). A same-machine two-cell run reported p95 0.49 ms / max 1.12 ms per step. Reviewed cell art, explicit visual findings and a human playtest remain required before calling A complete; no fusion, research spending or sail content is runtime-ready.
