/** Read-only verification harness. Reports unsupported sizes instead of bypassing limits. */
import {cpus,platform,arch} from 'node:os';
import {mkdirSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {source,through,matched,solveNetwork,type WaveLink} from '../src/sim/network';
import {createWorld,newEntity,step,evaluate} from '../src/sim/world';
const stats=(a:number[])=>{a.sort((a,b)=>a-b);return {medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)]};};
const results:any[]=[];
for(const ports of [40,80,128,130,256,400])for(const groups of [1,4,16]){
 const components=Array.from({length:groups},(_,i)=>source(`s${i}`,10)),links:WaveLink[]=[];
 const count=Math.floor((ports-groups*2)/2);
 for(let i=0;i<count;i++)components.push(through(`t${i}`,.1));
 for(let g=0;g<groups;g++){let previous={node:`s${g}`,port:0};for(let i=g;i<count;i+=groups){links.push({a:previous,b:{node:`t${i}`,port:0},amplitude:.995,phase:.1});previous={node:`t${i}`,port:1};}components.push(matched(`d${g}`));links.push({a:previous,b:{node:`d${g}`,port:0},amplitude:1,phase:0});}
 const row:any={kind:'solve',ports:components.reduce((n,c)=>n+c.s.length,0),groups,links:links.length,samples:30,warmup:5};
 try{const times:number[]=[];for(let i=0;i<35;i++){const start=performance.now(),r=solveNetwork(components,links);if(i>=5)times.push(performance.now()-start);row.residual=r.residual;}Object.assign(row,stats(times));}catch(e){row.error=String(e);}
 results.push(row);
}
for(const machines of [40,80,120]){const w=createWorld();while(w.entities.length<machines){const i=w.entities.length;w.entities.push(newEntity('sentry',2+i%20*3,22+Math.floor(i/20)*2,`e${i+100}`));}const times:number[]=[];for(let i=0;i<125;i++){const t=performance.now();step(w);if(i>=25)times.push(performance.now()-t);}results.push({kind:'world-step',machines,topology:'starter network + disconnected sentries',samples:100,warmup:25,...stats(times)});}
const w=createWorld();w.entities=Array.from({length:33},(_,i)=>newEntity('junction',i%11*4,Math.floor(i/11)*4,`e${i+1}`));w.links=[];evaluate(w);results.push({kind:'cap-reproduction',machines:33,ports:132,error:w.stats.error});
const report={date:new Date().toISOString(),platform:platform(),arch:arch(),cpu:cpus()[0]?.model,node:process.version,results};
mkdirSync('test-results',{recursive:true});writeFileSync('test-results/performance-review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
