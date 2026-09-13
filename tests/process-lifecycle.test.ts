import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cancelProcess,createWorld,deserialize,newEntity,processPreview,remove,reserveProcess,reworkProcess,serialize,type World} from '../src/sim/world';
import {finalizeLostJobs,step as processStep} from '../src/sim/process';
import {LOT_LIMIT,type ProcessLot} from '../src/sim/world-types';

const build=()=>{const w:World=createWorld();
 const target={id:'t100',kind:'process' as const,owner:null as string|null,x:40,y:20,health:0,emitters:[] as string[],contract:'standard-cell'};w.targets.push(target);
 const a=newEntity('emitter',40,10,'e300');a.powered=true;w.entities.push(a);
 const b=newEntity('emitter',44,10,'e301');b.powered=true;w.entities.push(b);
 target.emitters.push(a.id,b.id);w.stock={assemblies:10,crystal:5,scrap:0};
 const set=(useful:number,guard=0)=>{w.stats.targets['t100']={useful,guard,captured:useful+guard,emitters:2};};
 return {w,target,set};};
const run=(w:World,seconds:number,dt=.1)=>{for(let i=0;i<Math.round(seconds/dt);i++)processStep(w,dt);};
const cycle=(usefulDose:number,guardDose=0)=>{const built=build();built.set(usefulDose/8,guardDose/8);assert.equal(reserveProcess(built.w,'t100'),'');run(built.w,8.1);const job=built.w.jobs.find(j=>j.stage==='complete')!;return {w:built.w,outcome:job.outcome,accepted:built.w.process.accepted,lots:built.w.process.lots};};
const lot=(i:number):ProcessLot=>({id:`pl${i}`,kind:'scrap',recipe:'standard-cell',version:1,parent:`j${i}`,assemblies:0,crystal:0,disposition:'spent',owner:null,useful:0,guard:0});

test('reservation requires both ingredients and consumes nothing when one is missing',()=>{
 const onlyAssemblies=build().w;onlyAssemblies.stock.assemblies=1;assert.match(reserveProcess(onlyAssemblies,'t100'),/Missing/);assert.equal(onlyAssemblies.jobs.length,0);assert.equal(onlyAssemblies.stock.crystal,5);
 const noCrystal=build().w;noCrystal.stock.crystal=0;assert.match(reserveProcess(noCrystal,'t100'),/Missing/);assert.equal(noCrystal.stock.assemblies,10);assert.equal(noCrystal.jobs.length,0);
});

test('two cells competing for the last ingredient bundle: one reserves, the other is blocked',()=>{
 const {w}=build();const cellA=newEntity('sentry',10,10,'e400');cellA.powered=true;w.entities.push(cellA);
 const cellB=newEntity('sentry',13,10,'e401');cellB.powered=true;w.entities.push(cellB);
 w.targets.find(t=>t.id==='t100')!.owner='e400';
 w.targets.push({id:'t101',kind:'process',owner:'e401',x:45,y:20,health:0,emitters:[],contract:'standard-cell'});
 w.stock={assemblies:3,crystal:2,scrap:0};
 assert.equal(reserveProcess(w,'t100'),'');assert.match(reserveProcess(w,'t101'),/Missing/);assert.equal(w.jobs.length,1);assert.equal(w.stock.assemblies,1);
});

test('an accepted cycle commits once; repeated stepping or a second cancel cannot duplicate it',()=>{
 const {w,set}=build();set(20);assert.equal(reserveProcess(w,'t100'),'');const job=w.jobs[0];run(w,8.1);
 assert.equal(job.stage,'complete');assert.equal(w.process.accepted,1);assert.equal(w.process.lots.length,0);
 assert.equal(cancelProcess(w,job.id),'No active batch');run(w,1);assert.equal(w.process.accepted,1);
});

test('a zero-dose batch fails rather than producing a positive result',()=>{
 const {w,outcome,accepted,lots}=cycle(0,0);
 assert.equal(outcome,'scrap');assert.equal(accepted,0);assert.equal(lots.length,1);assert.equal(lots[0].kind,'scrap');
});

test('acceptance thresholds are inclusive for useful dose and the guard fraction',()=>{
 assert.equal(cycle(80).outcome,'accepted');
 assert.equal(cycle(79.9).outcome,'recoverable-reject');
 assert.equal(cycle(640).outcome,'accepted');
 assert.equal(cycle(640.1).outcome,'scrap');
 assert.equal(cycle(90,10).outcome,'accepted');
 assert.equal(cycle(90,10.01).outcome,'scrap');
});

test('dose integration is independent of the dt partition and clamps the final tick',()=>{
 const fast=build(),slow=build();fast.set(11.25,1.25);slow.set(11.25,1.25);
 assert.equal(reserveProcess(fast.w,'t100'),'');assert.equal(reserveProcess(slow.w,'t100'),'');
 run(fast.w,8,.1);run(slow.w,8,.01);const a=fast.w.jobs[0],b=slow.w.jobs[0];
 assert.ok(Math.abs(a.useful-b.useful)<1e-6);assert.ok(Math.abs(a.guard-b.guard)<1e-6);
 run(fast.w,2,.1);assert.ok(a.elapsed<=8+1e-9);assert.equal(a.stage,'complete');
});

test('a tripped cell suspends without banking progress, and repair resumes it',()=>{
 const {w,set}=build();const cell=newEntity('sentry',10,10,'e400');cell.powered=true;w.entities.push(cell);w.targets.find(t=>t.id==='t100')!.owner='e400';
 set(20);assert.equal(reserveProcess(w,'t100'),'');run(w,1);const job=w.jobs[0];assert.ok(Math.abs(job.elapsed-1)<1e-9);assert.equal(job.stage,'exposing');
 cell.tripped=true;processStep(w,.1);assert.equal(job.stage,'suspended');assert.ok(Math.abs(job.elapsed-1)<1e-9);
 cell.tripped=false;processStep(w,.1);assert.equal(job.stage,'exposing');assert.ok(Math.abs(job.elapsed-1.1)<1e-9);
});

