# 028 — Equipment animation coding and production handoff

Date: 2026-09-16. Parallel to compact UI tranche 026.
Authority: user request and [027 audit](../production/027-equipment-animation-audit.md).
Do not change simulation balance, save schema, ports, footprints, shot cadence or
process timing to make animation easier. Parent orchestrates/art-reviews; coding
agent implements and supplies proof. UI and animation work share renderer ownership:
coordinate commits there; animation work does not modify HUD structure.

## Delivery order and gates

| ID | Priority / owner | TODO | Completion criteria |
| --- | --- | --- | --- |
| AN-01 | P0 coding | Apply reduced motion to legacy cycles and thermal/alarm effects; keep static warning/status visible and preserve paused recipe pose semantics | Focused unit + actual renderer browser checks, no simulation changes |
| AN-02 | P0 asset production/reviewer | Generate reference and dump motion pilots using existing identity; inspect actual alpha, cell boundaries, stable chassis and mechanism differentiation | Unclipped source-over playback at 48/96/256 px on light/dark/terrain; no chassis wobble; explicit reviewed clip/direction/condition list |
| AN-03 | P0 coding, depends AN-02 | Explicitly register/load only accepted clips; source rects and anchors, correct service/activity gating, paused/reduced-motion behavior | In-world evidence shows intended clip/frame under real world state; no promotion of failed variants; r0-only support labeled partial |
| AN-04 | P1 asset production + coding | Replace/fix nine opaque condition families; four directions × intact/off, light, severe, wreck; explicit crops/anchors; source-over rendering | No neighboring sprites/matte on any background; dark native indicators; damage survives work/off/trip transitions; repair restores intact; no mirrored/rotated fake directions |
| AN-05 | P1 production + coding | Complete severe extractor r1–3, damaged assembler r1–3, generator/sentry r1–3 and applicable damaged motion; reference/dump remaining directions and damage variants | Condition/rotation coverage manifest matches actually loaded sources and tested selections; real load/recipe/shot/cooling events drive motion |
| AN-06 | P1 coding/reviewer | Per-kind/direction lamp/port anchors; phase-change/field-throughput/emission feedback for tuner/junction/emitter | No fabricated motor/idle motion or electrical requirements; zero-flow state is visually honest; useful markers survive field-overlay toggle |
| AN-07 | P1 production + coding | Correct cell chassis, register views, derive condition/wreck and real job-stage tooling/workpiece poses | Four valid directions; reserve/setup/expose/finish states follow actual lifecycle; pause/off/trip freeze, reject/rework/scrap identities match state; no unapproved candidate promotion |
| AN-08 | Release validation | Cross-kind/direction/state tests plus actual gameplay visual review | Evidence matrix below complete; remaining partial families explicitly listed, not hidden by fallbacks |

AN-01 and review gallery work can proceed while assets generate. AN-03 cannot promote
an unreviewed source. Authoring code that supports optional clips is not proof that
those clips are loaded or visible. AN-04–07 remain separate full-family tasks even
if a first-direction AN-03 prototype ships.

## Reference / cooled-dump binding contract

- Reference: powered, not tripped/destroyed, and actual reference source activity
  (derived from the existing network/reference world state). Running stabilizer is
  presentation only, not a new oscillator physics model. No field/no power stops it.
  Prefer a stable hold pose; any reset on activity change must avoid chassis jumps.
- Dump: powered cooling only when `equipmentState(...).moving` is true (field present
  or temperature above 30°C). Idle stays still. Receiving field without electricity
  shows UNCOOLED, not spinning fans. Damage retains corresponding damage art; an
  intact pilot must never overwrite damaged/wreck condition fallback.
- Preserve source reference-facing orientation only after comparing to the runtime
  rotation-0 footprint/port map. Candidate filename `r0` alone is not orientation proof.
- Fixed crop registration, same world anchor and scale per frame; no independent
  per-frame stretching. Source rects must avoid neighbors and all sheet edges.
- For first-direction prototype, use frame-zero dark art for idle/off only if that
  source has passed dark-indicator review; otherwise retain existing condition art.
  Inspect transition scale/ground-anchor consistency between fallback and clip.
- Advance by simulation time/activity, not wall-clock. Pause freezes all effects.
  Reduced motion uses a stable pose and nonanimated status/error cues.

## Asset acceptance measurements

Record source hashes, real alpha statistics, actual frame layout, source rectangles,
foundation/port/lamp anchors and intended frame order/period. Inspect outlines at
48/96/256 px; landmarks should remain within 1 screen pixel at 96 px after rigid
translation registration. This tolerance is a gate, not a measured result for
pass07/pass08. If static chassis shape changes, translations cannot “fix” it:
regenerate or use a separately authored mechanism overlay with approved registration.
Check final→first seam and actual mechanism change; four near-duplicates are not a
working cycle. Keep originals and rejected attempts for provenance.

Do not generate a separate bitmap for each combination of power, temperature and
status. Physical damage is authored art; light/alarms/heat/field activity remains
renderer-owned and driven by authoritative state. No auto-loading entire candidate
folders. No new raster generation for a purely procedural status indicator.

## Required validation matrix

For each of ten runtime kinds and rotations 0–3, record loaded art ID, condition
source, frame policy and visual outcome for applicable states:

- Intact idle / active, light / severe / wreck; repair transition.
- Powered / unpowered, no input / blocked / exhausted where meaningful.
- Nominal / hot / trip / destructive heat; no smoke on merely cold damage.
- Field / no field; dump cooling / uncooled; generator load / no load.
- Sentry ready / actual shots; fabrication cell lifecycle and local qualification.
- Pause, reduced motion, load/save presentation reset and different initial phases.

Assert actual draw calls or rendered frame changes in browser tests, not only helper
return values. Capture reference and dump beside terrain at all approved directions,
including on→off and intact→damaged transitions. Test no missing URLs, decode failures,
console errors or opaque backgrounds. Build and relevant unit/browser suites must
pass; parent independently reviews in-game output. Full suite required before merging
combined UI/animation changes. Update 027 with precise promotions and outstanding
failures rather than marking the entire animation system complete.
