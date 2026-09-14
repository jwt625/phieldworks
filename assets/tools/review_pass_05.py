"""Measure original PNGs and build a standalone review gallery. Requires Pillow.

Run from the repository root. Source pixels are never changed.
"""
import hashlib
import html
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'assets/production/pass-05'
records = []
cards = []
for path in sorted(DEST.glob('*.png')):
    sidecar = path.with_suffix('.png.source.json')
    source = json.loads(sidecar.read_text())
    assert source['prompt'] and source['tool'] == 'image_gen.imagegen'
    for reference in source['reference_inputs']:
        assert (ROOT / reference).is_file(), reference
    im = Image.open(path)
    alpha = im.convert('RGBA').getchannel('A')
    histogram = alpha.histogram()
    total = im.width * im.height
    transparent = histogram[0] / total
    status = 'needs-registration' if transparent else 'needs-correction'
    note = ('Real alpha; small-size and fixture registration remain pending. '
            'Generated edges need light-background inspection.') if transparent else 'Opaque painted checkerboard; rejected for runtime.'
    if path.stem == 'precision-accepted-part-v2':
        note += ' Carrier tabs and projection differ from blank; inventory concept only.'
    if 'fabrication-cell' in path.stem:
        note += ' Enclosure/port geometry needs directional correction.'
    record = dict(id=path.stem, path=str(path.relative_to(ROOT)), provenance_path=str(sidecar.relative_to(ROOT)),
                  width=im.width, height=im.height, mode=im.mode,
                  sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  transparent_fraction=transparent, partial_alpha_fraction=sum(histogram[1:255])/total,
                  alpha_bounds_xyxy=alpha.getbbox(), crop=None, ground_anchor_px=None,
                  status=status, production_ready=False, note=note)
    records.append(record)
    source['status'] = status
    source['review_notes'] = note
    sidecar.write_text(json.dumps(source, indent=2) + '\n')
    previews = ''.join(f'<span><img src="{path.name}" width="{s}" height="{s}" alt="{path.stem}">{s}px</span>' for s in [32,48,96])
    cards.append(f'<article><h2>{html.escape(path.stem)}</h2><p>{status} · alpha {transparent:.1%}</p><div class="preview">{previews}</div><details><summary>Original source</summary><img class="full" src="{path.name}" alt="{path.stem}"></details><p>{html.escape(note)}</p><a href="{sidecar.name}">Exact prompt and provenance</a></article>')
(DEST / 'review.json').write_text(json.dumps(dict(schema_version=1, source_pixels='unmodified', runtime_loader=False, candidates=records), indent=2)+'\n')
(DEST / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PHIELDWORKS pass 05 review</title>
<style>body{font:16px system-ui;background:#17232b;color:#e8edf0;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}article{border:1px solid #65747c;border-radius:8px;padding:16px}h2{font-size:17px;overflow-wrap:anywhere}.preview{background:var(--preview,#b9b5a4);display:flex;align-items:center;gap:24px;padding:16px;color:#111}span{display:grid;gap:8px;text-align:center}img{object-fit:contain}.full{width:100%;max-height:550px}a{color:#8fdded}button{padding:8px;margin:4px}p{line-height:1.5}</style>
<h1>Pass 05 — precision workpiece states</h1><p>Four item states and failed side-view corrections. Candidates only; no animation or runtime promotion. Previews use unchanged source images inside 32/48/96 px boxes, including source padding.</p>
<nav aria-label="Preview background"><button onclick="document.body.style.setProperty('--preview','#eee')">Light</button><button onclick="document.body.style.setProperty('--preview','#26343d')">Dark</button><button onclick="document.body.style.setProperty('--preview','#b9b5a4')">Terrain color</button></nav><main>'''+''.join(cards)+'</main></html>')
print(json.dumps({'sources':len(records), 'real_alpha':sum(r['transparent_fraction']>0 for r in records), 'production_ready':0}))
