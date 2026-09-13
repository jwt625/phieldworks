# Complete item and equipment dependencies

Revision B, 2026-09-12. Generated with `npm run docs:progression` from `src/ui/production-data.ts` and `src/ui/technology-data.ts`. The in-game panel uses these same records. Regenerate after editing the catalog.

**27 technologies + 99 named production/capability entries = 126 nodes, 551 typed connections.**

Read solid ingredient arrows as consumed recipe inputs, dotted producer arrows as installed manufacturing equipment, unlock arrows as recipe access and service arrows as required operating infrastructure. Science edges carry research consumption; milestone edges require field evidence. Every incoming condition applies. Current entries are implemented; proposed entries are design specifications awaiting approval.

The combined diagram is available in [Mermaid source](009-full-production-graph.mmd) and in **Technology → Items & equipment → Dev: full tree → All visible connections**. The per-technology diagrams below partition the complete graph by the destination's unlocking technology, so every edge appears in one branch. External input nodes are repeated for readability.

## Research-only resource audit

All research consumes 1960 industrial dossiers, 1600 precision dossiers, 1140 systems dossiers. Theoretical raw inputs below recursively include nested dossiers and intermediate recipes at their stated output quantities. They assume perfect acceptance yield, batch sharing, and zero waste; they exclude construction, ammunition, final launch hardware and recovery. Fractional totals indicate shared multi-output batches, not fractional inventory items.

| Raw resource | Theoretical minimum |
| --- | ---: |
| Mixed ferrous ore | 41,960 |
| Frontier crystal | 18,302.5 |
| Copper-rich ore | 5,020 |
| Silica gravel | 6,730 |
| Carbon nodules | 285 |

## Bootstrap and upgrade contracts

The starter extractor, assembler and generator are already deployed. Keep them as production seeds; a new assembler requires assemblies that the starter assembler can make. Research foundation construction recipes unlock from first crystal and a qualified blueprint before lab deployment. Raw copper/silica/carbon are guaranteed accessible deposits unlocked by prepared materials. A producing machine is never consumed by its recipes. A machine listed in the ingredient column is recovered and consumed by an equipment upgrade; build or recover another copy if it is also required as an installed service. These differences are visible in the graph and inspector.

## Automated outpost

**Research prerequisites:** Expedition kit. **Cost:** Expedition equipment.

Included with every expedition.

