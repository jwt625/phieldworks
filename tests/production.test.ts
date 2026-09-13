import {test} from 'node:test';
import assert from 'node:assert/strict';
import {technologies,technologyById} from '../src/ui/technology-data';
import {products,productById,dependencyEdges,directUnlocks,consumers,outputs} from '../src/ui/production-data';
import {DEFS,type Kind} from '../src/sim/definitions';

function ancestors(id:string,result=new Set<string>()):Set<string>{for(const parent of technologyById.get(id)!.requires)if(!result.has(parent)){result.add(parent);ancestors(parent,result);}return result;}

test('every technology has concrete unlocks and recipe dependencies are available at its tier',()=>{
 assert.equal(productById.size,products.length);
 for(const t of technologies)assert.ok(directUnlocks(t.id).length,`No concrete unlock for ${t.id}`);
 for(const p of products){
  assert.ok(technologyById.has(p.technology));assert.ok(p.quantity>0);
  const allowed=ancestors(p.technology);allowed.add(p.technology);
  for(const id of [...p.ingredients.map(i=>i.id),...p.needs,...(p.producer?[p.producer]:[])]){
   const source=productById.get(id);assert.ok(source,`${p.id}: unknown input ${id}`);
   assert.ok(allowed.has(source.technology),`${p.id} needs ${id}, but ${source.technology} is not a prerequisite of ${p.technology}`);
  }
  for(const i of p.ingredients)assert.ok(Number.isInteger(i.amount)&&i.amount>0);
 }
 const keys=new Set([...products.map(p=>`product:${p.id}`),...technologies.map(t=>`tech:${t.id}`)]);
 for(const e of dependencyEdges()){assert.ok(keys.has(e.from));assert.ok(keys.has(e.to));}
});

test('every proposed product is bootstrappable from the actual expedition kit without a self-gated producer',()=>{
 const reachable=new Set(['construction','extractor','assembler','generator','reference','junction','emitter','dump']);
 for(let i=0;i<products.length;i++)for(const p of products){
  if(p.type==='capability')continue;
  if(p.ingredients.every(v=>reachable.has(v.id))&&(!p.producer||reachable.has(p.producer)))reachable.add(p.id);
 }
 assert.deepEqual(products.filter(p=>p.type!=='capability'&&!reachable.has(p.id)).map(p=>p.id),[]);
});

test('science and endgame have traceable equipment and intermediate-item chains',()=>{
 assert.ok(outputs('processor').some(p=>p.id==='conductor'));
 assert.ok(consumers('conductor').some(p=>p.id==='control-board'));
 assert.ok(consumers('control-board').some(p=>p.id==='precision-dossier'));
 assert.equal(productById.get('patterned-die')!.producer,'fabrication-cell');
 assert.ok(productById.get('photonic-module')!.ingredients.some(i=>i.id==='patterned-die'));
 assert.ok(consumers('photonic-module').some(p=>p.id==='systems-dossier'));
 assert.ok(productById.get('aperture-sector')!.ingredients.some(i=>i.id==='locked-source'&&i.amount===2));
 assert.ok(productById.get('flight-sail')!.ingredients.some(i=>i.id==='sail-panel'&&i.amount===100));
});

test('documented current machinery retains actual construction costs',()=>{
 for(const [id,d] of Object.entries(DEFS)){
  if(id==='fabrication-cell')continue;
  const p=productById.get(id as Kind);if(!p)continue;
  assert.ok(p.implemented);
  assert.deepEqual(p.ingredients,[{id:'assembly',amount:d.cost}]);
 }
});
