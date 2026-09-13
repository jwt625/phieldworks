import {cpus} from 'node:os';import {writeFileSync,mkdirSync} from 'node:fs';import {performance} from 'node:perf_hooks';
import {connectedFixture} from './connected-review-fixture';import {DEFS,step,serialize,DT} from '../src/sim/world';
const results=[];mkdirSync('test-results',{recursive:true});
for(const [machines,groups] of [[40,1],[80,1],[120,1],[120,4],[120,16]]){
 const initial=connectedFixture(machines,groups);writeFileSync(`test-results/connected-${machines}-${groups}.json`,serialize(initial));
 for(const controller of [false,true]){const w=structuredClone(initial);{const d=w.domains[0];if(d)d.enabled=controller;}const times=[];for(let i=0;i<40;i++){const start=performance.now();step(w);if(i>=10)times.push(performance.now()-start);if(w.stats.error)throw Error(w.stats.error);}times.sort((a,b)=>a-b);results.push({machines,groups,ports:w.entities.reduce((n,e)=>n+DEFS[e.kind].ports.length,0),links:w.links.length,tuners:7,controller,warmup:10,samples:30,medianMs:times[15],p95Ms:times[28],residual:w.stats.network.residual,tripped:w.entities.filter(e=>e.tripped).length});}
}
const result={date:new Date().toISOString(),cpu:cpus()[0].model,node:process.version,stepSeconds:DT,topology:'one connected serpentine hybrid chain, 7 tuners, active reference feeds, emitter and optional dumps; padded sentries disconnected',results};writeFileSync('test-results/connected-performance.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
