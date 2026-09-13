# Coherence, industry and the lightsail — design iteration C

Date: 2026-09-13. Status: discussion direction approved for documentation and planning; new mechanics below are not implemented. The user approved the outline and requested this record. Implementation tranches are in [017](017-industrial-gameplay-tranches.md).

This iteration takes precedence over conflicting future-design assumptions in [000](000-design-doc.md), [001](001-gameplay-and-frontier-experiment.md), [007](007-technology-tree-design.md), and the future-work ordering in [012](012-next-coding-handoffs.md). Historical implementation evidence remains valid at its recorded checkpoint. The current 27-technology/99-product catalog remains the existing inspection UI's data source until explicitly revised; this document does not silently change recipes or unlocks.

## Fusion extension and shared-platform decision

The user subsequently added energy as a third core motivation: manufacturing, fusion energy and propulsion. [018](018-fusion-energy-roadmap.md) specifies the NIF-inspired roadmap, equipment/assets, research additions and shot/plant accounting. Fusion is **required for final launch**; the initial fuel economy uses **manufactured fuel cartridges**. Conventional power must bootstrap and restart the fusion program.

The three applications share source/amplifier families, power storage, cooling, transport, metrology, controllers, production tooling and research wherever operating ratings permit. Specialized endpoints provide distinct challenges. Shared upgrades require manufactured hardware and measured benefits, not automatic global bonuses. The two beam/sail workstreams below remain essential within this broader three-motivation structure; fusion adds an integrated energy workstream.

## Decision status and remaining design intent

Accepted direction:

- Connect material production to useful field-controlled processing. Materials build wave equipment; controlled waves improve material processing, inspection and eventually propulsion.
- Develop two substantial, interacting progression tracks: coherent beam generation/combining/control and lightweight, efficient sail manufacturing.
- Introduce multiple targets, local controller domains, and local qualification records. Global controller and commissioning state are prototype limitations to replace.
- Define distinct wave-transport families with physical tradeoffs, staged property simulation, and corresponding asset families.
- Explore equivalent boundary-port models for scale; retain live internal state and conservation. Approximate cached operating domains are a later extension.
- Restructure the HUD around contextual inspection and proper menus. Integrate art progression with equipment function and technology progression.
- Make the first precision manufacturing cell the next playable design centerpiece, preserving the existing frontier loop.

Working defaults, not individually answered preferences:

| Open design intent | Recommended working default | Consequence of choosing differently |
| --- | --- | --- |
| Campaign setting | One industrial planet, then an orbital deployment/launch layer | An airless moon simplifies propagation; multiple planets add cargo travel, map scheduling and persistence scope |
| Ongoing engineering effort | Tune prototypes, then automate qualified modules | Continuous manual tuning requires a smaller factory; preset-only play puts more weight on recipes and layout |
| Early challenge emphasis | Manufacturing quality/efficiency, with ecology and frontier pressure supporting it | Combat-led play needs a larger encounter and defense progression |
| Menu behavior | Pause full management dialogs in single-player; ordinary inspectors remain live | Live management requires stronger alert visibility and a deliberate attention-management design |

Three questions covering setting, engineering effort and early challenge were sent through the question panel; no individual answers were received before the user approved the outline. These defaults support planning without pretending that those answers were given. Revisit them before committing the campaign map or balancing the first extended playtest. Exact units, recipe quantities, process tolerances, time scaling, loss coefficients and sail mission parameters remain unbalanced.

## Core mechanism: manufacture better matter through controlled energy

Do not introduce cargo-to-light conversion and remote matter reconstruction. The proposed bridge is ordinary material processing and energy/momentum transfer, with compressed game units:

1. Mining and conventional production supply conductors, ceramics, substrates, gain media, optics, controllers and membranes.
2. Electrical power or optical pumping supplies field energy. Sources, references and amplifiers produce and control output; conversion losses become heat.
3. Fields deliver heat, spatial patterns, pulses, measurements or momentum to physical targets.
4. Better accepted products enable better field infrastructure and more demanding manufacturing.

