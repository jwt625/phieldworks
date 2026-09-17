# Pass 11 — Planning and physical hardware asset handoff

**Partial asset delivery; no runtime promotion. No code authored.**
Planning decisions: [034](../../../DevLog/planning/034-wave-hardware-integration-decisions.md).
Seam-gate status and coding handoff: [035](../../../DevLog/verification/035-runtime-kit-asset-handoff.md).

## Delivered assets

| File | Actual resolution | Use / status |
| --- | --- | --- |
| `connected-kit-atlas.png` | 1188×264 RGBA | Unmodified accepted pass-10 image. Only straight-basic H/V rectangles are candidate registrations. All other image regions excluded. |
| `atlas.json` | Four runtime pose entries | Exact rects, gutters, world scale, repeat period, port centers/normals/widths and explicit candidate allowlist. Runtime promoted list is empty. |
| `swept-basic-source.png` | 1402×1122 RGBA | New four-corner swept basic source sheet: W–S, W–N / N–E, E–S. Visual source only, blocked on finite-bend port geometry. |
| `offset-entities-source-v2.png` | 1448×1086 RGBA | Corrected preferred entity concept sheet: basic junction, matched junction, independent-channel body; four columns of pose concepts. Four terminals on every body. |
| `offset-entities-source.png` | 1448×1086 RGBA | Rejected first entity sheet: vertical junctions have only two ports. Preserve for provenance; never register. |
| `accessories-source.png` | 1230×1278 RGBA | Mouths, sockets, dump attachments in W/N/E/S order; H/V sleeve concepts; light and heavy scorch/crack concepts. Not isolated final overlays. |
| `prompts.json`, `prompt-entity-correction.json` | Text metadata | Exact built-in imagegen prompts and references. No CLI/API fallback used. |
| `condition-treatment.json` | Text metadata | Proposed three-level overlay treatment and interface exclusion rules; not a runtime module. |

PNG dimensions and alpha-channel presence checked with `sips`; atlas JSON parsed
with `jq`; copied atlas hash checked with `shasum`. Alpha-channel presence alone
does not establish clean edge pixels. Generated sheets were visually inspected.

The artwork uses the accepted kit as a style reference. Generated sources remain
unaltered; no rescaling, pixel repair, atlas packing or code-based extraction was
performed. Colored/grey edge residue, spacing, connector width and reinforcement
details require production normalization. The entity correction fixes terminal count,
but row 3 does not establish exact reverse-pose bridge placement. These sheets supply
material/silhouette direction, not measured optical geometry.

## Registration decision

Existing straight pixels can match the authoritative .24-tile guide width by uniform
scaling: 32 source pixels × .0075 tile/pixel = .24 tile. The corresponding 128-pixel
repeat is **.96 tile**, independent of runtime spans. Do not force this period to one
tile or stretch a sprite to the installed length. H/V reverse-travel poses keep the
same world lighting. Parent must review the original reinforcement-band cadence.

No generated image can honestly be labeled pixel-exact merely from a prompt. Exact
new junction/crossing bodies, turn silhouettes, clipped source rects, extruded gutters
and full seam testing are outstanding coding/asset-production work. Use generated
detail inside deterministic registered casings as permitted by 032. No source region
from pass-09 or the rejected entity sheet is on the candidate list.

## Scope decisions

- Precision straight/crossing/swept: out of v1. Keep existing two precision recipes.
- Compact, precision and swept elbows: no runtime promotion until P9 resolves the
  two coincident ports and full-length neighboring straights; deleted elbows must
  leave visible gaps without inventing topology.
- Junction/matched: preserve four offset terminals and A/B/C/D simulation ordering.
- Crossing: preserve independent A↔C and B↔D; do not substitute cardinal atlas art.
- Damage: intact plus clipped overlays; no full damaged-body families required.
- Terminal overlays: conditional only, one sleeve per real joint. Generic dump
  concept supplied; machine-specific adapter seams remain outside this delivery.
- Complete v1 seam gate and V-01–V-04 remain open. The report lists every requested
  fixture and its status rather than claiming pass-10 evidence covers new geometry.
