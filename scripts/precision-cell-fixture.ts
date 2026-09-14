/**
 * No-stock-injection bootstrap fixture: play a fresh expedition through frontier access, crystal,
 * a legal precision-cell build and three accepted cycles under local control. Nothing is injected;
 * all material comes from the starter extractor/assembler and the crystal deposit.
 */
import {assignEmitter,assignTuner,beginProcessQualification,bindDomainReference,connect,createWorld,DT,evaluate,place,reserveProcess,setController,setDomainEnabled,step,type World} from '../src/sim/world';

const placeAt=(w:World,kind:Parameters<typeof place>[1],x:number,y:number,rotation:0|1|2|3=0)=>{const error=place(w,kind,x,y,rotation);if(error)throw new Error(`place ${kind} at ${x},${y}: ${error}`);return w.entities.at(-1)!;};
const wire=(w:World,type:'field'|'material'|'power',a:string,ap:number,b:string,bp:number)=>{const error=connect(w,type,{node:a,port:ap},{node:b,port:bp});if(error)throw new Error(`${type} ${a}:${ap}->${b}:${bp}: ${error}`);};
const run=(w:World,seconds:number)=>{for(let i=0;i<Math.round(seconds/DT);i++)step(w);};

export interface PrecisionCellResult {world:World;cellTarget:string;cellDomain:string;standalone:string[];phaseSweep:{phase:number;useful:number;guard:number}[];failedLots:number;accepted:number;qualified:boolean;}

export function runPrecisionCellFixture():PrecisionCellResult{
 const w=createWorld();
 // Frontier: extend the starter branch and let the bounded controller clear the guardian.
 const frontierTuner=placeAt(w,'tuner',17,12),frontierEmitter=placeAt(w,'emitter',20,12);
 wire(w,'power','e1',0,frontierEmitter.id,0);
 const junction=w.entities.find(e=>e.kind==='junction')!;
 wire(w,'field',junction.id,3,frontierTuner.id,0);wire(w,'field',frontierTuner.id,1,frontierEmitter.id,0);
 if(setController(w,true))throw new Error('could not enable the frontier controller');
 for(let i=0;i<600&&!w.frontier;i++)run(w,1);
 if(!w.frontier)throw new Error('frontier never cleared');
 // Crystal access.
 const crystalExtractor=placeAt(w,'extractor',29,7);wire(w,'power','e1',0,crystalExtractor.id,0);
 for(let i=0;i<1200;i++){run(w,1);if(w.stock.crystal>=6&&w.stock.assemblies>=90)break;}
 if(w.stock.crystal<6)throw new Error(`crystal supply too low: ${w.stock.crystal}`);
 if(w.stock.assemblies<90)throw new Error(`assembly supply too low: ${w.stock.assemblies}`);
 // Standalone cell set: independent generator/reference/junction/tuner/two emitters/cell.
 const generator=placeAt(w,'generator',45,30),reference=placeAt(w,'reference',40,28),cellJunction=placeAt(w,'junction',44,28),cellTuner=placeAt(w,'tuner',44,24),emitterA=placeAt(w,'emitter',47,20),emitterB=placeAt(w,'emitter',47,26),cell=placeAt(w,'fabrication-cell',40,20);
 for(const load of [reference,emitterA,emitterB,cell])wire(w,'power',generator.id,0,load.id,0);
 wire(w,'field',reference.id,0,cellJunction.id,0);
 wire(w,'field',cellJunction.id,2,cellTuner.id,0);
 wire(w,'field',cellTuner.id,1,emitterA.id,0);
 wire(w,'field',cellJunction.id,3,emitterB.id,0);
 const cellTarget=w.targets.find(t=>t.owner===cell.id)!,cellDomain=w.domains.find(d=>d.target===cellTarget.id)!;
 if(assignEmitter(w,emitterA.id,cellTarget.id))throw new Error('assign emitter A');
 if(assignEmitter(w,emitterB.id,cellTarget.id))throw new Error('assign emitter B');
 if(assignTuner(w,cellTuner.id,cellDomain.id))throw new Error('assign cell tuner');
 if(bindDomainReference(w,cellDomain.id,reference.id))throw new Error('bind cell reference');
 evaluate(w);
 // Measure the two-zone phase response so the reject/accept points are chosen from the real model.
 const sweep:{phase:number;useful:number;guard:number}[]=[];
 for(let phase=-180;phase<=180;phase+=2){cellTuner.phase=phase;evaluate(w);const reading=w.stats.targets[cellTarget.id];if(reading)sweep.push({phase,useful:reading.useful,guard:reading.guard});}
 const total=(p:{useful:number;guard:number})=>p.useful+p.guard;
 const lowGuard=(p:{useful:number;guard:number})=>total(p)>0&&p.guard/total(p)<=.1;
 const rejectPoint=sweep.find(p=>p.useful>0&&p.useful*8<80&&lowGuard(p))??null;
 const failPoint=[...sweep].filter(p=>p.useful*8<80).sort((a,b)=>b.guard-a.guard)[0]??null;
 const acceptPoint=sweep.filter(p=>p.useful*8>=80&&p.useful*8<=640&&lowGuard(p)).sort((a,b)=>b.useful-a.useful)[0]??null;
 if(!acceptPoint){const best=[...sweep].sort((a,b)=>b.useful-a.useful)[0];throw new Error(`no accepted phase: max useful ${best.useful.toFixed(2)} p·s ${(best.useful*8).toFixed(1)} guardFraction ${(best.guard/total(best)).toFixed(3)}`);}
 // Deliberate failed batch (recoverable underdose when the capture floor allows it, otherwise off-phase scrap), then local control and three accepted cycles.
 if(setDomainEnabled(w,cellDomain.id,false))throw new Error('disable cell control');
 const failedPoint=rejectPoint??failPoint;
 if(failedPoint){cellTuner.phase=failedPoint.phase;evaluate(w);if(reserveProcess(w,cellTarget.id))throw new Error('reserve reject');run(w,8.2);}
 const failedLots=w.process.lots.length;
 cellTuner.phase=acceptPoint.phase;evaluate(w);
 if(setDomainEnabled(w,cellDomain.id,true))throw new Error('enable cell control');
 if(beginProcessQualification(w,cellTarget.id))throw new Error('begin process qualification');
 for(let cycle=0;cycle<3;cycle++){if(reserveProcess(w,cellTarget.id))throw new Error('reserve accepted cycle');run(w,8.2);}
 const qualification=w.qualifications.find(q=>q.domain===cellDomain.id)!;
 return {world:w,cellTarget:cellTarget.id,cellDomain:cellDomain.id,standalone:[generator.id,reference.id,cellJunction.id,cellTuner.id,emitterA.id,emitterB.id,cell.id],phaseSweep:sweep,failedLots,accepted:w.process.accepted,qualified:qualification.status==='qualified'};
}
