import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assignEmitter,connect,createWorld,evaluate,frontierDomain,frontierQualification,frontierTarget,invalidate,newEntity,place,repair,step,type World} from '../src/sim/world';
import {configurationSignature,revalidate,startQualification} from '../src/sim/qualification';

const qualify=()=>{const w:World=createWorld();evaluate(w);
 assert.equal(place(w,'tuner',17,12),'');const tuner=w.entities.at(-1)!;
 assert.equal(place(w,'emitter',20,12),'');const emitter=w.entities.at(-1)!;
 assert.equal(connect(w,'power',{node:'e1',port:0},{node:emitter.id,port:0}),'');
 const junction=w.entities.find(e=>e.kind==='junction')!;
 assert.equal(connect(w,'field',{node:junction.id,port:3},{node:tuner.id,port:0}),'');
 assert.equal(connect(w,'field',{node:tuner.id,port:1},{node:emitter.id,port:0}),'');
 const target=frontierTarget(w)!;w.stats.targets[target.id]={useful:40,guard:0,captured:40,emitters:2};
 const domain=frontierDomain(w)!;domain.enabled=true;
 assert.equal(startQualification(w,domain.id,'20 s thermal drift test'),'');
 return {w,domain,q:frontierQualification(w)!};};

test('phase and temperature drift do not change the configuration signature',()=>{
 const {w,domain,q}=qualify();const signature=configurationSignature(w,domain);const tuner=w.entities.find(e=>e.id===domain.tuners[0])!;
 tuner.phase+=13;tuner.temperature+=14;
 assert.equal(configurationSignature(w,domain),signature);assert.equal(revalidate(w),0);assert.equal(q.status,'testing');
});

test('moving hardware or changing delivery invalidates a testing certificate with a stable code',()=>{
 const {w,domain,q}=qualify();const tuner=w.entities.find(e=>e.id===domain.tuners[0])!;tuner.x+=1;
 invalidate(w,'Routing changed');
 assert.equal(q.status,'failed');assert.equal(q.code,'dependency-changed');
});

test('reassigning an emitter away from the target invalidates the certificate',()=>{
 const {w,q}=qualify();const emitter=w.entities.find(e=>e.id===frontierTarget(w)!.emitters[0])!;
 assert.equal(assignEmitter(w,emitter.id,null),'');
 assert.equal(q.status,'failed');
});

test('an unrelated repair on an independent machine leaves a qualified certificate intact',()=>{
 const {w,q}=qualify();q.status='qualified';
 const sentry=newEntity('sentry',30,30,'e999');sentry.health=50;w.entities.push(sentry);
 assert.equal(repair(w,sentry.id),'');
 assert.equal(q.status,'qualified');
});

test('a shared reference change invalidates every consumer',()=>{
 const {w,domain,q}=qualify();q.status='qualified';
 const target={id:'t100',kind:'process' as const,owner:null,x:40,y:20,health:0,emitters:[] as string[],contract:'standard-cell'};w.targets.push(target);
 const emitter=newEntity('emitter',40,25,'e200');emitter.powered=true;w.entities.push(emitter);target.emitters.push(emitter.id);
 w.domains.push({id:'d100',name:'Cell B',target:'t100',reference:domain.reference,sensor:null,tuners:[],enabled:true,objective:'useful-minus-guard',cursor:0});
 const other={id:'q200',domain:'d100',target:'t100',status:'qualified' as const,signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[] as string[],reason:'test',code:''};
 other.signature=configurationSignature(w,w.domains[1]);w.qualifications.push(other);
 const binding=w.references.find(r=>r.id===domain.reference)!;binding.group='shared-alt';
 invalidate(w,'Reference changed');
 assert.equal(q.status,'failed');assert.equal(w.qualifications.find(x=>x.id==='q200')!.status,'failed');
});

test('a changed power service state invalidates the affected consumer',()=>{
 const {w,q}=qualify();q.status='qualified';
 const emitter=w.entities.find(e=>e.id===frontierTarget(w)!.emitters[0])!;emitter.powered=false;
 invalidate(w,'Power load changed');
 assert.equal(q.status,'failed');
});

test('a live useful-power breach fails with a stable useful-underdose code',()=>{
 const {w,q}=qualify();q.status='qualified';const target=frontierTarget(w)!;
 w.stats.targets[target.id]={useful:10,guard:0,captured:10,emitters:1};
 invalidate(w,'Operating range');
 assert.equal(q.status,'failed');assert.equal(q.code,'useful-underdose');
});

test('process qualification is not granted by the frontier 20 s timer',()=>{
 const w=createWorld();evaluate(w);
 const emitter=newEntity('emitter',40,25,'e200');w.entities.push(emitter);
 assert.equal(connect(w,'power',{node:'e1',port:0},{node:emitter.id,port:0}),'');
 const target={id:'t100',kind:'process' as const,owner:null,x:40,y:20,health:0,emitters:[emitter.id],contract:'standard-cell'};w.targets.push(target);
 w.domains.push({id:'d100',name:'Cell B',target:'t100',reference:frontierDomain(w)!.reference,sensor:null,tuners:[],enabled:true,objective:'useful-minus-guard',cursor:0});
 const qualification={id:'q200',domain:'d100',target:'t100',status:'testing' as const,signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[] as string[],reason:'test',code:''};
 evaluate(w);
 qualification.signature=configurationSignature(w,w.domains[1]);w.qualifications.push(qualification);
 for(let i=0;i<250;i++)step(w);
 assert.equal(w.qualifications.find(x=>x.id==='q200')!.status,'testing');
});
