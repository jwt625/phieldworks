"""Read-only source audit and live DevLog/gallery refresh. Requires Pillow."""
import hashlib
import html
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'assets/production/pass-06'
DEST.mkdir(parents=True, exist_ok=True)
records, cards = [], []
for sidecar in sorted(DEST.glob('*.png.source.json')):
    source = json.loads(sidecar.read_text())
    path = ROOT / source['path']
    assert path.is_file() and source['prompt']
    for ref in source['reference_inputs']:
        assert (ROOT / ref).is_file(), ref
    im = Image.open(path)
    alpha = im.convert('RGBA').getchannel('A')
    hist = alpha.histogram()
    total = im.width * im.height
    bounds = alpha.getbbox()
    has_alpha = hist[0] > 0
    record = dict(id=path.stem, product_id=source['product_id'], variant=source['variant'],
                  path=source['path'], provenance_path=str(sidecar.relative_to(ROOT)),
                  dimensions=[im.width, im.height], mode=im.mode,
                  sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  transparent_fraction=hist[0]/total, partial_alpha_fraction=sum(hist[1:255])/total,
                  alpha_bounds_xyxy=bounds, crop=None, ground_anchor_px=None,
                  production_ready=False, status=source.get('visual_disposition','needs-visual-review') if has_alpha else 'needs-alpha-correction',
                  visual_review=source.get('visual_review', 'pending'))
    records.append(record)
    title=html.escape(path.stem)
    previews=''.join(f'<span><img src="{path.name}" width="{s}" height="{s}" alt="{title}">{s}px</span>' for s in (32,48,96))
    cards.append(f'<article data-kind="{html.escape(source["asset_type"])}"><h2>{title}</h2><p>{record["status"]} · alpha {record["transparent_fraction"]:.1%}</p><div class="previews">{previews}</div><details><summary>Full source</summary><img class="full" src="{path.name}" alt="{title}"></details><p>{html.escape(record["visual_review"])}</p><a href="{sidecar.name}">Prompt / provenance</a></article>')
summary = dict(sources=len(records), real_alpha=sum(r['transparent_fraction']>0 for r in records), production_ready=0)
(DEST/'review.json').write_text(json.dumps(dict(schema_version=1, source_pixels='unmodified', runtime_loader=False, summary=summary, candidates=records),indent=2)+'\n')
(DEST/'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PHIELDWORKS pass 06</title>
<style>body{font:16px system-ui;margin:24px;background:#17232b;color:#e8edf0}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}article{border:1px solid #637580;border-radius:8px;padding:16px}h2{font-size:18px;overflow-wrap:anywhere}p{line-height:1.5}.previews{display:flex;align-items:center;gap:24px;background:var(--preview,#c2bdac);color:#111;padding:16px}span{display:grid;text-align:center;gap:8px}img{object-fit:contain}.full{width:100%;max-height:560px}button,select{padding:8px;margin:4px}a{color:#8fdded}</style>
<h1>Pass 06 — catalog assets</h1><p>Original generated candidates. Alpha measurements do not establish clean edges, registration or runtime approval. Small previews include source padding.</p>
<p>'''+f'{summary["sources"]} sources · {summary["real_alpha"]} with real alpha · 0 runtime promotions'+'''</p>
<nav aria-label="Review controls"><button onclick="document.body.style.setProperty('--preview','#eee')">Light</button><button onclick="document.body.style.setProperty('--preview','#26343d')">Dark</button><button onclick="document.body.style.setProperty('--preview','#c2bdac')">Terrain color</button><label>Family <select onchange="document.querySelectorAll('article').forEach(a=>a.hidden=this.value!=='all'&&a.dataset.kind!==this.value)"><option value="all">All</option><option value="item">Items</option><option value="resource">Resources</option><option value="equipment">Equipment</option></select></label></nav><main>'''+''.join(cards)+'</main></html>')
log=ROOT/'DevLog/production/023-asset-generation-continuation.md'
text=log.read_text()
start,end='<!-- batch-ledger-start -->','<!-- batch-ledger-end -->'
rows=['| Source | Product / variant | Alpha | Review |','| --- | --- | --- | --- |']
for r in records:
    rows.append(f'| [{r["id"]}](../../{r["path"]}) | {r["product_id"]} / {r["variant"]} | {r["transparent_fraction"]:.1%} | {r["status"]} |')
ledger=f'**{summary["sources"]} saved sources; {summary["real_alpha"]} have real alpha; 0 runtime promotions.**\n\n'+'\n'.join(rows)
log.write_text(text.split(start)[0]+start+'\n'+ledger+'\n'+end+text.split(end)[1])
print(json.dumps(summary))
