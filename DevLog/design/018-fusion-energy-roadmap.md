# Fusion energy — the third industrial motivation

Date: 2026-09-13. Status: user-requested design expansion; equipment, technology additions and balance below are proposals, not implemented features. Augments [016](016-coherence-industry-and-lightsail-design.md) and [017](../planning/017-industrial-gameplay-tranches.md). The user explicitly establishes three core motivations: manufacturing, energy and propulsion, with a NIF-inspired fusion roadmap. The existing runtime catalog remains unchanged pending tranche C's deliberate revision.

## Design thesis

Manufacturing makes better targets and wave equipment. Controlled wave delivery initiates fusion. Fusion supplies the energy for larger factories and sustained sail acceleration. These three motivations share infrastructure but demand different operating regimes:

| Motivation | Player objective | Main delivery constraint |
| --- | --- | --- |
| Manufacturing | Produce accepted precision parts and materials | Spatial pattern, exposure and process stability |
| Energy | Produce dependable net electricity from repeated fusion cycles | Pulse timing, illumination symmetry, target quality, conversion efficiency and repetition |
| Propulsion | Accelerate a useful payload within sail limits | Large-aperture beam control, sustained delivery and tracking |

The beam-drive and sail-materials tracks in 016 remain substantial engineering workstreams. Fusion adds an energy workstream; it does not replace the sail branch. The planetary achievement is an industrial system of target factories, driver modules, energy plants, cooling, reference distribution and launch infrastructure. A single target chamber is a local installation, not a beam focus receiving all emitters from around an obstructing planet.

Confirmed campaign role: the user selected fusion as required for final launch. Conventional generation bootstraps the fusion program; qualified sustained net fusion export gates final launch infrastructure. Small sail demonstrations can proceed before commercial fusion. This is a campaign requirement, not a claim that lightsails physically require fusion.

Confirmed fuel scope: the user selected manufactured fuel cartridges initially. Use explicit finite feedstock and consumed targets; detailed isotope separation and breeding are deferred. Feedstock access and replenishment must be defined before balancing, so fuel is neither free nor indefinitely available.

## What NIF inspires, and what the game extrapolates

