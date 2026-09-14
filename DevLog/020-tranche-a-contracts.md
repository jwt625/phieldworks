# Tranche A — simulation, persistence and interaction contracts

2026-09-13. Proposed implementation contract for [019](019-tranche-a-plan.md). Numerical values below are game-design starting points, not measured material constants. Reference rationale is in [research notes](references/tranche-a/README.md). No code snippets here represent implemented APIs.

> **Implementation status — 2026-09-13 (later pass).** The record/migration, conserved two-zone delivery, local control/qualification, process lifecycle, first-cell, contextual UI, selection-blueprint and menu contracts are implemented (A-01–A-08) and the automated A-12 gates pass. The process workpiece-heat/clamping constants and the 80–640 dose window were measured by the no-injection fixture and retained. Cell art integration (A-11) is not done, so no generated art is claimed as runtime.

## 1. Module boundaries and records

Create `src/sim/world-types.ts` as the shared type layer; it may import types from geometry/network but not runtime world functions. `world.ts` remains the public command/step façade and can re-export old entry points during migration. Split responsibilities only where the work needs an independently testable contract.

| Record | Persistent minimum | Derived / never authoritative in saves |
| --- | --- | --- |
| Target | ID, kind (`frontier` or `process`), owner entity if applicable, position/anchor, assigned emitter IDs, contract ID | Per-group fields, zone powers, preview, fault text |
| Reference binding | Source entity ID, coherence-group ID | Optical phase inferred from neither proximity nor matching numeric settings |
| ControlDomain | ID/name, reference binding, target ID, sensor binding, ordered tuner IDs, enabled, tuning objective, local cursor | Current objective value, transient trial solution |
| Qualification | ID/domain/contract IDs, status, configuration signature, elapsed test time, counters/minima, dependency IDs, reason code | Fresh dependency traversal and live margins |
| ProcessJob | ID, cell/target/recipe/version IDs, stage, batch provenance, active elapsed time, useful/guard dose, interruption count, rework flag, terminal outcome/event sequence | Forecast quality and UI animations |
| Material reservation | Unique reservation ID, owner job ID, exact input quantities, reserved/consumed disposition | Stock available for a second reservation |
| Milestones | Frontier opened, first accepted part, first qualified cell, qualified replication demonstration | No automatic equipment buffs |
| Blueprint | Version, local entity/target/domain keys, internal routes, settings, external service slots, bounding box | Inventory, damage, heat, jobs, certificates and event playback |

IDs use distinct prefixes and a shared monotonically increasing allocator. Enforce unique IDs, bounded counts and valid cross-record references on load. Initially at most one process target/job/domain per cell; targets/domains bounded by machine cap plus the frontier record. Sensor binding means the cell's integrated zone diagnostic in A; it is not permission for future remote sensors to measure arbitrary targets.

A domain can list several tuners but every tuner has at most one controlling owner, including disabled domains. Reject conflicting assignment atomically. Every emitter has at most one delivery target. Assigning an emitter to a cell removes its frontier delivery; show this impact before commit. A target has at most one independent domain. Sharing a physical reference source across branches is allowed; assigning unrelated sources the same coherence group is not an A player action. Default each source to its own group, including migration.

## 2. Conserved delivery and process zones

Do not call the old global target projection once per target using all emitters. Partition emitters by explicit delivery assignment. Unassigned emitters still radiate; their power is off-target. Frontier projection preserves the old formula for its assigned emitter set, including `n = max(2, assigned emitter count)`; this preserves the starter fixture when all original emitters remain assigned there.

For a process target, require exactly two assigned powered emitters for the standard recipe. Zero/one emitter may be diagnosed but cannot begin standard exposure. Let `a[e,g]` be the incident complex field at emitter e for coherence group g. Use the current emitter model's reflectance and radiation efficiency:

```text
r = 0.08                         amplitude reflection
eta_rad = 0.92                   absorbed-to-radiated fraction
capture_e = min(0.88, 50/(distance_e^2 + 30))
x[e,g] = a[e,g] * sqrt((1-r^2)*eta_rad*capture_e) * exp(i*0.23*distance_e)
u[g] = (x[0,g] + x[1,g])/sqrt(2)
v[g] = (x[0,g] - x[1,g])/sqrt(2)
P_useful = sum_g |u[g]|^2
P_guard  = sum_g |v[g]|^2
P_capture = P_useful + P_guard = sum_e,g |x[e,g]|^2
P_missed = sum_e P_radiated_e - P_capture
```

