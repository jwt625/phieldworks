"""Measure original source pixels; never modifies image assets. Requires Pillow."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parent
rows = []
for axis in ('h', 'v'):
    path = root / f'straight-{axis}-repeat-v1.png'
    im = Image.open(path).convert('RGBA')
    n = im.height if axis == 'h' else im.width
    a = [im.getpixel((0, i) if axis == 'h' else (i, 0)) for i in range(n)]
    b = [im.getpixel((im.width-1, i) if axis == 'h' else (i, im.height-1)) for i in range(n)]
    active = [i for i in range(n) if max(a[i][3], b[i][3]) > 128]
    supports = [[i for i in range(n) if edge[i][3] > 128] for edge in (a, b)]
    spans = [[min(s), max(s)] if s else None for s in supports]
    errors = [abs(a[i][c]*a[i][3]/255-b[i][c]*b[i][3]/255) for i in active for c in range(3)]
    rows.append(dict(file=path.name, sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
        size=im.size, edge_body_spans=spans,
        normalized_widths=[len(s)/n for s in supports],
        alpha_support_equal=supports[0] == supports[1],
        mean_premultiplied_rgb_error_255=sum(errors)/len(errors) if errors else None,
        max_premultiplied_rgb_error_255=max(errors) if errors else None,
        mean_alpha_error_255=sum(abs(a[i][3]-b[i][3]) for i in active)/len(active) if active else None,
        status='raw-candidate-not-approved'))
(root / 'repeat-edge-audit.json').write_text(json.dumps(rows, indent=2)+'\n')
print(json.dumps(rows, indent=2))