NIF is an ignition research facility, not an operating electricity plant. Its shot sequence includes precise target preparation, pulse shaping, amplification, final optics and diagnostics. Its published illustrative sequence distinguishes hundreds of megajoules of stored electrical drive energy from approximately two megajoules of laser energy at the target. This motivates separate energy ledgers rather than copying those numbers into game balance. [LLNL: anatomy of a shot](https://lasers.llnl.gov/about/how-nif-works/anatomy-nif-shot)

LLNL explicitly distinguishes target-level ignition/gain from facility energy requirements and identifies repeat operation as a power-plant challenge. The game extrapolates from an experimental installation to a future energy plant; achieving a shot milestone must not automatically make it a net generator. [LLNL: exploring energy security](https://lasers.llnl.gov/science/energy-security)

NIF-like indirect drive and coherent far-field beam combining are different tasks. For the research stage, depict beams feeding a radiation enclosure around the capsule, with the intermediate drive represented by an abstract coupling efficiency. Do not silently switch to directly illuminating the capsule while describing it as the same architecture. A later direct-drive alternative would need a separate target/illumination contract; selecting the commercial architecture remains open.

Fusion does not simply demand all beam carrier phases match. Timing, pulse shape, energy balance and irradiation symmetry matter. OMEGA uses phase plates, spectral-dispersion smoothing and polarization smoothing for uniform irradiation. This provides a real basis for a game tradeoff: a driver optimized for a narrow coherent focus may require different final optics for a uniform compression target. [LLE: OMEGA](https://www.lle.rochester.edu/omega-laser-facility/omega-laser-system/)

Distinguish common pulse timing from shared optical coherence. Preserve controlled phase where the delivery network needs it; introduce intentional smoothing at the relevant stage. Neither coherence nor incoherence is a universal quality score. Frequency conversion has efficiency/heat costs; smoothing redistributes delivery and changes interference statistics rather than multiplying power.

Fusion does release nuclear energy through a small change in fuel rest mass. That extends 016's energy-source model without introducing material teleportation: consumed fuel becomes reaction products plus released energy. Game inventory counts can remain discrete, with a declared fuel-energy budget; there is no need to simulate microscopic mass differences as fractional conveyor items.

## Player progression and visible rewards

1. **Calibrate a pulse:** a diagnostic target reports arrival timing, delivered energy and illumination imbalance. No fusion fuel is required. This is useful for pulsed manufacturing too.
2. **Make a qualified target:** use the precision manufacturing/metrology branch to produce repeatable test capsules and eventually prepared fuel targets. Defective targets are measurable and can be rejected before an expensive shot.
3. **Demonstrate ignition:** charge storage, prepare the chamber, synchronize driver sectors and fire. A shot consumes a target and stored energy. The report separates delivery faults, target faults and measured fusion yield.
4. **Export net electricity:** improve driver efficiency, heat recovery and auxiliary demand until the installation exports energy after paying its operating costs.
5. **Operate repeatedly:** manufacture/inject targets, recover chamber conditions, cool optics, replace worn parts and dispatch charge cycles. A single good shot is not evidence of sustainable throughput.
6. **Scale the energy campus:** replicate locally qualified chambers and drivers with staggered cycles, regional power sharing and reserves. Supply advanced fabrication and a launch campaign while retaining restart capability.

Do not build a second mandatory recipe maze for all three branches. Existing accepted parts, films, optics, controllers, coolant and metrology should acquire new consumers. Materials research improves both capsule quality and sail quality; driver advances improve both process beams and propulsion where their regimes overlap.

## Shared infrastructure is the default

The user's follow-up explicitly requires tightly integrated equipment, infrastructure and technology across manufacturing, fusion and propulsion. Build one wave-engineering platform with specialized endpoint tooling. Do not create three parallel sets of almost-identical sources, amplifiers, controllers or research packs.

| Shared platform | Manufacturing use | Fusion use | Propulsion use | Upgrade reward |
| --- | --- | --- | --- | --- |
| Source/reference station | Stable process patterns and metrology | Seed pulses and calibrated driver references | Reference-locked aperture sectors | Better stability benefits every compatible domain |
| Pump and amplifier chassis | Process power or pulse energy | High-energy driver pulses | Sustained beam output | Efficiency reduces electrical and cooling demand across uses |
| Energy bank and grid | Pulse jobs and demand buffering | Charge/discharge cycles and restart reserve | Launch ramp and transient support | Capacity/rate upgrades improve scheduling, not unlimited energy |
| Guides, ducts and routing hardware | Workcell delivery | Driver-sector delivery | Array distribution | Better loss/handling improves every compatible route |
| Cooling and heat exchange | Yield and thermal stability | Driver recovery and chamber heat handling | Sustained operation | More cooling unlocks duty cycle as well as higher output |
| Sensors, timing and controllers | Process quality and acceptance | Pulse balance, synchronization and plant coordination | Wavefront control and tracking | Common control research unlocks application-specific objectives |
| Precision cells and inspection | Accepted components | Capsule/optics/liner manufacture and inspection | Sail films/optics manufacture and inspection | Higher yield improves both energy and flight economics |
| Service depots and modular construction | Repair and replicated cells | Optics/liner replacement and replicated plants | Array maintenance and replacement parts | Shared logistics makes scaling all three easier |

Shared chassis does not mean unlimited interchangeability. Give equipment explicit power, pulse-energy, bandwidth, wavelength/mode, duty-cycle and thermal ratings. A pulse amplifier does not automatically become an efficient continuous launch driver. Use compatible modules, tooling or conversions within an equipment family; reserve distinct buildings for physically different functions such as the chamber, turbine and sail dock.

Separate three kinds of reuse: common researched designs; common manufactured parts/spares; and actual shared installed capacity. The first two always make progression useful. The third requires routing and controller scheduling, sufficient throughput and target-specific qualification. A plant cannot lend away the drivers needed for its own next shot while pretending its promised export remains available. Establish reserves and alternate modules before dispatching shared capacity to launch.

Avoid global technology buffs: research unlocks improved hardware or settings that must be manufactured, installed and qualified. Each shared foundational research node should have at least two documented application consumers. Application-specific leaf research is allowed, but should draw on that foundation rather than duplicate it. Use common dossiers with relevant demonstration milestones instead of introducing three independent science currencies.

A concrete reward chain: improved pump modules reduce precision-cell operating costs; the same recipe improves fusion net export; surplus electricity expands membrane production; better inspected optics improve both fusion delivery and the launch array. The player sees these effects in measured power, accepted parts, duty cycle and mission margins.

### Catalog and asset consequences

Extend existing power banks, pulse drivers, amplifiers, metrology, controllers and thermal equipment before introducing new IDs. In tranche C, audit every 018 proposal as an existing capability, module/tooling variant, or genuinely new machine. The equipment table below specifies capabilities, not a mandate for fifteen new buildings.

Reuse the same base art for the same installed chassis across applications. Show interchangeable final optics/tooling through registered attachments and endpoint silhouettes; use transient field/status overlays for operating mode. Do not recolor identical machines into three incompatible families. Chamber armor, heat-conversion equipment and sail structures remain visually distinct because their functions differ.

## Proposed equipment and corresponding assets

Roles marked shared extend earlier proposals rather than requiring duplicate machines. Names are working catalog names, not yet runtime IDs.

| Equipment | Gameplay role and interfaces | Asset silhouette / state requirements |
| --- | --- | --- |
| Pulse energy bank (shared) | Grid input, finite stored energy, driver discharge service, cooling | Repeated capacitor cabinets and bus bars; charge indicators, discharge event, trip state |
| Pulse sequencer (shared) | Reference/timing input; commands bounded pulse profiles across assigned drivers | Low control cabinet with timing panels; armed/running/fault indicators |
| Efficient pump rack | Grid-to-driver excitation; efficiency and thermal load determine operating cost | Dense diode/power modules on cooled racks; serviced versus overheated states |
| Pulse amplifier bank (shared) | Seed field plus pump energy; bounded output energy and saturation | Long modular optical bay with gain sections; fixed ports, synchronized pulse overlay |
| Final-optics station | Beam shaping/conversion and configurable smoothing before target delivery | Sealed lens/crystal housing, exchangeable cassette; alignment and worn-optics states |
| Pulse diagnostic station (shared) | Measures delivered pulse energy/timing and target-zone balance | Sensor gantry/test head; diagnostic target loading and exposure event |
| Capsule fabrication tooling | Precision-cell tooling produces shell/target components from existing refined inputs | Small enclosed clean-process tool; carousel and component trays |
| Target inspection gantry (shared) | Accept/reject target batch; records bounded target quality | Metrology arch with capsule fixture; readable accepted/rejected material outputs |
| Fuel-target preparation station | Consumes capsule and fuel cartridge, requires thermal service | Insulated enclosure, cold-service pipes, loading cassette; ready/conditioning states |
| Target injector | Material feed into chamber, finite queue and timing interlock | Linear magazine/robot arm and chamber attachment; one target insertion event |
| Experimental fusion chamber | Multiple driver-sector inputs, target input, diagnostic/service ports; shot experiment | Rounded armored vessel, radial beam entries and service gantry; sealed/shot/recovery states |
| Heat-capture chamber module | Power-plant chamber upgrade, recoverable thermal output, replaceable liner | Thick segmented shell and large coolant connections; heat/wear/service overlays |
| Thermal conversion island (shared) | Hot-loop input to electricity; rejects waste heat | Heat exchanger, turbine/generator blocks and substantial cooling infrastructure |
| Chamber service depot | Consumes replacement liner/optics parts and handles spent material | Heavy service arm, replaceable panel racks, recovery containers |
| Fusion plant coordinator | Supervises local driver/chamber domains, charging, injection and net export | Existing controller family with plant-scale identity; status comes from UI/overlays |

New items proposed: diagnostic target, capsule shell, inspected capsule, fuel cartridge, prepared fusion target, final-optics cassette, chamber liner and spent-target material. Reuse accepted precision parts, coatings, coolant and control modules where appropriate. Exact recipes and feedstock sources must pass a bootstrap/resource audit before becoming authoritative.

Energy plants need electrical, optical, material, timing/control and hot/cold service interfaces. Distinguish timing commands from physical reference-field distribution. Early interfaces can be local explicit bindings; longer regional distribution must have actual costs/limitations when introduced.

Art progression follows 016: laboratory precision housings → repetitive amplifier halls → armored chamber/cooling campus. Avoid a permanently glowing star inside an open reactor. The chamber is opaque; show pulse travel, one brief diagnostic/shot event, then cooling and recovery. Internal compression belongs in an optional schematic, not an exposed world sprite. Recoil-like animation is inappropriate for every optical element; use real operation events and static anchored hardware.

Asset batches: first diagnostic target/sequencer/energy bank; then capsule tooling and experimental chamber; then efficient pump racks, injection, heat capture and conversion; finally campus-scale variants. Define footprints, ports, four views, condition frames and reduced-motion behavior before generation. Sources remain candidates until registered and visually reviewed. No image generation is authorized or performed by this documentation pass.

## Technology-tree additions

The table proposes an acyclic addition to the existing catalog. Parent names refer to existing proposed technologies or earlier rows, not implemented unlocks. Demonstration milestones and funded research are separate records.

| Proposed technology/project | Prerequisites | Unlocks / purpose |
| --- | --- | --- |
| Pulse metrology | Pulsed field delivery + Instrumented networks | Diagnostic targets, pulse measurements and sequencer profiles |
| Precision fusion targets | Precision fabrication + Thermal management + Pulse metrology | Capsule tooling, inspection fixtures and prepared-target recipes |
| Symmetric drive systems | Stable source arrays + Pulse metrology | Final-optics station, smoothing options and sector balance control |
| Experimental fusion | Precision fusion targets + Symmetric drive systems | Chamber/injector construction and commissioning; available before ignition |
| Demonstrated ignition (milestone) | Experimental fusion equipment operated successfully | Durable research evidence; no automatic electrical generation |
| Efficient pulsed drivers | Stable source arrays + Thermal management + Pulse metrology | Efficient pump racks and repeated-duty amplifier upgrades |
| Fusion heat recovery | Experimental fusion + Prepared materials + Thermal management | Capture module, liner/service recipes and thermal conversion |
| Net-energy demonstrator (project) | Demonstrated ignition + Efficient pulsed drivers + Fusion heat recovery | Acceptance objective for measured positive net electricity; equipment is already buildable |
| Repetitive fusion operations | Net-energy demonstrator + Structured logistics | Automated injection, servicing and sustained operation contracts |
| Regional fusion power | Repetitive fusion operations + Distributed infrastructure | Plant coordinators, staggered chambers and regional export acceptance |

Final launch integration: require qualified sustained net fusion supply through Regional fusion power, alongside the inspected sail, beam-sector and tracking requirements. Verify launch demand plus plant recirculating loads over the declared mission window; a historical ignition flag alone cannot satisfy this gate.

Research recipes must not consume products whose producer needs the research being funded. Ignition opens learning, not the recipe for the chamber required to achieve ignition. Conventional power must cover a research shot and restart after a failed shot. Do not fund the first target factory with electricity that only that factory's targets can produce.

## Simulation contract: shots plus slow plant dynamics

Do not solve plasma implosion on the factory grid. Use an explicitly approximate, bounded shot response based on delivered pulse-energy bins, arrival offsets, illumination imbalance, target-quality record and chamber readiness. Coefficients and tolerances are game design, not predictive fusion engineering. Initial response is deterministic so failures are diagnosable; any later variability needs persistent seeds and a stated purpose.

Recommended shot lifecycle:

```text
reserve target → prepare → charge → arm → fire → measure → recover/service → ready
```

Firing atomically consumes the reserved target and discharged energy exactly once. A pre-shot cancel releases unconsumed reservations under a stated policy; a fired target is spent even if yield is poor. Preserve stage, target identity, accumulated charge, recovery state and event sequence across save/load. Pauses do not complete a shot. Charged storage is finite and cannot be duplicated by blueprint or recovery actions.

Minimum ledgers:

- Driver: discharged electrical energy = delivered laser energy + driver/transport losses + remaining accounted stored energy change as applicable.
- Target: laser energy plus bounded nuclear energy release becomes reaction products, retained/recoverable heat and explicitly accounted escape/loss. Do not count target laser energy twice in heat recovery.
- Plant: report gross electrical production, driver draw, auxiliaries, exports/imports, thermal waste and changes in stored electrical/thermal energy.

Show target gain `fusion energy / laser energy delivered` separately from net electricity. Measure sustained net export over repeated cycles with no depletion of starting storage (or correct for that depletion), charging/thermal startup included in the declared window, and fuel/target production costs inside the stated boundary. Report grid imports and exports separately so a plant cannot qualify merely by re-exporting imported energy. Initial charge and fuel are not free surplus.

Local qualification layers: driver-sector pulse contract; target-batch inspection; single-shot chamber acceptance; repeated-cycle net-electric plant acceptance. Sharing a driver between a precision process and a chamber requires explicit scheduling and requalification when operating regime changes. Disabling a plant coordinator does not reset other control domains.

Use envelope/timing summaries for the fast shot and fixed-step thermal/economic dynamics between shots. Exact linear block reduction remains suitable for frozen linear driver sections. Saturation, stored gain and chamber yield require explicit state and invalidate an amplitude-independent linear response. Approximate caching must never extrapolate across an ignition transition or hide a consumed target; fall back to the detailed game-level shot model.

## UI and acceptance feedback

Use the existing planned operations window, with Energy as a section and the selected chamber/plant inspector as the detail surface. Keep only net plant power and actionable alerts in the quiet HUD when relevant. Shot reports show target quality, delivery balance, timing, driver cost, fusion yield, heat recovery and the limiting condition. Let the player compare the last two shots rather than exposing a wall of unlabelled physics values.

The three large achievements should read differently: a part accepted, ignition demonstrated, a plant exporting steadily. The launch then demonstrates the combined industrial capability. Avoid a single generic "coherence efficiency" bar for all three motivations.

## Scope and next decisions

Keep tranche A's first precision cell as the next implementation. Add pulse/energy contracts in B/C, an experimental ignition slice alongside D, then a separate net-electric/repetitive-operation slice before final launch acceptance. The first sail demonstrator remains independently reachable. Updated sequencing is in 017.

Confirmed: fusion is required for final launch; the initial fuel economy uses manufactured cartridges; infrastructure and research must be shared across all three applications wherever their operating contracts permit. Still discuss before balancing: indirect-drive research versus commercial target architecture; research-shot spectacle versus automated repetition; map area devoted to heat rejection.

Acceptance must prove ignition can coexist with negative net electricity, target quality and timing matter independently, fuel/charge cannot duplicate, conventional restart works, repeated duty respects cooling/wear, local failures stay scoped, and driver reduction preserves its declared domain. Add a before/after production story: the player's first costly shot, first net export, then energy-supported manufacturing expansion.
