import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captureBlueprint,createWorld,deserialize,frontierDomain,frontierQualification,frontierTarget,remove,serialize,setController,step,type World} from '../src/sim/world';

const tick=(w:World,n:number)=>{for(let i=0;i<n;i++)step(w);};
/** Build a pre-v4 save from a current world so migration can be exercised without stale hand-written fixtures. */
const legacy=(w:World,version=3)=>{const s=JSON.parse(serialize(w));s.version=version;if(version===1){for(const e of s.entities)delete e.rotation;s.links=s.links.filter((l:{type:string})=>l.type!=='power').map(({id,a,b,type}:{id:string;a:unknown;b:unknown;type:string})=>({id,a,b,type}));if(s.blueprint){for(const e of s.blueprint.entities)delete e.rotation;s.blueprint.links=s.blueprint.links.filter((l:{type:string})=>l.type!=='power').map(({id,a,b,type}:{id:string;a:unknown;b:unknown;type:string})=>({id,a,b,type}));}}if(version===2)delete s.ecology;s.target={x:28,y:13,health:600};s.controller=false;s.commission={state:'idle',elapsed:0,minimum:null,rating:0,reason:'',revision:0};delete s.targets;delete s.references;delete s.domains;delete s.qualifications;delete s.process;return s;};

test('the world façade no longer exposes writable global target/controller/commission state',()=>{
 const w=createWorld() as unknown as Record<string,unknown>;
 assert.equal(w.target,undefined);assert.equal(w.controller,undefined);assert.equal(w.commission,undefined);
 const target=frontierTarget(createWorld())!,domain=frontierDomain(createWorld())!,qualification=frontierQualification(createWorld())!;
 assert.equal(target.kind,'frontier');assert.equal(domain.target,target.id);assert.equal(qualification.domain,domain.id);assert.equal(qualification.status,'idle');
});

test('v1/v2/v3 saves migrate physical state and build local frontier records',()=>{
 for(const version of [1,2,3]){
  const w=createWorld();tick(w,30);const source=legacy(w,version);const loaded=deserialize(JSON.stringify(source));
  assert.equal(loaded.version,4,`v${version} version`);
  assert.equal(loaded.entities.length,w.entities.length,`v${version} entities`);
  assert.deepEqual(loaded.stock,w.stock,`v${version} stock`);
  assert.equal(loaded.frontier,w.frontier,`v${version} frontier`);
  assert.equal(loaded.links.length,loaded.links.length);
  const target=frontierTarget(loaded)!;
  assert.equal(target.x,source.target.x);assert.equal(target.y,source.target.y);assert.equal(target.health,source.target.health);
  assert.deepEqual(target.emitters,loaded.entities.filter(e=>e.kind==='emitter').map(e=>e.id));
  const domain=frontierDomain(loaded)!;
  assert.deepEqual(domain.tuners,loaded.entities.filter(e=>e.kind==='tuner').map(e=>e.id));
  assert.equal(loaded.references.length,loaded.entities.filter(e=>e.kind==='reference').length);
  assert.ok(loaded.references.every(r=>r.group===r.source));
 }
});

test('a legacy qualified commission becomes a stale local certificate and a partial test resets',()=>{
 const w=createWorld();
 const stale=legacy(w,3);stale.commission={state:'qualified',elapsed:20,minimum:41,rating:41,reason:'old',revision:0};
 const loadedStale=deserialize(JSON.stringify(stale));assert.equal(frontierQualification(loadedStale)!.status,'stale');
 const partial=legacy(w,3);partial.commission={state:'testing',elapsed:7,minimum:41,rating:0,reason:'old',revision:0};
 const loadedPartial=deserialize(JSON.stringify(partial));const qualification=frontierQualification(loadedPartial)!;
 assert.equal(qualification.status,'idle');assert.equal(qualification.elapsed,0);assert.equal(qualification.minimum,-1);
});

test('a save with no reference migrates to a disabled domain with an explicit missing reference',()=>{
 const w=createWorld();remove(w,w.entities.find(e=>e.kind==='reference')!.id);
 const source=legacy(w,3);source.controller=true;
 const loaded=deserialize(JSON.stringify(source));
 assert.equal(frontierDomain(loaded)!.reference,null);assert.equal(frontierDomain(loaded)!.enabled,false);
});