Coherence determines where and how energy acts; it does not create energy. Material items remain conserved through inputs, accepted output, recoverable rejects and scrap. Ordinary electrical transport and belts remain useful. Beam transport earns its place for remote access or process-specific delivery rather than universally replacing wires and cargo.

| Process | Delivery contract | Role of coherence |
| --- | --- | --- |
| Bulk heating/refining | Absorbed energy, temperature and throughput | Phase control is usually unnecessary; robust low-coherence operation remains valuable |
| Precision patterning | Spatial distribution, exposure and stability over a cycle | Relative fields control the process pattern and unwanted exposure |
| Pulsed processing | Pulse energy, duration and timing | Phase/timing and propagation affect delivered pulses |
| Inspection/metrology | Measurement resolution, reference stability | References support precise comparison and diagnosis |
| Remote power reception | Intercepted power, conversion efficiency and tracking | Appropriate beam control improves delivery; receiver conversion incurs losses |
| Sail acceleration | Momentum delivery, heating and tracking | Aperture control sustains useful illumination at distance |

Low coherence is not a universal combining-efficiency upgrade: independent inputs still obey each component's port routing. Spectral broadening and loss of spatial coherence are distinct. A conduit does not phase-lock unrelated sources.

### First precision-cell experiment

Extend the proposed field-assisted fabrication cell into a visible interaction: material enters a workpiece target; a local field network supplies its process pattern; the cycle produces accepted parts, recoverable rejects or scrap. Total source power alone must not determine success.

For the first slice, use a small declared set of target modes or process zones, such as useful exposure and unwanted exposure. Calculate bounded energy delivery from the field solution and accumulate exposure over the cycle. Define quality thresholds explicitly before implementation; do not claim a full diffraction solver. A phase change can redistribute exposure while source power stays constant. Provide a predicted process preview and a readable reason for a rejected part.

Keep the first output simple: one accepted precision-part item and an explicit reject/scrap path. Broader grades and sail-panel specifications follow later. Define reservation ownership, interruption behavior, rework losses and cycle persistence before adding recipes. Do not let reload, cancellation or destruction duplicate inputs or erase accounted losses.

First success is a repeatable production improvement: tune the cell, commission it, manufacture accepted parts, and deploy a second independently controlled cell. Keep starter sources and diagnostics sufficient to bootstrap this experiment before advanced research, avoiding a dependency on equipment made by the cell itself.

## Setting and final mission

Working setting: one industrial planet with regional terrain, resources, environmental coupling and outpost logistics; late conventional deployment puts a sail in orbit before beam acceleration. An interplanetary test destination can precede an interstellar probe ambition. Interplanetary factory simulation is deferred.

A surface aperture requires an explicit atmospheric and visibility model or a deliberate setting simplification. Choose among a high-altitude region, thin atmosphere, or orbital aperture before designing the launch region. Do not silently assume an ordinary atmosphere has no optical consequences. Emitters on opposite sides of the planet do not form a single unobstructed aperture. A planet-scale instrument includes its supporting industry and distributed control, not necessarily a continuous planet-wide optical aperture.

## Two interacting technology workstreams

| Stage | Beam-drive progression | Sail/materials progression | Shared demonstration |
| --- | --- | --- | --- |
| Industrial foundation | Stable local sources and heat handling | Refined substrates and reflective coatings | Repeatable processed test coupon |
| Precision manufacturing | Reference locking, return protection, small combined arrays | Thin films, patterned surfaces, defect inspection | Qualified membrane sample |
| Scalable engineering | Amplifier banks, hierarchical control, larger apertures | Large-area deposition, lightweight supports, panel joining | Ground/vacuum sail demonstrator |
| Flight engineering | Tracking, wavefront correction, sustained delivery | Low absorption, deployment, structural and steering stability | Orbital test sail |
| Launch system | Qualified aperture sectors and coordinated drive | Mission-matched flight sail and payload | Complete acceleration profile |

Both tracks must produce useful intermediate upgrades. Precision optics and controls improve the beam system; better process fields enable improved films and inspection. Cross-links must not create circular research or manufacturing gates. Existing sources and conventional materials provide the bootstrap route.

