import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,newEntity,evaluate,assignTuner,frontierDomain,type World} from '../src/sim/world';
import {automaticControl,domainTuners,eligibleDomains} from '../src/sim/control';
import {DT,type Stats} from '../src/sim/world-types';

/** Read-only stand-in solver: the reading depends only on the selected domain's first tuner phase, peaking at 0. */
const fakeEvaluate=(w:World):Stats=>{const stats=structuredClone(w.stats);stats.targets={};for(const d of w.domains){const tuner=domainTuners(w,d)[0];const useful=tuner?Math.max(0,40-Math.abs(tuner.phase)):0;stats.targets[d.target]={useful,guard:0,captured:useful,emitters:tuner?1:0};}w.stats=stats;return stats;};

const twoDomains=()=>{const w=createWorld();
 const t2={id:'t100',kind:'process' as const,owner:null,x:40,y:20,health:0,emitters:[] as string[],contract:'standard-cell'};w.targets.push(t2);
 const ref2=newEntity('reference',40,10,'e200');ref2.powered=true;w.entities.push(ref2);
 w.references.push({id:'r200',source:'e200',group:'e200'});
 const tunerA=newEntity('tuner',10,10,'e300');tunerA.phase=10;w.entities.push(tunerA);
 const tunerB=newEntity('tuner',40,15,'e301');tunerB.phase=10;w.entities.push(tunerB);
 const emitterA=newEntity('emitter',10,20,'e302');emitterA.powered=true;w.entities.push(emitterA);
 const emitterB=newEntity('emitter',40,25,'e303');emitterB.powered=true;w.entities.push(emitterB);
 w.targets[0].emitters.push(emitterA.id);t2.emitters.push(emitterB.id);
 w.entities.find(e=>e.id==='e4')!.powered=true;
 w.domains[0].tuners.push(tunerA.id);w.domains[0].enabled=true;
 w.domains.push({id:'d100',name:'Cell B',target:'t100',reference:'r200',sensor:null,tuners:[tunerB.id],enabled:true,objective:'useful-minus-guard',cursor:0});
 w.stats=fakeEvaluate(w);w.time=0;return {w,tunerA,tunerB};
};

test('one tuner is trial-tuned per step, round-robin across eligible domains',()=>{
 const {w,tunerA,tunerB}=twoDomains();let calls=0;const counted=(x:World)=>{calls++;return fakeEvaluate(x);};
 w.time=0;const used=automaticControl(w,counted);
 assert.equal(calls,used);assert.ok(used<=3&&used>=2);assert.equal(tunerA.phase,8);assert.equal(tunerB.phase,10);
 w.time=DT;calls=0;automaticControl(w,counted);assert.equal(tunerB.phase,8);assert.equal(tunerA.phase,8);assert.equal(calls,used);
});

test('disabling a domain removes it from the schedule; re-enabling restores it',()=>{
 const {w,tunerA,tunerB}=twoDomains();w.domains[1].enabled=false;w.time=0;
 automaticControl(w,fakeEvaluate);assert.equal(tunerA.phase,8);assert.equal(tunerB.phase,10);
 w.domains[1].enabled=true;w.time=DT;automaticControl(w,fakeEvaluate);assert.equal(tunerB.phase,8);
});

test('a domain without a ready reference is not scheduled',()=>{
 const {w,tunerB}=twoDomains();w.entities.find(e=>e.id==='e200')!.powered=false;w.time=DT;
 automaticControl(w,fakeEvaluate);assert.equal(tunerB.phase,10);
 assert.equal(eligibleDomains(w).some(d=>d.id==='d100'),false);
});

test('trial evaluations leave material, events, process inventory and heat untouched',()=>{
 const {w}=twoDomains();const before={stock:structuredClone(w.stock),events:w.events.length,process:structuredClone(w.process),temperatures:w.entities.map(e=>e.temperature),revision:w.revision};
 automaticControl(w,fakeEvaluate);
 assert.deepEqual(w.stock,before.stock);assert.equal(w.events.length,before.events);assert.deepEqual(w.process,before.process);assert.deepEqual(w.entities.map(e=>e.temperature),before.temperatures);assert.equal(w.revision,before.revision);
});

test('assignTuner enforces exclusive ownership and rejects invalid input',()=>{
 const {w,tunerA}=twoDomains();const frontier=frontierDomain(w)!;
 assert.equal(assignTuner(w,tunerA.id,'d100'),'');assert.equal(w.domains.find(d=>d.id==='d100')!.tuners.includes(tunerA.id),true);assert.equal(frontier.tuners.includes(tunerA.id),false);
 assert.match(assignTuner(w,tunerA.id,'nope'),/domain/);assert.match(assignTuner(w,'e4','d100'),/tuner/);
 assert.equal(assignTuner(w,tunerA.id,null),'');assert.equal(w.domains.some(d=>d.tuners.includes(tunerA.id)),false);
});

test('scheduling and cursors are deterministic across identical worlds',()=>{
 const a=twoDomains(),b=twoDomains();
 for(let i=0;i<12;i++){a.w.time=i*DT;b.w.time=i*DT;automaticControl(a.w,fakeEvaluate);automaticControl(b.w,fakeEvaluate);}
 assert.deepEqual(a.w.entities.map(e=>e.phase),b.w.entities.map(e=>e.phase));
 assert.deepEqual(a.w.domains.map(d=>d.cursor),b.w.domains.map(d=>d.cursor));
});

test('a domain with no powered tuners is not scheduled',()=>{
 const {w,tunerA}=twoDomains();tunerA.health=0;w.time=0;automaticControl(w,fakeEvaluate);
 assert.equal(eligibleDomains(w).some(d=>d.id===frontierDomain(w)!.id),false);
});