This is an orthonormal two-mode surrogate, not literal computed image-plane pixels. Zone overlays label that approximation. The distance coefficients are existing game units, not an atmosphere or diffraction model. Amplitudes interfere within a group; group powers add. Two unrelated sources cannot be made coherent by tuning their carrier phases. Opposite phase redistributes power between the two modes without increasing captured power.

For equal normalized inputs with total captured power 40, relative phases 0, π/2 and π give useful/guard powers (40,0), (20,20), (0,40). Independent equal-power groups give (20,20) independent of relative phase. Use these as analytic test oracles, not rounded renderer samples. Tolerance: `1e-8 * max(1, input power)` for algebra/ledger fixtures; separately state solver tolerance in integrated fixtures.

World field accounting: network absorption already includes emitter absorption. Replace emitter absorption with its local loss plus radiated output, then partition radiation into delivered zones and missed radiation. Process absorption is a destination of delivered radiation, not an additional source or a second subtraction from network absorption. Add target absorbed power to the cell's thermal update once. Existing ecology exposure remains a heuristic signal; do not count it as another physical energy sink. Unavailable target/cell shutter routes captured power to an explicitly reported local protective absorber, not a vanished quantity.

Keep potential zone delivery (the diagnostic projection with shutter open) separate from actual workpiece absorption. While idle or suspended, the protective absorber receives captured power, the preview can still show potential exposure, and no workpiece dose accumulates. Controller objectives use potential delivery so the player can tune before spending materials.

Predicted process preview uses current measured zone power extrapolated over remaining active time. Label it a forecast under unchanged conditions; show useful dose, guard dose and acceptance ranges. Preview, control trials and `evaluate` must not mutate jobs, inventory, qualification time, thermal state or event counters.

## 3. Starter balance and bootstrap

| Parameter | Proposed default |
| --- | --- |
| Cell ID / construction | `fabrication-cell`; 18 assemblies |
| Footprint / electrical demand | 3×3; 12 power units, ordinary generator feed |
| Material service | Explicit local UI reservation from shared stock; no material belt ports in A |
| Standard input | 2 assemblies + 1 crystal per workpiece |
| Active exposure | 8 simulation seconds |
| Accepted useful dose | 80 through 640 power-unit·seconds, inclusive |
| Accepted guard fraction | guard dose / total dose ≤0.10; zero dose fails |
| Trip / operation | Existing 85°C protection; unhealthy/tripped/unpowered cell cannot expose |
| Local cell cooling | Start with `dT/dt = 0.05*P_abs - 0.4*(T-25)` during all world steps; clamp ambient floor |
| Output | One `accepted-part`, one recoverable reject lot, or one scrap lot |
| Rework | One further 8-second exposure on an underdose-only reject; cumulative doses retained |
| Cell qualification | Three consecutive accepted standard cycles under enabled local control, no dependency faults; real inputs consumed |

The broad useful-dose window is intentionally a first test range; guard exposure should make phase matter before tight dose control. Dose acceptance occurs at exposure completion. Guard excess or useful overdose sends that batch to scrap under this recipe policy; the game does not model repairing those defects. Rework is allowed only when the sole failure is useful underdose and the cumulative guard fraction remains acceptable; a failed rework becomes scrap. No grade RNG. No passive qualification timer grants materials.

Bootstrap audit: the existing 100-field-unit reference is sufficient in principle for a nearby two-emitter cell, but a route-valid world fixture must prove actual power/heat margins. A new standalone cell set costs 75 assemblies: generator 14 + reference 12 + junction 5 + tuner 6 + two emitters 20 + cell 18. Three qualification batches add 6 assemblies and 3 crystal. Two such cells cost 162 assemblies and 6 crystal including qualification, before optional dumps, extraction, defenses or repairs. At 2 ore per assembly that construction/qualification portion is 324 ore. Audit the full expedition separately, including prerequisite frontier expansion and crystal extractor. Keep at least 12 assemblies unreserved for recovery. Current 1400+900 western ore is a gross resource bound, not proof that placement, defense, power and delivery work.

A construction command must not reserve future recipe inputs. Missing crystal must not consume assemblies. The inspector identifies this recipe as the starter process; do not silently change the existing preview's polished-crystal/control-board recipe. Reconcile the catalog deliberately in C; in A display implemented starter recipe separately and label catalog recipes as planned.

## 4. Material ownership and interruptions

Keep legacy ore packets and legacy scrap accounting intact. Add a small process inventory: accepted-part count, reject lots and process-scrap lots. Each lot carries recipe/version, original input bundle, parent batch ID and disposition; do not pretend an accepted part, an assembly and a legacy scrap count have equal mass. For audit, count workpieces by batch and retain the exact consumed ingredient bundle. A rework transfers a lot; it does not create another input bundle. No conversion from process scrap to free assemblies in A.

