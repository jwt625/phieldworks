import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deserialize,frontierQualification,ports,serialize} from '../src/sim/world';
import {runPrecisionCellFixture} from '../scripts/precision-cell-fixture';

const result=runPrecisionCellFixture();

test('a fresh no-injection expedition builds a cell, rejects a batch and qualifies on three accepted cycles',()=>{
 const w=result.world;
 assert.equal(result.failedLots,1);assert.equal(result.accepted,3);assert.equal(result.qualified,true);
 const cell=w.targets.find(t=>t.id===result.cellTarget)!.owner!;
 const cellEntity=w.entities.find(e=>e.id===cell)!;
 assert.ok(cellEntity);assert.equal(cellEntity.kind,'fabrication-cell');assert.equal(cellEntity.health,100);assert.ok(cellEntity.temperature<=85);
 const target=w.targets.find(t=>t.id===result.cellTarget)!;
 assert.equal(target.emitters.length,2);
 assert.equal(target.emitters.filter(id=>w.entities.find(e=>e.id===id)?.powered).length,2);
 const domain=w.domains.find(d=>d.id===result.cellDomain)!;
 assert.equal(domain.enabled,true);assert.ok(domain.reference);
 assert.equal(w.process.accepted,3);assert.ok(w.process.lots.length>=1);
 assert.equal(w.qualifications.find(q=>q.domain===result.cellDomain)!.counters,3);
 // The build came from real production, not injected stock.
 assert.ok(w.produced>=40);assert.ok(w.stock.crystal>=0&&w.stock.assemblies>=0);
 assert.ok(w.entities.filter(e=>e.kind==='fabrication-cell').length===1);
});

test('a qualified precision cell survives save/load with its inventory and a stale certificate',()=>{
 const loaded=deserialize(serialize(result.world));
 assert.equal(loaded.process.accepted,result.world.process.accepted);
 const cell=loaded.targets.find(t=>t.id===result.cellTarget)!.owner!;
 assert.equal(loaded.entities.find(e=>e.id===cell)!.kind,'fabrication-cell');
 assert.equal(frontierQualification(loaded)?.status,frontierQualification(result.world)?.status);
 assert.notEqual(loaded.qualifications.find(q=>q.domain===result.cellDomain)!.status,'qualified');
});

test('the cell has one power input and no field or material routing ports',()=>{
 const w=result.world;
 const cell=w.entities.find(e=>e.kind==='fabrication-cell')!;
 assert.equal(ports(cell,'field').length,0);assert.equal(ports(cell,'material').length,0);
 const power=ports(cell,'power');assert.equal(power.length,1);assert.equal(power[0].role,'input');
});
