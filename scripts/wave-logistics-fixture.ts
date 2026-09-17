/**
 * R-01 balance fixture. Declared initial stock and an already-cleared frontier are documented fixture
 * preconditions; from there every assembly, accepted cycle and manufactured part is real production.
 * The fixture freezes a compact two-branch cell, measures the best-tuned basic delivery, earns precision
 * output through three accepted cycles, manufactures a precision elbow and measures the upgraded layout
 * on the identical source, target, recipe and duration.
 */
import {
 assignEmitter,assignTuner,beginProcessQualification,bindDomainReference,commitFieldRoute,connect,createWorld,DT,
 evaluate,installVariant,place,previewFieldRoute,replacePiece,reserveProcess,reserveManufacture,setAssemblerMode,setDomainEnabled,step,type World,
} from '../src/sim/world';
import {step as manufactureStep,activeJob as manufactureActive} from '../src/sim/manufacture';
import {partScattering,PRECISION_ELBOW,MATCHED_JUNCTION,BASIC_STRAIGHT,COMPACT_ELBOW,BASIC_JUNCTION} from '../src/sim/wave-parts';

const placeAt=(w:World,kind:Parameters<typeof place>[1],x:number,y:number)=>{const error=place(w,kind,x,y);if(error)throw new Error(`place ${kind} at ${x},${y}: ${error}`);return w.entities.at(-1)!;};
const wire=(w:World,type:'field'|'material'|'power',a:string,ap:number,b:string,bp:number)=>{const error=connect(w,type,{node:a,port:ap},{node:b,port:bp});if(error)throw new Error(`${type} ${a}:${ap}->${b}:${bp}: ${error}`);};
const route=(w:World,a:string,ap:number,b:string,bp:number,radius=0)=>{const preview=previewFieldRoute(w,{node:a,port:ap},{node:b,port:bp},{radius});if(preview.error)throw new Error(`route ${a}:${ap}->${b}:${bp}: ${preview.error}`);const error=commitFieldRoute(w,preview);if(error)throw new Error(`commit ${a}:${ap}->${b}:${bp}: ${error}`);return preview;};
const run=(w:World,seconds:number)=>{for(let i=0;i<Math.round(seconds/DT);i++)step(w);};

export interface SweepPoint {phase:number;useful:number;guard:number;source:number}
export interface LayoutReading {pieces:number;area:number;best:SweepPoint;accept:SweepPoint|null;ratio:number}
export interface WaveLogisticsFixture {
 world:World;
 reference:string;
 cell:string;
 cellTarget:string;
 cellDomain:string;
 basic:LayoutReading;
 upgraded:LayoutReading;
 improvement:number;
 acceptedCycles:number;
 qualified:boolean;
}

function areaOf(w:World,ids:Set<string>):number{
 const boxes=w.pieces.filter(p=>ids.has(p.route)).map(p=>({x:p.x,y:p.y}));
 if(!boxes.length)return 0;
 const xs=boxes.map(b=>b.x),ys=boxes.map(b=>b.y);
 return (Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));
}
const ratio=(p:SweepPoint)=>p.source>0?p.useful/p.source:0;
const acceptOf=(sweep:SweepPoint[]):SweepPoint|null=>{
 const ok=sweep.filter(p=>p.useful*8>=80&&p.useful*8<=640&&(p.useful+p.guard>0)&&(p.guard/(p.useful+p.guard))<=.10);
 return ok.sort((a,b)=>b.useful-a.useful)[0]??null;
};
function measure(w:World,reference:string,cellTarget:string,tuner:{phase:number}):{sweep:SweepPoint[];best:SweepPoint;accept:SweepPoint|null}{
 const sweep:SweepPoint[]=[];
 for(let phase=-180;phase<=180;phase+=2){tuner.phase=phase;const stats=evaluate(w);const reading=stats.targets[cellTarget];sweep.push({phase,useful:reading?.useful??0,guard:reading?.guard??0,source:stats.network.ports[reference]?.[0]?.outgoing??0});}
 const best=[...sweep].sort((a,b)=>ratio(b)-ratio(a))[0];
 return {sweep,best,accept:acceptOf(sweep)};
}