```text
idle → reserved → exposing → complete → idle
                  ↘ suspended ↗
terminal result: accepted | recoverable-reject | scrap
```

Reserve atomically: subtract all ingredients from available stock and create one owner record. On first active exposure step, transfer reserved ingredients into consumed batch provenance. Completion atomically credits exactly one terminal result and stores the terminal event sequence. No second completion on repeated stepping, save/load or UI refresh. Completed job reports can be bounded to the last two per cell; cumulative counters remain persistent.

| Event | Before exposure | After any exposure |
| --- | --- | --- |
| Player pause / hidden tab / management modal | No simulation work | Preserve all job data; no offline catch-up |
| Missing power / protection trip | Keep reservation, no dose | Suspend and close shutter; retain elapsed/dose; repair then resume |
| Manual cancel | Refund unconsumed reservation exactly | Transfer workpiece to process scrap; do not refund ingredients |
| Cell removal or destruction | Reservation becomes accounted process waste; no remote refund | Workpiece becomes process scrap exactly once |
| Target, delivery assignment or recipe change | Cancel/refund before applying new contract | Require explicit abort-to-scrap before applying incompatible change |
| Tuner adjustment / source drift | Allowed | Continue exposure; measured doses record the consequence |
| Save/load | Restore ownership | Restore consumed stage, doses and outcome; no repeat emission of result |

Healthy-cell dismantling may refund chassis construction cost under current rules, separately from batch accounting. Thermal damage and wildlife destruction must use the same job-finalization helper. A cell may hold one job and at most one rejected lot for local rework; completed items transfer to shared process inventory with a bounded report. Rework selects/removes one owned reject lot atomically; two cells cannot rework the same lot. A pre-exposure rework cancel returns that lot, not its original raw ingredients.

## 5. Controls and certification

One world-level scheduling budget selects one eligible tuner trial pair per fixed step, round-robin over nonempty enabled domains and then local tuners. Do not multiply that budget by the number of cells. Keep the P0.1 two trial evaluations and at most one winning settle. Trial state and the winning solution must be restored consistently. Persist the scheduling cursor for deterministic reload continuity; derived field caches are rebuilt.

Frontier objective stays useful target power. Process objective is `P_useful - 4*P_guard`, with read-only preview; controller cannot alter recipe, reserve stock, stop a cycle early or change group identity. Qualification requires actual outcome evidence. Enabling auto-control does not auto-start material jobs: separate Run continuously and Auto tune switches.

Distinguish configuration changes from closed-loop state changes. Manual tuner edits, topology, assignments, hardware, reference/group, recipe and controller mode invalidate dependent certificates. Automatic phase corrections and ordinary temperature drift do not invalidate configuration signatures by themselves; live monitoring may fail the operating range. Beginning a new qualification resets test counters, not job inventory or milestones. Qualifying consumes the next three whole standard cycles begun after test start; a partial pre-existing cycle is not evidence.

Dependency closure includes target/cell, assigned emitters, tuners, connected field component (including possible reflections), source/reference, and electrical service participants capable of affecting supply. Capture pre-edit closure when removing a link, and post-edit closure when adding one; invalidate the union of affected domains. Shared source edits invalidate all consumers. New competing power load invalidates affected service consumers; an unrelated extractor repair on another independent supply does not. A conservative shared-bus invalidation is acceptable with a stated reason. Numerical cache revision remains global if needed; qualification validity must not use that global revision as its sole condition.

Qualification states: idle/testing/qualified/failed/stale. Loading sets existing certificates stale and resets active test progress, while preserving process work and earned milestones. Powered idle shuttering or missing stock is not an optical-quality failure; show certificate validity separately from ready/blocked state. During exposure, a dependency fault or failed batch fails an active test and a breached qualified operating contract invalidates certification. Clear human-readable reasons accompany stable codes (missing-input, unpowered, guard-overexposure, useful-underdose, useful-overdose, incompatible-binding, dependency-changed).

### Fixed-step integration order

Use one documented order: apply queued validated player commands → evaluate electrical/field state → perform bounded read-only control trials and retain winning state → advance ordinary production/logistics and process exposure using that field sample → commit completed job outcomes → integrate temperature and damage → run ecology and destruction cleanup → evaluate changed physical state → update qualification/alerts. Reevaluate before exposure if any preceding command changed topology or supply. A protection/wildlife failure later in the same step cannot duplicate or retract an already committed item; it fails current qualification and finalizes only an unfinished owned batch. This is a fixed-step approximation, not an intra-step event solver. Test this exact ordering.