test('not stepping (pause) leaves an in-progress batch unchanged',()=>{
 const {w,set}=build();set(20);assert.equal(reserveProcess(w,'t100'),'');processStep(w,.1);const job=w.jobs[0];const elapsed=job.elapsed,useful=job.useful;
 assert.equal(job.elapsed,elapsed);assert.equal(job.useful,useful);
});

test('reload preserves an in-progress batch and never emits a terminal result twice',()=>{
 const {w,set}=build();set(20);assert.equal(reserveProcess(w,'t100'),'');run(w,4);const job=w.jobs.find(j=>j.stage!=='complete')!;
 const loaded=deserialize(serialize(w));const resumed=loaded.jobs.find(j=>j.stage!=='complete')!;
 assert.equal(resumed.elapsed,job.elapsed);assert.equal(resumed.useful,job.useful);assert.equal(resumed.consumed,true);
 loaded.entities.filter(e=>e.id==='e300'||e.id==='e301').forEach(e=>e.powered=true);
 loaded.stats.targets['t100']={useful:20,guard:0,captured:20,emitters:2};
 run(loaded,4.1);assert.equal(loaded.process.accepted,1);
 processStep(loaded,.1);assert.equal(loaded.process.accepted,1);
});

test('a full process store blocks reservation before any ingredient is consumed',()=>{
 const {w}=build();w.process.lots=Array.from({length:LOT_LIMIT},(_,i)=>lot(i));
 assert.match(reserveProcess(w,'t100'),/full/);assert.equal(w.stock.assemblies,10);assert.equal(w.jobs.length,0);
});

test('cancelling an untouched reservation refunds exactly; an exposed batch becomes process scrap',()=>{
 const {w,set}=build();set(20);const assemblies=w.stock.assemblies,crystal=w.stock.crystal;
 assert.equal(reserveProcess(w,'t100'),'');assert.equal(w.stock.assemblies,assemblies-2);assert.equal(w.stock.crystal,crystal-1);
 cancelProcess(w,w.jobs[0].id);assert.equal(w.stock.assemblies,assemblies);assert.equal(w.stock.crystal,crystal);assert.equal(w.process.lots.length,0);
 assert.equal(reserveProcess(w,'t100'),'');const exposed=w.jobs.find(j=>j.stage!=='complete')!;processStep(w,.1);
 cancelProcess(w,exposed.id);assert.equal(w.stock.assemblies,assemblies-2);assert.equal(w.process.lots.length,1);assert.equal(w.process.lots[0].kind,'scrap');assert.equal(w.process.lots[0].disposition,'spent');
});

test('dismantling and destruction both finalize a batch through the loss helper',()=>{
 const dismantled=build();const cell=newEntity('sentry',10,10,'e400');cell.powered=true;dismantled.w.entities.push(cell);dismantled.w.targets.find(t=>t.id==='t100')!.owner='e400';
 dismantled.set(20);reserveProcess(dismantled.w,'t100');processStep(dismantled.w,.1);remove(dismantled.w,'e400');
 assert.equal(dismantled.w.process.lots.length,1);assert.equal(dismantled.w.process.lots[0].kind,'scrap');
 const destroyed=build();const doomed=newEntity('sentry',10,10,'e400');doomed.powered=true;destroyed.w.entities.push(doomed);destroyed.w.targets.find(t=>t.id==='t100')!.owner='e400';
 destroyed.set(20);reserveProcess(destroyed.w,'t100');processStep(destroyed.w,.1);doomed.health=0;finalizeLostJobs(destroyed.w);
 assert.equal(destroyed.w.process.lots.length,1);assert.equal(destroyed.w.process.lots[0].kind,'scrap');
});

test('one cumulative-dose rework is allowed, a cancelled pre-exposure rework returns the lot, and a failed rework scraps',()=>{
 const {w,set}=build();set(5);assert.equal(reserveProcess(w,'t100'),'');run(w,8.1);
 assert.equal(w.process.lots[0].kind,'reject');assert.equal(w.process.lots[0].disposition,'recoverable');
 assert.equal(reworkProcess(w,'t100'),'');const reworkJob=w.jobs.find(j=>j.stage!=='complete')!;assert.equal(w.process.lots.length,0);
 cancelProcess(w,reworkJob.id);assert.equal(w.process.lots.length,1);assert.equal(w.process.lots[0].kind,'reject');
 assert.equal(reworkProcess(w,'t100'),'');set(20);run(w,8.1);
 assert.equal(w.process.accepted,1);assert.equal(w.process.lots.length,0);
 const failed=build();failed.set(5);reserveProcess(failed.w,'t100');run(failed.w,8.1);assert.equal(reworkProcess(failed.w,'t100'),'');failed.set(1);run(failed.w,8.1);
 assert.equal(failed.w.process.accepted,0);assert.ok(failed.w.process.lots.some(l=>l.kind==='scrap'));
});

test('a pure preview never mutates the batch or stock and cannot manufacture acceptance',()=>{
 const {w,set}=build();set(20);assert.equal(reserveProcess(w,'t100'),'');const before=serialize(w);
 const reading=processPreview(w,'t100')!;assert.ok(reading.remaining<=8);assert.equal(serialize(w),before);
 const fresh=build();fresh.set(0);assert.equal(processPreview(fresh.w,'t100')!.outcome,'scrap');
});
