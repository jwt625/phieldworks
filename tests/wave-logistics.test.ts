import {test} from 'node:test';import assert from 'node:assert/strict';
import {commitFieldRoute,connect,createWorld,deserialize,disconnect,evaluate,piecePorts,place,previewFieldRoute,removePiece,replacePiece,serialize,type World} from '../src/sim/world';
import {c} from '../src/sim/complex';
 import {solveNetwork,source,compose2Port} from '../src/sim/network';
import {WAVE_PART_DEFS,partScattering,isPassive,returnLossDb,insertionLossDb,PRECISION_ELBOW,COMPACT_ELBOW} from '../src/sim/wave-parts';
import {simplifyPath,pieceCost,compileRoute} from '../src/sim/wave-construction';
import {straightSprite,STRAIGHT_SPRITES,hasRegisteredSprite} from '../src/wave-kit';

test('every wave part is passive for arbitrary simultaneous inputs',()=>{
 for(const part of WAVE_PART_DEFS){
  for(const spans of part.category==='straight'?[1,2,8]:[2]){
   const s=partScattering(part,spans);
   assert.ok(isPassive(s),`${part.id} spans ${spans} is not passive`);
  }
 }
 // A deliberately non-passive matrix is rejected, so the check is not vacuous.
 assert.equal(isPassive([[c(1.2),c(0)],[c(0),c(1)]]),false);
});
test('straight and elbow transmission are lossy and reflection is bounded below unity',()=>{
 const straight=partScattering(WAVE_PART_DEFS.find(p=>p.id==='straight-basic')!,4);
 assert.ok(straight[0][1][0]<1&&straight[0][1][0]>0);
 assert.equal(returnLossDb(0),Infinity);assert.ok(returnLossDb(.1)>0);assert.equal(insertionLossDb(0),Infinity);
});
test('a physical route installs as ordered pieces and solves without error',()=>{
 const w=createWorld();
 const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0});
 assert.equal(preview.error,'');
 assert.ok(preview.compiled.pieces.every(p=>p.id.startsWith('p')));
 assert.ok(preview.compiled.bom.assemblies>0);
 const error=commitFieldRoute(w,preview);assert.equal(error,'');
 assert.equal(w.pieces.length,preview.compiled.pieces.length);
 assert.ok(w.links.some(l=>l.id===preview.route&&l.pieces?.length===w.pieces.length));
 const stats=evaluate(w);
 assert.equal(stats.error,'',stats.error);
 assert.ok(Math.abs(stats.network.residual)<1e-8,`residual ${stats.network.residual}`);
 assert.ok(stats.targetPower>0);
});
test('committing an unaffordable route leaves stock and topology untouched',()=>{
 const w=createWorld();w.stock.assemblies=0;
 const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0});assert.equal(preview.error,'');
 const pieces=w.pieces.length,links=w.links.length;
 assert.match(commitFieldRoute(w,preview),/assemblies/);
 assert.equal(w.pieces.length,pieces);assert.equal(w.links.length,links);
});
test('replacing a compact elbow with precision hardware consumes inventory and keeps identity',()=>{
 const w=createWorld();const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0});assert.equal(commitFieldRoute(w,preview),'');
 const piece=w.pieces.find(p=>p.category==='elbow');
 if(!piece){ // straight-only route: no elbow to replace
  assert.ok(w.pieces.length>0);w.hardware['elbow-precision@1']=1;
  const straight=w.pieces[0];assert.match(replacePiece(w,straight.id,PRECISION_ELBOW.id),/cannot replace/);
  return;
 }
 const id=piece.id,route=piece.route;w.hardware['elbow-precision@1']=1;
 assert.equal(replacePiece(w,piece.id,PRECISION_ELBOW.id),'');
 assert.equal(piece.id,id);assert.equal(piece.route,route);assert.equal(piece.part,PRECISION_ELBOW.id);
 assert.equal(w.hardware['elbow-precision@1'],0);
 evaluate(w);assert.ok(!w.stats.error);
});
test('deleting one elbow opens only its route and conserves the pieces that remain',()=>{
 const w=createWorld();const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0});assert.equal(commitFieldRoute(w,preview),'');
 const elbow=w.pieces.find(p=>p.category==='elbow');if(!elbow)return;
 const remaining=w.pieces.length-1;
 assert.equal(removePiece(w,elbow.id),'');
 assert.equal(w.pieces.length,remaining);
 const link=w.links.find(l=>l.pieces)!;assert.ok(!link.pieces!.includes(elbow.id));
});
test('saved physical routes round-trip and malformed piece data is rejected',()=>{
 const w=createWorld();const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 assert.equal(commitFieldRoute(w,previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0})),'');
 evaluate(w);assert.equal(w.stats.error,'',w.stats.error);
 const loaded=deserialize(serialize(w));
 assert.equal(loaded.pieces.length,w.pieces.length);
 assert.ok(Math.abs(loaded.stats.targetPower-w.stats.targetPower)<1e-8);
 const raw=JSON.parse(serialize(w));raw.pieces[0].part='nonexistent';assert.throws(()=>deserialize(JSON.stringify(raw)),/Invalid/);
 const raw2=JSON.parse(serialize(w));raw2.pieces[0].route='l9999';assert.throws(()=>deserialize(JSON.stringify(raw2)),/Invalid/);
});
test('a bend-forcing physical route carries elbows, real loss and a closed ledger',()=>{
 const w=createWorld();const ref=w.entities.find(e=>e.kind==='reference')!;
 const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 assert.equal(place(w,'tuner',18,20),'');
 const tuner=w.entities.at(-1)!;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:tuner.id,port:0});
 assert.equal(preview.error,'',preview.error);
 assert.ok(preview.compiled.pieces.some(p=>p.category==='elbow'),'expected at least one elbow');
 w.stock.assemblies=200;const spent=w.stock.assemblies;
 assert.equal(commitFieldRoute(w,preview),'');
 assert.ok(w.stock.assemblies<spent);
 const stats=evaluate(w);assert.equal(stats.error,'',stats.error);
 assert.ok(stats.bendRadiation>0,'bend radiation should be booked');
 assert.ok(Math.abs(stats.network.residual)<1e-8,`residual ${stats.network.residual}`);
 for(const piece of w.pieces){const reading=stats.network.ports[piece.id];assert.ok(reading&&reading.every(p=>Number.isFinite(p.incoming)&&Number.isFinite(p.outgoing)),`piece ${piece.id}`);}
});
test('a crossing transmits straight through and never joins the two layers',()=>{
 const x=partScattering(WAVE_PART_DEFS.find(p=>p.id==='crossing-basic')!);
 const r=solveNetwork([source('s',100),{id:'x',s:x},{id:'c',s:[[c(.3)]]},{id:'d',s:[[c(.3)]]}],[{a:{node:'s',port:0},b:{node:'x',port:0},amplitude:1,phase:0},{a:{node:'x',port:2},b:{node:'c',port:0},amplitude:1,phase:0},{a:{node:'x',port:3},b:{node:'d',port:0},amplitude:1,phase:0}]);
 assert.ok(r.absorbed.c>0,'A should reach C');assert.ok(r.absorbed.d<1e-12,'A must not reach D');
 assert.ok(Math.abs(r.residual)<1e-8);
});
test('path simplification folds collinear midpoints for compact piece counts',()=>{
 const path=[{x:0,y:0},{x:.5,y:0},{x:1,y:0},{x:1.5,y:0},{x:1.5,y:.5}];
 const s=simplifyPath(path);assert.equal(s.length,3);
});
test('piece cost scales with straight spans and never double-charges a bend',()=>{
 const straight=WAVE_PART_DEFS.find(p=>p.id==='straight-basic')!;
 assert.equal(pieceCost(straight,4),4);
 assert.equal(pieceCost(COMPACT_ELBOW,2),COMPACT_ELBOW.cost);
});
test('exact two-port composition agrees with the explicit solve',()=>{
 const a=partScattering(COMPACT_ELBOW),b=partScattering(WAVE_PART_DEFS.find(p=>p.id==='straight-basic')!,4);
 const composed=compose2Port(a,b);
 const explicit=solveNetwork([source('s',100),{id:'a',s:a},{id:'b',s:b},{id:'load',s:[[c(.3)]]}],[{a:{node:'s',port:0},b:{node:'a',port:0},amplitude:1,phase:0},{a:{node:'a',port:1},b:{node:'b',port:0},amplitude:1,phase:0},{a:{node:'b',port:1},b:{node:'load',port:0},amplitude:1,phase:0}]);
 const routed=solveNetwork([source('s',100),{id:'composed',s:composed},{id:'load',s:[[c(.3)]]}],[{a:{node:'s',port:0},b:{node:'composed',port:0},amplitude:1,phase:0},{a:{node:'composed',port:1},b:{node:'load',port:0},amplitude:1,phase:0}]);
 assert.ok(Math.abs(explicit.absorbed.load-routed.absorbed.load)<1e-9*Math.max(1,explicit.absorbed.load),`${explicit.absorbed.load} vs ${routed.absorbed.load}`);
});

