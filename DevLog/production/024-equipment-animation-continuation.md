# Equipment animation continuation — pass 07

> Gameplay integration (2026-09-14): five selected clips now load and render in the actual game for rotation 0. Two superseded variants remain review-only. These are prototype promotions with residual art polish, not completed four-direction families.

2026-09-14. User authorized continued generation in priority order and progress tracking.

## Execution

Start with damaged extractor/assembler operation, then generator and sentry, then missing starter mechanisms and fabrication-cell family. Work one direction at a time: earlier 4×4 sheets retain camera/chassis drift. Preserve generated originals and exact prompts; do not promote unregistered candidates.

- Inspected extractor severe v2: weak damage distinction, inconsistent facing across frames, opaque background.
- Prepared a four-frame single-direction severe extractor pilot with fixed chassis and explicit persistent damage. Exact request: [pass-07 jobs](../../assets/production/pass-07/jobs.json).
- Generated first-direction pilots for all five priority clips, plus two focused corrections; see live ledger below. Other directions and runtime promotion remain open.

## Acceptance gates

Measure real alpha, crop margins, frame dimensions, then inspect damage readability, camera identity and stable base/port landmarks. Source measurements do not establish runtime approval. Register and review at 48/96 px before event-bound integration. Power/status/thermal signals remain renderer-owned.

## Remaining priority queue

1. Severe extractor and light/severe assembler operation: correct and register each direction.
2. Generator operation and sentry recoil: correct/register, bind actual load/shot events.
3. Reference station, phase tuner, emitter, cooled dump mechanisms.
4. Fabrication cell: directional chassis, damage/wreck, tooling poses, workpiece registration.

Existing README.md working-tree changes predate this pass.
## Review findings and continuation

- Seven original sources saved with exact prompts, references, dimensions, hashes and per-cell alpha bounds. All are single-direction pilots; r0 denotes reference-facing direction, not verified world rotation.
- Severe assembler v4 derives directly from light v3 and restores its left-hopper/right-arm layout. Severe v3 is retained as a superseded cross-condition mismatch.
- Inline image display exposed RGB background data even where alpha was zero. Initial assembler background-failure interpretation was corrected after pixel inspection and browser compositing; v4-alpha was an unnecessary extraction attempt, retained for provenance.
- Ordinary browser alpha compositing shows clean surrounding backgrounds at preview size. Fine original-resolution edge artifacts, painted generator display, anchor drift and fixture/pose continuity remain separate review issues.
- Preview tooling provides 48/96/256 px playback, pause/step, reduced-motion default and light/dark/terrain-color backgrounds. Proposed equal-grid crops are explicitly unregistered.
- This pass does not complete four-direction state families. Before expanding: darken generator display; measure base/port anchors; inspect each loop and end pose; correct drift; then generate remaining directions from the accepted pilot chassis. Missing reference/tuner/emitter/dump mechanisms and fabrication-cell family remain queued.
- Verification: all seven images decode; 21 preview canvases render; pause holds pixels and step advances them; no browser page errors. Inspected light-background previews for the five clip families and corrected severe assembler, with dark/terrain captures also saved under ignored `test-results/pass-07/`. All seven source hashes, prompt sidecars and reference paths verified; `git diff --check` passes. See [browser record](../../assets/production/pass-07/browser-review.json).
- The initial generation pass did not change runtime selections. The subsequent integration below supersedes that checkpoint.

## Gameplay integration

User explicitly requested hooking the assets into actual gameplay.

