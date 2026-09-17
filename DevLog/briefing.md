# PHIELDWORKS — current briefing

Last updated: 2026-09-16 (UI review/planning added; implementation snapshot unchanged). This is the orientation file. It summarizes the current
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

## Frontend cleanup queued

- [025 UI review](verification/025-compact-ui-review.md): measured raw canvas share
  is 24.7% at 1366 × 768 and 32.5% at 1440 × 1000.
- [026 compact UI tranche](planning/026-compact-ui-tranche.md): icon-first HUD,
  single-row build strip, contextual inspector, text reduction and independent
  validation. **U-01–U-07 implemented and validated** (`npm test` 120,
  `npm run test:browser` 38/38; evidence under `DevLog/evidence/ui-cleanup/`).
  **U-08 independent visual/interaction acceptance is pending** — automated results
  are not visual approval.

## Parallel equipment animation work

- [027 audit/pass08](production/027-equipment-animation-audit.md) covers all ten
  equipment kinds, new reference/cooling sources and existing condition-art defects.
- [028 handoff](planning/028-equipment-animation-handoff.md) tracks generation,
  registration, event bindings and cross-state validation separately. Refer to 027
  for current promotions and validation; full direction/condition coverage remains open.

## Where to go next

- **Connected route kit validated:** [033](verification/033-connected-route-kit-review.md)
  records 18 compact sprites with exact edge matches and native/PNG assembly checks.
  Pass10 includes atlas, metadata and a working gallery. Actual runtime machine-port
  mapping, full gameplay integration and larger swept parts remain pending.
- **Wave routing art:** [031](production/031-wave-logistics-assets.md) plans WA-01–08;
  pass09 contains basic/precision elbow and crossing pilots plus a crossing correction.
  Source alpha and small-size gallery inspected; geometry registration and runtime
  promotion remain pending.
- **Early-game physical routing:** user selected automatically placed, individually
  upgradeable straights/elbows and explicit junctions. [029 coding handoff](planning/029-early-game-wave-logistics-handoff.md)
  specifies physical construction, manufactured upgrades and local cell belts across
  R-01–R-10. [030](verification/030-wave-logistics-validation.md) is the parent
  multimodal validation protocol. Both are planning only; implementation and review pending.
- Concrete tasks: [`planning/tranche-a/021`](planning/tranche-a/021-tranche-a-coding-tasks.md).
- Everything else: [`README.md`](README.md).
