# PHIELDWORKS DevLog

This directory is the project's written memory: design authority, implementation
history, asset production, forward plans and verification. Documents are grouped
by **role** into folders, and every folder has a `README.md` briefing so you can
judge whether to open its contents.

Numeric prefixes (`000`–`022`) are stable chronological **IDs**, not folder
ordering. Cross-references and external links use them, so keep them stable.

> **If you read only one file, read [`briefing.md`](briefing.md).** It is the
> current-state snapshot: implemented vs planned, the authority chain, and the
> open gates.

## Folders

| Folder | Answers | Start with |
| --- | --- | --- |
| [`design/`](design/README.md) | What the game is and should become | 016, 018 (current authority) |
| [`implementation/`](implementation/README.md) | What actually exists and how it behaves | 004 (journal), 003 |
| [`production/`](production/README.md) | Asset/animation contracts, history and review status | 014, 008 |
| [`planning/`](planning/README.md) | What to build next, in what order, with what contracts | 017, `tranche-a/` 019–021 |
| [`verification/`](verification/README.md) | Independent findings that constrain later work | 013, 015 |
| [`evidence/`](evidence/README.md) | Raw machine-readable benchmark/report JSON | — |
| [`references/`](references/README.md) | Cached external sources behind decisions | `tranche-a/` |

## Authority chain

When documents disagree, the more specific and newer accepted direction wins:

```
000 vision
  → 001 accepted first-loop decisions
  → 007 progression rev B
  → 016 CURRENT design authority (iteration C)
  → 018 fusion extension
  → 017 current delivery sequence
  → 019–022 tranche-A plan, contracts, tasks, assets
```

Historical implementation evidence (`003`–`006`, `010`–`011`, `013`–`015`) stays
valid at its recorded checkpoint even where a later design supersedes its
assumptions. If a document carries a "continuation / superseded" banner, believe
the banner.

## Reading paths

- **Picking up a coding task:** `briefing.md` → `planning/README.md` → your tranche doc.
- **Design question:** `design/README.md` → 016 / 018.
- **Generating or integrating art:** `production/README.md` → 014 tracker → the relevant spec.
- **Review / verification:** `verification/README.md` → 013 / 015.
- **Understanding a shipped behavior:** `implementation/004` journal, then `implementation/features/`.

## Conventions

- Keep IDs stable; add a dated follow-up rather than rewriting prior findings.
- Automated assertions are not visual approval. Measurements state their fixture.
- Raw evidence lives in `evidence/`; do not commit `test-results/` (gitignored).