test('v4 roundtrip preserves local records and the frontier domain enable flag',()=>{
 const w=createWorld();setController(w,true);tick(w,4);
 const loaded=deserialize(serialize(w));
 assert.deepEqual(loaded.targets,w.targets);assert.deepEqual(loaded.domains,w.domains);assert.deepEqual(loaded.references,w.references);assert.deepEqual(loaded.qualifications,w.qualifications);
 assert.equal(frontierDomain(loaded)!.enabled,true);
});

test('v4 loader rejects duplicate or dangling local identities',()=>{
 const base=()=>JSON.parse(serialize(createWorld()));
 const cases:[string,(s:any)=>void][]=[
  ['duplicate target id',s=>s.targets.push({...s.targets[0]})],
  ['unknown assigned emitter',s=>{s.targets[0].emitters=['e999'];}],
  ['emitter owned twice',s=>{s.targets.push({...s.targets[0],id:'t999',kind:'process',owner:null,emitters:[...s.targets[0].emitters]});}],
  ['domain references missing target',s=>{s.domains[0].target='t999';}],
  ['domain references missing binding',s=>{s.domains[0].reference='r999';}],
  ['two domains share a target',s=>{s.domains.push({...s.domains[0],id:'d999',name:'copy'});}],
  ['qualification references missing domain',s=>{s.qualifications[0].domain='d999';}],
  ['qualification has a negative counter',s=>{s.qualifications[0].counters=-1;}],
  ['process inventory exceeds the bounded lot cap',s=>{s.process.lots=Array.from({length:1001},(_,i)=>({id:`pl${i}`,kind:'scrap',recipe:'x',version:1,parent:'p',assemblies:0,crystal:0,disposition:'spent'}));}],
  ['duplicate process lot id',s=>{s.process.lots=[{id:'pl1',kind:'scrap',recipe:'x',version:1,parent:'p',assemblies:0,crystal:0,disposition:'spent'},{id:'pl1',kind:'reject',recipe:'x',version:1,parent:'p',assemblies:0,crystal:0,disposition:'recoverable'}];}],
 ];
 for(const [name,mutate] of cases){const s=base();mutate(s);assert.throws(()=>deserialize(JSON.stringify(s)),/Invalid/,name);}
});

test('v4 process inventory roundtrips and legacy blueprints still validate',()=>{
 const s=JSON.parse(serialize(createWorld()));
 s.process={accepted:2,lots:[{id:'pl1',kind:'reject',recipe:'standard-cell',version:1,parent:'p1',assemblies:2,crystal:1,disposition:'recoverable'}]};
 const loaded=deserialize(JSON.stringify(s));assert.equal(loaded.process.accepted,2);assert.equal(loaded.process.lots[0].id,'pl1');
 const w=createWorld();w.frontier=true;frontierQualification(w)!.status='qualified';assert.equal(captureBlueprint(w),'');
 const migrated=deserialize(JSON.stringify(legacy(w,3)));
 assert.equal(migrated.blueprint!.entities.length,w.blueprint!.entities.length);
 assert.deepEqual(migrated.blueprint!.entities.map(e=>e.id),w.blueprint!.entities.map(e=>e.id));
 assert.equal(deserialize(JSON.stringify(legacy(w,1))).blueprint!.entities.length,w.blueprint!.entities.length);
});

test('old malformed saves and unsupported versions remain rejected',()=>{
 assert.throws(()=>deserialize('{broken'),/Invalid|Unexpected|SyntaxError/);
 assert.throws(()=>deserialize(JSON.stringify({version:99})),/Invalid/);
 const s=JSON.parse(serialize(createWorld()));s.entities[0].x=-1;assert.throws(()=>deserialize(JSON.stringify(s)),/Invalid/);
 const nan=JSON.parse(serialize(createWorld()));nan.qualifications[0].minimum=Number.NaN;assert.throws(()=>deserialize(JSON.stringify(nan)),/Invalid/);
 const badBlueprint=JSON.parse(serialize(createWorld()));badBlueprint.blueprint={entities:[{id:'bad'}],links:[]};assert.throws(()=>deserialize(JSON.stringify(badBlueprint)),/Invalid/);
});
