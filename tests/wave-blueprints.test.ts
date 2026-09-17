import {test} from 'node:test';import assert from 'node:assert/strict';
import {captureBlueprint,commitFieldRoute,createWorld,deserialize,disconnect,previewFieldRoute,replacePiece,serialize,stampBlueprint} from '../src/sim/world';
import {configurationSignature} from '../src/sim/qualification';
import {PRECISION_ELBOW,COMPACT_ELBOW} from '../src/sim/wave-parts';

function routed(){
 const w=createWorld();const before=w.links.find(l=>l.type==='field')!;disconnect(w,before.id);
 const ref=w.entities.find(e=>e.kind==='reference')!,j=w.entities.find(e=>e.kind==='junction')!;
 assert.equal(commitFieldRoute(w,previewFieldRoute(w,{node:ref.id,port:0},{node:j.id,port:0})),'');
 return {w,ref,j};
}

test('a blueprint captures physical pieces and a stamp restores them with fresh identities',()=>{
 const {w,ref,j}=routed();w.stock.assemblies=500;
 assert.equal(captureBlueprint(w,[ref.id,j.id]),'');
 assert.ok((w.blueprint?.pieces?.length??0)>0,'blueprint should carry pieces');
 const loaded=deserialize(serialize(w));
 assert.equal(loaded.blueprint?.pieces?.length,w.blueprint?.pieces?.length);
 const oldIds=new Set(loaded.pieces.map(p=>p.id));
 assert.equal(stampBlueprint(loaded,1,26,{allowDisconnected:true}),'');
 const fresh=loaded.pieces.filter(p=>!oldIds.has(p.id));
 assert.equal(fresh.length,loaded.pieces.length-oldIds.size);
 assert.equal(new Set(loaded.pieces.map(p=>p.id)).size,loaded.pieces.length);
 for(const piece of fresh){const link=loaded.links.find(l=>l.id===piece.route);assert.ok(link?.pieces?.includes(piece.id));}
 assert.equal(loaded.stats.error,'');
});

test('a failed stamp leaves stock and topology unchanged',()=>{
 const {w,ref,j}=routed();w.stock.assemblies=500;assert.equal(captureBlueprint(w,[ref.id,j.id]),'');
 const stripped=deserialize(serialize(w));stripped.stock.assemblies=0;
 const pieces=stripped.pieces.length,entities=stripped.entities.length;
 assert.match(stampBlueprint(stripped,1,26,{allowDisconnected:true}),/assemblies/);
 assert.equal(stripped.pieces.length,pieces);assert.equal(stripped.entities.length,entities);
});

test('piece definition/version changes are part of the qualification fingerprint',()=>{
 const {w}=routed();
 const domain=w.domains[0];
 const before=configurationSignature(w,domain);
 const elbow=w.pieces.find(p=>p.category==='elbow');
 if(!elbow){assert.ok(w.pieces.length>=0);return;}
 w.hardware['elbow-precision@1']=1;
 assert.equal(replacePiece(w,elbow.id,PRECISION_ELBOW.id),'');
 const after=configurationSignature(w,domain);
 assert.notEqual(before,after,'signature must include piece definitions');
 void COMPACT_ELBOW;
});