An exposure tick needs a powered healthy cell, a valid field solve and both assigned powered emitters; otherwise suspend without accumulating active time. Zero delivered field with electrically powered emitters is a valid underdose measurement, not permission to wait forever for energy. On the final partial exposure tick, integrate dose only over remaining active duration; account all field energy during the rest of dt at the protective absorber. Thermal absorption remains accounted throughout the whole step.

## 6. Save migration and transactional commands

Introduce world save v4 after the type extraction. Keep existing v1→v2→v3 geometry/ecology checks, then migrate v3 to local records. Preserve frontier state/health, world time, entities, packets, stock, wildlife, player settings and compatible blueprint geometry. Original emitters bind to the frontier target; original tuners belong to the frontier domain. Choose the first valid reference by stable entity order as controller reference; each source retains its own coherence group. If no reference exists, create the domain disabled with an explicit missing-reference diagnostic. The legacy enabled flag transfers only to a valid binding. Old commission becomes stale; old completed frontier progress remains an earned milestone.

Old blueprints become template geometry with no copied inventory/certification; derive frontier service slots instead of retaining a global target coordinate as an internal identity. Legacy invalid layouts still fail under the existing migration rules. Version-4 loader rejects duplicate IDs/reservations, missing owners, negative/nonfinite counters, impossible terminal combinations, multiple owners, unsupported recipe versions, invalid routes and exceeded machine/port bounds. Never allocate an unbounded job/lot array from untrusted save content. Proposed cap: 1000 retained reject/scrap lots; merge identical spent provenance summaries when safe, otherwise block further production visibly before consumption.

Normalize caches after validation; do not invoke ordinary mutating construction commands to replay saved inventory events. Migration fixtures cover v1/v2/v3, v4 roundtrip at every job stage, malformed references, qualification restart and save at the exact completion boundary. Historical v1 rejection fixtures must remain rejected.

## 7. Selected modules and blueprint placement

Selection includes only fully enclosed machines, their owned process targets, and routes with both endpoints included. Highlight excluded crossing routes. A domain may be captured with omitted controller/source equipment only as an explicit external slot. Internal IDs become template-local keys. A partially selected tuner set is not silently treated as a qualified whole domain: flag incomplete domain and require completing selection or capturing an unqualified template.

Qualified capture requires qualified included domains. Store settings and source-relative relationships, not runtime charge, temperature, health, inventory, exposures or ratings. External slots identify power feed, reference, target and any excluded controller/actuator binding, with required capacity/ownership and explanatory names. An already-owned external tuner is an invalid binding. A blueprint may contain an internal source, whose copy starts a fresh coherence group; do not copy the original physical coherence relationship.

Preview validates bounds, ports, routes, stock, fresh IDs and external slot resolutions against a staged candidate. Default external slots to unresolved; user selects a compatible service or explicitly chooses deploy disconnected where supported. Then commit all state/stock once. Failure leaves world, next-ID counter, bindings and stock unchanged. Disconnected deployment is visibly blocked/stale, never qualified. No automatic reference locking or cost-free external wires. Existing free-route rules persist for A; do not introduce paid logistics here.

## 8. Player workflow and UI contract

Selected cell inspector order: current result/blocker → input availability and Run once/continuous → useful/guard exposure preview → source/emitter/tuner assignment → manual phase controls and Auto tune → qualification → last two results and inventory disposition. Default diagnostics are short labels with a remedy; technical units and per-group breakdown are expandable. Include a visible acceptance band and expose the same values as text.

Opening the inspector keeps simulation live. Build/operations/Esc full dialogs pause via explicit pause reasons (`user`, `hidden`, `modal`) rather than toggling the user's pause setting. Closing the last dialog removes only the modal reason. Do not accumulate catch-up steps while paused. Esc closes topmost dialog, then active route/build operation, then opens session menu. Retain existing technology zoom/pan, minimap recentering and camera shortcuts.

Use labeled native modal dialogs with initial focus, contained tab navigation and focus return to the invoking control or a sensible fallback. This follows [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Search/build palettes can use ordinary buttons and input; avoid inventing a complex ARIA menu when a list suffices. Provide keyboard selection through a searchable entity/domain list and keyboard world placement cursor (arrows move tile, Enter places, R rotates, Esc cancels); existing camera arrow behavior remains when no placement cursor is active. Assignment controls list IDs/names, so canvas hit testing is not the only way to bind equipment. Process alerts deep-link to the owning inspector.

UI images are decorative beside accessible text. Exposure and fault overlays come from runtime state; reduced motion suppresses movement while preserving state/result indication. Simulation time drives active animations; completion effects use event sequence IDs rather than a repeating world-time phase.
