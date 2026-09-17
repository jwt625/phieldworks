# 025 — Compact UI review

Date: 2026-09-16. Reviewed revision: `8a930de` (clean working tree before review).
Status: review complete; cleanup implementation **not started**.
Request: maximize visible game canvas, pack controls tightly, prefer icons/art to
labels, and remove persistent explanations. This review changes no game code.

## Browser evidence

Vite source build, local headless Google Chrome via Playwright, DPR 1. Fresh world,
assets ready, tutorial dismissed and simulation user-paused for layout measurement.
Fresh-start tutorial captured separately. Dimensions are CSS pixels. Simulation
values can vary with startup timing; these are layout fixtures, not balance tests.

| Viewport | Canvas rectangle | Raw canvas / viewport | Build dock | Sidebar |
| --- | --- | --- | --- | --- |
| 1366 × 768 | 1038 × 250 | **24.7%** | 345 px | 328 px |
| 1440 × 1000 | 1112 × 421 | **32.5%** | 345 px | 328 px |
| 1920 × 1080 | 1592 × 501 | **38.5%** | 345 px | 328 px |
| 1024 × 768 | 734 × 250 | **23.3%** | 331 px | 290 px |

Raw canvas area includes minimap, hints and other overlays; usable exposure is
lower. No baseline claim of measured unobscured area is made.

[Raw rectangles](../evidence/ui-cleanup/baseline.json).
Screenshots: [laptop](ui-cleanup/before-1366x768.png),
[desktop](ui-cleanup/before-1440x1000.png),
[large desktop](ui-cleanup/before-1920x1080.png),
[small desktop](ui-cleanup/before-1024x768.png),
[first launch](ui-cleanup/before-1440-first-run.png).
Visual inspection performed on the laptop and first-launch images; all four
viewport rectangles were browser-measured. Other inspector/technology findings
below are source review, not claims of exhaustive visual approval.

## Findings ranked by impact

| Priority | Finding and evidence | Required disposition |
| --- | --- | --- |
| P0 | `src/style.css`: 79 px header + 79 px resources + 46 px toolbar + 30 px footer, before the dock. Branding, large counters and session actions dominate. | One 40 px status bar; logo mark only; icon/value resources; session actions behind logo/menu. Remove footer band. |
| P0 | Ten `order` entries in `src/main.ts`, but nine palette columns. Fabrication cell occupies a second mostly empty row. Dock is 345 px tall including heading/search/categories/requirements. | One 48 px icon strip; no wrapping or reserved description area. Search/categories become a compact popover. |
| P0 | Persistent sidebar stacks mission, empty inspector, commissioning, ledger and history. Selection competes with a long mission card and needs `revealInspector()` scrolling. | No idle sidebar. Contextual inspector opens directly to selected object's controls. Objectives become one progress chip. |
| P0 | At 1366 × 768 dock bounds end at y=799 but parent main ends at y=738. `.world-panel` clips overflow; body scroll metrics alone do not detect it. | Fit viewport with no clipped controls; test descendant bounds and focus visibility, not only page scrollWidth. |
| P1 | Default hint, dock guidance, objectives, requirements, inspector prose, tutorial and manual repeat instructions. First-run tutorial also covers a large part of the canvas. | Short contextual action cues; explanations available on demand; opt-in guided tour from a small first-run invitation. |
| P1 | `#minimap-wrap` consumes 194 × 139 px and idle legend persists. Renderer draws another sector/zoom ribbon. | Collapsed minimap by default; one shared zoom readout; remove decorative canvas ribbon and idle legend. |
| P1 | Inspector descriptions/requirements precede controls; process forecast is a paragraph; blueprint caveats and diagnostics have long repeated text. | Primary action/status first, compact labeled values, advanced details collapsed. Preserve actionable blockers and qualification semantics. |
| P1 | `src/style.css` layers repeated selectors/media overrides. Existing typography already includes 7–9 px text. | Consolidate scoped HUD rules. Recover space by removing blocks and repetition, not shrinking all text further. |
| P2 | Technology/production dialogs use large headings, legends, detail art and verbose nodes. | Compact their chrome and node summaries after gameplay HUD passes. Preserve roadmap/proposal distinctions. |

## Integration risks for the coding tranche

- `renderUI()` and handlers directly dereference many IDs. Moving a panel requires
  updating render/wiring/lifecycle together; hiding or deleting HTML alone is unsafe.
- Tutorial anchors reference `#map-hint`, `#build-categories`, `#controller` and
  `#commission`. Collapsing those surfaces requires reveal-before-anchor behavior.
- `Renderer.resize()` derives scale from canvas dimensions; it currently runs on
  window resize, home and zoom. Dynamic HUD geometry must preserve camera position
  and pointer mapping; simply increasing canvas size can enlarge sprites instead
  of exposing more world.
- Search currently overrides category visibility independently. Define combined
  filtering while moving it; preserve all ten tools and numeric bindings 1–9.
- Native dialogs own pause reasons and focus restoration. Inspector/popovers should
  remain nonmodal; modal close must not clear a user's explicit pause.
- Renderer labels carry faults/port information. Reduce idle labels without hiding
  failures or connection endpoints. Fabrication-cell placeholder must remain honest;
  use a distinct compact fallback glyph in the palette, never unrelated machine art.

## Recommendation

Schedule the [026 UI tranche](../planning/026-compact-ui-tranche.md) before further
persistent HUD additions. Aim for ≥85% unobscured game area in normal desktop play,
with separate explicit budgets for inspection and guided help. This is a proposed
implementation gate, not a completed result. No simulation, progression, save
format, production art approval or existing performance gate is changed.
