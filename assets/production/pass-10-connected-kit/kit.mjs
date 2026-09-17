/** Renderer-native interface geometry with original generated material detail.
 * No source image is modified. Coordinate units are authoring pixels, not world tiles.
 * Draw routes with drawAssembly so sampling seams are closed only at declared joins.
 */
export const SIZE=128;
export const WIDTH=32;
export const directions=['N','E','S','W'];
export const opposite={N:'S',E:'W',S:'N',W:'E'};
export const delta={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
export const terminals={N:[64,0],E:[128,64],S:[64,128],W:[0,64]};
export const kinds=['h','v','bend-ws','bend-nw','bend-ne','bend-es','junction','cross-h','cross-v'];
export const portMap={h:['W','E'],v:['N','S'],'bend-ws':['W','S'],'bend-nw':['N','W'],'bend-ne':['N','E'],'bend-es':['E','S'],junction:['W','N','E','S'],'cross-h':['W','N','E','S'],'cross-v':['W','N','E','S']};
export function connections(kind){return kind.startsWith('cross')?[['W','E'],['N','S']]:[portMap[kind]];}
const rotations={'ws':0,'nw':1,'ne':2,'es':3};
const materials=new WeakMap();
function materialFor(texture,tier){
 let variants=materials.get(texture);if(!variants){variants={};materials.set(texture,variants);}
 if(variants[tier])return variants[tier];
 const material=document.createElement('canvas');material.width=128;material.height=128;
 const m=material.getContext('2d');m.fillStyle='#e8e1d0';m.fillRect(0,0,128,128);
 const detail=document.createElement('canvas');detail.width=128;detail.height=128;
 const d=detail.getContext('2d');d.drawImage(texture,100,570,110,110,0,0,128,128);
 // A feathered material overlay avoids a rectangular texture patch. This is a
 // runtime material pass; the generated input file is never rewritten.
 const feather=d.createRadialGradient(64,64,12,64,64,36);feather.addColorStop(0,'#fff');feather.addColorStop(1,'#fff0');
 d.globalCompositeOperation='destination-in';d.fillStyle=feather;d.fillRect(0,0,128,128);
 m.globalAlpha=tier==='precision'?.16:.36;m.drawImage(detail,0,0);
 return variants[tier]=material;
}
function pathFor(kind){
 const p=new Path2D();
 if(kind==='h'){p.moveTo(-2,64);p.lineTo(130,64);return p;}
 if(kind==='v'){p.moveTo(64,-2);p.lineTo(64,130);return p;}
 const suffix=kind.split('-')[1],swept=kind.startsWith('swept');
 p.moveTo(-2,64);p.lineTo(swept?16:36,64);
 p.arcTo(64,64,64,112,swept?48:28);p.lineTo(64,130);
 const q=new Path2D();q.addPath(p,new DOMMatrix().translate(64,64).rotate(90*rotations[suffix]).translate(-64,-64));return q;
}
function shell(ctx,path,tier,texture){
 ctx.lineCap='butt';ctx.lineJoin='round';
 for(const [width,color] of [[32,'#263035'],[29,'#727878'],[24,'#353e41'],[20,'#d8d0bb'],[17,'#e8e1d0']]){ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke(path);}
 // Generated detail is only inside the center of a piece. Connector aprons are
 // deterministic and identical across tiers/orientations; no source pixel repairs.
 if(texture){
  ctx.save();ctx.lineWidth=15;
  const mask=new Path2D();mask.roundRect(28,28,72,72,10);ctx.clip(mask);
  // Uniform scale, restrained ceramic crop from the original horizontal pilot.
  ctx.strokeStyle=ctx.createPattern(materialFor(texture,tier),'no-repeat');ctx.stroke(path);ctx.restore();
 }
}
function band(ctx,x,y,vertical,tier){
 ctx.save();ctx.translate(x,y);
 // Shape geometry rotates, not raster lighting. No baked active indicators.
 if(vertical){ctx.fillStyle='#414b4e';ctx.fillRect(-17,-5,34,10);ctx.fillStyle=tier==='precision'?'#d0a273':'#ae815d';ctx.fillRect(-14,-3,28,6);ctx.fillStyle='#ead1aa';ctx.fillRect(-14,-3,28,1);}
 else {ctx.fillStyle='#414b4e';ctx.fillRect(-5,-17,10,34);ctx.fillStyle=tier==='precision'?'#d0a273':'#ae815d';ctx.fillRect(-3,-14,6,28);ctx.fillStyle='#ead1aa';ctx.fillRect(-3,-14,1,28);}
 ctx.restore();
}
export function drawTile(ctx,kind,tier='basic',texture=null){
 if(!portMap[kind])throw Error('Unknown kit kind '+kind);
 if(kind==='junction'){
  shell(ctx,pathFor('h'),tier,texture);shell(ctx,pathFor('v'),tier,texture);
  ctx.fillStyle='#727878';ctx.fillRect(41,41,46,46);ctx.fillStyle='#d8d0bb';ctx.fillRect(45,45,38,38);
  ctx.strokeStyle=tier==='precision'?'#d0a273':'#566064';ctx.lineWidth=tier==='precision'?5:3;ctx.strokeRect(48,48,32,32);
  for(const [x,y] of [[47,47],[81,47],[47,81],[81,81]]){ctx.fillStyle='#394246';ctx.fillRect(x-2,y-2,4,4);}
 }else if(kind.startsWith('cross')){
  const top=kind==='cross-h'?'h':'v',bottom=top==='h'?'v':'h';
  shell(ctx,pathFor(bottom),tier,texture);
  // Separation shadow/abutments are wholly internal; no impact on edge profile.
  ctx.fillStyle='#101619';if(top==='h')ctx.fillRect(35,42,58,50);else ctx.fillRect(42,35,50,58);
  shell(ctx,pathFor(top),tier,texture);
  if(top==='h'){band(ctx,36,64,false,tier);band(ctx,92,64,false,tier);ctx.fillStyle='#05090b';ctx.fillRect(48,83,32,5);}
  else {band(ctx,64,36,true,tier);band(ctx,64,92,true,tier);ctx.fillStyle='#05090b';ctx.fillRect(83,48,5,32);}
 }else{
  const path=pathFor(kind);shell(ctx,path,tier,texture);
  if(kind==='h')band(ctx,64,64,false,tier);
  else if(kind==='v')band(ctx,64,64,true,tier);
  else if(tier==='precision'){
   // Copper outside reinforcement is interior-only; never changes mating profile.
   const suffix=kind.split('-')[1],p=new Path2D();p.moveTo(37,53);p.quadraticCurveTo(75,53,75,91);
   const q=new Path2D();q.addPath(p,new DOMMatrix().translate(64,64).rotate(90*rotations[suffix]).translate(-64,-64));
   ctx.strokeStyle='#c79a6a';ctx.lineWidth=5;ctx.stroke(q);
  }
 }
 // Curves and lines can differ by one antialiasing channel at a boundary.
 // Finish with identical native aprons, including outside sampling gutters.
 for(const dir of portMap[kind]){
  const [x,y]=terminals[dir],axis=dir==='E'||dir==='W'?'h':'v';
  if(axis==='h')ctx.clearRect(x-2,y-18,4,36);else ctx.clearRect(x-18,y-2,36,4);
  joinPatch(ctx,x,y,axis);
 }
}
function joinPatch(ctx,x,y,axis){
 // Exact same cross section. Cover raster sampling cracks at a *real* mating seam.
 for(const [width,color] of [[32,'#263035'],[29,'#727878'],[24,'#353e41'],[20,'#d8d0bb'],[17,'#e8e1d0']]){
  ctx.fillStyle=color;
  if(axis==='h')ctx.fillRect(x-2,y-width/2,4,width);else ctx.fillRect(x-width/2,y-2,width,4);
 }
}
function openEnd(ctx,x,y,dir){
 ctx.fillStyle='#171e22';
 if(dir==='W'||dir==='E'){ctx.fillRect(x+(dir==='W'?0:-4),y-12,4,24);ctx.fillStyle='#bd956d';ctx.fillRect(x+(dir==='W'?3:-5),y-15,2,30);}
 else {ctx.fillRect(x-12,y+(dir==='N'?0:-4),24,4);ctx.fillStyle='#bd956d';ctx.fillRect(x-15,y+(dir==='N'?3:-5),30,2);}
}
export function topology(tiles){
 const map=new Map(tiles.map(t=>[`${t.x},${t.y}`,t]));if(map.size!==tiles.length)throw Error('Overlapping pieces');
 const joins=[],open=[];
 for(const t of tiles)for(const dir of portMap[t.kind]){
  const [dx,dy]=delta[dir],peer=map.get(`${t.x+dx},${t.y+dy}`);
  if(peer&&portMap[peer.kind].includes(opposite[dir])){if(dir==='E'||dir==='S')joins.push({a:t,b:peer,dir});}
  else open.push({tile:t,dir});
 }
 return {joins,open};
}
export function drawAssembly(ctx,tiles,{scale=1,offsetX=0,offsetY=0,texture=null,showGrid=false,atlas=null}={}){
 ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
 for(const t of tiles){ctx.save();ctx.translate(t.x*SIZE,t.y*SIZE);ctx.beginPath();ctx.rect(0,0,SIZE,SIZE);ctx.clip();
  if(atlas){const entry=atlas.entries.find(e=>e.kind===t.kind&&e.tier===(t.tier??'basic'));if(!entry)throw Error('Missing atlas entry');ctx.drawImage(atlas.image,...entry.rect,0,0,SIZE,SIZE);}
  else drawTile(ctx,t.kind,t.tier,texture);ctx.restore();}
 const net=topology(tiles);
 for(const {a,dir} of net.joins){const p=terminals[dir];joinPatch(ctx,a.x*SIZE+p[0],a.y*SIZE+p[1],dir==='E'?'h':'v');}
 for(const {tile,dir} of net.open){const p=terminals[dir];openEnd(ctx,tile.x*SIZE+p[0],tile.y*SIZE+p[1],dir);}
 if(showGrid){ctx.strokeStyle='#e9646760';ctx.lineWidth=1/scale;for(const t of tiles)ctx.strokeRect(t.x*SIZE,t.y*SIZE,SIZE,SIZE);}
 ctx.restore();return net;
}
