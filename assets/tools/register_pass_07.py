from PIL import Image
from pathlib import Path
import json
selected={'extractor-severe-r0-cycle-v3':('extractor',2),'assembler-light-r0-cycle-v3':('assembler',1),'assembler-severe-r0-cycle-v4':('assembler',2),'generator-r0-cycle-v3':('generator',0),'sentry-r0-fire-v3':('sentry',0)}
review=json.load(open('assets/production/pass-07/review.json'));clips=[]
for c in review['candidates']:
 if c['id'] not in selected:continue
 frames=[];im=Image.open(c['path'])
 for f in c['proposed_cells']:
  rect=f['proposed_rect_xyxy'];a=im.crop(rect).getchannel('A');m=a.point(lambda v:255 if v>=128 else 0);b=m.getbbox();lower=m.crop((0,b[3]-8,m.width,b[3])).getbbox();ax=(lower[0]+lower[2])/2
  if c['id'].startswith('generator'):ax=(b[0]+b[2])/2
  crop=[max(0,b[0]-3),max(0,b[1]-3),min(m.width,b[2]+3),min(m.height,b[3]+3)]
  frames.append({'source':[rect[0]+crop[0],rect[1]+crop[1],crop[2]-crop[0],crop[3]-crop[1]],'anchor':[ax-crop[0],b[3]-crop[1]]})
 kind,condition=selected[c['id']]
 logical=max(max(f['source'][2],f['source'][3]) for f in frames)/.90
 clips.append({'asset':c['id'],'kind':kind,'condition':condition,'rotation':0,'logicalSize':round(logical,3),'frames':frames,'sha256':c['sha256']})
Path('assets/production/pass-07/runtime-clips.json').write_text(json.dumps({'status':'prototype-runtime-selection','registration':'Alpha >=128 bounds with 3px crop padding; translation aligned to bottom foundation landmark (generator base bounds center). No pixel edits; residual chassis drift remains prototype polish.','clips':clips},indent=2)+'\n')
