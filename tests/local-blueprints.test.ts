import {test} from 'node:test';
import assert from 'node:assert/strict';
import {beginProcessQualification,blueprintCost,captureBlueprint,createWorld,deserialize,evaluate,newEntity,serialize,setDomainEnabled,stampBlueprint,type World} from '../src/sim/world';
import {runPrecisionCellFixture} from '../scripts/precision-cell-fixture';

const base=runPrecisionCellFixture();
const [gen,ref,junc,tun,emitterA,emitterB,cell]=base.standalone;
const clone=()=>{const w=structuredClone(base.world);w.stock.assemblies=200;return w;};

test('capturing a selection strips runtime state and stamping creates fresh nested identities',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone),'');const blueprint=w.blueprint!;
 assert.equal(blueprint.version,2);assert.ok(blueprint.targets.length>=1);assert.ok(blueprint.domains.length>=1);assert.ok(blueprint.references.length>=1);
 assert.ok(blueprint.entities.every(e=>e.ore===0&&e.progress===0&&e.health===100&&!e.powered));assert.ok(blueprint.links.every(l=>l.packets.length===0));
 const beforeEntities=w.entities.length,beforeStock=w.stock.assemblies,beforeTargets=w.targets.length,beforeDomains=w.domains.length,cost=blueprintCost(w);
 assert.equal(stampBlueprint(w,46,2),'');
 assert.equal(w.stock.assemblies,beforeStock-cost);assert.ok(w.entities.length>beforeEntities);assert.equal(w.targets.length,beforeTargets+blueprint.targets.length);assert.equal(w.domains.length,beforeDomains+blueprint.domains.length);
 assert.ok(w.entities.slice(beforeEntities).every(e=>!base.standalone.includes(e.id)));
 assert.ok(w.qualifications.slice(-blueprint.domains.length).every(q=>q.status==='idle'));
});

test('an unresolved external reference slot blocks deployment unless explicitly disconnected',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone.filter(id=>id!==ref)),'');
 assert.ok(w.blueprint!.slots.some(s=>s.kind==='reference'));
 const before=serialize(w);const beforeStock=w.stock.assemblies;
 assert.match(stampBlueprint(w,46,2),/Resolve external services/);assert.equal(serialize(w),before);assert.equal(w.stock.assemblies,beforeStock);
 assert.equal(stampBlueprint(w,46,2,{allowDisconnected:true}),'');
 const domain=w.domains.at(-1)!;assert.equal(domain.enabled,false);assert.equal(domain.reference,null);
 assert.equal(w.qualifications.find(q=>q.domain===domain.id)!.status,'idle');
});

test('a blocked footprint leaves entities, ids and stock unchanged',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone),'');
 const before={entities:w.entities.length,nextId:w.nextId,stock:w.stock.assemblies,save:serialize(w)};
 assert.ok(stampBlueprint(w,40,18));
 assert.equal(w.entities.length,before.entities);assert.equal(w.nextId,before.nextId);assert.equal(w.stock.assemblies,before.stock);assert.equal(serialize(w),before.save);
});

test('exhausted stock blocks deployment before any placement',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone),'');w.stock.assemblies=5;
 const before=w.entities.length;assert.match(stampBlueprint(w,46,2),/requires/);assert.equal(w.entities.length,before);
});

test('an internal source copy starts a fresh coherence group',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone),'');const originals=new Set(w.references.map(r=>r.group));
 assert.equal(stampBlueprint(w,46,2),'');
 const created=w.references.filter(r=>!originals.has(r.group));
 assert.ok(created.length>=1);assert.ok(created.every(r=>r.group===r.source));
});

test('resolving a controller slot to an already-owned tuner is rejected',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone.filter(id=>id!==tun)),'');
 const slot=w.blueprint!.slots.find(s=>s.kind==='controller')!;assert.ok(slot);
 const before=w.entities.length;assert.match(stampBlueprint(w,46,2,{resolved:{[slot.id]:tun}}),/already owned/);assert.equal(w.entities.length,before);
});

test('legacy blueprint geometry migrates to a version-2 template with no copied runtime state',()=>{
 const w=createWorld();const emitter=newEntity('emitter',0,0,'e1');const save=JSON.parse(serialize(w));
 save.blueprint={entities:[emitter],links:[],width:3,height:3};
 const loaded=deserialize(JSON.stringify(save));assert.equal(loaded.blueprint!.version,2);
 assert.deepEqual(loaded.blueprint!.targets,[]);assert.deepEqual(loaded.blueprint!.domains,[]);assert.deepEqual(loaded.blueprint!.slots,[]);assert.equal(loaded.blueprint!.entities.length,1);
});

test('a stamped cell commissions independently while the original keeps its certificate',()=>{
 const w=clone();assert.equal(captureBlueprint(w,base.standalone),'');assert.equal(stampBlueprint(w,46,2),'');evaluate(w);
 const domain=w.domains.at(-1)!;const target=w.targets.find(t=>t.id===domain.target)!;
 assert.ok(target.owner);assert.equal(target.emitters.length,2);assert.ok(domain.reference);
 assert.equal(w.qualifications.find(q=>q.domain===domain.id)!.status,'idle');
 assert.equal(setDomainEnabled(w,domain.id,true),'');assert.equal(beginProcessQualification(w,target.id),'');
 assert.equal(w.qualifications.find(q=>q.domain===domain.id)!.status,'testing');
 assert.equal(w.qualifications.find(q=>q.domain===base.cellDomain)!.status,'qualified');
});
