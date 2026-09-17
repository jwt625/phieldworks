# 030 — Wave logistics independent validation protocol

Date: 2026-09-16. Status: **protocol only; all review gates pending**.
Implementation authority: [029 coding handoff](../planning/029-early-game-wave-logistics-handoff.md).
Reviewer: parent/orchestrator agent, independently of the coding-agent implementation.
No screenshot, runtime check, benchmark or visual approval is claimed in this document.

## Review procedure

1. Record integrated revision (and uncommitted diff identity), browser, viewport, DPR,
   fixture/seed, camera and commands. Reproduce coding evidence before interpreting it.
2. Run a fresh expedition through UI; do not use direct state injection for the success
   path. Separate prepared fault/rotation fixtures are allowed and must be labeled.
3. Capture before/after at identical camera/source/target settings. Inspect actual
   screenshots using image-capable tools. For motion/transitions, inspect a recording
   when supported or a time-indexed frame sequence, not a single static screenshot.
4. Cross-check captures against simulation JSON: geometry, piece IDs/type, readings,
   inventory and process state. Browser DOM assertions alone do not prove canvas content.
5. Log each defect with severity, reproduction, expected/actual behavior, state and
   image path. Send bounded correction tasks to the coding agent and recheck fixes.

Required viewports: 1024×768, 1366×768, 1440×1000 and 1920×1080 at DPR 1;
one DPR 2 smoke run and 125% browser zoom reachability check. Include overview and
normal working zoom, all four rotations, light/dark terrain, overlay on/off, pause
and reduced motion. Reuse 026 exposed-canvas and control-accessibility budgets.

## Independent visual / interaction matrix

| Gate | Required observation | Pass criteria | Status |
| --- | --- | --- | --- |
| V-01 Construction | Drag around obstacle, choose compact/swept bend, inspect preview then commit | Rendered occupied footprint equals collision geometry; BOM predicts actual inventory debit; no hidden free bend | Pending |
| V-02 Topology | Split, crossing, merge and a deleted elbow | Shapes distinguish connectivity without color; crossing never joins; open ends visible; gap stops only intended branch | Pending |
| V-03 Port registration | Straights/elbows/junctions at rotations 0–3 | Guide ends and interactive ports align; no unexplained gaps, overlapping runs or ghost joins | Pending |
| V-04 Upgrade | Select/replace one installed part, then attempt invalid replacement | Selected item and tier unmistakable; replacement changes real readings; invalid action preserves old hardware and stock | Pending |
| V-05 Optical explanation | Compare best-tuned basic and upgraded demanding cell | Player can locate dominant loss/imbalance, see useful/guard consequence, and identify appropriate remedy; values match report | Pending |
| V-06 Combining | Sweep phase with useful/reject outputs and dump visible | Power redistribution readable; dump heat/absorption agrees with state; no implied energy destruction or creation | Pending |
| V-07 Factory flow | Inputs arrive, process runs, output backs up, depot receives accepted part | Correct item identities/directions; no product appearing before completion or shared credit before receipt; blocked state readable | Pending |
| V-08 Lifecycle | Power loss, resume, cancel, save/load, recover and local replacement | Visible state matches authoritative pause/job/inventory state; no spurious running animation, duplicate output or stale readings | Pending |
| V-09 Replication | Capture/stamp upgraded cell and commission independently | Preview includes real pieces/costs, fresh copy lacks certificate/inventory, original independent cell retains valid operation | Pending |
| V-10 Usability | Tutorial skipped and enabled; keyboard route/edit/inspect; narrow viewport | Main actions discoverable/reachable, no click-through/clipping, clear blockers, compact HUD budgets retained | Pending |
| V-11 First loop | Fresh run to earned upgrade and sustained accepted output | No cheat input; explain improvement from observed evidence; record elapsed time, failed attempts and resource reserve | Pending |

## Code evidence reviewed separately

- [ ] Tests/build/browser suite results and exact revision verified.
- [ ] Energy residual, passive components and explicit/composed comparison inspected.
- [ ] Stock/packet/reservation/blueprint conservation and legacy migrations inspected.
- [ ] Fixed-source before/after gain and three-cycle acceptance reproduced.
- [ ] Full world-step timing meets 029's delivered-fixture gate; larger-scale limits disclosed.

## Review record template

For each review round append:

- Date/reviewer/revision/environment and implementation R IDs ready for review.
- V-ID results: pass/fail/not exercised, screenshot/frame path and state report path.
- Defects: severity (blocking/major/minor), reproduction, expected/actual, owner, retest.
- Numerical comparison: basic/upgraded BOM, area, source energy, useful/guard dose,
  accepted output, remaining stock, performance. All values labeled measured or unknown.
- Verdict: code-verified scope, visually accepted scope, outstanding gates. Human
  unprompted discoverability and pacing remain separately labeled untested unless observed.

A preparatory protocol is not a completed review. No default passes; do not infer
visual quality from image generation, artifact existence or passing unit tests.