```mermaid
flowchart LR
  tech_outpost["Automated outpost [research]"]
  product_construction["Expedition construction kit [equipment]"]
  product_ore["Mixed ferrous ore [resource]"]
  product_extractor["Extractor [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_assembler["Assembler [equipment]"]
  product_generator["Power unit [equipment]"]
  product_belt_route["Material belt route [capability]"]
  product_wire_route["Electrical wire route [capability]"]
  product_repair["Repair and recovery [capability]"]
  tech_outpost -.->|"unlocks: Recipe unlock"| product_construction
  tech_outpost -.->|"unlocks: Access"| product_ore
  product_extractor -.->|"produces: Extracted by"| product_ore
  tech_outpost -.->|"unlocks: Recipe unlock"| product_assembly
  product_ore -->|"ingredient: 2 consumed"| product_assembly
  product_assembler -.->|"produces: Produced by"| product_assembly
  tech_outpost -.->|"unlocks: Recipe unlock"| product_extractor
  product_assembly -->|"ingredient: 8 consumed"| product_extractor
  product_construction -.->|"produces: Produced by"| product_extractor
  product_generator -.->|"service: Requires service"| product_extractor
  tech_outpost -.->|"unlocks: Recipe unlock"| product_assembler
  product_assembly -->|"ingredient: 10 consumed"| product_assembler
  product_construction -.->|"produces: Produced by"| product_assembler
  product_generator -.->|"service: Requires service"| product_assembler
  tech_outpost -.->|"unlocks: Recipe unlock"| product_generator
  product_assembly -->|"ingredient: 14 consumed"| product_generator
  product_construction -.->|"produces: Produced by"| product_generator
  tech_outpost -.->|"unlocks: Enables"| product_belt_route
  product_extractor -.->|"service: Requires service"| product_belt_route
  product_assembler -.->|"service: Requires service"| product_belt_route
  tech_outpost -.->|"unlocks: Enables"| product_wire_route
  product_generator -.->|"service: Requires service"| product_wire_route
  tech_outpost -.->|"unlocks: Enables"| product_repair
  product_assembly -->|"ingredient: 3 consumed"| product_repair
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Expedition construction kit | equipment / current | Supplied with the expedition | — | Starting capability; consumes listed construction materials instantly. Not a craftable machine. |
| Mixed ferrous ore | resource / current | Extract from a finite deposit | Extractor | Finite starter/remote deposits; extractor produces one ore every 0.65 s with 8 power. Belt output. |
| Construction assembly | item / current | 2 Mixed ferrous ore → 1 Construction assembly / 1.4 s | Assembler | Consume the listed inputs once per completed recipe. |
| Extractor | equipment / current | 8 Construction assembly → 1 Extractor · build instantly | Expedition construction kit | 8 power; place on a deposit. 1 ore / 0.65 s; belt output. New mineral types are proposed. Requires: Power unit. |
| Assembler | equipment / current | 10 Construction assembly → 1 Assembler · build instantly | Expedition construction kit | 6 power; 2 ore → 1 assembly / 1.4 s. Starter machine is already built. Requires: Power unit. |
| Power unit | equipment / current | 14 Construction assembly → 1 Power unit · build instantly | Expedition construction kit | 240 power units per generator; connect a wire to each active load. Fuel abstracted. |
| Material belt route | capability / current | Operating capability / milestone | — | Existing free material routes: 2 tiles/s, spacing and backpressure. Requires: Extractor, Assembler. |
| Electrical wire route | capability / current | Operating capability / milestone | — | Existing free point-to-point wires; 240-unit generator capacity. Requires: Power unit. |
| Repair and recovery | capability / current | 3 Construction assembly → 1 Repair and recovery · build instantly | — | Each manual repair consumes 3 assemblies. Recovery returns an intact machine’s existing construction cost. |

## Field engineering

**Research prerequisites:** Automated outpost. **Cost:** Expedition equipment.

Included with every expedition.

```mermaid
flowchart LR
  tech_outpost["Automated outpost [research]"]
  tech_fieldcraft["Field engineering [research]"]
  product_reference["Reference station [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_junction["Four-port junction [equipment]"]
  product_tuner["Phase tuner [equipment]"]
  product_emitter["Field emitter [equipment]"]
  product_dump["Cooled dump [equipment]"]
  product_field_route["Field link [capability]"]
  product_diagnostics["Baseline diagnostics [capability]"]
  product_phase_control["Automatic phase control [capability]"]
  product_focused_field["Focused target delivery [capability]"]
  tech_outpost -.->|"prerequisite: Prerequisite"| tech_fieldcraft
  tech_fieldcraft -.->|"unlocks: Recipe unlock"| product_reference
  product_assembly -->|"ingredient: 12 consumed"| product_reference
  product_construction -.->|"produces: Produced by"| product_reference
  product_generator -.->|"service: Requires service"| product_reference
  tech_fieldcraft -.->|"unlocks: Recipe unlock"| product_junction
  product_assembly -->|"ingredient: 5 consumed"| product_junction
  product_construction -.->|"produces: Produced by"| product_junction
  tech_fieldcraft -.->|"unlocks: Recipe unlock"| product_tuner
  product_assembly -->|"ingredient: 6 consumed"| product_tuner
  product_construction -.->|"produces: Produced by"| product_tuner
  tech_fieldcraft -.->|"unlocks: Recipe unlock"| product_emitter
  product_assembly -->|"ingredient: 10 consumed"| product_emitter
  product_construction -.->|"produces: Produced by"| product_emitter
  product_generator -.->|"service: Requires service"| product_emitter
  product_reference -.->|"service: Requires service"| product_emitter
  tech_fieldcraft -.->|"unlocks: Recipe unlock"| product_dump
  product_assembly -->|"ingredient: 5 consumed"| product_dump
  product_construction -.->|"produces: Produced by"| product_dump
  product_generator -.->|"service: Requires service"| product_dump
  tech_fieldcraft -.->|"unlocks: Enables"| product_field_route
  product_reference -.->|"service: Requires service"| product_field_route
  product_junction -.->|"service: Requires service"| product_field_route
  tech_fieldcraft -.->|"unlocks: Enables"| product_diagnostics
  tech_fieldcraft -.->|"unlocks: Enables"| product_phase_control
  product_reference -.->|"service: Requires service"| product_phase_control
  product_tuner -.->|"service: Requires service"| product_phase_control
  tech_fieldcraft -.->|"unlocks: Enables"| product_focused_field
  product_reference -.->|"service: Requires service"| product_focused_field
  product_junction -.->|"service: Requires service"| product_focused_field
  product_tuner -.->|"service: Requires service"| product_focused_field
  product_emitter -.->|"service: Requires service"| product_focused_field
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Reference station | equipment / current | 12 Construction assembly → 1 Reference station · build instantly | Expedition construction kit | 125 power → 100 field units; coherent reference OUT. Requires: Power unit. |
| Four-port junction | equipment / current | 5 Construction assembly → 1 Four-port junction · build instantly | Expedition construction kit | Passive four-port splitter/combiner; terminate unused ports. |
| Phase tuner | equipment / current | 6 Construction assembly → 1 Phase tuner · build instantly | Expedition construction kit | Passive ±180° trim; thermal drift changes phase. |
| Field emitter | equipment / current | 10 Construction assembly → 1 Field emitter · build instantly | Expedition construction kit | 4 power and field input; directs useful power toward the guardian. Requires: Power unit, Reference station. |
| Cooled dump | equipment / current | 5 Construction assembly → 1 Cooled dump · build instantly | Expedition construction kit | 2 cooling power; absorbs rejected field, trips at 85 °C. Requires: Power unit. |
| Field link | capability / current | Operating capability / milestone | — | Existing free field routes. Length and bends affect phase, attenuation and radiation. Requires: Reference station, Four-port junction. |
| Baseline diagnostics | capability / current | Operating capability / milestone | — | Available from the start: faults, remedies, energy balance and object location. |
| Automatic phase control | capability / current | Operating capability / milestone | — | Bounded phase search follows thermal drift. No extra research lock in the starter scenario. Requires: Reference station, Phase tuner. |
| Focused target delivery | capability / current | Operating capability / milestone | — | Two powered emitter branches plus phase trim can exceed 32 useful units; this is a measured output, not an inventory item. Requires: Reference station, Four-port junction, Phase tuner, Field emitter. |

## Perimeter defense

**Research prerequisites:** Automated outpost. **Cost:** Expedition equipment.

Available immediately; wire a sentry to activate the existing defense gate.

```mermaid
flowchart LR
  tech_outpost["Automated outpost [research]"]
  tech_perimeter["Perimeter defense [research]"]
  product_sentry["Perimeter sentry [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_defense_ready["Defense readiness [capability]"]
  tech_outpost -.->|"prerequisite: Prerequisite"| tech_perimeter
  tech_perimeter -.->|"unlocks: Recipe unlock"| product_sentry
  product_assembly -->|"ingredient: 8 consumed"| product_sentry
  product_construction -.->|"produces: Produced by"| product_sentry
  product_generator -.->|"service: Requires service"| product_sentry
  tech_perimeter -.->|"unlocks: Enables"| product_defense_ready
  product_sentry -.->|"service: Requires service"| product_defense_ready
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Perimeter sentry | equipment / current | 8 Construction assembly → 1 Perimeter sentry · build instantly | Expedition construction kit | 6 wired power; 8-tile defense radius; ammunition abstracted for this original model. Requires: Power unit. |
| Defense readiness | capability / current | Operating capability / milestone | — | First powered sentry starts a 30-second grace period. It enables the existing wildlife-aggression gate. Requires: Perimeter sentry. |

## Open the frontier

**Research prerequisites:** Field engineering. **Cost:** Gameplay milestone · no research cost.

Clear the guardian by delivering more than 32 on-target field units.

```mermaid
flowchart LR
  tech_fieldcraft["Field engineering [research]"]
  tech_frontier["Open the frontier [research]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_extractor["Extractor [equipment]"]
  product_eastern_access["Eastern frontier access [capability]"]
  product_focused_field["Focused target delivery [capability]"]
  tech_fieldcraft -.->|"prerequisite: Prerequisite"| tech_frontier
  tech_frontier -.->|"unlocks: Access"| product_raw_crystal
  product_extractor -.->|"produces: Extracted by"| product_raw_crystal
  tech_frontier -.->|"unlocks: Enables"| product_eastern_access
  product_focused_field -.->|"service: Requires service"| product_eastern_access
  product_focused_field -->|"milestone: Demonstrate"| tech_frontier
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Frontier crystal | resource / current | Extract from a finite deposit | Extractor | Clear the guardian, build an extractor over the deposit and supply 8 power. Crystal enters shared stock. |
| Eastern frontier access | capability / current | Operating capability / milestone | — | Guardian defeated: access the eastern sector and crystal deposit. Requires: Focused target delivery. |

## First crystal

**Research prerequisites:** Open the frontier. **Cost:** Gameplay milestone · no research cost.

Harvest at least 1 crystal using a powered extractor over the frontier deposit.

```mermaid
flowchart LR
  tech_frontier["Open the frontier [research]"]
  tech_crystal["First crystal [research]"]
  product_crystal_supply["Harvested crystal milestone [capability]"]
  product_raw_crystal["Frontier crystal [resource]"]
  tech_frontier -.->|"prerequisite: Prerequisite"| tech_crystal
  tech_crystal -.->|"unlocks: Enables"| product_crystal_supply
  product_raw_crystal -.->|"service: Requires service"| product_crystal_supply
  product_raw_crystal -->|"milestone: Demonstrate"| tech_crystal
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Harvested crystal milestone | capability / current | Operating capability / milestone | — | Observe the first harvested crystal. Proposed permanent milestone history survives later spending. Requires: Frontier crystal. |

## Qualified outpost

**Research prerequisites:** Open the frontier. **Cost:** Gameplay milestone · no research cost.

Enable automatic phase control and establish at least 35 target units to start. Sustain at least 32 units for the 20-second drift test with no trips or destroyed equipment, then record a blueprint. Every placed installation needs local qualification.

```mermaid
flowchart LR
  tech_frontier["Open the frontier [research]"]
  tech_qualification["Qualified outpost [research]"]
  product_blueprint["Qualified outpost blueprint [capability]"]
  product_reference["Reference station [equipment]"]
  product_phase_control["Automatic phase control [capability]"]
  tech_frontier -.->|"prerequisite: Prerequisite"| tech_qualification
  tech_qualification -.->|"unlocks: Enables"| product_blueprint
  product_reference -.->|"service: Requires service"| product_blueprint
  product_phase_control -.->|"service: Requires service"| product_blueprint
  product_phase_control -->|"milestone: Demonstrate"| tech_qualification
  product_reference -->|"milestone: Demonstrate"| tech_qualification
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Qualified outpost blueprint | capability / current | Operating capability / milestone | — | Enable automatic control and reach 35 target units to begin. Hold at least 32 for 20 seconds with no trips or destroyed equipment, then record topology. Stamping costs the sum of its machines; every placement requires local qualification. Requires: Reference station, Automatic phase control. |

## Industrial research

**Research prerequisites:** First crystal + Qualified outpost. **Cost:** Project conditions.

First crystal and a qualified blueprint unlock the workbench and laboratory recipes immediately. Build and power these machines to begin pack-funded research; their construction needs no science packs.

```mermaid
flowchart LR
  tech_crystal["First crystal [research]"]
  tech_research["Industrial research [research]"]
  tech_qualification["Qualified outpost [research]"]
  product_workbench["Research workbench [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_laboratory["Research laboratory [equipment]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_research_queue["Research queue [capability]"]
  product_blueprint["Qualified outpost blueprint [capability]"]
  tech_crystal -.->|"prerequisite: Prerequisite"| tech_research
  tech_qualification -.->|"prerequisite: Prerequisite"| tech_research
  tech_research -.->|"unlocks: Recipe unlock"| product_workbench
  product_assembly -->|"ingredient: 12 consumed"| product_workbench
  product_raw_crystal -->|"ingredient: 2 consumed"| product_workbench
  product_construction -.->|"produces: Produced by"| product_workbench
  product_generator -.->|"service: Requires service"| product_workbench
  tech_research -.->|"unlocks: Recipe unlock"| product_laboratory
  product_assembly -->|"ingredient: 8 consumed"| product_laboratory
  product_raw_crystal -->|"ingredient: 3 consumed"| product_laboratory
  product_construction -.->|"produces: Produced by"| product_laboratory
  product_generator -.->|"service: Requires service"| product_laboratory
  tech_research -.->|"unlocks: Recipe unlock"| product_industrial_dossier
  product_assembly -->|"ingredient: 2 consumed"| product_industrial_dossier
  product_raw_crystal -->|"ingredient: 1 consumed"| product_industrial_dossier
  product_workbench -.->|"produces: Produced by"| product_industrial_dossier
  tech_research -.->|"unlocks: Enables"| product_research_queue
  product_laboratory -.->|"service: Requires service"| product_research_queue
  product_raw_crystal -->|"milestone: Demonstrate"| tech_research
  product_blueprint -->|"milestone: Demonstrate"| tech_research
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Research workbench | equipment / proposed | 12 Construction assembly + 2 Frontier crystal → 1 Research workbench · build instantly | Expedition construction kit | 6 power; produces all unlocked dossier recipes. Requires: Power unit. |
| Research laboratory | equipment / proposed | 8 Construction assembly + 3 Frontier crystal → 1 Research laboratory · build instantly | Expedition construction kit | 12 power; consumes each required dossier per research unit, at one laboratory-second per simulated second. Requires: Power unit. |
| Industrial dossier | item / proposed | 2 Construction assembly + 1 Frontier crystal → 1 Industrial dossier / 4 s | Research workbench | Consume the listed inputs once per completed recipe. |
| Research queue | capability / proposed | Operating capability / milestone | — | One active technology across all supplied labs. Queue prerequisites, retain partial progress and show input shortages. Requires: Research laboratory. |

## Structured logistics

**Research prerequisites:** Industrial research. **Cost:** 40 × Industrial dossier · 10 s / unit.

Complete research in powered laboratories.

```mermaid
flowchart LR
  tech_research["Industrial research [research]"]
  tech_logistics["Structured logistics [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_splitter["Belt splitter [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_underground["Underground belt pair [equipment]"]
  product_belt_segment["Constructible belt segment [item]"]
  product_segment_editing["Transport segment editing [capability]"]
  tech_research -.->|"prerequisite: Prerequisite"| tech_logistics
  product_industrial_dossier -->|"science: 40 consumed"| tech_logistics
  product_laboratory -.->|"service: Researched in"| tech_logistics
  tech_logistics -.->|"unlocks: Recipe unlock"| product_splitter
  product_assembly -->|"ingredient: 4 consumed"| product_splitter
  product_construction -.->|"produces: Produced by"| product_splitter
  tech_logistics -.->|"unlocks: Recipe unlock"| product_underground
  product_assembly -->|"ingredient: 6 consumed"| product_underground
  product_construction -.->|"produces: Produced by"| product_underground
  tech_logistics -.->|"unlocks: Recipe unlock"| product_belt_segment
  product_assembly -->|"ingredient: 1 consumed"| product_belt_segment
  product_construction -.->|"produces: Produced by"| product_belt_segment
  tech_logistics -.->|"unlocks: Enables"| product_segment_editing
  product_belt_segment -.->|"service: Requires service"| product_segment_editing
  product_splitter -.->|"service: Requires service"| product_segment_editing
  product_underground -.->|"service: Requires service"| product_segment_editing
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Belt splitter | equipment / proposed | 4 Construction assembly → 1 Belt splitter · build instantly | Expedition construction kit | Passive 1:2 or 2:1 routing; priority selection and explicit throughput. |
| Underground belt pair | equipment / proposed | 6 Construction assembly → 1 Underground belt pair · build instantly | Expedition construction kit | One recipe builds a matched entry/exit pair; up to 6 tiles beneath crossings. |
| Constructible belt segment | item / proposed | 1 Construction assembly → 4 Constructible belt segment · construct instantly | Expedition construction kit | Consume the listed inputs once per completed recipe. |
| Transport segment editing | capability / proposed | Operating capability / milestone | — | Select and replace individual transport segments; show costs and preserve packet accounting. Requires: Constructible belt segment, Belt splitter, Underground belt pair. |

## Instrumented networks

**Research prerequisites:** Industrial research. **Cost:** 30 × Industrial dossier · 10 s / unit.

Complete research; baseline errors remain available from the start.

```mermaid
flowchart LR
  tech_research["Industrial research [research]"]
  tech_instrumentation["Instrumented networks [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_monitor["Monitor station [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_probe["Branch probe [equipment]"]
  tech_research -.->|"prerequisite: Prerequisite"| tech_instrumentation
  product_industrial_dossier -->|"science: 30 consumed"| tech_instrumentation
  product_laboratory -.->|"service: Researched in"| tech_instrumentation
  tech_instrumentation -.->|"unlocks: Recipe unlock"| product_monitor
  product_assembly -->|"ingredient: 6 consumed"| product_monitor
  product_raw_crystal -->|"ingredient: 2 consumed"| product_monitor
  product_construction -.->|"produces: Produced by"| product_monitor
  product_generator -.->|"service: Requires service"| product_monitor
  tech_instrumentation -.->|"unlocks: Recipe unlock"| product_probe
  product_assembly -->|"ingredient: 2 consumed"| product_probe
  product_raw_crystal -->|"ingredient: 1 consumed"| product_probe
  product_construction -.->|"produces: Produced by"| product_probe
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Monitor station | equipment / proposed | 6 Construction assembly + 2 Frontier crystal → 1 Monitor station · build instantly | Expedition construction kit | 4 power; precise traces and history export. Basic faults stay visible without this equipment. Requires: Power unit. |
| Branch probe | equipment / proposed | 2 Construction assembly + 1 Frontier crystal → 1 Branch probe · build instantly | Expedition construction kit | Passive incident/return sample at a port; no hidden field energy gain. |

## Power distribution

**Research prerequisites:** Industrial research. **Cost:** 40 × Industrial dossier · 10 s / unit.

Complete research in powered laboratories.

```mermaid
flowchart LR
  tech_research["Industrial research [research]"]
  tech_grid["Power distribution [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_power_pole["Power pole [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_substation["Substation [equipment]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_shared_bus["Shared electrical bus [capability]"]
  product_generator["Power unit [equipment]"]
  tech_research -.->|"prerequisite: Prerequisite"| tech_grid
  product_industrial_dossier -->|"science: 40 consumed"| tech_grid
  product_laboratory -.->|"service: Researched in"| tech_grid
  tech_grid -.->|"unlocks: Recipe unlock"| product_power_pole
  product_assembly -->|"ingredient: 2 consumed"| product_power_pole
  product_construction -.->|"produces: Produced by"| product_power_pole
  tech_grid -.->|"unlocks: Recipe unlock"| product_substation
  product_assembly -->|"ingredient: 12 consumed"| product_substation
  product_raw_crystal -->|"ingredient: 2 consumed"| product_substation
  product_construction -.->|"produces: Produced by"| product_substation
  tech_grid -.->|"unlocks: Enables"| product_shared_bus
  product_substation -.->|"service: Requires service"| product_shared_bus
  product_power_pole -.->|"service: Requires service"| product_shared_bus
  product_generator -.->|"service: Requires service"| product_shared_bus
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Power pole | equipment / proposed | 2 Construction assembly → 1 Power pole · build instantly | Expedition construction kit | Passive electrical branch support; explicit network capacity. |
| Substation | equipment / proposed | 12 Construction assembly + 2 Frontier crystal → 1 Substation · build instantly | Expedition construction kit | Multi-generator bus with breaker-isolated load branches; 960-unit nominal throughput. |
| Shared electrical bus | capability / proposed | Operating capability / milestone | — | Aggregate supply by connected component; overload and islanding are visible faults. Requires: Substation, Power pole, Power unit. |

## Prepared materials

**Research prerequisites:** Industrial research. **Cost:** 50 × Industrial dossier · 10 s / unit.

Complete research; build a powered processor to make the new recipes.

```mermaid
flowchart LR
  tech_research["Industrial research [research]"]
  tech_materials["Prepared materials [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_copper_ore["Copper-rich ore [resource]"]
  product_extractor["Extractor [equipment]"]
  product_silica["Silica gravel [resource]"]
  product_carbon["Carbon nodules [resource]"]
  product_processor["Material processor [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_steel["Structural steel [item]"]
  product_ore["Mixed ferrous ore [resource]"]
  product_conductor["Copper conductor [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_control_board["Control board [item]"]
  tech_research -.->|"prerequisite: Prerequisite"| tech_materials
  product_industrial_dossier -->|"science: 50 consumed"| tech_materials
  product_laboratory -.->|"service: Researched in"| tech_materials
  tech_materials -.->|"unlocks: Access"| product_copper_ore
  product_extractor -.->|"produces: Extracted by"| product_copper_ore
  tech_materials -.->|"unlocks: Access"| product_silica
  product_extractor -.->|"produces: Extracted by"| product_silica
  tech_materials -.->|"unlocks: Access"| product_carbon
  product_extractor -.->|"produces: Extracted by"| product_carbon
  tech_materials -.->|"unlocks: Recipe unlock"| product_processor
  product_assembly -->|"ingredient: 16 consumed"| product_processor
  product_raw_crystal -->|"ingredient: 4 consumed"| product_processor
  product_construction -.->|"produces: Produced by"| product_processor
  product_generator -.->|"service: Requires service"| product_processor
  tech_materials -.->|"unlocks: Recipe unlock"| product_steel
  product_ore -->|"ingredient: 4 consumed"| product_steel
  product_carbon -->|"ingredient: 1 consumed"| product_steel
  product_processor -.->|"produces: Produced by"| product_steel
  tech_materials -.->|"unlocks: Recipe unlock"| product_conductor
  product_copper_ore -->|"ingredient: 2 consumed"| product_conductor
  product_processor -.->|"produces: Produced by"| product_conductor
  tech_materials -.->|"unlocks: Recipe unlock"| product_ceramic
  product_silica -->|"ingredient: 2 consumed"| product_ceramic
  product_ore -->|"ingredient: 1 consumed"| product_ceramic
  product_processor -.->|"produces: Produced by"| product_ceramic
  tech_materials -.->|"unlocks: Recipe unlock"| product_polished_crystal
  product_raw_crystal -->|"ingredient: 2 consumed"| product_polished_crystal
  product_processor -.->|"produces: Produced by"| product_polished_crystal
  tech_materials -.->|"unlocks: Recipe unlock"| product_control_board
  product_assembly -->|"ingredient: 2 consumed"| product_control_board
  product_conductor -->|"ingredient: 2 consumed"| product_control_board
  product_ceramic -->|"ingredient: 1 consumed"| product_control_board
  product_processor -.->|"produces: Produced by"| product_control_board
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Copper-rich ore | resource / proposed | Extract from a finite deposit | Extractor | Proposed guaranteed post-frontier surface deposit; mined by the existing extractor. No advanced transport needed. |
| Silica gravel | resource / proposed | Extract from a finite deposit | Extractor | Proposed guaranteed surface deposit within the first cleared sector; mined by extractor. |
| Carbon nodules | resource / proposed | Extract from a finite deposit | Extractor | Proposed guaranteed surface deposit within the first cleared sector; mined by extractor. |
| Material processor | equipment / proposed | 16 Construction assembly + 4 Frontier crystal → 1 Material processor · build instantly | Expedition construction kit | 12 power; one refining/chemical recipe at a time. Construction uses the starter supply chain. Requires: Power unit. |
| Structural steel | item / proposed | 4 Mixed ferrous ore + 1 Carbon nodules → 2 Structural steel / 4 s | Material processor | Consume the listed inputs once per completed recipe. |
| Copper conductor | item / proposed | 2 Copper-rich ore → 4 Copper conductor / 2 s | Material processor | Consume the listed inputs once per completed recipe. |
| Ceramic substrate | item / proposed | 2 Silica gravel + 1 Mixed ferrous ore → 2 Ceramic substrate / 4 s | Material processor | Consume the listed inputs once per completed recipe. |
| Polished crystal | item / proposed | 2 Frontier crystal → 1 Polished crystal / 4 s | Material processor | Consume the listed inputs once per completed recipe. |
| Control board | item / proposed | 2 Construction assembly + 2 Copper conductor + 1 Ceramic substrate → 1 Control board / 6 s | Material processor | Consume the listed inputs once per completed recipe. |

## Modular construction

**Research prerequisites:** Structured logistics + Qualified outpost + Prepared materials. **Cost:** 60 × Industrial dossier · 15 s / unit.

Complete research; local qualification remains mandatory.

```mermaid
flowchart LR
  tech_logistics["Structured logistics [research]"]
  tech_modules["Modular construction [research]"]
  tech_qualification["Qualified outpost [research]"]
  tech_materials["Prepared materials [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_service_connector["Service connector [item]"]
  product_steel["Structural steel [item]"]
  product_conductor["Copper conductor [item]"]
  product_control_board["Control board [item]"]
  product_assembler["Assembler [equipment]"]
  product_module_blueprint["Selected-area blueprint [capability]"]
  product_blueprint["Qualified outpost blueprint [capability]"]
  product_construction_request["Construction request [capability]"]
  tech_logistics -.->|"prerequisite: Prerequisite"| tech_modules
  tech_qualification -.->|"prerequisite: Prerequisite"| tech_modules
  tech_materials -.->|"prerequisite: Prerequisite"| tech_modules
  product_industrial_dossier -->|"science: 60 consumed"| tech_modules
  product_laboratory -.->|"service: Researched in"| tech_modules
  tech_modules -.->|"unlocks: Recipe unlock"| product_service_connector
  product_steel -->|"ingredient: 2 consumed"| product_service_connector
  product_conductor -->|"ingredient: 2 consumed"| product_service_connector
  product_control_board -->|"ingredient: 1 consumed"| product_service_connector
  product_assembler -.->|"produces: Produced by"| product_service_connector
  tech_modules -.->|"unlocks: Enables"| product_module_blueprint
  product_blueprint -.->|"service: Requires service"| product_module_blueprint
  product_service_connector -.->|"service: Requires service"| product_module_blueprint
  tech_modules -.->|"unlocks: Enables"| product_construction_request
  product_module_blueprint -.->|"service: Requires service"| product_construction_request
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Service connector | item / proposed | 2 Structural steel + 2 Copper conductor + 1 Control board → 1 Service connector / 4 s | Assembler | Consume the listed inputs once per completed recipe. |
| Selected-area blueprint | capability / proposed | Operating capability / milestone | — | Capture a chosen cell and its declared service connectors rather than the whole outpost. Requires: Qualified outpost blueprint, Service connector. |
| Construction request | capability / proposed | Operating capability / milestone | — | Display a bill of materials and place requested components using the construction kit. No unimplemented robots implied. Requires: Selected-area blueprint. |

## Thermal management

**Research prerequisites:** Instrumented networks + Prepared materials. **Cost:** 40 × Industrial dossier · 15 s / unit.

Complete research in powered laboratories.

```mermaid
flowchart LR
  tech_instrumentation["Instrumented networks [research]"]
  tech_thermal["Thermal management [research]"]
  tech_materials["Prepared materials [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_coolant["Coolant charge [item]"]
  product_carbon["Carbon nodules [resource]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_processor["Material processor [equipment]"]
  product_coolant_pipe["Coolant pipe [item]"]
  product_conductor["Copper conductor [item]"]
  product_steel["Structural steel [item]"]
  product_assembler["Assembler [equipment]"]
  product_pump["Coolant pump [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_branch_isolator["Branch isolation switch [equipment]"]
  product_ceramic["Ceramic substrate [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_dump["Cooled dump [equipment]"]
  tech_instrumentation -.->|"prerequisite: Prerequisite"| tech_thermal
  tech_materials -.->|"prerequisite: Prerequisite"| tech_thermal
  product_industrial_dossier -->|"science: 40 consumed"| tech_thermal
  product_laboratory -.->|"service: Researched in"| tech_thermal
  tech_thermal -.->|"unlocks: Recipe unlock"| product_coolant
  product_carbon -->|"ingredient: 1 consumed"| product_coolant
  product_raw_crystal -->|"ingredient: 1 consumed"| product_coolant
  product_processor -.->|"produces: Produced by"| product_coolant
  tech_thermal -.->|"unlocks: Recipe unlock"| product_coolant_pipe
  product_conductor -->|"ingredient: 2 consumed"| product_coolant_pipe
  product_steel -->|"ingredient: 1 consumed"| product_coolant_pipe
  product_assembler -.->|"produces: Produced by"| product_coolant_pipe
  tech_thermal -.->|"unlocks: Recipe unlock"| product_pump
  product_assembly -->|"ingredient: 6 consumed"| product_pump
  product_steel -->|"ingredient: 2 consumed"| product_pump
  product_conductor -->|"ingredient: 4 consumed"| product_pump
  product_construction -.->|"produces: Produced by"| product_pump
  product_generator -.->|"service: Requires service"| product_pump
  tech_thermal -.->|"unlocks: Recipe unlock"| product_heat_exchanger
  product_assembly -->|"ingredient: 12 consumed"| product_heat_exchanger
  product_steel -->|"ingredient: 6 consumed"| product_heat_exchanger
  product_conductor -->|"ingredient: 8 consumed"| product_heat_exchanger
  product_construction -.->|"produces: Produced by"| product_heat_exchanger
  product_generator -.->|"service: Requires service"| product_heat_exchanger
  product_pump -.->|"service: Requires service"| product_heat_exchanger
  product_coolant_pipe -.->|"service: Requires service"| product_heat_exchanger
  product_coolant -.->|"service: Requires service"| product_heat_exchanger
  tech_thermal -.->|"unlocks: Recipe unlock"| product_branch_isolator
  product_assembly -->|"ingredient: 4 consumed"| product_branch_isolator
  product_ceramic -->|"ingredient: 2 consumed"| product_branch_isolator
  product_polished_crystal -->|"ingredient: 1 consumed"| product_branch_isolator
  product_construction -.->|"produces: Produced by"| product_branch_isolator
  product_dump -.->|"service: Requires service"| product_branch_isolator
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Coolant charge | item / proposed | 1 Carbon nodules + 1 Frontier crystal → 4 Coolant charge / 4 s | Material processor | Consume the listed inputs once per completed recipe. |
| Coolant pipe | item / proposed | 2 Copper conductor + 1 Structural steel → 4 Coolant pipe / 2 s | Assembler | Consume the listed inputs once per completed recipe. |
| Coolant pump | equipment / proposed | 6 Construction assembly + 2 Structural steel + 4 Copper conductor → 1 Coolant pump · build instantly | Expedition construction kit | 4 power; moves coolant around a closed loop. Requires: Power unit. |
| Heat exchanger | equipment / proposed | 12 Construction assembly + 6 Structural steel + 8 Copper conductor → 1 Heat exchanger · build instantly | Expedition construction kit | 8 power; rejects loop heat. Connect pump, pipes and at least 4 coolant charges. Requires: Power unit, Coolant pump, Coolant pipe, Coolant charge. |
| Branch isolation switch | equipment / proposed | 4 Construction assembly + 2 Ceramic substrate + 1 Polished crystal → 1 Branch isolation switch · build instantly | Expedition construction kit | Trips a branch on return power/heat; isolation redirects energy to a matched dump. Requires: Cooled dump. |

## Layered defenses

**Research prerequisites:** Power distribution + Perimeter defense + Prepared materials. **Cost:** 40 × Industrial dossier · 15 s / unit.

Complete research; the initial sentry retains its prototype service contract. Upgraded sentries consume magazines.

```mermaid
flowchart LR
  tech_grid["Power distribution [research]"]
  tech_defense["Layered defenses [research]"]
  tech_perimeter["Perimeter defense [research]"]
  tech_materials["Prepared materials [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_wall["Perimeter wall [equipment]"]
  product_steel["Structural steel [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_magazine["Sentry magazine [item]"]
  product_assembly["Construction assembly [item]"]
  product_assembler["Assembler [equipment]"]
  product_repair_kit["Repair kit [item]"]
  product_conductor["Copper conductor [item]"]
  product_supplied_sentry["Supplied perimeter sentry [equipment]"]
  product_sentry["Perimeter sentry [equipment]"]
  product_control_board["Control board [item]"]
  product_generator["Power unit [equipment]"]
  product_repair_depot["Repair depot [equipment]"]
  tech_grid -.->|"prerequisite: Prerequisite"| tech_defense
  tech_perimeter -.->|"prerequisite: Prerequisite"| tech_defense
  tech_materials -.->|"prerequisite: Prerequisite"| tech_defense
  product_industrial_dossier -->|"science: 40 consumed"| tech_defense
  product_laboratory -.->|"service: Researched in"| tech_defense
  tech_defense -.->|"unlocks: Recipe unlock"| product_wall
  product_steel -->|"ingredient: 2 consumed"| product_wall
  product_ceramic -->|"ingredient: 2 consumed"| product_wall
  product_construction -.->|"produces: Produced by"| product_wall
  tech_defense -.->|"unlocks: Recipe unlock"| product_magazine
  product_assembly -->|"ingredient: 1 consumed"| product_magazine
  product_assembler -.->|"produces: Produced by"| product_magazine
  tech_defense -.->|"unlocks: Recipe unlock"| product_repair_kit
  product_assembly -->|"ingredient: 2 consumed"| product_repair_kit
  product_conductor -->|"ingredient: 1 consumed"| product_repair_kit
  product_assembler -.->|"produces: Produced by"| product_repair_kit
  tech_defense -.->|"unlocks: Recipe unlock"| product_supplied_sentry
  product_sentry -->|"ingredient: 1 consumed"| product_supplied_sentry
  product_steel -->|"ingredient: 4 consumed"| product_supplied_sentry
  product_control_board -->|"ingredient: 2 consumed"| product_supplied_sentry
  product_construction -.->|"produces: Produced by"| product_supplied_sentry
  product_generator -.->|"service: Requires service"| product_supplied_sentry
  product_magazine -.->|"service: Requires service"| product_supplied_sentry
  tech_defense -.->|"unlocks: Recipe unlock"| product_repair_depot
  product_assembly -->|"ingredient: 10 consumed"| product_repair_depot
  product_steel -->|"ingredient: 4 consumed"| product_repair_depot
  product_control_board -->|"ingredient: 2 consumed"| product_repair_depot
  product_construction -.->|"produces: Produced by"| product_repair_depot
  product_generator -.->|"service: Requires service"| product_repair_depot
  product_repair_kit -.->|"service: Requires service"| product_repair_depot
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Perimeter wall | equipment / proposed | 2 Structural steel + 2 Ceramic substrate → 1 Perimeter wall · build instantly | Expedition construction kit | Passive barrier; gates and routing clearances remain explicit. |
| Sentry magazine | item / proposed | 1 Construction assembly → 4 Sentry magazine / 4 s | Assembler | Consume the listed inputs once per completed recipe. |
| Repair kit | item / proposed | 2 Construction assembly + 1 Copper conductor → 1 Repair kit / 4 s | Assembler | Consume the listed inputs once per completed recipe. |
| Supplied perimeter sentry | equipment / proposed | 1 Perimeter sentry + 4 Structural steel + 2 Control board → 1 Supplied perimeter sentry · build instantly | Expedition construction kit | 8 power; magazine-fed upgrade. Building consumes one recovered original sentry and the listed parts. Requires: Power unit, Sentry magazine. |
| Repair depot | equipment / proposed | 10 Construction assembly + 4 Structural steel + 2 Control board → 1 Repair depot · build instantly | Expedition construction kit | 8 power; restores nearby damaged equipment by consuming repair kits. Requires: Power unit, Repair kit. |

## Precision research

**Research prerequisites:** Prepared materials + Instrumented networks. **Cost:** 60 × Industrial dossier · 15 s / unit.

Complete industrial research, then feed boards and polished crystal to the research workbench.

```mermaid
flowchart LR
  tech_materials["Prepared materials [research]"]
  tech_precision["Precision research [research]"]
  tech_instrumentation["Instrumented networks [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_precision_dossier["Precision dossier [item]"]
  product_control_board["Control board [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_workbench["Research workbench [equipment]"]
  product_precision_lens["Precision lens [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_processor["Material processor [equipment]"]
  product_actuator["Precision actuator [item]"]
  product_steel["Structural steel [item]"]
  product_conductor["Copper conductor [item]"]
  product_assembler["Assembler [equipment]"]
  product_resonator["Resonator core [item]"]
  product_sensor["Sensor head [item]"]
  tech_materials -.->|"prerequisite: Prerequisite"| tech_precision
  tech_instrumentation -.->|"prerequisite: Prerequisite"| tech_precision
  product_industrial_dossier -->|"science: 60 consumed"| tech_precision
  product_laboratory -.->|"service: Researched in"| tech_precision
  tech_precision -.->|"unlocks: Recipe unlock"| product_precision_dossier
  product_industrial_dossier -->|"ingredient: 1 consumed"| product_precision_dossier
  product_control_board -->|"ingredient: 1 consumed"| product_precision_dossier
  product_polished_crystal -->|"ingredient: 1 consumed"| product_precision_dossier
  product_workbench -.->|"produces: Produced by"| product_precision_dossier
  tech_precision -.->|"unlocks: Recipe unlock"| product_precision_lens
  product_polished_crystal -->|"ingredient: 2 consumed"| product_precision_lens
  product_ceramic -->|"ingredient: 1 consumed"| product_precision_lens
  product_processor -.->|"produces: Produced by"| product_precision_lens
  tech_precision -.->|"unlocks: Recipe unlock"| product_actuator
  product_steel -->|"ingredient: 2 consumed"| product_actuator
  product_conductor -->|"ingredient: 4 consumed"| product_actuator
  product_control_board -->|"ingredient: 1 consumed"| product_actuator
  product_assembler -.->|"produces: Produced by"| product_actuator
  tech_precision -.->|"unlocks: Recipe unlock"| product_resonator
  product_polished_crystal -->|"ingredient: 2 consumed"| product_resonator
  product_ceramic -->|"ingredient: 2 consumed"| product_resonator
  product_conductor -->|"ingredient: 2 consumed"| product_resonator
  product_processor -.->|"produces: Produced by"| product_resonator
  tech_precision -.->|"unlocks: Recipe unlock"| product_sensor
  product_precision_lens -->|"ingredient: 1 consumed"| product_sensor
  product_control_board -->|"ingredient: 2 consumed"| product_sensor
  product_assembler -.->|"produces: Produced by"| product_sensor
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Precision dossier | item / proposed | 1 Industrial dossier + 1 Control board + 1 Polished crystal → 1 Precision dossier / 6 s | Research workbench | Consume the listed inputs once per completed recipe. |
| Precision lens | item / proposed | 2 Polished crystal + 1 Ceramic substrate → 1 Precision lens / 6 s | Material processor | Consume the listed inputs once per completed recipe. |
| Precision actuator | item / proposed | 2 Structural steel + 4 Copper conductor + 1 Control board → 1 Precision actuator / 6 s | Assembler | Consume the listed inputs once per completed recipe. |
| Resonator core | item / proposed | 2 Polished crystal + 2 Ceramic substrate + 2 Copper conductor → 1 Resonator core / 8 s | Material processor | Consume the listed inputs once per completed recipe. |
| Sensor head | item / proposed | 1 Precision lens + 2 Control board → 1 Sensor head / 6 s | Assembler | Consume the listed inputs once per completed recipe. |

## Long-range transport

**Research prerequisites:** Modular construction + Power distribution + Precision research. **Cost:** 80 × Industrial dossier + Precision dossier · 20 s / unit.

Complete research; conduit behavior uses declared loss and bend specifications.

```mermaid
flowchart LR
  tech_modules["Modular construction [research]"]
  tech_transport["Long-range transport [research]"]
  tech_grid["Power distribution [research]"]
  tech_precision["Precision research [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_freight_depot["Freight depot [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_steel["Structural steel [item]"]
  product_service_connector["Service connector [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_cargo_carrier["Cargo carrier [equipment]"]
  product_actuator["Precision actuator [item]"]
  product_control_board["Control board [item]"]
  product_restricted_conduit["Restricted-mode conduit [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_processor["Material processor [equipment]"]
  tech_modules -.->|"prerequisite: Prerequisite"| tech_transport
  tech_grid -.->|"prerequisite: Prerequisite"| tech_transport
  tech_precision -.->|"prerequisite: Prerequisite"| tech_transport
  product_industrial_dossier -->|"science: 80 consumed"| tech_transport
  product_precision_dossier -->|"science: 80 consumed"| tech_transport
  product_laboratory -.->|"service: Researched in"| tech_transport
  tech_transport -.->|"unlocks: Recipe unlock"| product_freight_depot
  product_assembly -->|"ingredient: 16 consumed"| product_freight_depot
  product_steel -->|"ingredient: 12 consumed"| product_freight_depot
  product_service_connector -->|"ingredient: 4 consumed"| product_freight_depot
  product_construction -.->|"produces: Produced by"| product_freight_depot
  product_generator -.->|"service: Requires service"| product_freight_depot
  tech_transport -.->|"unlocks: Recipe unlock"| product_cargo_carrier
  product_steel -->|"ingredient: 12 consumed"| product_cargo_carrier
  product_actuator -->|"ingredient: 4 consumed"| product_cargo_carrier
  product_control_board -->|"ingredient: 4 consumed"| product_cargo_carrier
  product_construction -.->|"produces: Produced by"| product_cargo_carrier
  product_freight_depot -.->|"service: Requires service"| product_cargo_carrier
  tech_transport -.->|"unlocks: Recipe unlock"| product_restricted_conduit
  product_polished_crystal -->|"ingredient: 2 consumed"| product_restricted_conduit
  product_ceramic -->|"ingredient: 2 consumed"| product_restricted_conduit
  product_processor -.->|"produces: Produced by"| product_restricted_conduit
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Freight depot | equipment / proposed | 16 Construction assembly + 12 Structural steel + 4 Service connector → 1 Freight depot · build instantly | Expedition construction kit | 12 power; buffers items and dispatches scheduled carriers. Requires: Power unit. |
| Cargo carrier | equipment / proposed | 12 Structural steel + 4 Precision actuator + 4 Control board → 1 Cargo carrier · build instantly | Expedition construction kit | Battery-powered vehicle charged at the depot. Capacity 40 item stacks; schedules use explicit loading conditions. Requires: Freight depot. |
| Restricted-mode conduit | item / proposed | 2 Polished crystal + 2 Ceramic substrate → 4 Restricted-mode conduit / 6 s | Material processor | Consume the listed inputs once per completed recipe. |

## Stable source arrays

**Research prerequisites:** Precision research + Thermal management. **Cost:** 80 × Industrial dossier + Precision dossier · 20 s / unit.

Complete research; each source must meet its locking and thermal limits.

```mermaid
flowchart LR
  tech_precision["Precision research [research]"]
  tech_coherent["Stable source arrays [research]"]
  tech_thermal["Thermal management [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_locked_source["Reference-locked source [equipment]"]
  product_reference["Reference station [equipment]"]
  product_resonator["Resonator core [item]"]
  product_control_board["Control board [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_gain_core["Gain core [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_processor["Material processor [equipment]"]
  product_amplifier["Field amplifier [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_conductor["Copper conductor [item]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_return_guard["Return-power guard [equipment]"]
  product_dump["Cooled dump [equipment]"]
  product_branch_isolator["Branch isolation switch [equipment]"]
  product_sensor["Sensor head [item]"]
  tech_precision -.->|"prerequisite: Prerequisite"| tech_coherent
  tech_thermal -.->|"prerequisite: Prerequisite"| tech_coherent
  product_industrial_dossier -->|"science: 80 consumed"| tech_coherent
  product_precision_dossier -->|"science: 80 consumed"| tech_coherent
  product_laboratory -.->|"service: Researched in"| tech_coherent
  tech_coherent -.->|"unlocks: Recipe unlock"| product_locked_source
  product_reference -->|"ingredient: 1 consumed"| product_locked_source
  product_resonator -->|"ingredient: 2 consumed"| product_locked_source
  product_control_board -->|"ingredient: 4 consumed"| product_locked_source
  product_construction -.->|"produces: Produced by"| product_locked_source
  product_generator -.->|"service: Requires service"| product_locked_source
  product_reference -.->|"service: Requires service"| product_locked_source
  tech_coherent -.->|"unlocks: Recipe unlock"| product_gain_core
  product_polished_crystal -->|"ingredient: 4 consumed"| product_gain_core
  product_ceramic -->|"ingredient: 2 consumed"| product_gain_core
  product_resonator -->|"ingredient: 1 consumed"| product_gain_core
  product_processor -.->|"produces: Produced by"| product_gain_core
  tech_coherent -.->|"unlocks: Recipe unlock"| product_amplifier
  product_assembly -->|"ingredient: 16 consumed"| product_amplifier
  product_gain_core -->|"ingredient: 2 consumed"| product_amplifier
  product_conductor -->|"ingredient: 8 consumed"| product_amplifier
  product_construction -.->|"produces: Produced by"| product_amplifier
  product_generator -.->|"service: Requires service"| product_amplifier
  product_heat_exchanger -.->|"service: Requires service"| product_amplifier
  tech_coherent -.->|"unlocks: Recipe unlock"| product_return_guard
  product_dump -->|"ingredient: 1 consumed"| product_return_guard
  product_branch_isolator -->|"ingredient: 1 consumed"| product_return_guard
  product_sensor -->|"ingredient: 1 consumed"| product_return_guard
  product_construction -.->|"produces: Produced by"| product_return_guard
  product_heat_exchanger -.->|"service: Requires service"| product_return_guard
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Reference-locked source | equipment / proposed | 1 Reference station + 2 Resonator core + 4 Control board → 1 Reference-locked source · build instantly | Expedition construction kit | 160 power; upgraded source locks to a reference and reports lock margin. Recovered reference station is consumed. Requires: Power unit, Reference station. |
| Gain core | item / proposed | 4 Polished crystal + 2 Ceramic substrate + 1 Resonator core → 1 Gain core / 10 s | Material processor | Consume the listed inputs once per completed recipe. |
| Field amplifier | equipment / proposed | 16 Construction assembly + 2 Gain core + 8 Copper conductor → 1 Field amplifier · build instantly | Expedition construction kit | 80 power plus field input and cooling; adds field energy through an explicit ledger. Requires: Power unit, Heat exchanger. |
| Return-power guard | equipment / proposed | 1 Cooled dump + 1 Branch isolation switch + 1 Sensor head → 1 Return-power guard · build instantly | Expedition construction kit | Dump-backed return protection; directed rejected energy is still accounted as heat. Requires: Heat exchanger. |

## Pulsed field delivery

**Research prerequisites:** Layered defenses + Thermal management + Precision research. **Cost:** 80 × Industrial dossier + Precision dossier · 20 s / unit.

Complete research; entering the next sector introduces the new threat after defense is available.

```mermaid
flowchart LR
  tech_defense["Layered defenses [research]"]
  tech_pulses["Pulsed field delivery [research]"]
  tech_thermal["Thermal management [research]"]
  tech_precision["Precision research [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_capacitor["Pulse capacitor [item]"]
  product_conductor["Copper conductor [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_carbon["Carbon nodules [resource]"]
  product_processor["Material processor [equipment]"]
  product_pulse_driver["Pulse driver [equipment]"]
  product_emitter["Field emitter [equipment]"]
  product_control_board["Control board [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_pulse_diagnostics["Pulse timing diagnostics [capability]"]
  product_monitor["Monitor station [equipment]"]
  tech_defense -.->|"prerequisite: Prerequisite"| tech_pulses
  tech_thermal -.->|"prerequisite: Prerequisite"| tech_pulses
  tech_precision -.->|"prerequisite: Prerequisite"| tech_pulses
  product_industrial_dossier -->|"science: 80 consumed"| tech_pulses
  product_precision_dossier -->|"science: 80 consumed"| tech_pulses
  product_laboratory -.->|"service: Researched in"| tech_pulses
  tech_pulses -.->|"unlocks: Recipe unlock"| product_capacitor
  product_conductor -->|"ingredient: 4 consumed"| product_capacitor
  product_ceramic -->|"ingredient: 4 consumed"| product_capacitor
  product_carbon -->|"ingredient: 2 consumed"| product_capacitor
  product_processor -.->|"produces: Produced by"| product_capacitor
  tech_pulses -.->|"unlocks: Recipe unlock"| product_pulse_driver
  product_emitter -->|"ingredient: 1 consumed"| product_pulse_driver
  product_capacitor -->|"ingredient: 4 consumed"| product_pulse_driver
  product_control_board -->|"ingredient: 4 consumed"| product_pulse_driver
  product_construction -.->|"produces: Produced by"| product_pulse_driver
  product_generator -.->|"service: Requires service"| product_pulse_driver
  product_heat_exchanger -.->|"service: Requires service"| product_pulse_driver
  tech_pulses -.->|"unlocks: Enables"| product_pulse_diagnostics
  product_monitor -.->|"service: Requires service"| product_pulse_diagnostics
  product_pulse_driver -.->|"service: Requires service"| product_pulse_diagnostics
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Pulse capacitor | item / proposed | 4 Copper conductor + 4 Ceramic substrate + 2 Carbon nodules → 1 Pulse capacitor / 8 s | Material processor | Consume the listed inputs once per completed recipe. |
| Pulse driver | equipment / proposed | 1 Field emitter + 4 Pulse capacitor + 4 Control board → 1 Pulse driver · build instantly | Expedition construction kit | 40 power while charging; existing emitter body becomes a pulse-delivery device. Requires: Power unit, Heat exchanger. |
| Pulse timing diagnostics | capability / proposed | Operating capability / milestone | — | Read delivered pulse energy, peak power, duty cycle and thermal limits. Requires: Monitor station, Pulse driver. |

## Precision fabrication

**Research prerequisites:** Precision research + Modular construction + Thermal management. **Cost:** 100 × Industrial dossier + Precision dossier · 20 s / unit.

Complete research; only parts that pass the cell inspection count as accepted output.

```mermaid
flowchart LR
  tech_precision["Precision research [research]"]
  tech_fabrication["Precision fabrication [research]"]
  tech_modules["Modular construction [research]"]
  tech_thermal["Thermal management [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_fabrication_cell["Field-assisted fabrication cell [equipment]"]
  product_assembler["Assembler [equipment]"]
  product_steel["Structural steel [item]"]
  product_actuator["Precision actuator [item]"]
  product_precision_lens["Precision lens [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_emitter["Field emitter [equipment]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_accepted_part["Accepted precision part [item]"]
  product_polished_crystal["Polished crystal [item]"]
  product_control_board["Control board [item]"]
  product_wafer["Semiconductor wafer [item]"]
  product_raw_crystal["Frontier crystal [resource]"]
  product_silica["Silica gravel [resource]"]
  product_processor["Material processor [equipment]"]
  product_resist["Patterning resist [item]"]
  product_carbon["Carbon nodules [resource]"]
  tech_precision -.->|"prerequisite: Prerequisite"| tech_fabrication
  tech_modules -.->|"prerequisite: Prerequisite"| tech_fabrication
  tech_thermal -.->|"prerequisite: Prerequisite"| tech_fabrication
  product_industrial_dossier -->|"science: 100 consumed"| tech_fabrication
  product_precision_dossier -->|"science: 100 consumed"| tech_fabrication
  product_laboratory -.->|"service: Researched in"| tech_fabrication
  tech_fabrication -.->|"unlocks: Recipe unlock"| product_fabrication_cell
  product_assembler -->|"ingredient: 1 consumed"| product_fabrication_cell
  product_steel -->|"ingredient: 8 consumed"| product_fabrication_cell
  product_actuator -->|"ingredient: 2 consumed"| product_fabrication_cell
  product_precision_lens -->|"ingredient: 2 consumed"| product_fabrication_cell
  product_construction -.->|"produces: Produced by"| product_fabrication_cell
  product_generator -.->|"service: Requires service"| product_fabrication_cell
  product_emitter -.->|"service: Requires service"| product_fabrication_cell
  product_heat_exchanger -.->|"service: Requires service"| product_fabrication_cell
  tech_fabrication -.->|"unlocks: Recipe unlock"| product_accepted_part
  product_polished_crystal -->|"ingredient: 2 consumed"| product_accepted_part
  product_control_board -->|"ingredient: 1 consumed"| product_accepted_part
  product_fabrication_cell -.->|"produces: Produced by"| product_accepted_part
  tech_fabrication -.->|"unlocks: Recipe unlock"| product_wafer
  product_raw_crystal -->|"ingredient: 4 consumed"| product_wafer
  product_silica -->|"ingredient: 2 consumed"| product_wafer
  product_processor -.->|"produces: Produced by"| product_wafer
  tech_fabrication -.->|"unlocks: Recipe unlock"| product_resist
  product_carbon -->|"ingredient: 2 consumed"| product_resist
  product_raw_crystal -->|"ingredient: 1 consumed"| product_resist
  product_processor -.->|"produces: Produced by"| product_resist
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Field-assisted fabrication cell | equipment / proposed | 1 Assembler + 8 Structural steel + 2 Precision actuator + 2 Precision lens → 1 Field-assisted fabrication cell · build instantly | Expedition construction kit | 24 power plus ≥10 stable useful process-field units and cooling for accepted precision parts. Starter reference/emitter can supply this contract. Requires: Power unit, Field emitter, Heat exchanger. |
| Accepted precision part | item / proposed | 2 Polished crystal + 1 Control board → 1 Accepted precision part / 8 s | Field-assisted fabrication cell | Consume the listed inputs once per completed recipe. |
| Semiconductor wafer | item / proposed | 4 Frontier crystal + 2 Silica gravel → 2 Semiconductor wafer / 8 s | Material processor | Consume the listed inputs once per completed recipe. |
| Patterning resist | item / proposed | 2 Carbon nodules + 1 Frontier crystal → 4 Patterning resist / 4 s | Material processor | Consume the listed inputs once per completed recipe. |

## Integrated photonics

**Research prerequisites:** Stable source arrays + Precision fabrication. **Cost:** 120 × Industrial dossier + Precision dossier · 25 s / unit.

Complete research; produce accepted precision parts and photonic modules before making systems dossiers.

```mermaid
flowchart LR
  tech_coherent["Stable source arrays [research]"]
  tech_photonics["Integrated photonics [research]"]
  tech_fabrication["Precision fabrication [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_patterned_die["Patterned die [item]"]
  product_wafer["Semiconductor wafer [item]"]
  product_resist["Patterning resist [item]"]
  product_fabrication_cell["Field-assisted fabrication cell [equipment]"]
  product_optical_coupler["Optical coupler [item]"]
  product_precision_lens["Precision lens [item]"]
  product_ceramic["Ceramic substrate [item]"]
  product_processor["Material processor [equipment]"]
  product_photonic_module["Photonic module [item]"]
  product_control_board["Control board [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_accepted_part["Accepted precision part [item]"]
  product_workbench["Research workbench [equipment]"]
  tech_coherent -.->|"prerequisite: Prerequisite"| tech_photonics
  tech_fabrication -.->|"prerequisite: Prerequisite"| tech_photonics
  product_industrial_dossier -->|"science: 120 consumed"| tech_photonics
  product_precision_dossier -->|"science: 120 consumed"| tech_photonics
  product_laboratory -.->|"service: Researched in"| tech_photonics
  tech_photonics -.->|"unlocks: Recipe unlock"| product_patterned_die
  product_wafer -->|"ingredient: 1 consumed"| product_patterned_die
  product_resist -->|"ingredient: 1 consumed"| product_patterned_die
  product_fabrication_cell -.->|"produces: Produced by"| product_patterned_die
  tech_photonics -.->|"unlocks: Recipe unlock"| product_optical_coupler
  product_precision_lens -->|"ingredient: 1 consumed"| product_optical_coupler
  product_ceramic -->|"ingredient: 1 consumed"| product_optical_coupler
  product_processor -.->|"produces: Produced by"| product_optical_coupler
  tech_photonics -.->|"unlocks: Recipe unlock"| product_photonic_module
  product_patterned_die -->|"ingredient: 2 consumed"| product_photonic_module
  product_optical_coupler -->|"ingredient: 1 consumed"| product_photonic_module
  product_control_board -->|"ingredient: 1 consumed"| product_photonic_module
  product_fabrication_cell -.->|"produces: Produced by"| product_photonic_module
  tech_photonics -.->|"unlocks: Recipe unlock"| product_systems_dossier
  product_precision_dossier -->|"ingredient: 1 consumed"| product_systems_dossier
  product_photonic_module -->|"ingredient: 1 consumed"| product_systems_dossier
  product_accepted_part -->|"ingredient: 1 consumed"| product_systems_dossier
  product_workbench -.->|"produces: Produced by"| product_systems_dossier
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Patterned die | item / proposed | 1 Semiconductor wafer + 1 Patterning resist → 4 Patterned die / 10 s | Field-assisted fabrication cell | Consume the listed inputs once per completed recipe. |
| Optical coupler | item / proposed | 1 Precision lens + 1 Ceramic substrate → 2 Optical coupler / 6 s | Material processor | Consume the listed inputs once per completed recipe. |
| Photonic module | item / proposed | 2 Patterned die + 1 Optical coupler + 1 Control board → 1 Photonic module / 8 s | Field-assisted fabrication cell | Consume the listed inputs once per completed recipe. |
| Systems dossier | item / proposed | 1 Precision dossier + 1 Photonic module + 1 Accepted precision part → 1 Systems dossier / 10 s | Research workbench | Consume the listed inputs once per completed recipe. |

## Distributed infrastructure

**Research prerequisites:** Long-range transport + Integrated photonics. **Cost:** 160 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research; communication quality constrains remote automation.

```mermaid
flowchart LR
  tech_transport["Long-range transport [research]"]
  tech_distributed["Distributed infrastructure [research]"]
  tech_photonics["Integrated photonics [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_communication_module["Communication module [item]"]
  product_photonic_module["Photonic module [item]"]
  product_control_board["Control board [item]"]
  product_fabrication_cell["Field-assisted fabrication cell [equipment]"]
  product_relay["Communication relay [equipment]"]
  product_steel["Structural steel [item]"]
  product_actuator["Precision actuator [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_regional_controller["Regional scheduler [equipment]"]
  product_assembly["Construction assembly [item]"]
  product_freight_depot["Freight depot [equipment]"]
  tech_transport -.->|"prerequisite: Prerequisite"| tech_distributed
  tech_photonics -.->|"prerequisite: Prerequisite"| tech_distributed
  product_industrial_dossier -->|"science: 160 consumed"| tech_distributed
  product_precision_dossier -->|"science: 160 consumed"| tech_distributed
  product_systems_dossier -->|"science: 160 consumed"| tech_distributed
  product_laboratory -.->|"service: Researched in"| tech_distributed
  tech_distributed -.->|"unlocks: Recipe unlock"| product_communication_module
  product_photonic_module -->|"ingredient: 2 consumed"| product_communication_module
  product_control_board -->|"ingredient: 2 consumed"| product_communication_module
  product_fabrication_cell -.->|"produces: Produced by"| product_communication_module
  tech_distributed -.->|"unlocks: Recipe unlock"| product_relay
  product_steel -->|"ingredient: 8 consumed"| product_relay
  product_communication_module -->|"ingredient: 2 consumed"| product_relay
  product_actuator -->|"ingredient: 1 consumed"| product_relay
  product_construction -.->|"produces: Produced by"| product_relay
  product_generator -.->|"service: Requires service"| product_relay
  tech_distributed -.->|"unlocks: Recipe unlock"| product_regional_controller
  product_assembly -->|"ingredient: 12 consumed"| product_regional_controller
  product_control_board -->|"ingredient: 4 consumed"| product_regional_controller
  product_communication_module -->|"ingredient: 2 consumed"| product_regional_controller
  product_construction -.->|"produces: Produced by"| product_regional_controller
  product_generator -.->|"service: Requires service"| product_regional_controller
  product_relay -.->|"service: Requires service"| product_regional_controller
  product_freight_depot -.->|"service: Requires service"| product_regional_controller
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Communication module | item / proposed | 2 Photonic module + 2 Control board → 1 Communication module / 8 s | Field-assisted fabrication cell | Consume the listed inputs once per completed recipe. |
| Communication relay | equipment / proposed | 8 Structural steel + 2 Communication module + 1 Precision actuator → 1 Communication relay · build instantly | Expedition construction kit | 12 power; transports commands and telemetry with finite delay. Requires: Power unit. |
| Regional scheduler | equipment / proposed | 12 Construction assembly + 4 Control board + 2 Communication module → 1 Regional scheduler · build instantly | Expedition construction kit | 12 power; coordinates depot schedules across linked regions. Requires: Power unit, Communication relay, Freight depot. |

## Adaptive aperture control

**Research prerequisites:** Integrated photonics + Instrumented networks. **Cost:** 160 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research; each sector performs a local calibration before joining an aperture.

```mermaid
flowchart LR
  tech_photonics["Integrated photonics [research]"]
  tech_adaptive["Adaptive aperture control [research]"]
  tech_instrumentation["Instrumented networks [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_calibration_beacon["Calibration beacon [equipment]"]
  product_sensor["Sensor head [item]"]
  product_photonic_module["Photonic module [item]"]
  product_steel["Structural steel [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_sector_controller["Aperture sector controller [equipment]"]
  product_control_board["Control board [item]"]
  tech_photonics -.->|"prerequisite: Prerequisite"| tech_adaptive
  tech_instrumentation -.->|"prerequisite: Prerequisite"| tech_adaptive
  product_industrial_dossier -->|"science: 160 consumed"| tech_adaptive
  product_precision_dossier -->|"science: 160 consumed"| tech_adaptive
  product_systems_dossier -->|"science: 160 consumed"| tech_adaptive
  product_laboratory -.->|"service: Researched in"| tech_adaptive
  tech_adaptive -.->|"unlocks: Recipe unlock"| product_calibration_beacon
  product_sensor -->|"ingredient: 2 consumed"| product_calibration_beacon
  product_photonic_module -->|"ingredient: 2 consumed"| product_calibration_beacon
  product_steel -->|"ingredient: 4 consumed"| product_calibration_beacon
  product_construction -.->|"produces: Produced by"| product_calibration_beacon
  product_generator -.->|"service: Requires service"| product_calibration_beacon
  tech_adaptive -.->|"unlocks: Recipe unlock"| product_sector_controller
  product_control_board -->|"ingredient: 6 consumed"| product_sector_controller
  product_photonic_module -->|"ingredient: 4 consumed"| product_sector_controller
  product_sensor -->|"ingredient: 2 consumed"| product_sector_controller
  product_construction -.->|"produces: Produced by"| product_sector_controller
  product_generator -.->|"service: Requires service"| product_sector_controller
  product_calibration_beacon -.->|"service: Requires service"| product_sector_controller
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Calibration beacon | equipment / proposed | 2 Sensor head + 2 Photonic module + 4 Structural steel → 1 Calibration beacon · build instantly | Expedition construction kit | 8 power; provides a surveyed field calibration target. Requires: Power unit. |
| Aperture sector controller | equipment / proposed | 6 Control board + 4 Photonic module + 2 Sensor head → 1 Aperture sector controller · build instantly | Expedition construction kit | 20 power; bounds adaptive phase updates using beacon feedback. Requires: Power unit, Calibration beacon. |

## Frontier observatories

**Research prerequisites:** Pulsed field delivery + Integrated photonics. **Cost:** 140 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research, then operate powered observatories to obtain site and target data.

```mermaid
flowchart LR
  tech_pulses["Pulsed field delivery [research]"]
  tech_survey["Frontier observatories [research]"]
  tech_photonics["Integrated photonics [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_observatory["Frontier observatory [equipment]"]
  product_steel["Structural steel [item]"]
  product_precision_lens["Precision lens [item]"]
  product_sensor["Sensor head [item]"]
  product_actuator["Precision actuator [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_tracking_receiver["Tracking receiver [equipment]"]
  product_photonic_module["Photonic module [item]"]
  product_site_survey["Surveyed aperture site [capability]"]
  tech_pulses -.->|"prerequisite: Prerequisite"| tech_survey
  tech_photonics -.->|"prerequisite: Prerequisite"| tech_survey
  product_industrial_dossier -->|"science: 140 consumed"| tech_survey
  product_precision_dossier -->|"science: 140 consumed"| tech_survey
  product_systems_dossier -->|"science: 140 consumed"| tech_survey
  product_laboratory -.->|"service: Researched in"| tech_survey
  tech_survey -.->|"unlocks: Recipe unlock"| product_observatory
  product_steel -->|"ingredient: 16 consumed"| product_observatory
  product_precision_lens -->|"ingredient: 4 consumed"| product_observatory
  product_sensor -->|"ingredient: 4 consumed"| product_observatory
  product_actuator -->|"ingredient: 2 consumed"| product_observatory
  product_construction -.->|"produces: Produced by"| product_observatory
  product_generator -.->|"service: Requires service"| product_observatory
  tech_survey -.->|"unlocks: Recipe unlock"| product_tracking_receiver
  product_sensor -->|"ingredient: 2 consumed"| product_tracking_receiver
  product_photonic_module -->|"ingredient: 2 consumed"| product_tracking_receiver
  product_actuator -->|"ingredient: 2 consumed"| product_tracking_receiver
  product_construction -.->|"produces: Produced by"| product_tracking_receiver
  product_generator -.->|"service: Requires service"| product_tracking_receiver
  product_observatory -.->|"service: Requires service"| product_tracking_receiver
  tech_survey -.->|"unlocks: Enables"| product_site_survey
  product_observatory -.->|"service: Requires service"| product_site_survey
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Frontier observatory | equipment / proposed | 16 Structural steel + 4 Precision lens + 4 Sensor head + 2 Precision actuator → 1 Frontier observatory · build instantly | Expedition construction kit | 20 power; surveys build corridors and measures a target trajectory. Requires: Power unit. |
| Tracking receiver | equipment / proposed | 2 Sensor head + 2 Photonic module + 2 Precision actuator → 1 Tracking receiver · build instantly | Expedition construction kit | 12 power; live trajectory corrections and stale-data alarms. Requires: Power unit, Frontier observatory. |
| Surveyed aperture site | capability / proposed | Operating capability / milestone | — | One observatory survey certifies an unobstructed site. Certification is invalidated by incompatible construction; it is not a consumable item. Requires: Frontier observatory. |

## Large-area nanofabrication

**Research prerequisites:** Integrated photonics + Precision fabrication. **Cost:** 180 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research; defects reduce accepted film yield.

```mermaid
flowchart LR
  tech_photonics["Integrated photonics [research]"]
  tech_nanofab["Large-area nanofabrication [research]"]
  tech_fabrication["Precision fabrication [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_membrane_line["Membrane deposition line [equipment]"]
  product_steel["Structural steel [item]"]
  product_actuator["Precision actuator [item]"]
  product_photonic_module["Photonic module [item]"]
  product_accepted_part["Accepted precision part [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_emitter["Field emitter [equipment]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_metrology_gantry["Metrology gantry [equipment]"]
  product_sensor["Sensor head [item]"]
  product_sail_panel["Accepted sail panel [item]"]
  tech_photonics -.->|"prerequisite: Prerequisite"| tech_nanofab
  tech_fabrication -.->|"prerequisite: Prerequisite"| tech_nanofab
  product_industrial_dossier -->|"science: 180 consumed"| tech_nanofab
  product_precision_dossier -->|"science: 180 consumed"| tech_nanofab
  product_systems_dossier -->|"science: 180 consumed"| tech_nanofab
  product_laboratory -.->|"service: Researched in"| tech_nanofab
  tech_nanofab -.->|"unlocks: Recipe unlock"| product_membrane_line
  product_steel -->|"ingredient: 20 consumed"| product_membrane_line
  product_actuator -->|"ingredient: 4 consumed"| product_membrane_line
  product_photonic_module -->|"ingredient: 4 consumed"| product_membrane_line
  product_accepted_part -->|"ingredient: 8 consumed"| product_membrane_line
  product_construction -.->|"produces: Produced by"| product_membrane_line
  product_generator -.->|"service: Requires service"| product_membrane_line
  product_emitter -.->|"service: Requires service"| product_membrane_line
  product_heat_exchanger -.->|"service: Requires service"| product_membrane_line
  tech_nanofab -.->|"unlocks: Recipe unlock"| product_metrology_gantry
  product_steel -->|"ingredient: 12 consumed"| product_metrology_gantry
  product_sensor -->|"ingredient: 4 consumed"| product_metrology_gantry
  product_actuator -->|"ingredient: 2 consumed"| product_metrology_gantry
  product_photonic_module -->|"ingredient: 2 consumed"| product_metrology_gantry
  product_construction -.->|"produces: Produced by"| product_metrology_gantry
  product_generator -.->|"service: Requires service"| product_metrology_gantry
  tech_nanofab -.->|"unlocks: Recipe unlock"| product_sail_panel
  product_accepted_part -->|"ingredient: 2 consumed"| product_sail_panel
  product_photonic_module -->|"ingredient: 1 consumed"| product_sail_panel
  product_membrane_line -.->|"produces: Produced by"| product_sail_panel
  product_metrology_gantry -.->|"service: Requires service"| product_sail_panel
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Membrane deposition line | equipment / proposed | 20 Structural steel + 4 Precision actuator + 4 Photonic module + 8 Accepted precision part → 1 Membrane deposition line · build instantly | Expedition construction kit | 48 power, process field and cooling; produces film panels with counted rejects. Requires: Power unit, Field emitter, Heat exchanger. |
| Metrology gantry | equipment / proposed | 12 Structural steel + 4 Sensor head + 2 Precision actuator + 2 Photonic module → 1 Metrology gantry · build instantly | Expedition construction kit | 16 power; inspects membrane output. Uninspected film cannot fund a flight sail. Requires: Power unit. |
| Accepted sail panel | item / proposed | 2 Accepted precision part + 1 Photonic module → 1 Accepted sail panel / 12 s | Membrane deposition line | Consume the listed inputs once per completed recipe. Requires: Metrology gantry. |

## Planetary aperture

**Research prerequisites:** Distributed infrastructure + Adaptive aperture control + Frontier observatories. **Cost:** 250 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research; commission 4 sectors at surveyed sites, each at ≥100 useful units for 60 s with no thermal trip.

```mermaid
flowchart LR
  tech_distributed["Distributed infrastructure [research]"]
  tech_aperture["Planetary aperture [research]"]
  tech_adaptive["Adaptive aperture control [research]"]
  tech_survey["Frontier observatories [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_aperture_sector["Aperture sector assembly [equipment]"]
  product_locked_source["Reference-locked source [equipment]"]
  product_amplifier["Field amplifier [equipment]"]
  product_emitter["Field emitter [equipment]"]
  product_sector_controller["Aperture sector controller [equipment]"]
  product_return_guard["Return-power guard [equipment]"]
  product_steel["Structural steel [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_substation["Substation [equipment]"]
  product_heat_exchanger["Heat exchanger [equipment]"]
  product_relay["Communication relay [equipment]"]
  product_tracking_receiver["Tracking receiver [equipment]"]
  product_calibration_beacon["Calibration beacon [equipment]"]
  product_site_survey["Surveyed aperture site [capability]"]
  product_qualified_sector["Qualified aperture sector [capability]"]
  tech_distributed -.->|"prerequisite: Prerequisite"| tech_aperture
  tech_adaptive -.->|"prerequisite: Prerequisite"| tech_aperture
  tech_survey -.->|"prerequisite: Prerequisite"| tech_aperture
  product_industrial_dossier -->|"science: 250 consumed"| tech_aperture
  product_precision_dossier -->|"science: 250 consumed"| tech_aperture
  product_systems_dossier -->|"science: 250 consumed"| tech_aperture
  product_laboratory -.->|"service: Researched in"| tech_aperture
  tech_aperture -.->|"unlocks: Recipe unlock"| product_aperture_sector
  product_locked_source -->|"ingredient: 2 consumed"| product_aperture_sector
  product_amplifier -->|"ingredient: 4 consumed"| product_aperture_sector
  product_emitter -->|"ingredient: 4 consumed"| product_aperture_sector
  product_sector_controller -->|"ingredient: 1 consumed"| product_aperture_sector
  product_return_guard -->|"ingredient: 2 consumed"| product_aperture_sector
  product_steel -->|"ingredient: 40 consumed"| product_aperture_sector
  product_construction -.->|"produces: Produced by"| product_aperture_sector
  product_substation -.->|"service: Requires service"| product_aperture_sector
  product_heat_exchanger -.->|"service: Requires service"| product_aperture_sector
  product_relay -.->|"service: Requires service"| product_aperture_sector
  product_tracking_receiver -.->|"service: Requires service"| product_aperture_sector
  product_calibration_beacon -.->|"service: Requires service"| product_aperture_sector
  product_site_survey -.->|"service: Requires service"| product_aperture_sector
  tech_aperture -.->|"unlocks: Enables"| product_qualified_sector
  product_aperture_sector -.->|"service: Requires service"| product_qualified_sector
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Aperture sector assembly | equipment / proposed | 2 Reference-locked source + 4 Field amplifier + 4 Field emitter + 1 Aperture sector controller + 2 Return-power guard + 40 Structural steel → 1 Aperture sector assembly · build instantly | Expedition construction kit | Install recovered machines as a sector; requires a surveyed site, grid supply, coolant, relay, tracking and beacon services. Requires: Substation, Heat exchanger, Communication relay, Tracking receiver, Calibration beacon, Surveyed aperture site. |
| Qualified aperture sector | capability / proposed | Operating capability / milestone | — | One installed sector passes ≥100 useful units for 60 s with no thermal trips. Local service failures invalidate its qualification. Requires: Aperture sector assembly. |

## Lightsail assembly

**Research prerequisites:** Large-area nanofabrication. **Cost:** 250 × Industrial dossier + Precision dossier + Systems dossier · 30 s / unit.

Complete research, then pass the sail inspection with 100 accepted panels.

```mermaid
flowchart LR
  tech_nanofab["Large-area nanofabrication [research]"]
  tech_sail["Lightsail assembly [research]"]
  product_industrial_dossier["Industrial dossier [item]"]
  product_precision_dossier["Precision dossier [item]"]
  product_systems_dossier["Systems dossier [item]"]
  product_laboratory["Research laboratory [equipment]"]
  product_sail_dock["Lightsail assembly dock [equipment]"]
  product_steel["Structural steel [item]"]
  product_actuator["Precision actuator [item]"]
  product_photonic_module["Photonic module [item]"]
  product_accepted_part["Accepted precision part [item]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_metrology_gantry["Metrology gantry [equipment]"]
  product_flight_sail["Inspected flight sail [item]"]
  product_sail_panel["Accepted sail panel [item]"]
  tech_nanofab -.->|"prerequisite: Prerequisite"| tech_sail
  product_industrial_dossier -->|"science: 250 consumed"| tech_sail
  product_precision_dossier -->|"science: 250 consumed"| tech_sail
  product_systems_dossier -->|"science: 250 consumed"| tech_sail
  product_laboratory -.->|"service: Researched in"| tech_sail
  tech_sail -.->|"unlocks: Recipe unlock"| product_sail_dock
  product_steel -->|"ingredient: 40 consumed"| product_sail_dock
  product_actuator -->|"ingredient: 8 consumed"| product_sail_dock
  product_photonic_module -->|"ingredient: 8 consumed"| product_sail_dock
  product_accepted_part -->|"ingredient: 16 consumed"| product_sail_dock
  product_construction -.->|"produces: Produced by"| product_sail_dock
  product_generator -.->|"service: Requires service"| product_sail_dock
  product_metrology_gantry -.->|"service: Requires service"| product_sail_dock
  tech_sail -.->|"unlocks: Recipe unlock"| product_flight_sail
  product_sail_panel -->|"ingredient: 100 consumed"| product_flight_sail
  product_photonic_module -->|"ingredient: 20 consumed"| product_flight_sail
  product_sail_dock -.->|"produces: Produced by"| product_flight_sail
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Lightsail assembly dock | equipment / proposed | 40 Structural steel + 8 Precision actuator + 8 Photonic module + 16 Accepted precision part → 1 Lightsail assembly dock · build instantly | Expedition construction kit | 32 power; joins and tensions an inspected flight sail. Requires: Power unit, Metrology gantry. |
| Inspected flight sail | item / proposed | 100 Accepted sail panel + 20 Photonic module → 1 Inspected flight sail / 120 s | Lightsail assembly dock | Consume the listed inputs once per completed recipe. |

## Launch the lightsail

**Research prerequisites:** Planetary aperture + Lightsail assembly. **Cost:** Project conditions.

Proposed final acceptance: 1 inspected flight sail; 4 qualified sectors; live target tracking; ≥400 combined useful units for 120 s under declared drift, with no trips or tracking loss.

```mermaid
flowchart LR
  tech_aperture["Planetary aperture [research]"]
  tech_launch["Launch the lightsail [research]"]
  tech_sail["Lightsail assembly [research]"]
  product_launch_cradle["Lightsail launch cradle [equipment]"]
  product_sail_dock["Lightsail assembly dock [equipment]"]
  product_steel["Structural steel [item]"]
  product_actuator["Precision actuator [item]"]
  product_sector_controller["Aperture sector controller [equipment]"]
  product_construction["Expedition construction kit [equipment]"]
  product_generator["Power unit [equipment]"]
  product_tracking_receiver["Tracking receiver [equipment]"]
  product_launch_acceptance["Integrated launch acceptance [capability]"]
  product_flight_sail["Inspected flight sail [item]"]
  product_qualified_sector["Qualified aperture sector [capability]"]
  tech_aperture -.->|"prerequisite: Prerequisite"| tech_launch
  tech_sail -.->|"prerequisite: Prerequisite"| tech_launch
  tech_launch -.->|"unlocks: Recipe unlock"| product_launch_cradle
  product_sail_dock -->|"ingredient: 1 consumed"| product_launch_cradle
  product_steel -->|"ingredient: 40 consumed"| product_launch_cradle
  product_actuator -->|"ingredient: 8 consumed"| product_launch_cradle
  product_sector_controller -->|"ingredient: 1 consumed"| product_launch_cradle
  product_construction -.->|"produces: Produced by"| product_launch_cradle
  product_generator -.->|"service: Requires service"| product_launch_cradle
  product_tracking_receiver -.->|"service: Requires service"| product_launch_cradle
  tech_launch -.->|"unlocks: Enables"| product_launch_acceptance
  product_flight_sail -.->|"service: Requires service"| product_launch_acceptance
  product_qualified_sector -.->|"service: Requires service"| product_launch_acceptance
  product_tracking_receiver -.->|"service: Requires service"| product_launch_acceptance
  product_launch_cradle -.->|"service: Requires service"| product_launch_acceptance
  product_flight_sail -->|"milestone: Demonstrate"| tech_launch
  product_qualified_sector -->|"milestone: Demonstrate"| tech_launch
```

| Unlock | Type / status | Exact recipe or acquisition | Producer | Operating requirements |
| --- | --- | --- | --- | --- |
| Lightsail launch cradle | equipment / proposed | 1 Lightsail assembly dock + 40 Structural steel + 8 Precision actuator + 1 Aperture sector controller → 1 Lightsail launch cradle · build instantly | Expedition construction kit | 24 power; recovered sail dock is integrated into the release structure. Requires: Power unit, Tracking receiver. |
| Integrated launch acceptance | capability / proposed | Operating capability / milestone | — | Require one inspected sail and four qualified sectors; sustain ≥400 combined useful units for 120 s with no trip or tracking loss, then release the sail. Requires: Inspected flight sail, Qualified aperture sector, Tracking receiver, Lightsail launch cradle. |