Sail progression considers areal mass, reflectivity, absorption, thermal emission, wavelength response, structural strength and deployment reliability. A larger sail intercepts more of a spreading beam but adds manufacturing and deployment costs. Lower mass helps acceleration but can reduce margins. Greater drive power is useful only while heating, tracking and structural constraints are satisfied.

Final acceptance is a mission profile: deliver sufficient momentum to a declared payload while maintaining thermal, structural and tracking limits over the trajectory. Replace the old proposed fixed-power final checklist when this model is implemented. Exact mission distance, velocity, duration and payload remain design parameters. The first demonstrator uses a simplified low-speed regime; relativistic Doppler behavior is future mission-dependent scope.

## Local targets, control and qualification

Separate these records:

- Target: stable identity, type, position/motion, delivery modes or zones, process/mission objective, and observed state. Workpieces, receivers, creatures, beacons and sails have different contracts.
- Control domain: assigned reference, sensors, actuators, target bindings, operating mode, enabled state, scheduling progress and faults.
- Qualification: module/configuration identity, contract, dependencies, test conditions, elapsed work, rating and current validity.

Start with one objective per local domain; leave room for coordinated scheduling and subordinate domains. Actuators have explicit ownership. Independent controllers cannot silently command the same tuner. Shared equipment requires a coordinator or declared arbitration. Reference locking requires an explicit shared coherence relationship, not merely proximity or equal source settings.

Track qualification dependencies. An unrelated extractor repair must not invalidate a precision cell; a changed shared source may invalidate several dependent records. Independent target damage and frontier state must not assume one global guardian. A selected-area blueprint preserves internal assignments, exposes external service bindings, creates fresh identities, and requires local acceptance after deployment.

## Simulation abstraction and cached behavior

For a fixed linear configuration, eliminate internal unknowns to obtain an equivalent boundary relation:

```text
outgoing boundary fields = effective scattering matrix × incoming boundary fields
                           + internal-source contribution
```

This is algebraic reduction, not a sampled output lookup. It can be exact within numerical precision and the model's linear assumptions, across input amplitudes. Preserve complex fields, coherence groups, backward reflections and reconstructible internal absorption. Handle singular elimination blocks explicitly: choose a viable partition or fall back to the detailed solve; do not disguise an elimination failure as a valid response.

The payoff depends on boundary size and update frequency. A large block with few exposed ports is promising. A block exposing nearly every internal port is not. Thermal drift or tuner changes alter coefficients and can require updates even without a topology edit.

Implementation sequence:

1. Reuse topology/assembly and existing route caches; retain bounded controller scheduling. Measure baseline connected fixtures.
2. Prototype exact reduction with internal-state reconstruction and detailed-solver comparisons.
3. Introduce reusable module response models only when full world-step measurements demonstrate a benefit.
4. Later, explore parameterized approximate models for thermal/nonlinear/controller behavior. Track configuration, state, operating domain and error bounds; expand to detailed evaluation outside validity or when uncertainty is excessive.

Internal heat, health, inventory and disturbances remain live. Model changes must not hide faults or create energy. Keep an explicit conservation residual and deterministic fallback. Aggregate many weak coherent paths only under a stated error bound.

Commissioning certifies operation; it does not grant permission for the simulation to optimize a block. Numerical caching is transparent to players. A qualified operating envelope and a numerical approximation domain are related data but different contracts.

## Wave transport families and staged physics

Material belts, electrical conductors, coolant pipes and wave links have separate port types and readable silhouettes. Wave transport evolves through specialized families rather than one universally superior tier:

| Family | Purpose and cost | Physical tradeoffs | Asset family |
| --- | --- | --- | --- |
| Basic enclosed guide | Inexpensive local routing | Bend loss, reflection, phase drift | Segmented metal/ceramic shell and visible joints |
| Large-core power conduit | Forgiving coupling and bulk delivery | Multiple modes complicate precise patterns and pulses | Broad duct, reinforced bends, large couplers |
| Precision restricted-mode guide | Predictable mode delivery | Alignment demands and intensity limits | Slender sealed guide on precision supports |
| High-power beam duct | Expanded beam and cooling | Large footprint, expensive turns and mirror alignment | Wide rigid tube, cooling jackets, mirror stations |
| Free-space optical link | Remote delivery without continuous conduit | Line of sight, diffraction/spreading, tracking and environment | Gimbaled terminals and receiver apertures |
| Compensated/multiplexed link | Advanced timing/channel capacity | Endpoint complexity, bandwidth and power costs | Compatible base route plus compensator/filter equipment |

