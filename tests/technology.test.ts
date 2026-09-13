import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../src/sim/world';
import {technologies,technologyById,packs,visibleTechnologies,technologyState} from '../src/ui/technology-data';

test('research graph has valid acyclic prerequisites and every science recipe is reachable before its use',()=>{
 assert.equal(technologyById.size,technologies.length);
 const ancestors=(id:string,path:string[]=[]):Set<string>=>{
  assert.ok(!path.includes(id),`Cycle: ${[...path,id].join(' → ')}`);
  const node=technologyById.get(id);assert.ok(node,`Unknown technology ${id}`);
  const result=new Set<string>();
  for(const parent of node.requires){
   assert.ok(technologyById.get(parent)!.column<node.column||node.column===0,'Prerequisites must appear before their unlock');
   result.add(parent);for(const ancestor of ancestors(parent,[...path,id]))result.add(ancestor);
  }
  return result;
 };
 for(const t of technologies){
  const prior=ancestors(t.id);
  if(t.kind==='research')assert.ok(t.cost,`Missing research cost for ${t.id}`);
  if(t.cost){assert.ok(t.cost.units>0&&t.cost.seconds>0);for(const p of t.cost.packs)assert.ok(prior.has(packs[p].unlockedBy),`${t.id} consumes ${p} before its recipe is unlocked`);}
 }
});

test('player horizon follows observed milestones and full design viewing never grants progress',()=>{
 const world=createWorld(),initial=JSON.stringify(world);
 assert.ok(visibleTechnologies(world).some(t=>t.id==='frontier'));
 assert.ok(visibleTechnologies(world).some(t=>t.id==='research'));
 const shown=new Set(visibleTechnologies(world).map(t=>t.id));
 for(const t of visibleTechnologies(world))assert.ok(t.requires.every(id=>shown.has(id)));
 assert.ok(!visibleTechnologies(world).some(t=>t.id==='launch'));
 assert.equal(visibleTechnologies(world,true).length,technologies.length);
 assert.equal(JSON.stringify(world),initial);
 assert.equal(technologyState(technologyById.get('frontier')!,world),'Next objective');
 world.frontier=true;
 assert.ok(visibleTechnologies(world).some(t=>t.id==='research'));
 assert.equal(technologyState(technologyById.get('qualification')!,world),'Next objective');
 assert.equal(technologyState(technologyById.get('research')!,world),'Design proposal');
});
