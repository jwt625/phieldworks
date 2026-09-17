import {equipmentState,type EquipmentState} from './equipment-state';
import {equipmentEffects} from './equipment-effects';
import {equipmentAnimation,recipeFrame} from './equipment-animation';
import frameMap from '../assets/animations/frame-map.json';
import {createTerrain} from './terrain';
import {APPEARANCE} from './presentation';
import {footprint,ports,routeMetrics,pointAt,segmentDistance,type Rotation,type Point} from './sim/geometry';
import {findRoute} from './sim/routing';
import {type World,type Kind,type Entity,type WavePiece,DEFS,WIDTH,HEIGHT,center,portPosition,placementError,entity,frontierTarget,piecePorts} from './sim/world';
import {WAVE_KIT_ATLAS_ID,straightSprite,hasRegisteredSprite,type WaveSpriteRect} from './wave-kit';
import type {Endpoint} from './sim/network';
import {sprites} from './assets';
export interface View {objectSelection?:string|null;rotation:Rotation;diagonal:boolean;radius:number;waypoints:Point[];selected:string|null;build:Kind|null;tool:'select'|'field'|'guide'|'material'|'power'|'blueprint'|'module';pending:Endpoint|null;editing?:string|null;overlay:boolean;grid:boolean;mouse:{x:number;y:number}|null;panX:number;panY:number;zoom:number;selection?:string[];selecting?:{x0:number;y0:number;x1:number;y1:number}|null;cursor?:Point|null;guidePreview?:{pieces:{category:string;x:number;y:number;rotation:number;spans:number;turn:number}[];path:Point[];error:string;cost:number}|null;guideCell?:Point|null}
export class Renderer {
 private motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 private firingSince=new Map<string,number>();
 private ground:HTMLCanvasElement|null=null;private lastWorld:World|null=null;private gait=new Map<string,{x:number;y:number;phase:number}>();
 ctx:CanvasRenderingContext2D; width=0;height=0;scale=30;baseScale=0;
 constructor(public canvas:HTMLCanvasElement,public view:View){this.ctx=canvas.getContext('2d')!;this.resize();}
 defaultScale(){return Math.max(16,Math.min(this.width/64,this.height/36));}
 /** Recompute the intrinsic framing scale. Only explicit Home/Fit may reframe. */
 fit(){this.resize();this.baseScale=this.defaultScale();this.scale=this.baseScale*this.view.zoom;}
 /** Resize the backing store for the current DPR. Dimensions only; camera reframing stays explicit. */
 resize(){const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;const d=Math.min(devicePixelRatio,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);if(!this.baseScale)this.baseScale=this.defaultScale();this.scale=this.baseScale*this.view.zoom;}
 /** Viewport resize helper: keeps world center and pixels-per-tile by compensating pan for the size delta. */
 resizeViewport(){const oldW=this.width,oldH=this.height;this.resize();if(oldW&&oldH){this.view.panX+=(this.width-oldW)/2;this.view.panY+=(this.height-oldH)/2;}}
 screen(x:number,y:number){return{x:x*this.scale+this.view.panX,y:y*this.scale+this.view.panY};}
 world(x:number,y:number){return{x:(x-this.view.panX)/this.scale,y:(y-this.view.panY)/this.scale};}
 hit(w:World,x:number,y:number):Entity|undefined {return [...w.entities].reverse().find(e=>x>=e.x&&x<=e.x+footprint(e).w&&y>=e.y&&y<=e.y+footprint(e).h);}
  hitObject(w:World,x:number,y:number):string|null {const target=frontierTarget(w);return w.ecology.creatures.find(c=>c.health>0&&Math.hypot(x-c.x,y-c.y)<.8)?.id??w.deposits.find(d=>x>=d.x&&x<=d.x+d.w&&y>=d.y&&y<=d.y+d.h)?.id??(target&&Math.hypot(x-target.x,y-target.y)<2?'guardian':null);}
 hitPort(w:World,x:number,y:number,type:'field'|'material'|'power'='field'):Endpoint|null {let best:Endpoint|null=null,dist=14/this.scale;for(const e of w.entities)ports(e,type).forEach((_,i)=>{const p=portPosition(e,i,type),d=Math.hypot(x-p.x,y-p.y);if(d<dist){dist=d;best={node:e.id,port:i};}});return best;}
 hitRoute(w:World,x:number,y:number):string|null {let best:string|null=null,dist=9/this.scale;for(const l of [...w.links].reverse())for(let i=1;i<l.path.length;i++){const d=segmentDistance({x,y},l.path[i-1],l.path[i]);if(d<dist){dist=d;best=l.id;}}return best;}
 /** Nearest authoritative physical wave piece to a world point, for selection and replace UI. */
 hitPiece(w:World,x:number,y:number):string|null {let best:string|null=null,dist=.55;for(const p of [...w.pieces].reverse()){const pts=piecePorts(p);let d=Math.hypot(x-pts[0].x,y-pts[0].y);for(let i=1;i<pts.length;i++)d=Math.min(d,segmentDistance({x,y},pts[i-1],pts[i]));if(d<dist){dist=d;best=p.id;}}return best;}
 /**
  * Coding-owned straight composition (P2/P7): periodic, world-phase-fixed source tiles cropped to the
  * installed length, transverse-centred on the centerline, never rotated or stretched. Returns false if
  * the atlas is unavailable so callers fall back to the truthful native body.
  */
 drawStraightSprite(piece:WavePiece,sprite:WaveSpriteRect):boolean{
  const img=sprites[WAVE_KIT_ATLAS_ID];if(!img)return false;
  const ctx=this.ctx,[rx,ry,rw,rh]=sprite.rect,pts=piecePorts(piece),half=rw*sprite.pixelsPerTile/2;
  const horizontal=sprite.axis==='x';
  const lo=horizontal?Math.min(pts[0].x,pts[1].x):Math.min(pts[0].y,pts[1].y);
  const hi=horizontal?Math.max(pts[0].x,pts[1].x):Math.max(pts[0].y,pts[1].y);
  const centre=horizontal?pts[0].y:pts[0].x;
  for(let k=Math.floor(lo/sprite.period);k<=Math.floor((hi-1e-9)/sprite.period);k++){
   const w0=Math.max(lo,k*sprite.period),w1=Math.min(hi,(k+1)*sprite.period);if(w1<=w0)continue;
   const sc=(w0-k*sprite.period)*sprite.pixelsPerTile,sw=(w1-w0)*sprite.pixelsPerTile;
   if(horizontal){const nw=this.screen(w0,centre-half),se=this.screen(w1,centre+half);ctx.drawImage(img,rx+sc,ry,sw,rh,nw.x,nw.y,se.x-nw.x,se.y-nw.y);}
   else{const nw=this.screen(centre-half,w0),se=this.screen(centre+half,w1);ctx.drawImage(img,rx,ry+sc,rw,sw,nw.x,nw.y,se.x-nw.x,se.y-nw.y);}
  }
  return true;
 }
 draw(w:World){const ctx=this.ctx,s=this.scale;ctx.clearRect(0,0,this.width,this.height);ctx.fillStyle='#17282b';ctx.fillRect(0,0,this.width,this.height);
  // Terrain and dressing are presentation-only: never create hidden collision.
  this.ground??=createTerrain();ctx.drawImage(this.ground,this.view.panX,this.view.panY,WIDTH*s,HEIGHT*s);if(this.lastWorld!==w){this.gait.clear();this.firingSince.clear();this.lastWorld=w;}
  for(let i=0;i<110;i++){const noise=(v:number)=>{const n=Math.sin(v*127.1+311.7)*43758.5453;return n-Math.floor(n);};const x=1+noise(i+1)*62,y=1+noise(i+811)*34;if(w.entities.some(e=>x>e.x-1&&x<e.x+footprint(e).w+1&&y>e.y-1&&y<e.y+footprint(e).h+1)||w.deposits.some(d=>x>d.x-1&&x<d.x+d.w+1&&y>d.y-1&&y<d.y+d.h+1)||w.links.some(l=>l.path.some(p=>Math.hypot(p.x-x,p.y-y)<1.5)))continue;this.atlas('terrain-props-v2',i%4,x-.6,y-.6,1.2,.8);}
  if(this.view.grid){ctx.strokeStyle='#8ba79914';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=WIDTH;x++){const a=this.screen(x,0),b=this.screen(x,HEIGHT);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}for(let y=0;y<=HEIGHT;y++){const a=this.screen(0,y),b=this.screen(WIDTH,y);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();}
  for(const dep of w.deposits){const reveal=this.view.objectSelection===dep.id||(!this.view.build&&this.view.mouse&&this.view.mouse.x>=dep.x&&this.view.mouse.x<=dep.x+dep.w&&this.view.mouse.y>=dep.y&&this.view.mouse.y<=dep.y+dep.h);if(reveal){const p=this.screen(dep.x,dep.y);ctx.strokeStyle='#edd7a0';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,dep.w*s,dep.h*s);}if(dep.remaining===0&&sprites['depletion-debris-v1'])this.atlas('depletion-debris-v1',dep.kind==='ore'?0:1,dep.x,dep.y,Math.max(dep.w,dep.h));else this.sprite(dep.kind==='ore'?'starter-ore':'frontier-crystal-ore',dep.x,dep.y,dep.w,dep.h,dep.remaining>0?1:.25);if(this.view.overlay||reveal){const p=this.screen(dep.x+dep.w/2,dep.y+dep.h+.4);this.label(p.x,p.y,dep.kind==='ore'?'FERROUS DEPOSIT':'PRECISION CRYSTAL',dep.kind==='ore'?'#b5a283':'#95cfde',9);}}
  const boundary=this.screen(25,0);ctx.fillStyle=w.frontier?'#b5d8ab05':'#c5a4720b';ctx.fillRect(boundary.x,this.view.panY,WIDTH*s,this.height);ctx.strokeStyle=w.frontier?'#92cc9270':'#bda97566';ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(boundary.x,0);ctx.lineTo(boundary.x,this.height);ctx.stroke();ctx.setLineDash([]);
  for(const l of w.links){const color=l.type==='material'?'#cba75f':l.type==='power'?'#be9adc':this.view.overlay?'#6acecd':'#769495';const selected=this.view.objectSelection===l.id;ctx.beginPath();l.path.forEach((v,i)=>{const p=this.screen(v.x,v.y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.lineJoin='round';ctx.strokeStyle=selected?'#f0dfa6':'#0d171b';ctx.lineWidth=l.type==='material'?9:6;ctx.stroke();ctx.strokeStyle=selected?'#fff2c0':color;ctx.lineWidth=l.type==='material'?5:2;ctx.stroke();
   const m=routeMetrics(l.path,l.radius);for(const bend of m.bends)if((l.type==='field'&&bend.bad)||(selected&&bend.bad)){const p=this.screen(bend.point.x,bend.point.y);ctx.fillStyle='#ef9874';ctx.fillRect(p.x-2,p.y-2,4,4);}else if(selected){const p=this.screen(bend.point.x,bend.point.y);ctx.fillStyle='#f0dfa6';ctx.fillRect(p.x-1.5,p.y-1.5,3,3);}
   const dots=l.type==='material'?l.packets:this.view.overlay&&l.type==='field'?[(w.time*5)%m.length]:[];for(const travel of dots){const v=pointAt(l.path,travel),p=this.screen(v.x,v.y);if(l.type==='material'&&sprites['transport-items-v1'])this.atlas('transport-items-v1',0,v.x-.16,v.y-.16,.32);else{ctx.fillStyle=l.type==='material'?'#ffe3a6':color;ctx.fillRect(p.x-2,p.y-2,4,4);}}
  }
  // Authoritative wave pieces: straights and bends are distinguished by shape, tier by fill, not colour alone.
  for(const piece of w.pieces){const pts=piecePorts(piece),selected=this.view.selected===piece.id;const basic=piece.tier!=='precision';ctx.lineCap='round';
   if(piece.category==='straight'&&hasRegisteredSprite(piece)&&this.drawStraightSprite(piece,straightSprite(piece.rotation))){/* registered atlas draw */ }
   else if(piece.category==='straight'){const a=this.screen(pts[0].x,pts[0].y),b=this.screen(pts[1].x,pts[1].y);ctx.strokeStyle='#0d171b';ctx.lineWidth=selected?8:7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle=selected?'#fff2c0':basic?'#c2a06a':'#8fe0cf';ctx.lineWidth=selected?5:4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
   else{const a=this.screen(piece.x,piece.y);const inV=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}][(piece.rotation+2)%4],outV=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}][(piece.rotation+(piece.turn===1?1:3))%4];const from=this.screen(piece.x+inV.x*.5,piece.y+inV.y*.5),to=this.screen(piece.x+outV.x*.5,piece.y+outV.y*.5);ctx.strokeStyle=basic?'#c98a5a':'#8fe0cf';ctx.lineWidth=selected?5:4;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.quadraticCurveTo(a.x,a.y,to.x,to.y);ctx.stroke();}
   if(selected){const a=this.screen(piece.x,piece.y);ctx.strokeStyle='#a8dbc1';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(a.x,a.y,10,0,Math.PI*2);ctx.stroke();}
  }
  if(this.view.tool==='guide'&&this.view.guidePreview){const gp=this.view.guidePreview;ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=gp.error?'#ef9874':'#8fe0cf';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();gp.path.forEach((v,i)=>{const p=this.screen(v.x,v.y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();if(this.view.mouse&&!gp.error)this.label(this.screen(this.view.mouse.x,this.view.mouse.y).x,this.screen(this.view.mouse.x,this.view.mouse.y).y-16,`${gp.pieces.length} pcs · ${gp.cost} assemblies`,'#caf0da',10);if(this.view.mouse&&gp.error)this.label(this.screen(this.view.mouse.x,this.view.mouse.y).x,this.screen(this.view.mouse.x,this.view.mouse.y).y-16,gp.error,'#f0b48d',10);ctx.restore();}
  if(this.view.editing&&this.view.objectSelection===this.view.editing){ctx.setLineDash([4,3]);ctx.strokeStyle='#f6e7ad';ctx.lineWidth=1.5;ctx.beginPath();this.view.waypoints.forEach((v,i)=>{const p=this.screen(v.x,v.y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);for(const v of this.view.waypoints){const p=this.screen(v.x,v.y);ctx.fillStyle='#f6e7ad';ctx.fillRect(p.x-3,p.y-3,6,6);ctx.strokeStyle='#142124';ctx.strokeRect(p.x-3,p.y-3,6,6);}}
  const ft=frontierTarget(w);if(ft){if(this.view.overlay){const target=this.screen(ft.x,ft.y);for(const e of w.entities.filter(e=>e.kind==='emitter'&&e.powered&&ft.emitters.includes(e.id))){const p=center(e),q=this.screen(p.x,p.y);const power=w.stats.network.ports[e.id]?.[0]?.incoming??0;if(power<.1)continue;ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(q.x,q.y,target.x,target.y);g.addColorStop(0,'#7bf2e52c');g.addColorStop(1,'#8bf0d350');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(q.x,q.y-3);ctx.lineTo(target.x,target.y-12);ctx.lineTo(target.x,target.y+12);ctx.lineTo(q.x,q.y+3);ctx.fill();ctx.strokeStyle='#a2edd594';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.restore();}}
   if(ft.health>0)this.sprite('armored-frontier-organism',ft.x-2,ft.y-2,4,4);else{this.atlas('depletion-debris-v1',3,ft.x-2,ft.y-2,4);const p=this.screen(ft.x,ft.y);ctx.strokeStyle='#9fd4ae';ctx.beginPath();ctx.arc(p.x,p.y,25,0,Math.PI*2);ctx.stroke();this.label(p.x,p.y,'CLEARED','#a7d6ae',10);}
   const target=this.screen(ft.x,ft.y);if(this.view.overlay){const rad=8+Math.max(0,40-w.stats.targetPower);ctx.strokeStyle='#8ae2cc88';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(target.x,target.y,rad,rad*.6,0,0,Math.PI*2);ctx.stroke();}
   this.label(target.x,target.y+2.6*s,w.frontier?'FRONTIER OPEN':`ARMORED ORGANISM · ${Math.ceil(ft.health)}`,'#ddd3ae',10);}
  for(const target of w.targets.filter(t=>t.kind==='process')){const p=this.screen(target.x,target.y);ctx.save();ctx.strokeStyle='#c9b06f99';ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.strokeRect(p.x-18,p.y-18,36,36);ctx.setLineDash([]);ctx.restore();if(this.view.overlay)this.label(p.x,p.y-24,'WORKPIECE','#e0cb92',8);
   if(this.view.overlay)for(const e of w.entities.filter(e=>e.kind==='emitter'&&e.powered&&target.emitters.includes(e.id))){const q=this.screen(center(e).x,center(e).y);ctx.save();ctx.strokeStyle='#b7e6a288';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();}}
  for(const e of [...w.entities].sort((a,b)=>a.y-b.y)){const d={...DEFS[e.kind],...footprint(e)},p=this.screen(e.x,e.y);if(p.x+d.w*s<0||p.y+d.h*s<0||p.x>this.width||p.y>this.height)continue;const selected=this.view.selected===e.id;ctx.fillStyle=selected?'#93dec715':'#121d211c';ctx.fillRect(p.x,p.y,d.w*s,d.h*s);if(selected){ctx.strokeStyle='#a8dbc1';ctx.lineWidth=1.5;ctx.strokeRect(p.x-2,p.y-2,d.w*s+4,d.h*s+4);}const visual=equipmentState(w,e);this.machine(e,1,visual,w.time);equipmentEffects(ctx,visual,p.x,p.y,d.w*s,d.h*s,w.time,this.motionPreference.matches);
   if(visual.work!=='running'||selected)this.label(p.x+d.w*s/2,p.y-7,visual.label,visual.work==='running'?'#b8d8ac':'#e4bd87',9);if(visual.damageLabel&&visual.condition!==3)this.label(p.x+d.w*s/2,p.y+d.h*s+14,visual.damageLabel,visual.condition===2?'#ef9874':'#cbb38e',8);
   if(e.temperature>55){ctx.fillStyle='#151b20';ctx.fillRect(p.x,p.y+d.h*s+3,d.w*s,3);ctx.fillStyle=e.temperature>85?'#ed8d70':'#d0ac6a';ctx.fillRect(p.x,p.y+d.h*s+3,d.w*s*Math.min(1,e.temperature/120),3);}
   if(this.view.tool==='field'||this.view.tool==='material'||this.view.tool==='power'||selected||this.view.overlay){const type=this.view.tool==='material'?'material':this.view.tool==='power'?'power':'field';ports(e,type).forEach((port,i)=>{const name=port.id,pp=port.position,q=this.screen(pp.x,pp.y);const pending=this.view.pending?.node===e.id&&this.view.pending.port===i;ctx.fillStyle=pending?'#f2cb7b':'#193234';ctx.strokeStyle=pending?'#f2cb7b':type==='material'?'#cba75f':type==='power'?'#be9adc':'#90d8c8';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+port.normal.x*12,q.y+port.normal.y*12);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(q.x,q.y,(this.view.tool==='field'||this.view.tool==='material'||this.view.tool==='power')?6:4,0,Math.PI*2);ctx.fill();ctx.stroke();if(this.view.tool==='field'||this.view.tool==='material'||this.view.tool==='power'||selected)this.label(q.x+(i<2?-10:10),q.y-8,name,'#caf0da',8);});}
  }
  for(const c of w.ecology.creatures){if(c.health<=0)continue;const p=this.screen(c.x,c.y);const previous=this.gait.get(c.id),distance=previous?Math.hypot(c.x-previous.x,c.y-previous.y):0,phase=((previous?.phase??0)+(distance<2?distance:0)*8)%4;this.gait.set(c.id,{x:c.x,y:c.y,phase});if(sprites['crawler-walk-v2'])this.atlas('crawler-walk-v2',c.heading*4+Math.floor(phase),c.x-.7,c.y-.7,1.4,1,4,4);else this.atlas('investigator-crawler-v1',c.heading,c.x-.7,c.y-.7,1.4);if(!sprites['investigator-crawler-v1']){ctx.fillStyle='#b79c72';ctx.beginPath();ctx.ellipse(p.x,p.y,9,6,0,0,Math.PI*2);ctx.fill();}if(c.state==='attack'||this.view.objectSelection===c.id){ctx.strokeStyle=c.state==='attack'?'#ff9879':'#e2ce92';ctx.beginPath();ctx.arc(p.x,p.y,s*.8,0,Math.PI*2);ctx.stroke();this.label(p.x,p.y-s,`${c.id.toUpperCase()} · ${c.state.toUpperCase()}`,ctx.strokeStyle,9);}}
  for(const shot of w.ecology.shots){const a=this.screen(shot.from.x,shot.from.y),b=this.screen(shot.to.x,shot.to.y);ctx.strokeStyle='#ffe7a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  if(this.view.pending&&this.view.mouse){const e=entity(w,this.view.pending.node),type=this.view.tool==='material'?'material':this.view.tool==='power'?'power':'field';if(e){const a=ports(e,type)[this.view.pending.port],hit=this.hitPort(w,this.view.mouse.x,this.view.mouse.y,type),target=hit?ports(entity(w,hit.node)!,type)[hit.port]:null;const path=target?findRoute(a,target,w.entities,WIDTH,HEIGHT,{diagonal:this.view.diagonal,waypoints:this.view.waypoints}):null;ctx.setLineDash([5,5]);ctx.strokeStyle=target&&!path?'#ef9874':'#dac38b';ctx.beginPath();(path??[a.position,...this.view.waypoints,{x:Math.round(this.view.mouse.x*2)/2,y:Math.round(this.view.mouse.y*2)/2}]).forEach((v,i)=>{const p=this.screen(v.x,v.y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);}}
  if(this.view.build){const at=this.view.mouse??this.view.cursor;if(at){const x=Math.floor(at.x),y=Math.floor(at.y),kind=this.view.build,rotation=this.view.rotation,d=footprint({kind,rotation}),p=this.screen(x,y),bad=placementError(w,kind,x,y,[],rotation);ctx.fillStyle=bad?'#eb7f7225':'#b4e4b320';ctx.strokeStyle=bad?'#ed8d7c':'#c4eac5';ctx.fillRect(p.x,p.y,d.w*s,d.h*s);ctx.strokeRect(p.x,p.y,d.w*s,d.h*s);if(this.view.cursor&&!this.view.mouse){ctx.strokeStyle='#f2cb7b';ctx.setLineDash([3,3]);ctx.strokeRect(p.x,p.y,d.w*s,d.h*s);ctx.setLineDash([]);}this.machine({kind,x,y,rotation},.6);}}
  if(this.view.tool==='blueprint'&&this.view.mouse&&w.blueprint){const p=this.screen(Math.floor(this.view.mouse.x),Math.floor(this.view.mouse.y));ctx.strokeStyle='#e9c67d';ctx.setLineDash([6,3]);ctx.strokeRect(p.x,p.y,w.blueprint.width*s,w.blueprint.height*s);ctx.setLineDash([]);}
  const selection=this.view.selection??[];
  if(selection.length){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const id of selection){const e=w.entities.find(v=>v.id===id);if(!e)continue;const f=footprint(e);minX=Math.min(minX,e.x);minY=Math.min(minY,e.y);maxX=Math.max(maxX,e.x+f.w);maxY=Math.max(maxY,e.y+f.h);}if(minX<Infinity){const a=this.screen(minX,minY),b=this.screen(maxX,maxY);ctx.save();ctx.strokeStyle='#e9c67d';ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.setLineDash([]);ctx.restore();}
   for(const l of w.links){const inA=selection.includes(l.a.node),inB=selection.includes(l.b.node);if(inA!==inB){ctx.save();ctx.strokeStyle='#ef9874';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();l.path.forEach((v,i)=>{const p=this.screen(v.x,v.y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);ctx.restore();}}
   for(const id of selection){const e=w.entities.find(v=>v.id===id);if(!e)continue;const f=footprint(e),p=this.screen(e.x,e.y);ctx.save();ctx.strokeStyle='#e9c67d';ctx.lineWidth=1.5;ctx.strokeRect(p.x,p.y,f.w*s,f.h*s);ctx.restore();}}
  if(this.view.selecting){const a=this.screen(this.view.selecting.x0,this.view.selecting.y0),b=this.screen(this.view.selecting.x1,this.view.selecting.y1);ctx.save();ctx.fillStyle='#8ae2cc22';ctx.strokeStyle='#8ae2ccaa';ctx.setLineDash([5,4]);ctx.fillRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y));ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y));ctx.setLineDash([]);ctx.restore();}
}
 /** Select a separately drawn ground-plane orientation. Never spin or mirror equipment art. */
 machine(e:{kind:Kind;x:number;y:number;rotation:Rotation;progress?:number},alpha=1,state?:EquipmentState,time=0){const a=APPEARANCE[e.kind],f=footprint(e),size=Math.max(f.w,f.h)*(a.scale??1.12);const conditionAsset=`${e.kind}-condition-v1`,damagedCycle=state&&state.condition>0&&state.condition<3?`${e.kind}-${state.condition===1?'light':'severe'}-cycle-v1`:undefined;
 // Ecology emits a short-lived shot each simulation step during sustained fire.
 // Start recoil on a real firing burst, advance only with world time, reset at rest.
 const shotKey=`${e.x},${e.y}`;
 if(e.kind==='sentry'){
  if(state?.work==='firing'){
   const start=this.firingSince.get(shotKey)??time-(state.shotAge??0);
   this.firingSince.set(shotKey,start);state={...state,shotAge:Math.max(0,time-start)};
  }else this.firingSince.delete(shotKey);
 }
 const animation=equipmentAnimation(e,state,time,this.motionPreference.matches);
 if(animation&&sprites[animation.clip.asset]){
  const {clip,frame}=animation,entry=clip.frames[frame],im=sprites[clip.asset],c=this.ctx;
  const p=this.screen(e.x+f.w/2,e.y+f.h/2+size*.43),k=size*this.scale/clip.logicalSize;
  const [sx,sy,w,h]=entry.source;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=alpha;
  c.drawImage(im,sx,sy,w,h,p.x-entry.anchor[0]*k,p.y-entry.anchor[1]*k,w*k,h*k);c.restore();return;
 }
 if(!sprites[a.asset]&&!a.sheet&&!a.views&&!a.animation){this.placeholder(e,alpha);return;}
 const off=state&&(state.condition===3||state.work==='tripped'||(!state.powered&&!state.passive)||(state.passive&&!state.field));
 const dynamicAsset=damagedCycle&&sprites[damagedCycle]?damagedCycle:a.animation?.asset;
 if(state&&!off&&dynamicAsset&&sprites[dynamicAsset]&&e.progress!==undefined&&(state.condition===0||damagedCycle&&sprites[damagedCycle])){const anim=a.animation!,frame=recipeFrame(e.progress,anim.period,4,this.motionPreference.matches||!state.moving);this.atlas(dynamicAsset,e.rotation*4+frame,e.x+f.w/2-size/2,e.y+f.h/2-size/2,size,alpha,4,4);return;}
 const serviceCycle=e.kind==='generator'?'generator-cycle-v1':e.kind==='sentry'?'sentry-fire-v1':null;
 if(state&&!off&&state.condition===0&&serviceCycle&&sprites[serviceCycle]){this.atlas(serviceCycle,e.rotation*4+(state.moving&&!this.motionPreference.matches?Math.floor(time*(e.kind==='sentry'?20:8))%4:0),e.x+f.w/2-size/2,e.y+f.h/2-size/2,size,alpha,4,4);return;}
 if(state&&sprites[conditionAsset]&&(off||state.condition>0)){this.atlas(conditionAsset,state.condition*4+e.rotation,e.x+f.w/2-size/2,e.y+f.h/2-size/2,size,alpha,4,4);return;}
 if(!state&&a.animation&&sprites[a.animation.asset]&&e.progress!==undefined){const anim=a.animation;this.atlas(anim.asset,e.rotation*4+recipeFrame(e.progress,anim.period,4,this.motionPreference.matches),e.x+f.w/2-size/2,e.y+f.h/2-size/2,size,alpha,4,4);return;}
 if(a.sheet&&sprites[a.sheet]){this.atlas(a.sheet,e.rotation,e.x+f.w/2-size/2+(a.offset?.x??0),e.y+f.h/2-size/2+(a.offset?.y??0),size,alpha);return;}this.sprite(a.views?.[e.rotation]??a.asset,e.x,e.y,f.w,f.h,alpha);}
 /** Visibly labeled placeholder until reviewed cell art exists; never borrow an unrelated generator sprite. */
 placeholder(e:{kind:Kind;x:number;y:number;rotation:Rotation},alpha=1){const f=footprint(e),p=this.screen(e.x,e.y),ctx=this.ctx,s=this.scale;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#26383a';ctx.fillRect(p.x,p.y,f.w*s,f.h*s);ctx.strokeStyle='#d6bf89';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.strokeRect(p.x+1.5,p.y+1.5,f.w*s-3,f.h*s-3);ctx.setLineDash([]);ctx.restore();this.label(p.x+f.w*s/2,p.y+f.h*s/2-.5,'FAB CELL','#e7d9a6',9);this.label(p.x+f.w*s/2,p.y+f.h*s/2+9,'PLACEHOLDER','#b9a97f',8);}
 atlas(id:string,frame:number,x:number,y:number,size:number,alpha=1,columns=2,rows=2){const im=sprites[id];if(!im)return;const p=this.screen(x,y),c=this.ctx,sw=im.naturalWidth/columns,sh=im.naturalHeight/rows;c.save();c.globalCompositeOperation='lighten';c.globalAlpha=alpha;const mapping=(frameMap as Record<string,{logicalSize:number;frames:{source:number[];offset:number[]}[]}>)[id],entry=mapping?.frames[frame];if(entry){const [sx,sy,w,h]=entry.source,k=size*this.scale/mapping.logicalSize;c.drawImage(im,sx,sy,w,h,p.x+entry.offset[0]*k,p.y+entry.offset[1]*k,w*k,h*k);}else c.drawImage(im,(frame%columns)*sw,Math.floor(frame/columns)*sh,sw,sh,p.x,p.y,size*this.scale,size*this.scale);c.restore();}
 sprite(id:string,x:number,y:number,w:number,h:number,alpha=1){const im=sprites[id];if(!im)return;const p=this.screen(x,y),ctx=this.ctx;const size=Math.max(w,h)*this.scale*1.16;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,p.x+w*this.scale/2-size/2,p.y+h*this.scale/2-size/2,size,size);ctx.restore();}
 label(x:number,y:number,text:string,color:string,size:number){const c=this.ctx;c.font=`${size}px "IBM Plex Mono", monospace`;c.textAlign='center';c.fillStyle='#142124d9';const width=c.measureText(text).width;c.fillRect(x-width/2-4,y-size,width+8,size+5);c.fillStyle=color;c.fillText(text,x,y);c.textAlign='left';}
}