Route contracts include supported wavelength bands/modes, attenuation, phase, delay, dispersion, power/intensity handling, thermal limits, bend response and nonlinear susceptibility. Numerical values require balance and an explicit units convention. Coherence state belongs to fields/sources, with propagation affecting it; it is not a cable quality scalar.

Stage 1 simulates loss, phase, reflections, bends and power handling. Stage 2 introduces a bounded mode representation and reference distribution. Stage 3 introduces chromatic/modal dispersion when finite-bandwidth pulses or signals make it observable. Stage 4 adds bounded intensity-dependent phase or gain saturation in selected components. A continuous monochromatic link should not lose generic throughput solely because its catalog says "dispersion". A broad conduit need not have every nonlinear effect of a narrow one.

Provide explicit splitters, combiners with reject outputs, mode/band adapters, isolation devices and dumps. Crossings do not implicitly connect. Properties remain physically present when applicable; research unlocks hardware and operating regimes, not new laws. Representations must agree in overlapping regimes.

## Art direction tied to progression

Revise technology contracts before another broad concept-art batch. Existing canonical art stays available as concept/reference material; it does not establish playable equipment or force the revised tree to retain a node.

- Industrial foundation: exposed fasteners, rough castings, bulky ceramic insulation.
- Precision: sealed housings, alignment mounts, clean optical interfaces.
- High power: cooling infrastructure, shielding, large service access.
- Flight: thin membranes, lightweight supports, sparse structural frames.

Preserve camera, lighting, scale conventions, ground anchors and port vocabulary across tiers. Changes in silhouette/material must communicate functional improvement, not just ornament. Distinguish route families through geometry as well as color. Keep field overlays and dynamic beams separate from sprites.

Each enabled route family needs registered straight/diagonal pieces as supported, bends, endpoints/adapters, separate-layer crossings, build previews and condition states. Larger ducts may need explicit turn machines rather than small bend sprites. Each new machine needs footprint/port definitions before its four-view art, condition frames and real event-bound operation animation. Require stable anchors, pause/power behavior, reduced-motion handling and readable small-scale silhouettes. Generate one implemented tier at a time after these contracts are stable.

## HUD and menus

Replace persistent button accumulation with a clear interaction hierarchy:

- Persistent HUD: quiet resource/time status, summarized alerts, compact quickbar and collapsible map.
- Build menu: searchable categories and contextual equipment/route variants, keyboard accessible.
- Contextual inspector: only the selected entity, route, target or module and relevant actions.
- Operations window: research, local controller domains, qualification and blueprints in navigable sections.
- Esc menu: save/load, settings, help and leave-game action appropriate to the browser host.

Routing controls appear during routing/editing. Alerts open the relevant diagnostic/object, preserving baseline fault visibility. Working default: full management dialogs pause single-player simulation; ordinary inspectors remain live. Make pause state visible and preserve the existing hidden-tab pause behavior. Esc closes the topmost surface first; dismissal restores focus. Preserve direct camera control, technology zoom/pan, minimap navigation and accessible shortcuts.

## Physics references used in the discussion

These motivate simplified game contracts; they do not validate game constants:

- [Beam shaping for ultrafast materials processing](https://arxiv.org/abs/2010.12851): spatial/temporal delivery for manufacturing.
- [Coherent beam combination of ultrafast fiber lasers](https://arxiv.org/abs/2101.05696): scaling and stabilization requirements.
- [Lightsail thermal regulation](https://arxiv.org/abs/2106.03558): coupled optical, thermal and acceleration constraints.
- [NASA: directed energy and optical effects of fluids](https://www.nas.nasa.gov/pubs/ams/2025/02-06-25.html): atmospheric distortion and thermal blooming.
- [COMSOL: domain decomposition using Schur complements](https://doc.comsol.com/6.4/doc/com.comsol.help.comsol/comsol_ref_solver.36.175.html): boundary reduction method family.
