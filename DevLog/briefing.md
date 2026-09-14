# PHIELDWORKS — current briefing

Last updated: 2026-09-13. This is the orientation file. It summarizes the current
state; the linked documents are authoritative for detail.

## What the project is

A desktop-browser factory-building experiment where an industrial network is also
a coupled wave system. First playable: build a second emitter branch, tune phase,
clear a resource frontier, commission a reusable outpost. Long-term: field-assisted
manufacturing, fusion energy and a beam-driven lightsail.

## Authority

- **Design:** [016 coherence, industry and lightsail](design/016-coherence-industry-and-lightsail-design.md),
  extended by [018 fusion energy](design/018-fusion-energy-roadmap.md).
- **Delivery sequence:** [017 industrial gameplay tranches](planning/017-industrial-gameplay-tranches.md).
- **Current work package:** [tranche A](planning/tranche-a/README.md) (019–022).

## Implemented (verify against code, not this file)

- Renderer-independent fixed-step world: economy, belts with discrete packets,
  grid routes, connected-component power, diagnostics.
- Complex-amplitude port network: splits/combines, reflections, loss, thermal
  drift, bounded phase control, target damage, commissioning.
- Moving wildlife, gated defense, onboarding, menu shell, keyboard placement.
- **Tranche A:** local target/domain/reference/qualification records and save `v4`
  (v1–v3 migration); conserved two-zone process delivery; local control and
  signature-based qualification; atomic process lifecycle with one rework;
  buildable `fabrication-cell`; process/domain inspectors; selection blueprints.
  Automated checkpoint: **115 headless tests, 27 browser scenarios, build pass**.

## Placeholder / not implemented

- The fabrication cell renders a labeled `FAB CELL / PLACEHOLDER`; reviewed cell
  art (A-09–A-11) is not promoted.
- Research spending, the full 27/99 catalog runtime, fusion and sail mechanics are
  **design previews only**.
- Most animation candidates are opaque/incomplete and not world-integrated.

## Open gates

- ≤16 ms p95 world-step target unmet for control-on and 16-group connected cases
  ([015](verification/015-connected-world-validation.md)).
- Cell-art visual review, condition-sheet registration, event bindings
  ([011](production/011-equipment-state-and-damage-animation.md),
  [014](production/014-asset-production-tracker.md)).
- Unprompted human first-expedition playtest ([013](verification/013-verification-review.md)).

## Where to go next

- Concrete tasks: [`planning/tranche-a/021`](planning/tranche-a/021-tranche-a-coding-tasks.md).
- Everything else: [`README.md`](README.md).