- Explicit loader selections: severe extractor v3, light assembler v3, severe assembler v4, generator v3, sentry v3. Unselected correction attempts are excluded.
- New `src/equipment-animation.ts` binds the five clips by machine kind, integrity and rotation. Only rotation 0 is promoted; other directions continue using their existing separately drawn views.
- [Runtime crop metadata](../../assets/production/pass-07/runtime-clips.json) defines per-frame source rectangles and translated foundation anchors. Reproduce with `python3 assets/tools/register_pass_07.py`, then `python3 assets/tools/review_pass_07.py`. Bounding measurement ignores alpha below 128 and adds three pixels of padding; the source PNGs are unchanged. This is prototype crop/translation registration, not a claim that all ports meet the final one-pixel tolerance.
- Renderer uses ordinary source-over alpha and preserves source aspect ratio; it does not use the older dark-matte lighten blend for these clips.
- Extractor/assembler motion follows recipe progress, including all six assembler frames. Damaged chassis stays damaged when stopped or unpowered. Wrecks use existing condition art.
- Generator moves only under an actual connected load. Unpowered/tripped generator and sentry use dark condition art. Generator's baked cyan display remains visible in its powered prototype; final artwork correction is still open.
- Sentry recoil starts only while actual ecology shot records exist. Ecology currently emits a shot every simulation step during sustained fire, so the renderer tracks the active burst with world time and resets at rest. This adds no combat damage or attack-rate changes.
- Simulation pause holds these frames; reduced-motion mode selects frame zero. Loading a world clears presentation burst history.
- Actual gameplay screenshot: `test-results/pass-07-gameplay.png` (ignored). Viewed in-world beside terrain and existing machines; no opaque background rectangles. Fine edges, exact port alignment and remaining directions remain polish/backlog items.

- Integration validation: **117 unit tests, 5 targeted browser scenarios, production build and diff check pass.** [Saved validation record](../../assets/production/pass-07/gameplay-validation.json). Browser tests observe actual gameplay draw calls and state transitions, not just the gallery.

<!-- live-ledger -->

## Saved-source ledger

**7 saved; 7 with real alpha; 5 runtime prototype promotions.**

[Interactive motion review](../../assets/production/pass-07/index.html) · [Measurements](../../assets/production/pass-07/review.json)

| Source | Alpha | Review |
| --- | --- | --- |
| [extractor-severe-r0-cycle-v3](../../assets/production/pass-07/extractor-severe-r0-cycle-v3.png) | 56.0% | runtime-prototype: Consistent facing and visible broken right housing. Colored edge speckles remain. Drill motion subtle, loop and alignment need review. |
| [assembler-light-r0-cycle-v3](../../assets/production/pass-07/assembler-light-r0-cycle-v3.png) | 56.9% | runtime-prototype: Pixel inspection confirms real transparent background; RGB backdrop shown by inline preview was misleading. Six poses preserve facing. Fixture/workpiece changes and base registration still need review. |
| [assembler-severe-r0-cycle-v3](../../assets/production/pass-07/assembler-severe-r0-cycle-v3.png) | 57.9% | needs-cross-condition-correction: Real alpha confirmed. Six poses preserve facing and exposed chassis. Hopper arrangement differs from light pilot; cross-condition identity and frame anchors need correction. |
| [generator-r0-cycle-v3](../../assets/production/pass-07/generator-r0-cycle-v3.png) | 60.2% | runtime-prototype: Visible keyed rotor rotation with consistent facing. Cyan display remains baked in despite dark-lamp request; edge speckles and anchor alignment need correction/review. |
| [sentry-r0-fire-v3](../../assets/production/pass-07/sentry-r0-fire-v3.png) | 59.7% | runtime-prototype: Clear extend/recoil/return poses, dark display and consistent aim. Colored edge speckles remain. Base and barrel alignment and actual-shot binding unverified. |
| [assembler-light-r0-cycle-v4-alpha](../../assets/production/pass-07/assembler-light-r0-cycle-v4-alpha.png) | 57.1% | needs-registration-and-mechanism-review: Pixel inspection confirms real transparent background; RGB backdrop shown by inline preview was misleading. Six poses preserve facing. Fixture/workpiece changes and base registration still need review. |
| [assembler-severe-r0-cycle-v4](../../assets/production/pass-07/assembler-severe-r0-cycle-v4.png) | 56.7% | runtime-prototype: Correction restores left hopper/right arm layout shared with light pilot. Missing right enclosure panel persists across six poses. Base/port landmarks and fixture changes still require registration and motion review. |
