# 027 — Equipment animation and state audit / pass 08

Date: 2026-09-16. Parallel effort to [026 compact UI](../planning/026-compact-ui-tranche.md).
User priorities: reference station and cooling facility, then audit every equipment
kind for missing motion, condition/status art and implementation. “Cooling facility”
maps to the current `dump` / Cooled dump; no new gameplay equipment is introduced.

## Scope and evidence

All ten current runtime equipment kinds were checked against `APPEARANCE`, loader
roots, renderer fallbacks, state resolver, registered clips and candidate directories.
A separate read-only audit agent cross-checked the implementation. It ran eight
focused state/animation tests successfully; passing tests do not prove art completion.
The [source measurements](../../assets/production/pass-08/existing-assets-audit.json)
record actual dimensions, alpha and hashes. Reference/dump original sprites and
condition sheets were visually inspected. Existing visual defects are also recorded
in [013](../verification/013-verification-review.md). This is not a new exhaustive
visual pass over every condition/direction combination.

## Coverage matrix

| Kind | Actually loaded motion | Condition/status coverage | Remaining work |
| --- | --- | --- | --- |
| Extractor | Intact/light: legacy four-direction cycles; severe: pass07 r0 | 4×4 condition sheet; work/service/thermal effects | Severe r1–3; alpha/crop repair of legacy art |
| Assembler | Intact legacy four-direction; light/severe pass07 r0 | 4×4 condition sheet; starvation/service/thermal effects | Damaged r1–3; legacy alpha/registration |
| Generator | Intact pass07 r0, actual connected-load driven | 4×4 conditions; load/idle/service/thermal effects | r1–3 and damaged motion; remove baked display light |
| Reference station | **None at audit baseline** | Static four-direction sheet + conditions; field/power state | New operation source and explicit activity binding; pass08 candidates below |
| Junction | No mechanism cycle; stationary chassis is appropriate | Conditions and actual field state | Registered state art; optional flow effect, no invented motor/power requirement |
| Phase tuner | No mechanism cycle | Conditions and field state | Phase-change/field-driven feedback, not arbitrary idle movement |
| Field emitter | No mechanism cycle; field-overlay target beams exist | Conditions, field and thermal state | Readable actual emission feedback without implying emission at zero power |
| Cooled dump | **None at audit baseline** | Conditions; resolver already computes cooling activity | Fan source + powered cooling binding; pass08 candidates below |
| Sentry | Intact pass07 r0 recoil, actual shot driven | Conditions and combat/service/thermal effects | r1–3 and damaged recoil |
| Fabrication cell | **Placeholder only** | No generated runtime condition family; generic status effects | Correct/approve four-direction chassis, damage/wreck, job-stage tooling and workpiece registration |

Runtime r0 means only rotation 0 is integrated, not a completed direction family.
`generator-cycle-v1` and `sentry-fire-v1` are named in renderer fallback logic but
exist only under excluded candidate directories. They are not loaded four-direction
animations. The five explicit pass07 promotions remain prototypes with documented
alignment/polish limitations. Full 99-product design catalog is not 99 implemented
machines; this audit does not count speculative equipment as runtime omissions.

## State-art and implementation defects

1. **All nine existing condition sheets are RGB, 1254 × 1254, with no alpha.** They
   render using `lighten`, not normal transparency. Equal 4×4 crops are unregistered;
   `frame-map.json` covers only intact extractor/assembler cycles. Earlier review
   found neighboring-row fragments on reference, assembler and extractor. File
   presence does not satisfy the condition-art production gate.
2. Status lamps use a shared generic screen-relative location, not per-machine,
   per-direction authored anchors. A dark overlay may not cover the actual baked lamp.
3. Reference, junction, tuner and emitter can report `work='running'` while
   `moving=false`. Reference motion needs an explicit real-source activity rule;
   do not blindly turn on a timer for every powered machine.
4. Dump activity already respects outage/trip/wreck and follows field presence or
   temperature >30°C when powered. Unpowered field absorption must remain UNCOOLED.
5. Reduced motion originally covered only pass07 clips; legacy recipe cycles and
   thermal/alarm effects bypassed it. A coding agent is addressing this independently.
6. Damaged recipe frames intentionally hold recipe progress during power loss.
   Do not reset to pristine art or change production state to simplify animation.
7. Fabrication-cell r3 candidates in pass05 failed transparency/geometry checks.
   Generate/register a stable chassis before deriving motion or condition variants.

## Pass 08 generation

Built-in `image_gen`; existing source sprites establish identity. Original outputs
are copied unchanged into `assets/production/pass-08/`; exact prompts, reference
paths, hashes and tool provenance accompany each `.png.source.json`.

First pilots target intact reference-facing operation only. They do not satisfy
four directions × intact/light/severe or replace existing wrecks.

- `reference-r0-cycle-v1`: four-frame keyed stabilizer-collar proposal; rejected for
  clipped outer/bottom foundations and layout crossing equal-cell boundaries. Motion
  is not sufficiently established by a contact sheet alone.
- `dump-r0-cycle-v1`: four-frame fan proposal; rejected for clipped lower/right
  foundations, cell-boundary overflow and weak blade-position differentiation.
- v2 corrections request ≤65% occupancy within each quadrant, full transparent
  margins and explicitly differing mechanism poses. Review results appended below.

Do not promote v1, use browser blend modes to conceal defects, rotate the whole
sprite as a substitute for mechanism motion, or label candidates “ready” based on
alpha alone. The [028 handoff](../planning/028-equipment-animation-handoff.md)
separates current fixes from the remaining asset-production and integration queue.

## 2026-09-16 follow-up — pass 08 v2 promoted (coding)

Acting on the user request to inspect and incorporate the new assets, the coding
agent decoded both v2 sheets and measured per-frame alpha bounds, occupancy,
foreground frame difference (aligned by registered anchors) and the loop seam.
Chassis drift is ≤0.94 px at 96 px on both, and each clip shows non-trivial
mechanism change between adjacent frames (reference stabilizer collar 29–63 mean
abs; dump fan 48–69), so **`reference-r0-cycle-v2` and `dump-r0-cycle-v2` were
promoted for rotation 0, intact condition only**. v1 stays unpromoted.

Registration lives in [`runtime-clips.json`](../../assets/production/pass-08/runtime-clips.json)
(source rectangles and anchors copied unchanged from `candidate-clips.json`);
`src/assets.ts` loads only those two files via an explicit glob, never the folder.
`src/equipment-animation.ts` now merges the pass-08 clips and gates them: an
unpowered or tripped reference/dump returns the dark condition fallback; the
reference stabilizer advances only while actual source field is present; the dump
fan advances only under powered cooling (`state.moving`) while idle/UNCOOLED hold
frame zero; reduced motion holds frame zero and pause freezes because all motion is
driven by `world.time`. No simulation, balance, save, footprint or port change.

Evidence: `DevLog/evidence/028-pass-08-promotion.json`; browser spec
`tests/browser/equipment-animation.spec.ts` (6/6) asserts the pass-08 clips render
`source-over`, advance under real world state, freeze on pause and hold at frame
zero under reduced motion; unit test in `tests/equipment-animation.test.ts`.

Still open, and **not** satisfied by this promotion: independent visual acceptance
of the in-game result; reference/dump directions 1–3; damaged/off variants
(conditions 1–2 still use existing fallbacks); and the four-direction/reduced-motion
seam checks from the 028 matrix. This promotion is a coding-agent inspection, not
the reviewer approval AN-02/AN-03 require.
