# Design

Authoritative statements of what PHIELDWORKS is and should become. Read before
changing or evaluating gameplay or system behavior.

## Authority

[016](016-coherence-industry-and-lightsail-design.md) is the **current design
authority** and takes precedence over conflicting future assumptions in 000, 001
and 007. [018](018-fusion-energy-roadmap.md) adds the fusion pillar to 016. Where a
document carries a "continuation / superseded" banner, believe the banner.

## Contents

| Doc | What it is | Status |
| --- | --- | --- |
| [000 — Design doc](000-design-doc.md) | Broad vision: wave physics as gameplay, conservation laws, ecology as failure modes, simulation levels, endgame lightsail | Foundational; specifics superseded by 016/018 |
| [001 — Gameplay and frontier experiment](001-gameplay-and-frontier-experiment.md) | Agreed audience, rewards, commissioning loop, first-scenario scope, clarifications | Accepted first-loop decisions; still valid |
| [007 — Technology tree rev B](007-technology-tree-design.md) | Proposed research/production progression, dossier economy, unlock schedule; embeds a generated progression block | Preview catalog; needs deliberate revision in tranche C |
| [016 — Coherence, industry and lightsail](016-coherence-industry-and-lightsail-design.md) | Iteration C: field-assisted manufacturing, local control/qualification, wave transport families, beam/sail tracks, HUD, boundary-port reduction | **Current design authority** |
| [018 — Fusion energy roadmap](018-fusion-energy-roadmap.md) | NIF-inspired fusion: shared platform, shot/plant accounting, equipment and technology additions | Authority for the energy pillar; not implemented |
| [catalog/](catalog/README.md) | Generated item/equipment dependency spec and Mermaid graph | Generated, not authoritative |

## Dig deeper when

- You need exact progression, recipes or dependencies → `catalog/` (regenerated from source data).
- You need current taste, mechanics or constraints → 016, then 018.
- You need original intent or open design questions → 001.
