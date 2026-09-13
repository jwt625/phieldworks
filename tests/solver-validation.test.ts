import {test} from 'node:test';import assert from 'node:assert/strict';
import {c,factorLU,solveFactorization,solveLinear,type Complex} from '../src/sim/complex';
import {FIELD_PORT_LIMIT,matched,solveNetwork} from '../src/sim/network';
import {createWorld,newEntity,deserialize,serialize,placementError,DEFS} from '../src/sim/world';
test('reused LU solves multiple complex right-hand sides like the independent Gaussian solver',()=>{
 for(const size of [3,7,31]){const matrix:Complex[][]=Array.from({length:size},(_,i)=>Array.from({length:size},(_,j)=>c(i===j?size+2:Math.sin(i*17+j*11),Math.cos(i*7-j*13)*.2)));[matrix[0],matrix[size-1]]=[matrix[size-1],matrix[0]];const original=structuredClone(matrix),factor=factorLU(matrix);
  for(let group=0;group<16;group++){const rhs=Array.from({length:size},(_,i)=>c(Math.sin(group+i),Math.cos(group*3-i)));const expected=solveLinear(matrix,rhs),actual=solveFactorization(factor,rhs);for(let i=0;i<size;i++)for(let part=0;part<2;part++)assert.ok(Math.abs(expected[i][part]-actual[i][part])<1e-10);}
  assert.deepEqual(matrix,original);
 }
});
test('cap minus one, cap and cap plus one agree across save, placement and solve',()=>{
 for(const portCount of [FIELD_PORT_LIMIT-1,FIELD_PORT_LIMIT,FIELD_PORT_LIMIT+1]){const w=createWorld();w.entities=[];w.links=[];w.frontier=true;w.nextId=1000;const junctions=Math.floor((FIELD_PORT_LIMIT-1)/4);for(let i=0;i<junctions;i++)w.entities.push(newEntity('junction',1+i%16*3,1+Math.floor(i/16)*3,`e${w.nextId++}`));while(w.entities.reduce((n,e)=>n+DEFS[e.kind].ports.length,0)<portCount){const i=w.entities.length-junctions;w.entities.push(newEntity('dump',1+i*3,16,`e${w.nextId++}`));}
  const solve=()=>solveNetwork(w.entities.map(e=>matched(e.id,DEFS[e.kind].ports.length)),[]);
  if(portCount<=FIELD_PORT_LIMIT){assert.doesNotThrow(solve);assert.equal(deserialize(serialize(w)).stats.error,'');}else{assert.throws(solve,/wave ports/);assert.throws(()=>deserialize(serialize(w)),/Invalid/);}
  assert.equal(!!placementError(w,'dump',60,30),portCount>=FIELD_PORT_LIMIT);
 }
});
