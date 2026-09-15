"""Measure original sources and refresh the pass-07 ledger; never edit PNG pixels."""
import hashlib
import html
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'assets/production/pass-07'
jobs = json.loads((DEST / 'jobs.json').read_text())['jobs']
runtime_path = DEST / 'runtime-clips.json'
runtime = {c['asset']: c for c in json.loads(runtime_path.read_text())['clips']} if runtime_path.exists() else {}
records = []
for job in jobs:
    path = DEST / (job['id'] + '.png')
    if not path.exists():
        continue
    im = Image.open(path)
    alpha = im.convert('RGBA').getchannel('A')
    hist = alpha.histogram()
    cols, rows = job['columns'], job['rows']
    cells = []
    for n in range(job['frames']):
        x, y = n % cols, n // cols
        rect = [round(x * im.width / cols), round(y * im.height / rows),
                round((x + 1) * im.width / cols), round((y + 1) * im.height / rows)]
        cells.append({'proposed_rect_xyxy': rect, 'alpha_bounds_local': alpha.crop(rect).getbbox()})
    record = dict(id=job['id'], path=str(path.relative_to(ROOT)), dimensions=im.size,
                  mode=im.mode, sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  transparent_fraction=hist[0] / (im.width * im.height),
                  partial_alpha_fraction=sum(hist[1:255]) / (im.width * im.height),
                  columns=cols, rows=rows, frames=job['frames'], proposed_cells=cells,
                  ground_anchor=None, port_landmarks=None, registered=False,
                  production_ready=False, runtime_promoted=False,
                  status=job.get('visual_disposition', 'needs-visual-review') if hist[0] else 'needs-alpha-correction',
                  visual_review=job.get('visual_review', 'Pending'))
    records.append(record)
    if job['id'] in runtime:
        record.update(runtime_promoted=True, status='runtime-prototype',
                      registration=runtime[job['id']],
                      registration_scope='Translation/crop only; final port/chassis tolerance remains unverified')
    (path.with_suffix('.png.source.json')).write_text(json.dumps(dict(
        tool='built-in image_gen', original_output=job['original_output'],
        prompt=job['prompt'], reference_inputs=job['reference_inputs'],
        path=record['path'], source_pixels='unmodified', sha256=record['sha256']), indent=2) + '\n')
summary = dict(saved=len(records), real_alpha=sum(r['transparent_fraction'] > 0 for r in records), runtime_promotions=sum(r['runtime_promoted'] for r in records))
(DEST / 'review.json').write_text(json.dumps(dict(summary=summary, candidates=records), indent=2) + '\n')
cards = []
for r in records:
    name = r['id'] + '.png'
    cards.append(f'<article><h2>{html.escape(r["id"])}</h2><p>{html.escape(r["status"])} · alpha {r["transparent_fraction"]:.1%}</p>'
                 f'<p>{html.escape(r["visual_review"])}</p><img class="sheet" src="{name}" alt="{r["id"]}">'
                 f'<div class="players" data-src="{name}" data-cols="{r["columns"]}" data-rows="{r["rows"]}" data-frames="{r["frames"]}"></div>'
                 f'<a href="{name}.source.json">Exact prompt and provenance</a></article>')
(DEST / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pass 07 equipment motion</title>
<style>body{font:16px system-ui;background:#17232b;color:#eee;margin:24px}article{border:1px solid #678;padding:16px;margin:20px 0}.sheet{max-width:100%;max-height:440px;object-fit:contain;background:var(--bg,#ccc)}canvas{background:var(--bg,#ccc);margin:12px}a{color:#8df}button{padding:8px;margin:8px}</style>
<h1>Pass 07 — equipment motion pilots</h1><p>Five explicit rotation-0 clips are used in gameplay as prototypes. This gallery shows the original equal-grid layouts; gameplay uses the translated crops in runtime-clips.json. Originals preserved; final production polish remains open.</p>
<button id="pause">Pause</button><button id="step">Step</button><button onclick="document.body.style.setProperty('--bg','#eee')">Light</button><button onclick="document.body.style.setProperty('--bg','#26343d')">Dark</button><button onclick="document.body.style.setProperty('--bg','#b6af98')">Terrain color</button>
''' + ''.join(cards) + '''<script>
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches, tick=0;
const players=[];document.querySelectorAll('.players').forEach(el=>{const im=new Image();im.src=el.dataset.src;for(const size of [48,96,256]){const c=document.createElement('canvas');c.width=c.height=size;el.append(c);players.push({im,c,cols:+el.dataset.cols,rows:+el.dataset.rows,frames:+el.dataset.frames});}});
function draw(){for(const p of players){if(!p.im.complete||!p.im.naturalWidth)continue;const i=tick%p.frames,w=p.im.naturalWidth/p.cols,h=p.im.naturalHeight/p.rows,scale=p.c.width/Math.max(w,h),ctx=p.c.getContext('2d');ctx.clearRect(0,0,p.c.width,p.c.height);ctx.drawImage(p.im,(i%p.cols)*w,Math.floor(i/p.cols)*h,w,h,(p.c.width-w*scale)/2,(p.c.height-h*scale)/2,w*scale,h*scale);}}
const button=document.querySelector('#pause');function label(){button.textContent=paused?'Play':'Pause'}label();button.onclick=()=>{paused=!paused;label()};document.querySelector('#step').onclick=()=>{paused=true;tick++;label();draw()};setInterval(()=>{if(!paused&&!document.hidden)tick++;draw()},250);
</script></html>''')
log = ROOT / 'DevLog/production/024-equipment-animation-continuation.md'
text = log.read_text().split('<!-- live-ledger -->')[0]
text += '<!-- live-ledger -->\n\n## Saved-source ledger\n\n'
text += f'**{summary["saved"]} saved; {summary["real_alpha"]} with real alpha; {summary["runtime_promotions"]} runtime prototype promotions.**\n\n'
text += '[Interactive motion review](../../assets/production/pass-07/index.html) · [Measurements](../../assets/production/pass-07/review.json)\n\n'
text += '| Source | Alpha | Review |\n| --- | --- | --- |\n'
for r in records:
    text += f'| [{r["id"]}](../../{r["path"]}) | {r["transparent_fraction"]:.1%} | {r["status"]}: {r["visual_review"]} |\n'
log.write_text(text)
print(json.dumps(summary))
