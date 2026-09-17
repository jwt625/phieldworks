# 026 — Canvas-first compact UI tranche

Date: 2026-09-16. Status: **specified; U-01 implemented (interim), U-02–U-08 pending**.
Input: user request and [025 browser/source review](../verification/025-compact-ui-review.md).
Role of this handoff: coding goals, TODOs, contracts and independent completion gates.
No implementation is included. This is the next frontend cleanup package alongside
017's gameplay sequence; it does not rename or supersede gameplay tranches A–E.

## Implementation progress

- **U-01 shell and geometry — implemented (interim).** 40 px status bar with
  logo/session menu, icon resource chips and diagnostics badge; persistent sidebar
  removed in favour of a contextual right drawer plus a compact objective chip;
  energy accounting and expedition log moved into diagnostics; `Renderer.fit()`
  frames the settled canvas and `resizeViewport()` preserves world center and
  pixels-per-tile. Evidence: `DevLog/evidence/ui-cleanup/u01-geometry.json`,
  screenshots `DevLog/verification/ui-cleanup/u01-after-*.png`. Raw canvas share
  43.9% / 56.9% / 44.4% / 60.1% at 1366×768 / 1440×1000 / 1024×768 / 1920×1080.
  The ≥85% / ≥82% normal-state budgets are **not** met yet; the build dock, map
  toolbar, minimap and idle hint remain and are owned by U-02–U-04. Automated
  results are not visual approval.
- **U-02 icon build strip and map controls — implemented.** 48 px strip of ten icon
  buttons (art, numeric cost, shortcut badge, fabrication-cell fallback glyph),
  catalog popover with combined category+query filtering, floating 32 px map-tool
  icon row, collapsed minimap toggle. Normal exposed area 85.5–90.6% and active
  build 84.5–90.2%; evidence `DevLog/evidence/ui-cleanup/u02-area.json`.
- **U-03 contextual inspector — implemented.** Status/controls first, collapsible
  ports/routes/requirements, forecast as labeled rows, collapsed control-domain and
  results; expanded state and focused controls preserved across rebuilds.
- **U-04 text reduction and onboarding — implemented.** Start/Skip invitation,
  one-sentence lessons with repointed anchors, non-blocking tutorial panel, removed
  sector ribbon and route legend, hover/selection world labels. Evidence
  `DevLog/evidence/ui-cleanup/u04-onboarding.json`.
- **U-05 input and accessibility — implemented.** Escape priority popover → tool →
  drawer → session, Space/input guards, accessible names and pressed state.
- **U-06 secondary screen density — implemented.** Compact modal chrome, legends
  behind a toggle, footnote details, row-first diagnostics. Technology +26.5% and
  production +23.2% viewport area at 1366×768; evidence
  `DevLog/evidence/ui-cleanup/u06-secondary-screens.json`.
- **U-07 regression evidence — implemented.** New `tests/browser/compact-hud.spec.ts`
  plus updated locators. `npm test` 120, `npm run test:browser` 38/38;
  `DevLog/evidence/ui-cleanup/u07-regression.json`.
- **U-08 independent visual and interaction acceptance — pending (release gate).**
  Automated results and screenshots are not visual approval. Node geometry was not
  resized and independent label-readability review remains.

## Outcome and layout contract

Normal play should look like a game with a thin HUD. Assume desktop mouse/keyboard;
validate 1024 × 768, 1366 × 768, 1440 × 1000 and 1920 × 1080 at DPR 1, with a DPR 2
smoke check. Mobile redesign is outside this tranche. Do not require clarification
for routine icon or spacing choices; validate them against the budgets below.

- Top status bar: **40 px maximum**, one row. Existing logo mark is the menu opener.
  Stock, power demand/supply, target field and crystal use distinguishable icons +
  numbers. Keep pause/speed and a diagnostics badge directly accessible. Manufactured
  total, elapsed time, version, save/load/new, tutorial and manual live in the menu
  or contextual detail. Technology retains a direct icon entry.
- Bottom build strip: **48 px maximum**, one row, intrinsic item widths. All ten
  current machines directly available at ≥1024 px; art/glyph, numeric cost and
  optional tiny shortcut badge, no persistent names or descriptions. Include a
  search/catalog opener. Overflow at narrower/zoomed layouts scrolls inside the strip.
