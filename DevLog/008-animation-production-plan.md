# Animation production plan — awaiting design approval

Date: 2026-09-12. Scope: existing machinery, current wildlife and the first approved research assets. This is a frame and integration specification; no new images or animation playback are implemented in this pass.

## Visual contract

Preserve the existing equipment identities: weathered steel, pale ceramic, copper thermal details, restrained cyan field status. Use a fixed orthographic oblique camera and upper-left lighting. Each orientation is separately drawn. No canvas rotation or mirroring of shaded machinery or creatures to manufacture missing directions.

Generate **four world directions**, as used by the current renderer. At diagonal movement headings choose the closest drawn direction with hysteresis to avoid flickering between views. The guardian remains anchored; it has breathing and damage reactions, never locomotion. Crawlers walk; a later armored rover has a separate identity and animation set.

Each clip uses **four rows for directions and N columns for frames**, a common 256×256 transparent RGBA cell for machines/guardian and 128×128 for crawlers. Footprint center, scale, camera, fixed ports and lighting must match across frames and directions. Reserve 8 transparent pixels around the silhouette. Larger future structures may use 512×512 cells. Export one atlas per state to keep files manageable. Idle, damaged and wreck states can use one column. Frame indices start at zero.

Provide real alpha with no black matte or painted transparency checkerboard. Keep contact shadows in a separately defined presentation layer so the existing prototype lighten-compositing workaround can be retired for these assets. Preserve the original files until a pilot has passed runtime review.

## Existing machinery: small frame sets

| Equipment | Operating clip | Other states | Playback and visible moving parts |
| --- | --- | --- | --- |
| Extractor | 4 frames × 4 views | 1 idle, 1 damaged, 1 wreck per view | 6 fps nominal; drill reciprocation and small feed wheel. Freeze without power, deposit, or downstream capacity. |
| Assembler | 6 × 4 | 1 idle, 1 damaged, 1 wreck per view | One clip per 1.4 s production cycle: receive, grip, lower, press, lift, release. Driven by recipe progress, including backpressure. |
| Power unit | 4 × 4 | 1 idle, 1 overloaded, 1 wreck per view | 8 fps nominal rotor/fan. Active when supplying a load; overload shows an explicit indicator rather than apparent successful operation. |
| Reference station | 4 × 4 | 1 idle, 2 trip frames, 1 wreck per view | 4 fps status sweep and cooling fan when active. Qualification success is a UI signal with a 3-frame pulse overlay. |
| Four-port junction | Static 1 × 4 | 1 damaged and 1 wreck per view | No invented mechanical motion. Renderer overlays directional port activity from measured incident/outgoing power. |
| Phase tuner | 4 × 4 adjustment clip | 1 idle, 1 damaged, 1 wreck per view | Only animate while phase changes: carriage moves then settles; no motion at a fixed phase. Map carriage position to actual phase for coherent endpoints. |
| Field emitter | 4 × 4 | 1 idle, 2 trip frames, 1 wreck per view | 6 fps cooling/shutter motion when delivering field. Optional 3-frame gimbal adjustment when targeting is implemented; field beams remain separate diagnostics. |
| Cooled dump | 4 × 4 | 1 idle, 2 overheat frames, 1 wreck per view | 8 fps fans while cooling is powered. Heat tint uses temperature; a trip does not imply that cooling also stops. |
| Perimeter sentry | 4 × 4 scan; 3 × 4 fire | 1 idle, 1 damaged, 1 wreck per view | Scan at 4 fps; fire as a short 12 fps recoil/return event. Flash is a separate 2-frame effect; replay frequency follows actual engagements. |

Damage is a persistent separate state rather than random jitter. Where a damaged operational sprite is unavailable, apply a consistent damage overlay to the operational clip and show the exact inspector state. A wreck is static and stops working. Avoid changing the apparent position of a fixed physical connector during animation.

## Wildlife frame design

