/** Same-machine two-cell convergence check: copy the qualified standalone set and step both under local control. */
import {cpus} from 'node:os';
import {mkdirSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {runPrecisionCellFixture} from './precision-cell-fixture';
import {blueprintCost,captureBlueprint,evaluate,setDomainEnabled,step,stampBlueprint} from '../src/sim/world';

const base=runPrecisionCellFixture(),w=base.world;
w.stock.assemblies=200;
if(captureBlueprint(w,base.standalone))throw new Error('capture failed');
const cost=blueprintCost(w);
if(stampBlueprint(w,46,2))throw new Error('stamp failed');
evaluate(w);
const second=w.domains.at(-1)!;
setDomainEnabled(w,base.cellDomain,true);setDomainEnabled(w,second.id,true);
const times:number[]=[];const wallStart=performance.now(),simStart=w.time;
for(let i=0;i<600;i++){const start=performance.now();step(w);if(i>=100)times.push(performance.now()-start);if(w.stats.error)throw new Error(w.stats.error);}
times.sort((a,b)=>a-b);
const report={date:new Date().toISOString(),cpu:cpus()[0].model,node:process.version,mode:'two independently controlled qualified cells (original + blueprint copy)',copyCost:cost,warmup:100,samples:times.length,p50Ms:times[Math.floor(times.length*.5)],p95Ms:times[Math.floor(times.length*.95)],maxMs:times.at(-1),wallMs:performance.now()-wallStart,simSeconds:w.time-simStart,accepted:w.process.accepted,residual:w.stats.network.residual,targets:w.targets.map(t=>({id:t.id,kind:t.kind,reading:w.stats.targets[t.id]}))};
mkdirSync('DevLog/evidence/tranche-a',{recursive:true});
writeFileSync('DevLog/evidence/tranche-a/two-cell-benchmark.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
