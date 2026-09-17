import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,newEntity,center,evaluate} from '../src/sim/world';
import {equipmentState} from '../src/equipment-state';
import {equipmentAnimation} from '../src/equipment-animation';

test('damaged recipe clips follow progress, retain damage without power, and respect direction/wreck fallback',()=>{
 const w=createWorld(),a=w.entities.find(e=>e.kind==='assembler')!;
 a.health=35;a.ore=4;
 const frames=new Set<number>();
 for(let i=0;i<6;i++){a.progress=(i+.1)*1.4/6;const result=equipmentAnimation(a,equipmentState(w,a),10)!;frames.add(result.frame);assert.equal(result.clip.asset,'assembler-severe-r0-cycle-v4');}
 assert.equal(frames.size,6);
 a.powered=false;assert.equal(equipmentAnimation(a,equipmentState(w,a),30)!.frame,5);
 assert.equal(equipmentAnimation(a,equipmentState(w,a),30,true)!.frame,0);
 a.rotation=1;assert.equal(equipmentAnimation(a,equipmentState(w,a),30),undefined);
 a.rotation=0;a.health=0;assert.equal(equipmentAnimation(a,equipmentState(w,a),30),undefined);
});
test('generator needs load; sentry needs actual shots; service failure uses condition fallback',()=>{
 const w=createWorld(),g=w.entities.find(e=>e.kind==='generator')!;
 assert.equal(equipmentAnimation(g,equipmentState(w,g),.15)!.frame,1);
 w.links=[];assert.equal(equipmentAnimation(g,equipmentState(w,g),.15)!.frame,0);
 g.tripped=true;assert.equal(equipmentAnimation(g,equipmentState(w,g),.15),undefined);
 const s=newEntity('sentry',12,5,'e99');s.powered=true;
 assert.equal(equipmentAnimation(s,equipmentState(w,s),50)!.frame,0);
 w.ecology.shots=[{from:center(s),to:{x:15,y:6},ttl:.07}];
 assert.equal(equipmentAnimation(s,equipmentState(w,s),50)!.frame,1);
 w.ecology.shots[0].ttl=.02;assert.equal(equipmentAnimation(s,equipmentState(w,s),50)!.frame,2);
 w.ecology.shots=[];assert.equal(equipmentAnimation(s,equipmentState(w,s),50)!.frame,0);
 s.powered=false;assert.equal(equipmentAnimation(s,equipmentState(w,s),50),undefined);
});

test('reference stabilizer follows source field activity and dump fans spin only under powered cooling',()=>{
 const w=createWorld(),ref=w.entities.find(e=>e.kind==='reference')!,dump=w.entities.find(e=>e.kind==='dump')!;
 // Starter reference is powered and field-active.
 const r=equipmentAnimation(ref,equipmentState(w,ref),1)!;
 assert.equal(r.clip.asset,'reference-r0-cycle-v2');
 assert.equal(equipmentAnimation(ref,equipmentState(w,ref),0)!.frame,0);
 assert.equal(equipmentAnimation(ref,equipmentState(w,ref),2)!.frame,3);
 assert.equal(equipmentAnimation(ref,equipmentState(w,ref),2,true)!.frame,0);
 // Unpowered reference keeps the dark condition fallback.
 ref.powered=false;assert.equal(equipmentAnimation(ref,equipmentState(w,ref),2),undefined);ref.powered=true;
 // Starter dump is powered and cooling; it spins with real activity.
 assert.equal(equipmentAnimation(dump,equipmentState(w,dump),1)!.clip.asset,'dump-r0-cycle-v2');
 // Idle (no field, below 30 C) holds frame zero; unpowered stays UNCOOLED and static.
 w.links=w.links.filter(l=>!(l.type==='field'&&(l.a.node===dump.id||l.b.node===dump.id)));dump.temperature=10;evaluate(w);
 assert.equal(equipmentAnimation(dump,equipmentState(w,dump),1)!.frame,0);
 assert.equal(equipmentAnimation(dump,equipmentState(w,dump),1,true)!.frame,0);
 dump.powered=false;assert.equal(equipmentAnimation(dump,equipmentState(w,dump),1),undefined);
});

test('recipe frame selection freezes at reduced motion and clamps simulation progress',async()=>{
 const {recipeFrame}=await import('../src/equipment-animation');
 for(const count of [4,6]){
  assert.equal(recipeFrame(.8,1,count),Math.floor(.8*count));
  assert.equal(recipeFrame(.8,1,count,true),0);
  assert.equal(recipeFrame(-.1,1,count),0);
  assert.equal(recipeFrame(2,1,count),count-1);
 }
});
