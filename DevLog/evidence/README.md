# Evidence

Raw machine-readable evidence for claims made in the DevLogs: benchmark reports,
performance tables, solver measurements and planning-validation output. JSON only;
human-readable interpretation belongs in `../verification/`,
`../implementation/004` or the relevant feature log.

| File | Source |
| --- | --- |
| `012-p0-solver-after.json` | `npm run bench:review` after the P0 solver remedy |
| `013-performance-baseline.json`, `013-state-and-render-baseline.json` | 013 capacity/render baseline |
| `015-connected-world.json`, `015-connected-browser.json` | Connected step and real-app pacing (P0.1 baseline) |
| `015-p0.1-connected-step.json`, `015-p0.1-connected-browser.json` | P0.1 remedy measurements |
| `tranche-a-planning-validation.json` | `scripts/validate-tranche-a-plan.mjs` output (planning, not gameplay) |
| `tranche-a/connected-benchmark.json`, `tranche-a/performance-review.json`, `tranche-a/two-cell-benchmark.json` | A-12 same-machine benchmarks |
| `tranche-a-alpha-correction.json`, `tranche-a-asset-validation.json` | Precision-cell candidate asset validation |

Convention: `evidence/<id>-<topic>.json` for handoff evidence. Do not commit
`test-results/` (gitignored); reference screenshots there by filename.
