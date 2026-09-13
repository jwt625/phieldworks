import {test} from 'node:test';
import assert from 'node:assert/strict';
import {c,power,polar} from '../src/sim/complex';
import {coupledField,projectFrontier,projectTwoZone} from '../src/sim/targets';
import {assignEmitter,connect,createWorld,evaluate,place,type World} from '../src/sim/world';

const close=(a:number,b:number,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const armed=()=>{const w=createWorld();assert.equal(place(w,'tuner',17,12),'');const t=w.entities.at(-1)!;assert.equal(place(w,'emitter',20,12),'');const e=w.entities.at(-1)!;assert.equal(connect(w,'power',{node:w.entities.find(x=>x.kind==='generator')!.id,port:0},{node:e.id,port:0}),'');const j=w.entities.find(x=>x.kind==='junction')!;assert.equal(connect(w,'field',{node:j.id,port:3},{node:t.id,port:0}),'');assert.equal(connect(w,'field',{node:t.id,port:1},{node:e.id,port:0}),'');evaluate(w);return {w,e,t};};
const target=(kind:'frontier'|'process')=>({id:'t100',kind,owner:null,x:40,y:20,health:0,emitters:[] as string[],contract:'standard-cell'});
const frontierId=(w:World)=>w.targets.find(t=>t.kind==='frontier')!.id;

test('two-zone analytic oracle: a phase sweep keeps captured power constant',()=>{
 const x0=polar(Math.sqrt(20),0);
 for(const [phase,useful,guard] of [[0,40,0],[Math.PI/2,20,20],[Math.PI,0,40]] as const){
  const reading=projectTwoZone({g:[x0,polar(Math.sqrt(20),phase)]});
  close(reading.captured,40);close(reading.useful,useful);close(reading.guard,guard);close(reading.captured,reading.useful+reading.guard);
 }
});

test('unequal equal-phase inputs conserve captured power across the two modes',()=>{
 const reading=projectTwoZone({g:[c(Math.sqrt(30)),c(Math.sqrt(10))]});
 close(reading.captured,40);close(reading.useful,(Math.sqrt(30)+Math.sqrt(10))**2/2);close(reading.guard,(Math.sqrt(30)-Math.sqrt(10))**2/2);
});

test('independent coherence groups add powers and ignore the inter-group phase',()=>{
 const groupA=[polar(Math.sqrt(10),0),polar(Math.sqrt(10),Math.PI/2)];
 for(const theta of [0,.7,2.1,Math.PI]){const groupB=[polar(Math.sqrt(10),theta),polar(Math.sqrt(10),theta+Math.PI/2)];const reading=projectTwoZone({a:groupA,b:groupB});close(reading.useful,20);close(reading.guard,20);close(reading.captured,40);}
 close(projectTwoZone({a:groupA}).captured,20);
});

test('coupled power stays within the emitter capture bound and frontier keeps max(2,count)',()=>{
 for(const d of [0,1,5,20]){const expected=(1-.08**2)*.92*Math.min(.88,50/(d*d+30));close(power(coupledField(c(1),d)),expected);}
 close(projectFrontier({g:[c(Math.sqrt(10)),c(Math.sqrt(10))]},2).useful,power(c(2*Math.sqrt(10)))/2);
 close(projectFrontier({g:[c(2)]},1).useful,power(c(2))/2);
 assert.equal(projectFrontier({g:[c(1)]},1).guard,0);
});

test('placing an emitter auto-assigns it to the only frontier target, and removing releases it',()=>{
 const {w,e}=armed();const id=frontierId(w);
 assert.ok(w.targets.find(t=>t.id===id)!.emitters.includes(e.id));
 const before=w.stats.targets[id].useful;
 assert.equal(assignEmitter(w,e.id,null),'');evaluate(w);
 assert.ok(w.stats.targets[id].useful<before);
 assert.equal(w.stats.targets[id].emitters,1);
 assert.ok(w.stats.offTarget>0);
});

test('reassigning an emitter moves delivery between targets without double-counting',()=>{
 const {w,e}=armed();const frontier=frontierId(w);w.targets.push(target('process'));evaluate(w);
 const before=w.stats.targets[frontier].useful;
 assert.equal(assignEmitter(w,e.id,'t100'),'');evaluate(w);
 assert.ok(w.stats.targets[frontier].useful<before);
 assert.equal(w.stats.targets['t100'].emitters,1);
 assert.ok(w.stats.targets['t100'].captured>0);
 assert.equal(w.targets.find(t=>t.id==='t100')!.emitters.includes(e.id),true);
 assert.equal(w.targets.find(t=>t.id===frontier)!.emitters.includes(e.id),false);
});

test('two targets split captured power and the world ledger closes',()=>{
 const {w,e}=armed();const frontier=frontierId(w);w.targets.push(target('process'));
 assert.equal(assignEmitter(w,e.id,'t100'),'');evaluate(w);
 const total=Object.values(w.stats.targets).reduce((s,r)=>s+r.captured,0);
 close(w.stats.radiated,w.stats.offTarget+total,1e-7);
 assert.ok(total<=w.stats.radiated+1e-9);
 assert.ok(w.stats.targets[frontier].captured>0&&w.stats.targets['t100'].captured>0);
 assert.equal(w.stats.targetPower,w.stats.targets[frontier].useful);
 assert.equal(w.stats.protectiveAbsorption,w.stats.targets['t100'].captured);
});

test('a process target with a missing second emitter still reports bounded zones',()=>{
 const {w,e}=armed();w.targets.push(target('process'));assert.equal(assignEmitter(w,e.id,'t100'),'');evaluate(w);
 const reading=w.stats.targets['t100'];
 assert.equal(reading.emitters,1);assert.ok(reading.useful>=0&&reading.guard>=0);close(reading.captured,reading.useful+reading.guard);
});

test('an invalid field solve reports a fault and never reuses the previous success',()=>{
 const {w}=armed();assert.ok(w.stats.targetPower>0);
 w.links.push({...w.links.find(l=>l.type==='field')!});
 const stats=evaluate(w);
 assert.ok(stats.error);assert.equal(stats.targetPower,0);
});
