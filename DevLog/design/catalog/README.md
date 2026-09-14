# Design catalog (generated)

Machine-generated progression data. **Do not hand-edit** these files: they are
produced from `src/ui/production-data.ts` and `src/ui/technology-data.ts` by
`npm run docs:progression` (`scripts/generate-progression-docs.ts`). The same data
drives the in-game Technology panel. `../007-technology-tree-design.md` embeds a
generated `<!-- progression:start -->` block from the same script.

| File | Contents |
| --- | --- |
| [009 — Production dependencies](009-production-dependencies.md) | 27 technologies + 99 products = 126 nodes, 551 typed edges; per-technology branch diagrams; research-only resource audit |
| [009-full-production-graph.mmd](009-full-production-graph.mmd) | Whole-graph Mermaid source |

The catalog is a design **preview**: entries are labelled current vs proposed, and
research spending is not implemented. It is not a runtime recipe source.

Regenerate after editing the source data. `node scripts/validate-tranche-a-plan.mjs`
checks tranche-A planning links and cached-reference hashes, not the catalog.