export function runWaveLogisticsFixture():WaveLogisticsFixture{
 const w=createWorld();
 w.frontier=true;w.stock={assemblies:400,crystal:20,scrap:0,precision:0};
 const generator=placeAt(w,'generator',40,32),reference=placeAt(w,'reference',14,30);
 const cellJunction=placeAt(w,'junction',18,30),cellTuner=placeAt(w,'tuner',24,28);
 const emitterA=placeAt(w,'emitter',28,24),emitterB=placeAt(w,'emitter',28,32),cell=placeAt(w,'fabrication-cell',22,22);
 for(const load of [reference,emitterA,emitterB,cell])wire(w,'power',generator.id,0,load.id,0);
 // Physical two-branch field network: reference → junction splits to branch A (tuner→emitter) and B.
 route(w,reference.id,0,cellJunction.id,0);
 route(w,cellJunction.id,2,cellTuner.id,0);
 route(w,cellTuner.id,1,emitterA.id,0);
 route(w,cellJunction.id,3,emitterB.id,0);
 const cellTargetEntity=w.targets.find(t=>t.owner===cell.id)!,cellDomainEntity=w.domains.find(d=>d.target===cellTargetEntity.id)!;
 if(assignEmitter(w,emitterA.id,cellTargetEntity.id))throw new Error('assign emitter A');
 if(assignEmitter(w,emitterB.id,cellTargetEntity.id))throw new Error('assign emitter B');
 if(assignTuner(w,cellTuner.id,cellDomainEntity.id))throw new Error('assign cell tuner');
 if(bindDomainReference(w,cellDomainEntity.id,reference.id))throw new Error('bind reference');
 const routeIds=new Set(w.links.filter(l=>l.pieces).map(l=>l.id));
 const basic=measure(w,reference.id,cellTargetEntity.id,cellTuner);
 if(!basic.accept)throw new Error(`no accepted basic phase: max useful ${basic.best.useful.toFixed(2)}`);
 // Earn precision output with accepted cycles on the basic layout; keep the certificate fresh by
 // re-running the test on the upgraded layout afterwards.
 cellTuner.phase=basic.accept.phase;evaluate(w);
 if(setDomainEnabled(w,cellDomainEntity.id,true))throw new Error('enable control');
 if(beginProcessQualification(w,cellTargetEntity.id))throw new Error('begin process test');
 for(let cycle=0;cycle<9;cycle++){if(reserveProcess(w,cellTargetEntity.id))throw new Error('reserve accepted cycle');run(w,8.2);}
 // Manufacture the upgrades for real: assembler tooling jobs funded by earned precision stock.
 const assembler=w.entities.find(e=>e.kind==='assembler')!;if(setAssemblerMode(w,assembler.id,'tooling'))throw new Error('tooling mode');
 for(const part of [PRECISION_ELBOW,PRECISION_ELBOW,PRECISION_ELBOW,MATCHED_JUNCTION]){if(reserveManufacture(w,assembler.id,part.id))break;for(let i=0;i<400&&manufactureActive(w,assembler.id);i++)manufactureStep(w,.1);}
 if((w.hardware['elbow-precision@1']??0)<1||(w.hardware['junction-matched@1']??0)<1)throw new Error('upgrades were not manufactured');
 // Replace every lossy bend we can, then the imbalanced junction; everything else stays identical.
 for(const piece of w.pieces.filter(p=>p.category==='elbow')){if((w.hardware['elbow-precision@1']??0)<1)break;const error=replacePiece(w,piece.id,PRECISION_ELBOW.id);if(error)throw new Error(`replace ${piece.id}: ${error}`);}
 const junctionPart=installVariant(w,cellJunction.id,MATCHED_JUNCTION.id);if(junctionPart)throw new Error(`junction: ${junctionPart}`);
 const upgraded=measure(w,reference.id,cellTargetEntity.id,cellTuner);
 if(!upgraded.accept)throw new Error(`no accepted upgraded phase: err=${w.stats.error} max useful ${upgraded.best.useful.toFixed(2)}`);
 cellTuner.phase=upgraded.accept.phase;
 if(setDomainEnabled(w,cellDomainEntity.id,true))throw new Error('enable control');
 if(beginProcessQualification(w,cellTargetEntity.id))throw new Error('begin upgraded test');
 for(let cycle=0;cycle<3;cycle++){if(reserveProcess(w,cellTargetEntity.id))throw new Error('reserve upgraded cycle');run(w,8.2);}
 const qualification=w.qualifications.find(q=>q.domain===cellDomainEntity.id)!;
 return {
  world:w,reference:reference.id,cell:cell.id,cellTarget:cellTargetEntity.id,cellDomain:cellDomainEntity.id,
  basic:{pieces:w.pieces.length,area:areaOf(w,routeIds),best:basic.best,accept:basic.accept,ratio:ratio(basic.accept)},
  upgraded:{pieces:w.pieces.length,area:areaOf(w,routeIds),best:upgraded.best,accept:upgraded.accept,ratio:ratio(upgraded.accept)},
  improvement:ratio(basic.accept)>0?ratio(upgraded.accept)/ratio(basic.accept)-1:0,
  acceptedCycles:w.process.accepted,qualified:qualification.status==='qualified',
 };
}

/** Static data contract report: coefficients, passivity and the frozen starter BOM. */
export function dataContract(){
 const parts=[BASIC_STRAIGHT,COMPACT_ELBOW,BASIC_JUNCTION,PRECISION_ELBOW];
 return parts.map(p=>{const s=partScattering(p);const n=s.length;const transmission=n===2?Math.hypot(s[0][1][0],s[0][1][1]):0;return {id:p.id,version:p.version,category:p.category,tier:p.tier,reflectance:p.reflectance,loss:p.loss,ports:n,transmission};});
}

if(process.argv[1]&&process.argv[1].endsWith('wave-logistics-fixture.ts')){
 const result=runWaveLogisticsFixture();
 console.log(JSON.stringify({contract:dataContract(),basic:result.basic,upgraded:result.upgraded,improvement:result.improvement,acceptedCycles:result.acceptedCycles,qualified:result.qualified},null,2));
}