- Map tools: one tightly grouped 32 px icon row floating at the upper left below
  the status bar; ≤400 px wide. No full-width reserved toolbar band. Preserve inspect,
  field/material/power routing, module selection, blueprint, field view, grid and home.
- Objective: one compact progress/action chip, ≤220 × 28 px, upper right below the
  status bar. Expand for checklist and commissioning; never a persistent mission card.
- Minimap: collapsed by default, reachable in one click. Expanded map + zoom controls
  fit within 160 × 116 px. No separate footer or renderer sector banner.
- Inspector: absent with no selection. One contextual right-side drawer, ≤280 px
  wide on standard desktops, ≤256 px at 1024 px. Height fits the available game area;
  internal scroll only. Main action and critical status appear first. Drawer overlays
  canvas without recentering it; optional expansion for advanced details is explicit.
- Spacing: 4 px between adjacent controls, 8 px between groups, 6–8 px panel padding.
  Buttons normally 28–32 px square, never below 24 × 24 px interactive bounds. Standard
  labels/readouts 11–12 px; only supplementary shortcut badges may be smaller (≥9 px).
  Under browser zoom, retain readable controls and accessible internal overflow.
- Interpret “logo first” as existing brand mark, machine sprites and consistent
  action icons. Do not generate new bitmap art or a new visual identity for this work.

Placement schematic (not a pixel-approved design):

```text
┌ logo/menu  stock  power  target  crystal    tech  issues  pause speed ┐ 40 px
│ tools                                         objective / map icon │
│                                                                    │
│                       GAME WORLD                    [inspector     │
│                                                      on selection] │
│                                                                    │
└ machine icons + costs (all 10)                       catalog/search ┘ 48 px
```

## Area and text acceptance budgets

Use `viewportArea = innerWidth * innerHeight`. Raw canvas area is its CSS rectangle
clipped to the viewport. **Exposed area** subtracts the union of visible HUD/panel
rectangles intersecting that canvas (no double counting). Count translucent panels
at their full bounds, including toolbars, objective, minimap, tooltips, tutorial,
inspector and toast. Include any surviving canvas-painted HUD ribbon; ordinary
world objects, fault markers and port labels are game content, not HUD rectangles.
A canvas behind opaque UI does not count as exposed game area.

| State | ≥1366 px width | 1024 × 768 | Conditions |
| --- | --- | --- | --- |
| Normal idle / active build or route | ≥85% exposed | ≥82% exposed | No selection drawer, minimap collapsed; include persistent active-tool cue |
| Inspecting / commissioning | ≥65% exposed | ≥58% exposed | One drawer, minimap collapsed |
| First-run invitation | ≥82% exposed | ≥78% exposed | Invitation ≤260 × 64 px; start/skip choices |
| Explicit guided lesson | ≥72% exposed | ≥68% exposed | ≤280 × 160 px lesson; opens required controls only |

Expanded minimap must cost ≤3 percentage points at desktop sizes; may collapse when
another drawer opens. Modal manual/technology/session and transient tooltips/toasts
are exempt from normal-state thresholds, but capture and report their occlusion.
Guided lessons that need a drawer use the inspector threshold instead; report the
combined state explicitly. No body scrollbars, clipped actions, or overlapping hit
targets in required viewports. Test browser zoom at 125% for reachability.

No persistent instructional paragraphs in default gameplay. Objective ≤8 words;
active-tool cue ≤8 words; button labels normally ≤2 words. Tooltips can include a
name, shortcut, cost and one concise reason/requirement. Details/manual can retain
necessary explanations. Do not truncate actionable errors merely to meet a word
count. Keep units and clear labels on phase, dose, power, health and qualification.

## Coding packages

Each package needs a focused implementation commit, completed checklist, validation
results and evidence links. One owner integrates shared `main.ts` / `style.css`
changes. Sequence U-01 → U-02 → U-03 → U-04 → U-05 → U-06 → U-07; U-08 is the final
independent release gate. Do not mark a task complete from screenshots alone.

### U-01 — Shell and geometry (P0)

Goal: recover the screen area currently consumed by permanent framing.
Files: `src/main.ts`, `src/style.css`, `src/renderer.ts`, `src/ui/minimap.ts` as needed.

TODO:
- Replace header/resource/footer bands with contracted status bar; preserve live
  status/error visibility and all session actions through the menu.
- Remove idle sidebar column and default empty-inspector/mission blocks. Add drawer
  mount and compact objective entry; retain working access to existing content.
