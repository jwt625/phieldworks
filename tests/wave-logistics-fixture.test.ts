import {test} from 'node:test';import assert from 'node:assert/strict';
import {runWaveLogisticsFixture,dataContract} from '../scripts/wave-logistics-fixture';
import {isPassive,partDef,partScattering} from '../src/sim/wave-parts';

const result=runWaveLogisticsFixture();

test('the frozen basic layout bootstraps a precision cell and the upgraded layout meets the R-01 gate',()=>{
 assert.ok(result.basic.accept,'basic layout must have an accepted phase');
 assert.ok(result.upgraded.accept,'upgraded layout must have an accepted phase');
 assert.equal(result.qualified,true,'upgraded layout must qualify on three consecutive accepted cycles');
 assert.ok(result.improvement>=.15,`useful/source-energy improvement ${(result.improvement*100).toFixed(1)}% < 15%`);
 // Same source, target, recipe and duration: only hardware changed.
 assert.equal(result.basic.best.source,result.upgraded.best.source);
 assert.equal(result.basic.pieces,result.upgraded.pieces);
 assert.equal(result.basic.area,result.upgraded.area);
});

test('the R-01 data contract is versioned, passive and distinguishable',()=>{
 const rows=dataContract();
 assert.ok(rows.length>=4);
 for(const row of rows){const def=partDef(row.id,row.version)!;assert.ok(def,'definition must resolve');assert.ok(isPassive(partScattering(def)),`${row.id} not passive`);}
 assert.notEqual(rows.find(r=>r.id==='elbow-compact')!.loss,rows.find(r=>r.id==='elbow-precision')!.loss);
});
