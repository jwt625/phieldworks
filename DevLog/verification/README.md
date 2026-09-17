# Verification

Independent review findings and measurements that constrain later work. Treat these
as the audit trail: a passing automated test is not visual approval, and a reviewed
failure is not fixed without code plus evidence.

| Doc | What it establishes |
| --- | --- |
| [030 — Wave logistics validation](030-wave-logistics-validation.md) | Parent multimodal review protocol for 029; all gates pending, no implementation review claimed |
| [025 — Compact UI review](025-compact-ui-review.md) | Current browser layout measurements, screenshots, ranked cleanup findings and integration risks; implementation pending |
| [013 — Verification review](013-verification-review.md) | Visual/complex review of outpost screens and the state lab, overload experiment, capacity/performance baseline; P0 remedy follow-ups |
| [015 — Connected-world validation](015-connected-world-validation.md) | Connected-world step and frame-pacing tables, the failed ≤16 ms p95 gate, P0.1 remedy results, remaining levers |

## Open gates (as of 2026-09-13)

- ≤16 ms p95 world-step target unmet for control-on and 16-group connected cases (`015`).
- Cell-art visual review, condition-sheet registration and event bindings (`../production/011`, `../production/014`).
- Unprompted human first-expedition playtest (`013`, `../planning/017`).

Evidence files referenced here live under `../evidence/`.