- Consolidate conflicting HUD/media rules into scoped styles and shared size values.
- Keep world coordinates under pointer correct after resize and drawer changes.
  Preserve world center and pixels-per-tile on viewport resize; explicit Home/Fit
  are the actions allowed to reframe. Resize backing store for DPR appropriately.

Done: shell heights pass; no null-ID render exceptions; drawer toggles preserve
camera; world pan/zoom, fit and port hit-testing work at all required sizes. Interim
area may still fail until U-02, but no unreachable legacy function is accepted.

### U-02 — Icon build strip and map controls (P0)

Goal: eliminate the 345 px build dock and large textual toolbar.
Files: `src/main.ts`, `src/style.css`, `src/ui/catalog.ts`, existing UI asset bindings.

TODO:
- Single-row 48 px strip, all ten items including an identifiable fabrication-cell
  fallback. Preserve stable shortcuts 1–9; do not invent a conflicting tenth shortcut.
- Show numeric costs/affordability and selected state without name/cost sentences.
- Move categories/search/requirements into a dismissible anchored catalog popover;
  filter by category AND query, clear predictably, preserve keyboard navigation.
- Replace map-tool text with distinct symbols, accessible names and state indicators.
  Provide names/shortcuts/details on hover AND keyboard focus; handle disabled item
  explanations with a focusable wrapper or equivalent accessible mechanism.
- Remove reserved requirements area, dock heading and repeated logistics guidance.

Done: all machines and three route types can be chosen/placed with pointer and
keyboard; no wrapping; normal/build/route area budgets pass; filtered results remain
correct across category changes, query clearing and selection. HUD clicks never
place equipment or start routes behind the control.

### U-03 — Context inspector and objective workflow (P0)

Goal: show the control needed now without scrolling through unrelated panels.
Files: `src/main.ts`, `src/ui/{process-inspector,domain-inspector,blueprint-inspector,operations}.ts`.

TODO:
- Selection opens drawer directly to selected entity/route/deposit/creature/module.
  Clear selection closes it. Close button keeps selection highlight; selecting an
  object again reopens it. Avoid automatic reopening on each 150 ms UI update.
- Equipment summary: icon/name, state, temperature/integrity and relevant primary
  controls; ports/routes/requirements under compact expandable groups.
- Tuner phase and cell run/auto-tune/test controls stay directly available. Replace
  forecast paragraph with labeled useful dose, guard dose/fraction and predicted
  outcome. Keep units/thresholds accessible and distinguish forecast from result.
- Move objective checklist/frontier commissioning into objective drawer mode. Preserve
  frontier vs local cell qualification, test progress/cancel and blueprint gates.
- Put energy accounting/history in diagnostics or operations. Blueprint drawer keeps
  external-service resolution and disconnected-deployment qualification warning.

Done: inspecting requires no scroll past mission content; main controls appear in
first drawer screen at 768 px high; advanced rows accessible internally; drawer
area budgets pass. Run/rework/continuous, assignments, qualification, repair/recover,
route editing, capture/deploy and disabled reasons retain behavior. Live rendering
must not reset expanded state, select values, focused controls or slider drags.

### U-04 — Text reduction, hints and onboarding (P1)

Goal: teach on demand while keeping the world visible.
Files: `src/ui/tutorial.ts`, `src/main.ts`, `src/renderer.ts`, `src/style.css`.

TODO:
- First launch offers small Start tour / Skip invitation. Preserve skip persistence
  and replay; no automatic large welcome paragraph. Tour steps use one action sentence
  plus progress/next/back; extended rationale moves to manual/details.
- Reveal hidden controls before anchoring tutorial; handle offscreen anchors and
  focus return. Update references to controls removed from the header.
- Show only active placement/routing cues (e.g. “Choose destination port”). Remove
  idle help sentence, duplicate zoom/sector ribbon and permanent route legend.
- Default resource names and routine world labels appear on hover/selection or an
  explicit overlay; faults/attacks and relevant connection port labels stay visible.
- Compact minimap with visible toggle and accessible zoom/fit; dismiss transient hints
  without dismissing critical error state.

Done: invitation/tour area budgets pass; replay covers every lesson with visible
anchors; essential actions remain discoverable without the tour. No instructional
paragraphs remain in default gameplay. Critical fault, warning and blocker messages
are still available and distinguishable without color alone.

### U-05 — Consistent input, accessibility and session behavior (P1)