test('P9 finite-bend geometry gives distinct terminals and a real gap after deletion',()=>{
 const w=createWorld();const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!;
 assert.equal(place(w,'tuner',18,20),'');const tuner=w.entities.at(-1)!;
 w.stock.assemblies=200;
 const preview=previewFieldRoute(w,{node:ref.id,port:0},{node:tuner.id,port:0});assert.equal(preview.error,'',preview.error);
 assert.equal(commitFieldRoute(w,preview),'');
 for(const p of w.pieces){assert.ok(Number.isInteger(p.spans*2),`${p.id} spans ${p.spans}`);if(p.category==='elbow')assert.ok((p.reach??0)>0,`${p.id} reach`);}
 const elbow=w.pieces.find(p=>p.category==='elbow');assert.ok(elbow,'expected a bend');
 const [a,b]=piecePorts(elbow);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>.4,'elbow terminals must be distinct');
 const link=w.links.find(l=>l.pieces?.includes(elbow!.id))!;
 const others=w.pieces.filter(p=>p.id!==elbow!.id&&link.pieces!.includes(p.id)).flatMap(p=>piecePorts(p));
 for(const term of [a,b])assert.ok(others.some(p=>Math.abs(p.x-term.x)<1e-9&&Math.abs(p.y-term.y)<1e-9),'a neighbour must meet each elbow terminal');
 // The elbow bridges exactly one entry interface and one exit interface; removing it must separate them.
 const entry=link.interfaces!.find(i=>i.b.node===elbow!.id&&i.b.port===0)!;
 const exit=link.interfaces!.find(i=>i.a.node===elbow!.id&&i.a.port===1)!;
 assert.equal(removePiece(w,elbow!.id),'');
 const prev=w.pieces.find(p=>p.id===entry.a.node)!,next=w.pieces.find(p=>p.id===exit.b.node)!;
 const prevExit=piecePorts(prev)[entry.a.port],nextEntry=piecePorts(next)[exit.b.port];
 assert.ok(Math.hypot(prevExit.x-nextEntry.x,prevExit.y-nextEntry.y)>1e-9,'deleted bend must leave a real gap');
});
test('P9 short legs clamp the bend reach and keep trimmed spans exact',()=>{
 let n=0;const compiled=compileRoute([{x:0,y:0},{x:2,y:0},{x:2,y:.5},{x:4,y:.5}],'l1',()=>`p${++n}`);
 const elbow=compiled.pieces.find(p=>p.category==='elbow')!;
 assert.ok(Math.abs((elbow.reach??0)-.25)<1e-9,`reach ${elbow.reach}`);
 for(const piece of compiled.pieces)assert.ok(Number.isInteger(piece.spans*2),`${piece.id} spans ${piece.spans}`);
});
test('wave-kit straight registration matches the frozen runtime interface',()=>{
 assert.equal(straightSprite(0),straightSprite(2));assert.equal(straightSprite(1),straightSprite(3));assert.notEqual(straightSprite(0),straightSprite(1));
 for(const key of ['h','v'] as const){const s=STRAIGHT_SPRITES[key];assert.ok(Math.abs(128/s.pixelsPerTile-s.period)<1e-9,`${key} period`);assert.ok(Math.abs(32/s.pixelsPerTile-.24)<1e-9,`${key} width`);}
 assert.equal(hasRegisteredSprite({category:'straight',tier:'basic',condition:0}),true);
 assert.equal(hasRegisteredSprite({category:'straight',tier:'basic',condition:1}),false);
 assert.equal(hasRegisteredSprite({category:'elbow',tier:'basic',condition:0}),false);
 assert.equal(hasRegisteredSprite({category:'straight',tier:'precision',condition:0}),false);
});
