import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equipmentEffects} from '../src/equipment-effects';
import type {EquipmentState} from '../src/equipment-state';

function draw(state:EquipmentState,time:number,reducedMotion=false){
 const calls:unknown[]=[];
 const ctx=new Proxy({}, {
  get:(_,key)=>(...args:unknown[])=>calls.push([key,...args]),
  set:(_,key,value)=>{calls.push([key,value]);return true;},
 }) as CanvasRenderingContext2D;
 equipmentEffects(ctx,state,10,20,60,60,time,reducedMotion);
 return calls;
}
const hot:EquipmentState={condition:2,work:'uncooled',powered:false,passive:false,field:true,moving:false,hot:true,smoke:true,label:'UNCOOLED',damageLabel:'SEVERE DAMAGE'};

test('reduced motion freezes thermal effects and warnings without hiding their status',()=>{
 assert.notDeepEqual(draw(hot,0),draw(hot,1));
 assert.deepEqual(draw(hot,0,true),draw(hot,1,true));
 const calls=draw(hot,1,true) as unknown[][];
 assert.equal(calls.filter(c=>c[0]==='quadraticCurveTo').length,3);
 assert.equal(calls.filter(c=>c[0]==='arc').length,4);
 assert.ok(calls.some(c=>c[0]==='closePath')); // failure triangle survives
 assert.notDeepEqual(draw(hot,1,true),draw({...hot,powered:true},1,true));
});
test('effects are deterministic at paused simulation time',()=>{
 assert.deepEqual(draw(hot,12.5),draw(hot,12.5));
});