Goal: density does not break control or make icons inscrutable.
Files: affected UI modules, pause-state integrations, browser tests.

TODO:
- Give every icon-only button a meaningful accessible name and hover/focus tooltip;
  use aria-pressed/selected/expanded as appropriate. Keep visible keyboard focus.
- Define Escape priority: close modal using existing modal behavior; otherwise close
  topmost transient popover; cancel active build/route/module operation; close drawer;
  finally open session. One press performs one action. Restore focus to a valid opener
  or canvas if that opener no longer exists.
- Text/select inputs consume typing/arrows without triggering world shortcuts.
  Enter/Space on controls never place objects accidentally. Popovers/drawers do not
  pause simulation; true modals preserve independent user/modal pause reasons.
- Ensure warning badge remains visible and offers one-click access to issues; retain
  diagnostics Locate and copy report, manual access, save/load and reset confirmation.

Done: keyboard-only build → route → inspect/tune → menu round trip passes; interactive
bounds ≥24 px, focus/tooltips visible at edges, no click-through, pause ownership
regressions or focus loss during refresh. Hidden panels are absent from tab order.

### U-06 — Secondary screen density (P2, after gameplay gates)

Goal: apply the same hierarchy to technology, production, diagnostics and operations.
Files: `src/ui/{technology,production-graph,operations}.ts`, `src/style.css`.

TODO:
- Reduce modal header/tool/legend bands; put legends/help behind an explicit affordance.
- Graph nodes show icon, short name and status; detail view carries recipes/prose.
  Update node geometry AND edges/hit areas together; do not merely shrink CSS boxes.
- Use compact detail sections, remove always-visible hero art where it displaces
  controls, and preserve all prerequisite/search/filter/navigation functionality.
- Diagnostics rows lead with severity/object/action; descriptions expand when needed.
  Keep runtime-vs-design-preview and proposal status unmistakable.

Done: technology/production graph viewport gains ≥15% relative area at 1366 × 768
versus a baseline captured by this task under identical active tab/detail state.
No clipped graph labels/edges, unreadable statuses or missing recipes; modal keyboard
navigation, close/focus return and pause behavior pass. This gate is a future task
measurement; 025 did not measure secondary-screen areas.

### U-07 — Regression evidence (P1)

Goal: prove both usable space and retained gameplay.
Files: relevant `tests/browser/` specs, new focused layout/input coverage, DevLog evidence.

TODO:
- Add meaningful area/overflow assertions using the exposed-area definition above.
  Capture raw rectangles and overlay union; do not assert CSS constants alone.
- Capture before/after at fixed viewport, world, camera zoom and tutorial state;
  disclose camera differences where new initial framing is intentional. Also capture
  selected tuner/cell, active route, module blueprint, objectives, diagnostics and tour.
- Update role/name-based locators for icon controls; preserve behavioral assertions.
- Run `npm run build`, `npm test`, `npm run test:browser`; investigate failures.
  Include menus, interactions, outpost, precision-cell, precision-expedition,
  local-blueprints and technology scenarios; retain existing art/state coverage.
- Record a browser console/page-error check and resize/DPR/125% zoom smoke results.

Done: all suites pass or pre-existing failures are reproduced on the base revision
and explicitly reviewed; no new failures accepted. Store machine evidence under
`DevLog/evidence/ui-cleanup/`; selected review screenshots under
`DevLog/verification/ui-cleanup/`, routine test artifacts in ignored `test-results/`.
No simulation benchmark rerun required unless simulation/frame behavior changes.

### U-08 — Independent visual and interaction acceptance (release gate)

Validator checks the running implementation, not only author screenshots:
- Verify every area budget from measured evidence and inspect all required viewports.
- Play build → wire → field-link → tune → qualify → capture/deploy; exercise cell
  workflow and deliberately inspect an error without relying on tutorial prose.
- Confirm icons are distinguishable, essential numbers readable, repeated text gone,
  screen edges unclipped, empty space reclaimed, and increased canvas reveals useful
  terrain rather than merely scaling the same cropped scene larger.
- Record pass/fail per U-01–U-07, remaining defects with severity, screenshots and
  measured before/after table in a dated verification follow-up.

Tranche complete only when U-01–U-08 pass. Automated results are not visual approval.
Existing simulation performance, art promotion and unprompted human-playtest gates
remain separate and must not be reported as resolved by UI cleanup.
