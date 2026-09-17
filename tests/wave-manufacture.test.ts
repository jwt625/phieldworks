import {test} from 'node:test';import assert from 'node:assert/strict';
import {cancelManufacture,createWorld,newEntity,reserveManufacture,reserveProcess,setAssemblerMode,type World} from '../src/sim/world';
import {step as manufactureStep,activeJob} from '../src/sim/manufacture';
import {step as processStep} from '../src/sim/process';
import {PRECISION_ELBOW,MATCHED_JUNCTION} from '../src/sim/wave-parts';

function acceptedCycle():World{
 const w=createWorld();
 const target={id:'t200',kind:'process' as const,owner:null as string|null,x:40,y:20,health:0,emitters:[] as string[],contract:'standard-cell'};w.targets.push(target);
 const a=newEntity('emitter',40,10,'e300');a.powered=true;w.entities.push(a);
 const b=newEntity('emitter',44,10,'e301');b.powered=true;w.entities.push(b);
 target.emitters.push(a.id,b.id);w.stock.assemblies=10;w.stock.crystal=5;
 w.stats.targets['t200']={useful:20,guard:0,captured:20,emitters:2};
 assert.equal(reserveProcess(w,'t200'),'');
 for(let i=0;i<82;i++)processStep(w,.1);
 return w;
}

test('an accepted cycle grants exactly one spendable precision item and unlocks two recipes',()=>{
 const w=acceptedCycle();
 assert.equal(w.process.accepted,1);
 assert.equal(w.stock.precision,1);
 assert.ok(w.unlocked.includes(PRECISION_ELBOW.id)&&w.unlocked.includes(MATCHED_JUNCTION.id));
 assert.equal(w.process.accepted,w.stock.precision,'lifetime history and spendable stock are separate but both incremented once');
});

test('tooling manufactures hardware from reserved inputs and does not touch qualification history',()=>{
 const w=acceptedCycle();
 const asm=w.entities.find(e=>e.kind==='assembler')!;
 assert.equal(setAssemblerMode(w,asm.id,'tooling'),'');
 w.stock.assemblies=50;w.stock.crystal=5;w.stock.precision=2;
 const accepted=w.process.accepted;
 assert.equal(reserveManufacture(w,asm.id,PRECISION_ELBOW.id),'');
 assert.ok(activeJob(w,asm.id));
 for(let i=0;i<60;i++)manufactureStep(w,.1);
 assert.equal(w.hardware['elbow-precision@1'],1);
 assert.equal(w.process.accepted,accepted);
 assert.equal(w.stock.precision,0);
 assert.equal(w.process.lots.length,0);
});

test('cancel before consumption refunds every reserved input',()=>{
 const w=acceptedCycle();
 const asm=w.entities.find(e=>e.kind==='assembler')!;setAssemblerMode(w,asm.id,'tooling');
 w.stock.assemblies=50;w.stock.crystal=5;w.stock.precision=2;
 const before={...w.stock};
 reserveManufacture(w,asm.id,PRECISION_ELBOW.id);
 const job=activeJob(w,asm.id)!;
 assert.equal(cancelManufacture(w,job.id),'');
 assert.deepEqual(w.stock,before);
 assert.equal(w.hardware['elbow-precision@1'],undefined);
});

test('losing tooling power suspends and banks no progress',()=>{
 const w=acceptedCycle();
 const asm=w.entities.find(e=>e.kind==='assembler')!;setAssemblerMode(w,asm.id,'tooling');
 w.stock.assemblies=50;w.stock.crystal=5;w.stock.precision=2;
 reserveManufacture(w,asm.id,PRECISION_ELBOW.id);
 manufactureStep(w,.5);
 const elapsed=activeJob(w,asm.id)!.elapsed;
 asm.powered=false;
 manufactureStep(w,1);
 assert.equal(activeJob(w,asm.id)!.stage,'suspended');
 assert.ok(Math.abs(activeJob(w,asm.id)!.elapsed-elapsed)<1e-9);
 asm.powered=true;manufactureStep(w,.1);
 assert.equal(activeJob(w,asm.id)!.stage,'running');
});

test('reserving hardware without an unlocked recipe or sufficient inputs fails atomically',()=>{
 const w=createWorld();const asm=w.entities.find(e=>e.kind==='assembler')!;setAssemblerMode(w,asm.id,'tooling');
 w.stock.precision=5;w.stock.assemblies=50;w.stock.crystal=5;
 const before={...w.stock};
 assert.match(reserveManufacture(w,asm.id,PRECISION_ELBOW.id),/not unlocked/);
 assert.deepEqual(w.stock,before);
 w.unlocked.push(PRECISION_ELBOW.id);w.stock.crystal=0;
 assert.match(reserveManufacture(w,asm.id,PRECISION_ELBOW.id),/crystal/);
 assert.deepEqual(w.stock,{...before,crystal:0});
});