| Creature / state | Frames per direction | Timing | Frame intent |
| --- | --- | --- | --- |
| Crawler idle | 2 | 2 fps | Low body settle and feeler movement. No root translation. |
| Crawler walk / investigate | 6 | Nominal 8 fps, travel-driven | Alternating tripod contact → push → passing → opposite contact → push → passing. Keep planted feet stable and body displacement modest. |
| Crawler flee | Reuse walk | Travel-driven | Increase cycle rate with actual speed, preserving stride distance. |
| Crawler attack | 4 | 8 fps, event-triggered | Brace → raise → strike → recoil. Damage still comes from simulation; frame 2 illustrates contact. |
| Crawler hit | 2 | 12 fps once | Small compression then recovery; return to current behavior. |
| Crawler death | 4 | 6 fps once, hold last | Buckle → collapse → settle → static remains. Never loop. |
| Anchored guardian idle | 4 | 2 fps | Subtle breathing and armor flex; base and hitbox remain fixed. |
| Guardian under field | 3 | 6 fps while damaged | Cracks and stress brighten toward the incident side. Overlay intensity follows delivered damage, not a constant flash. |
| Guardian collapse | 6 | 6 fps once, hold last | Plates break, body settles and residue remains. Frontier unlock follows simulation health, not clip duration. |
| Future armored rover | 6 walk, 4 attack, 4 death | Reuse travel/event contracts | Heavy gait, mineral plates and clear wind-up. Generate only after the pulsed-delivery tier is accepted and scheduled. |

The current guardian needs only its existing view for the first animation pilot; additional directions are unnecessary until a scenario can orient it. This avoids generating frames the game cannot display.

## Playback integration plan

- Keep simulation independent of art. Extend presentation metadata with atlas rectangles, cell size, anchors, clip duration, loop/one-shot rules and per-view port registration. Artwork must never decide damage, throughput or field output.
- Use simulation time/progress, not wall-clock animation timers. Pausing, hidden tabs and open modal panels freeze animation with the world. Speed controls scale both consistently; reduced-motion mode shows representative still frames while preserving readable state indicators.
- Creature walking advances from distance traveled with a defined stride length; stop the cycle when blocked. Preserve foot contacts through turns and choose direction using velocity, retaining the last orientation when stationary.
- Recipe animations follow the existing entity production progress. Source/fan loops use simulation time with a deterministic entity offset to avoid synchronized factories. Tuner changes and sentry hits need presentation event timestamps or counters; do not infer attacks solely from proximity.
- Trigger death only once on a health transition, and restore static remains correctly after load. Store gameplay event times where needed; cosmetic phase can be reconstructed. Rendering must not modify save data.
- Cache decoded sheets. Stream later tech assets on demand; the present large PNG inventory already makes a full animated preload undesirable. Benchmark on a 40-machine sector before multiplying frame counts. Verify source alpha and cutouts before atlas packing.

## Recipe-to-asset mapping after revision B

[009](009-production-dependencies.md) now names every item, equipment and capability unlocked by research. Use `src/ui/production-data.ts` IDs for future art manifests. It distinguishes equipment (world sprites with the operating states above), manufactured items/resources (inventory icons and physical transport payloads), and capabilities (UI symbols, no invented buildings). An item unlock does not automatically require a new machinery sheet: dossiers share the workbench, refining recipes share the material processor, and die/module recipes share the fabrication cell. Upgraded sentries, reference-locked sources and pulse drivers consume predecessor equipment and should visibly retain its identity. No new art is generated by this catalog update.

## Generation order after approval

1. **Pilot:** crawler six-frame walk in one direction, assembler six-frame operation in one direction, and guardian four-frame breathing in its current view. Verify identity, alpha, loop seam, anchor and feet before expanding directions.
2. **First expedition:** remaining crawler states/views, guardian stress/collapse, all nine existing machines using the small frame budgets above. Static junction art gets alpha and port-registration work.
3. **Industrial tier:** research workbench (4-frame sample transfer), lab (6-frame carousel), material processor (4-frame polishing), splitter (3-frame gate), substation (2-frame switch), heat exchanger (4-frame fans), repair depot (4-frame arm). Generate only the approved implemented tier; do not batch the whole endgame catalog.
4. **Precision and systems:** derive assets from approved tech unlocks: source-lock equipment, pulse driver, fabrication cell, freight carrier, relay, observatory, membrane line, aperture and sail dock. Each receives an explicit input/output/service silhouette and state sheet before generation.

Every delivered atlas needs a sidecar manifest listing frame rectangles, direction order, anchor coordinates, intended state bindings, prompt and source provenance. The reviewer should see a looping contact sheet and an in-game scene, including paused, damaged, unpowered and obstructed states. No asset generation begins until the technology design is approved.


## Checkpoint — 2026-09-13

Generation has started after approval. Existing operating sheets and nine new candidate clips do not yet complete the frame/state specification below. The user paused work for documentation/commits; see [014](014-asset-production-tracker.md) for saved corrections, source failures and remaining clips.
