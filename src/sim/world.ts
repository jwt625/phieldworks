import {newEcology,stepEcology} from './ecology';
import {footprint,ports,inside,routeMetrics,type Rotation,type Point,type Transport} from './geometry';
import {findRoute,segmentClear,type RouteOptions} from './routing';
export {footprint,ports,routeMetrics} from './geometry';
import {c,type Complex} from './complex';
import {source,hybrid,through,matched,solveNetwork,FIELD_PORT_LIMIT,type NetworkResult,type Component,type Endpoint,type WaveLink} from './network';
import {BASIC_CROSSING,partDef,partScattering} from './wave-parts';
import {previewFieldRoute,commitFieldRoute,replacePiece,removePiece,piecePorts,pieceCost,sweptError,recycleRoute,hardwareKey} from './wave-construction';
import {RADIATION_EFFICIENCY,coupledField,projectFrontier,projectTwoZone} from './targets';
import {automaticControl,referenceReady} from './control';
import {revalidate,startQualification} from './qualification';
import {cancel as cancelProcessJob,finalizeLostJobs,finalizeLoss,reserve as reserveProcessJob,rework as reworkProcessJob,step as stepProcess} from './process';
import {cancel as cancelManufactureJob,finalizeLostJobs as finalizeLostManufactureJobs,reserve as reserveManufactureJob,setAssemblerMode as setAssemblerModeImpl,step as stepManufacture,activeJob as activeManufactureJob,unlockedParts} from './manufacture';
export {blocker as processBlocker,preview as processPreview} from './process';
export {FIELD_PORT_LIMIT} from './network';
import {DEFS,type Kind} from './definitions';
export {DEFS,type Kind} from './definitions';
import {WIDTH,HEIGHT,DT,MACHINE_LIMIT,LINK_LIMIT,WIRE_CAPACITY,type World,type Entity,type Connection,type Deposit,type Blueprint,type Stats,type Target,type ReferenceBinding,type ControlDomain,type Qualification} from './world-types';
export {WIDTH,HEIGHT,DT,MACHINE_LIMIT,LINK_LIMIT,WIRE_CAPACITY} from './world-types';
export type {World,Entity,Connection,Deposit,Blueprint,Stats,Target,ReferenceBinding,ControlDomain,Qualification,ProcessInventory,ProcessLot,ControlObjective,QualificationStatus,TargetKind,LotKind,WavePiece,WaveInterface,ManufactureJob,ManufactureStage,ManufactureOutcome} from './world-types';
export {previewFieldRoute,commitFieldRoute,replacePiece,removePiece,piecePorts,pieceCost,routePath,sweptError,hardwareKey} from './wave-construction';
export {partDef,partById,partScattering,WAVE_PART_DEFS,BASIC_STRAIGHT,COMPACT_ELBOW,SWEPT_ELBOW,BASIC_JUNCTION,BASIC_CROSSING,PRECISION_ELBOW,MATCHED_JUNCTION,returnLossDb,insertionLossDb,isPassive} from './wave-parts';
import {deserializeCore,emptyStats,newProcess} from './persistence';
export {serialize} from './persistence';

export const center=(e:Entity)=>({x:e.x+footprint(e).w/2,y:e.y+footprint(e).h/2});
/** Public restore entry point: persistence owns validation/migration, then the façade evaluates the rebuilt world. */
export function deserialize(raw:string):World{const w=deserializeCore(raw);evaluate(w);return w;}
export function event(w:World,text:string){w.events.unshift({time:w.time,text});w.events=w.events.slice(0,30);}
export function entity(w:World,id:string){return w.entities.find(e=>e.id===id);}
export function portPosition(e:Entity,p:number,type:Transport='field'){return ports(e,type)[p].position;}
export function newEntity(kind:Kind,x:number,y:number,id:string,rotation:Rotation=0):Entity{return{id,kind,x,y,rotation,phase:0,temperature:25,health:100,tripped:false,protection:true,ore:0,progress:0,powered:false};}
/** The frontier target/controller/commission state is derived from local records; never a second writable authority. */
export function frontierTarget(w:World):Target|undefined{return w.targets.find(t=>t.kind==='frontier');}
export function frontierDomain(w:World):ControlDomain|undefined{const t=frontierTarget(w);return t?w.domains.find(d=>d.target===t.id):undefined;}
export function frontierQualification(w:World):Qualification|undefined{const d=frontierDomain(w);return d?w.qualifications.find(q=>q.domain===d.id):undefined;}
export function invalidate(w:World,reason:string){w.revision++;if(revalidate(w,reason))event(w,`Qualification invalidated: ${reason}`);}
function overlap(x:number,y:number,aw:number,ah:number,b:{x:number;y:number;w:number;h:number}){return x<b.x+b.w&&x+aw>b.x&&y<b.y+b.h&&y+ah>b.y;}
export function placementError(w:World,kind:Kind,x:number,y:number,extra:Entity[]=[],rotation:Rotation=0):string {
 const d={...DEFS[kind],...footprint({kind,rotation})};if(![0,1,2,3].includes(rotation))return 'Invalid rotation';if(w.entities.length+extra.length>=MACHINE_LIMIT)return `Prototype limit: ${MACHINE_LIMIT} machines`;if([...w.entities,...extra].reduce((n,e)=>n+DEFS[e.kind].ports.length,0)+w.pieces.length*2+d.ports.length>FIELD_PORT_LIMIT)return `Prototype limit: ${FIELD_PORT_LIMIT} field ports`;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x+d.w>WIDTH||y+d.h>HEIGHT)return 'Outside the build area';
 if(!w.frontier&&x+d.w>25)return 'Clear the armored organism to open the eastern frontier';
 if([...w.entities,...extra].some(e=>overlap(x,y,d.w,d.h,{x:e.x,y:e.y,...footprint(e)})))return 'Footprint occupied';
 if(w.links.some(l=>l.path.some((p,i)=>inside(p,{kind,x,y,rotation})||(i>0&&!segmentClear(l.path[i-1],p,[{kind,x,y,rotation}])))))return 'Route occupies footprint';
 if(kind==='extractor'&&!w.deposits.some(dep=>dep.remaining>0&&overlap(x,y,d.w,d.h,dep)))return 'An extractor needs a resource deposit';
 return '';
}
/** Transitional default: while the frontier is the only domain/target, new equipment joins it; process targets require explicit assignment. */
function autoAssign(w:World,e:Entity){
 if(e.kind==='emitter'&&w.targets.length===1&&w.targets[0].kind==='frontier')w.targets[0].emitters.push(e.id);
 else if(e.kind==='tuner'&&w.domains.length===1)w.domains[0].tuners.push(e.id);
}
/** Every emitter delivers to at most one target. Reassigning removes it from the previous target atomically. */
export function assignEmitter(w:World,emitterId:string,targetId:string|null):string {
 const e=entity(w,emitterId);if(!e||e.kind!=='emitter')return 'Select a field emitter';
 if(targetId!==null&&!w.targets.some(t=>t.id===targetId))return 'Select a delivery target';
 for(const t of w.targets)t.emitters=t.emitters.filter(id=>id!==emitterId);
 if(targetId!==null)w.targets.find(t=>t.id===targetId)!.emitters.push(emitterId);
 invalidate(w,'Delivery assignment changed');return '';
}
export function place(w:World,kind:Kind,x:number,y:number,rotation:Rotation=0):string {
 const error=placementError(w,kind,x,y,[],rotation);if(error)return error;if(w.stock.assemblies<DEFS[kind].cost)return 'Not enough assemblies';
 w.stock.assemblies-=DEFS[kind].cost;const created=newEntity(kind,x,y,`e${w.nextId++}`,rotation);w.entities.push(created);autoAssign(w,created);if(kind==='fabrication-cell')createProcessCell(w,created);invalidate(w,'Installation changed');event(w,`${DEFS[kind].name} built`);return '';
}
/** A cell owns exactly one process target/domain/qualification. Material is reserved from shared stock, not routed. */
function createProcessCell(w:World,cell:Entity){const p=center(cell),targetId=`t${w.nextId++}`,domainId=`d${w.nextId++}`;
 w.targets.push({id:targetId,kind:'process',owner:cell.id,x:p.x,y:p.y,health:0,emitters:[],contract:'standard-cell'});
 w.domains.push({id:domainId,name:'Fabrication cell',target:targetId,reference:frontierDomain(w)?.reference??null,sensor:cell.id,tuners:[],enabled:false,objective:'useful-minus-guard',cursor:0});
 w.qualifications.push({id:`q${w.nextId++}`,domain:domainId,target:targetId,status:'idle',signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[],reason:'Not tested',code:''});
}
export function remove(w:World,id:string):void {const e=entity(w,id);if(!e)return;for(const job of w.jobs.filter(j=>j.cell===id&&j.stage!=='complete'))finalizeLoss(w,job.id,'cell dismantled');finalizeLostManufactureJobs(w);for(const target of w.targets.filter(t=>t.owner===id)){for(const d of w.domains.filter(d=>d.target===target.id))w.qualifications=w.qualifications.filter(q=>q.domain!==d.id);w.domains=w.domains.filter(d=>d.target!==target.id);}w.targets=w.targets.filter(t=>t.owner!==id);for(const l of w.process.lots)if(l.owner===id&&l.kind==='reject'){l.kind='scrap';l.disposition='spent';l.owner=null;}w.stock.assemblies+=e.health>0?DEFS[e.kind].cost:0;w.stock.scrap+=e.ore;e.ore=0;w.entities=w.entities.filter(x=>x.id!==id);for(const t of w.targets)t.emitters=t.emitters.filter(x=>x!==id);for(const d of w.domains)d.tuners=d.tuners.filter(x=>x!==id);for(const l of w.links.filter(l=>l.a.node===id||l.b.node===id))disconnect(w,l.id);invalidate(w,'Equipment removed');event(w,e.health>0?'Equipment recovered; buffered ore becomes scrap':'Wreck cleared');}
/** Process lifecycle commands. Ownership/capacity are validated before any stock or lot mutation. */
export function reserveProcess(w:World,targetId:string):string{const error=reserveProcessJob(w,targetId);if(!error)invalidate(w,'Process batch reserved');return error;}
/** R-05 hardware manufacture commands. Installation consumes manufactured hardware, never research points. */
export function setAssemblerMode(w:World,id:string,mode:'ore'|'tooling'):string{return setAssemblerModeImpl(w,id,mode);}
export function reserveManufacture(w:World,cellId:string,partId:string):string{return reserveManufactureJob(w,cellId,partId);}
export function cancelManufacture(w:World,jobId:string):string{return cancelManufactureJob(w,jobId);}
export function manufactureActive(w:World,cellId:string|null){return activeManufactureJob(w,cellId);}
export {unlockedParts};
export function cancelProcess(w:World,jobId:string):string{const error=cancelProcessJob(w,jobId);if(!error)invalidate(w,'Process batch cancelled');return error;}
export function reworkProcess(w:World,targetId:string):string{const error=reworkProcessJob(w,targetId);if(!error)invalidate(w,'Rework started');return error;}
/** Begin the local process test: three consecutive accepted cycles under enabled control. */
export function beginProcessQualification(w:World,targetId:string):string{
 const domain=w.domains.find(d=>d.target===targetId);if(!domain)return 'No control domain for this target';
 return startQualification(w,domain.id,'3 consecutive accepted standard cycles');
}
export function cancelQualification(w:World,domainId:string):string{
 const qualification=w.qualifications.find(q=>q.domain===domainId);if(!qualification)return 'No qualification record';
 qualification.status='idle';qualification.reason='Cancelled; not qualified';qualification.elapsed=0;qualification.minimum=-1;qualification.counters=0;qualification.signature='';return '';
}
/** Domain commands validate ownership/reference before mutating so a domain cannot be enabled without a live source. */
export function setDomainEnabled(w:World,domainId:string,on:boolean):string{
 const domain=w.domains.find(d=>d.id===domainId);if(!domain)return 'No such control domain';
 if(on&&!referenceReady(w,domain))return 'Bind a powered reference before enabling control';
 domain.enabled=on;invalidate(w,'Controller mode changed');return '';
}
/** Bind a domain to a powered reference entity, creating its coherence binding on first use (each source defaults to its own group). */
export function bindDomainReference(w:World,domainId:string,sourceId:string):string{
 const domain=w.domains.find(d=>d.id===domainId);if(!domain)return 'No such control domain';
 const source=entity(w,sourceId);if(!source||source.kind!=='reference')return 'Select a reference station';
 let binding=w.references.find(r=>r.source===sourceId);if(!binding){binding={id:`r${w.nextId++}`,source:sourceId,group:sourceId};w.references.push(binding);}
 domain.reference=binding.id;invalidate(w,'Reference binding changed');return '';
}
/** Install manufactured junction hardware on a placed four-port junction; consumes inventory only. */
export function installVariant(w:World,id:string,partId:string):string{
 const e=entity(w,id);if(!e)return 'Select equipment';
 const def=partDef(partId,1);if(!def||def.category!=='junction'||e.kind!=='junction')return 'Incompatible hardware definition';
 if(e.variant===def.id&&e.variant!==undefined)return 'That hardware is already installed';
 const key=hardwareKey(def.id,def.version);if((w.hardware[key]??0)<1)return `No ${def.name} in inventory — manufacture one first`;
 w.hardware[key]!--;e.variant=def.id;invalidate(w,'Hardware replaced');event(w,`${def.name} installed`);return '';
}
export function connect(w:World,type:Connection['type'],a:Endpoint,b:Endpoint,options:RouteOptions={}):string {
 const ea=entity(w,a.node),eb=entity(w,b.node);if(!ea||!eb||a.node===b.node)return 'Choose two different machines';
 if(!['field','material','power'].includes(type)||!Number.isInteger(a.port)||!Number.isInteger(b.port)||a.port<0||b.port<0)return 'Invalid port index';
 const pa=ports(ea,type)[a.port],pb=ports(eb,type)[b.port];if(!pa||!pb)return 'Select a compatible port';
 if(type!=='field'&&(pa.role!=='output'||pb.role!=='input'))return 'Belts and wires run from output to input';
 if(w.links.some(l=>l.type===type&&[l.a,l.b].some(p=>(type!=='power'&&p.node===a.node&&p.port===a.port)||(p.node===b.node&&p.port===b.port))))return 'Port occupied — disconnect its existing route first';
 const radius=options.radius??.5;if(!Number.isFinite(radius)||radius<0||radius>4)return 'Invalid bend radius';
 const path=findRoute(pa,pb,w.entities,WIDTH,HEIGHT,options);if(!path)return 'No valid grid route: check clearance and port direction';
 w.links.push({id:`l${w.nextId++}`,type,a:{...a},b:{...b},path,diagonal:options.diagonal??false,radius,packets:[]});invalidate(w,'Routing changed');return '';
}
export function disconnect(w:World,id:string){const l=w.links.find(l=>l.id===id);if(!l)return;w.stock.scrap+=l.packets.length;recycleRoute(w,l);w.links=w.links.filter(l=>l.id!==id);invalidate(w,'Routing changed');}
/** Rebuild an installed route in place. Validation is atomic: the route is untouched on failure. */
export function editRoute(w:World,id:string,options:RouteOptions={}):string {
 const l=w.links.find(l=>l.id===id);if(!l)return 'Select a route to edit';
 const ea=entity(w,l.a.node),eb=entity(w,l.b.node);if(!ea||!eb)return 'Route endpoint missing';
 const pa=ports(ea,l.type)[l.a.port],pb=ports(eb,l.type)[l.b.port];if(!pa||!pb)return 'Route endpoints are invalid';
 const radius=options.radius??l.radius,diagonal=options.diagonal??l.diagonal;if(!Number.isFinite(radius)||radius<0||radius>4)return 'Invalid bend radius';
 const path=findRoute(pa,pb,w.entities,WIDTH,HEIGHT,{diagonal,radius,waypoints:options.waypoints,path:options.path});if(!path)return 'No valid grid route: check clearance and port direction';
 l.path=path;l.diagonal=diagonal;l.radius=radius;
 if(l.type==='material'){const length=routeMetrics(path).length,capacity=Math.floor(length*2)+1;let limit=length;const kept:number[]=[];for(const v of l.packets){const p=Math.min(v,limit);if(p<0)break;kept.push(p);limit=p-.5;if(kept.length>=capacity)break;}w.stock.scrap+=l.packets.length-kept.length;l.packets=kept;}
 invalidate(w,'Routing changed');event(w,`Route ${id} rebuilt`);return '';
}
export function rotateEntity(w:World,id:string):string {
 const e=entity(w,id);if(!e)return 'Select equipment';if(w.links.some(l=>l.a.node===id||l.b.node===id))return 'Disconnect routes before rotating equipment';
 const rotation=((e.rotation+1)%4) as Rotation;
 const error=placementError({...w,entities:w.entities.filter(v=>v.id!==id)},e.kind,e.x,e.y,[],rotation);if(error)return error;e.rotation=rotation;invalidate(w,'Equipment rotated');return '';
}
export function setPhase(w:World,id:string,degrees:number){const e=entity(w,id);if(!e||e.kind!=='tuner'||!Number.isFinite(degrees))return;e.phase=Math.max(-180,Math.min(180,degrees));w.revision++;let changed=false;for(const d of w.domains)if(d.tuners.includes(id))for(const q of w.qualifications)if(q.domain===d.id&&(q.status==='testing'||q.status==='qualified')){q.status='failed';q.reason='Manual phase adjustment';q.code='dependency-changed';changed=true;}if(changed)event(w,'Qualification invalidated: Manual phase adjustment');}
/** A tuner belongs to at most one domain. Manual tuner edits deliberately fall outside the configuration signature. */
export function assignTuner(w:World,tunerId:string,domainId:string|null):string{
 const e=entity(w,tunerId);if(!e||e.kind!=='tuner')return 'Select a phase tuner';
 if(domainId!==null&&!w.domains.some(d=>d.id===domainId))return 'Select a control domain';
 for(const d of w.domains)d.tuners=d.tuners.filter(id=>id!==tunerId);
 if(domainId!==null)w.domains.find(d=>d.id===domainId)!.tuners.push(tunerId);
 invalidate(w,'Tuner assignment changed');return '';
}
export function repair(w:World,id:string):string{const e=entity(w,id);if(!e)return 'Select equipment';if(w.stock.assemblies<3)return 'Repair needs 3 assemblies';w.stock.assemblies-=3;e.health=100;e.temperature=25;e.tripped=false;invalidate(w,'Equipment repaired');event(w,`${DEFS[e.kind].name} repaired and reset`);return '';}
export function createWorld():World {
  const w:World={version:5,ecology:newEcology(),time:0,nextId:1,entities:[],links:[],pieces:[],deposits:[{id:'starter',x:3,y:5,w:4,h:4,remaining:1400,kind:'ore'},{id:'reserve',x:3,y:17,w:4,h:3,remaining:900,kind:'ore'},{id:'remote-ore',x:38,y:5,w:4,h:4,remaining:1200,kind:'ore'},{id:'frontier',x:29,y:7,w:4,h:4,remaining:500,kind:'crystal'}],stock:{assemblies:28,crystal:0,scrap:0,precision:0},unlocked:[],manufacture:[],hardware:{},produced:0,targets:[],references:[],domains:[],qualifications:[],process:newProcess(),jobs:[],eventSeq:0,frontier:false,revision:0,statsRevision:-1,blueprint:null,events:[],stats:emptyStats()};
  const seed=(kind:Kind,x:number,y:number)=>{const e=newEntity(kind,x,y,`e${w.nextId++}`);w.entities.push(e);return e.id;};
  const gen=seed('generator',9,3),ex=seed('extractor',3,5),as=seed('assembler',3,11),ref=seed('reference',10,9),j=seed('junction',14,9),em=seed('emitter',20,5),dump=seed('dump',14,15);
  const targetId=`t${w.nextId++}`;w.targets=[{id:targetId,kind:'frontier',owner:null,x:28,y:13,health:600,emitters:[em],contract:null}];
  const referenceId=`r${w.nextId++}`;w.references=[{id:referenceId,source:ref,group:ref}];
  const domainId=`d${w.nextId++}`;w.domains=[{id:domainId,name:'Frontier',target:targetId,reference:referenceId,sensor:null,tuners:[],enabled:false,objective:'target-power',cursor:0}];
  w.qualifications=[{id:`q${w.nextId++}`,domain:domainId,target:targetId,status:'idle',signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[],reason:'Not commissioned',code:''}];
  connect(w,'material',{node:ex,port:0},{node:as,port:0});connect(w,'field',{node:ref,port:0},{node:j,port:0});connect(w,'field',{node:j,port:2},{node:em,port:0});connect(w,'field',{node:j,port:1},{node:dump,port:0});
  for(const e of w.entities.filter(e=>DEFS[e.kind].watts>0))connect(w,'power',{node:gen,port:0},{node:e.id,port:0});
  w.events=[];w.revision=0;event(w,'Expedition bus online. Build a tuner and a second emitter to concentrate the field.');evaluate(w);return w;
}
function powerGrid(w:World){
 const healthy=(e:Entity)=>e.health>0&&!e.tripped;
 const generators=w.entities.filter(e=>e.kind==='generator'&&healthy(e));
 const supply=generators.length*240;
 const demand=w.entities.reduce((sum,e)=>sum+(healthy(e)?DEFS[e.kind].watts:0),0);
 for(const e of w.entities)e.powered=healthy(e)&&DEFS[e.kind].watts===0;
 const adj=new Map<string,string[]>();const add=(a:string,b:string)=>{if(!adj.has(a))adj.set(a,[]);adj.get(a)!.push(b);};
 for(const l of w.links.filter(l=>l.type==='power')){add(l.a.node,l.b.node);add(l.b.node,l.a.node);}
 // Connected components via wires; supply is shared, loads are served in stable id order so
 // existing infrastructure stays up and only the excess is isolated in an overload.
 const seen=new Set<string>();let overload=0;
 for(const g of generators){if(seen.has(g.id))continue;const stack=[g.id];seen.add(g.id);const component:string[]=[];while(stack.length){const id=stack.pop()!;component.push(id);for(const n of adj.get(id)??[])if(!seen.has(n)){seen.add(n);stack.push(n);}}
  const gens=component.filter(id=>entity(w,id)?.kind==='generator'&&healthy(entity(w,id)!)).length;
  const loads=component.map(id=>entity(w,id)).filter((e):e is Entity=>!!e&&DEFS[e.kind].watts>0&&healthy(e)).sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));
  let used=0;const capacity=gens*240;for(const load of loads){const watts=DEFS[load.kind].watts;if(used+watts<=capacity){load.powered=true;used+=watts;}else overload++;}
 }
 // A load has one feed and no power output, so each wire carries exactly its receiver's draw.
 // Revisit this direct calculation if power poles/buses ever allow chained feeds.
 let wireOverload=0;
 for(const l of w.links)if(l.type==='power'){const e=entity(w,l.b.node);const flow=e&&e.powered?DEFS[e.kind].watts:0;if(flow>WIRE_CAPACITY)wireOverload++;}
 return {supply,demand,overload,wireOverload};
}
/** Geometry uses effective phase rad/tile, not real optical wavelength. Physical routes link explicit interfaces. */
export function waveLinks(w:World):WaveLink[]{
 const links:WaveLink[]=[];
 for(const l of w.links.filter(x=>x.type==='field')){
  if(l.interfaces?.length){for(const iface of l.interfaces)links.push({a:iface.a,b:iface.b,amplitude:1,phase:0});}
  else{const m=routeMetrics(l.path,l.radius);links.push({a:l.a,b:l.b,amplitude:Math.exp(-.5*(m.propagationExponent+m.bendExponent)),phase:.31*m.length});}
 }
 return links;
}
export function evaluate(w:World):Stats {
 const grid=powerGrid(w);const comps:Component[]=w.entities.filter(e=>DEFS[e.kind].ports.length).map(e=>{
  if(e.health<=0)return matched(e.id,DEFS[e.kind].ports.length);
  if(e.tripped&&e.kind!=='reference')return {id:e.id,s:DEFS[e.kind].ports.map((_,i)=>DEFS[e.kind].ports.map((_,j)=>c(i===j?1:0)))};
  if(e.tripped)return matched(e.id,DEFS[e.kind].ports.length);
  if(e.kind==='reference')return source(e.id,e.powered?100:0,e.id);
  if(e.kind==='junction'){const def=e.variant?partDef(e.variant,1):undefined;return def?{id:e.id,s:partScattering(def)}:hybrid(e.id);}
  if(e.kind==='crossing')return {id:e.id,s:partScattering(BASIC_CROSSING)};
  if(e.kind==='tuner')return through(e.id,e.phase*Math.PI/180+(e.temperature-25)*.045);
  if(e.kind==='emitter')return {id:e.id,s:[[c(.08)]]};return matched(e.id);
 });
 for(const piece of w.pieces){const def=partDef(piece.part,piece.version);if(def)comps.push({id:piece.id,s:partScattering(def,piece.spans)});}
 const stats=emptyStats();Object.assign(stats,grid);
 try{stats.network=solveNetwork(comps,waveLinks(w));}catch(err){stats.error=err instanceof Error?err.message:'Wave solve failed';w.stats=stats;w.statsRevision=w.revision;return stats;}
 for(const l of w.links.filter(l=>l.type==='field')){
  if(l.pieces?.length){
   for(const id of l.pieces){const piece=w.pieces.find(p=>p.id===id);if(!piece)continue;const absorbed=Math.max(0,stats.network.absorbed[id]??0);if(piece.category==='elbow')stats.bendRadiation+=absorbed;else stats.propagationLoss+=absorbed;}
   continue;
  }
  const m=routeMetrics(l.path,l.radius),total=m.propagationExponent+m.bendExponent;const outgoing=(stats.network.ports[l.a.node]?.[l.a.port]?.outgoing??0)+(stats.network.ports[l.b.node]?.[l.b.port]?.outgoing??0);const loss=outgoing*(1-Math.exp(-total));stats.bendRadiation+=total?loss*m.bendExponent/total:0;stats.propagationLoss+=total?loss*m.propagationExponent/total:0;
 }
 const targetOf=new Map<string,Target>();for(const t of w.targets)for(const id of t.emitters)targetOf.set(id,t);
 const perTarget=new Map<string,{groups:Record<string,Complex[]>;count:number}>();
 let heat=0,radiated=0;
 for(const e of w.entities){const absorbed=Math.max(0,stats.network.absorbed[e.id]??0);
  if(e.kind==='emitter'&&e.powered){const p=center(e),rad=absorbed*RADIATION_EFFICIENCY;radiated+=rad;heat+=absorbed-rad;
   const target=targetOf.get(e.id);stats.emitterFields[e.id]={};
   if(target){const distance=Math.hypot(p.x-target.x,p.y-target.y);let bucket=perTarget.get(target.id);if(!bucket){bucket={groups:{},count:0};perTarget.set(target.id,bucket);}bucket.count++;
    for(const [group,value] of Object.entries(stats.network.ports[e.id]?.[0]?.fields??{})){const field=coupledField(value.a,distance);(bucket.groups[group]??=[]).push(field);stats.emitterFields[e.id][group]=field;}}
  }else heat+=absorbed;
 }
 let capturedTotal=0;stats.targetPower=0;stats.protectiveAbsorption=0;
 for(const target of w.targets){const bucket=perTarget.get(target.id);
  if(!bucket){stats.targets[target.id]={useful:0,guard:0,captured:0,emitters:0};continue;}
  const reading=target.kind==='frontier'?projectFrontier(bucket.groups,bucket.count):projectTwoZone(bucket.groups);
  stats.targets[target.id]={useful:reading.useful,guard:reading.guard,captured:reading.captured,emitters:bucket.count};
  capturedTotal+=reading.captured;
  if(target.kind==='frontier')stats.targetPower=reading.useful;else stats.protectiveAbsorption+=reading.captured;
 }
 stats.radiated=radiated;stats.offTarget=Math.max(0,radiated-capturedTotal);stats.heat=heat;stats.leaked=stats.network.escaped+stats.network.linkLoss+stats.offTarget;w.stats=stats;w.statsRevision=w.revision;return stats;
}
export function setController(w:World,on:boolean):string{const d=frontierDomain(w);if(!d)return 'No frontier control domain';if(on&&!referenceReady(w,d))return 'Bind a powered reference before enabling control';d.enabled=on;invalidate(w,'Controller mode changed');event(w,on?'Automatic phase control enabled':'Automatic phase control disabled');return '';}
export function beginCommission(w:World):string{evaluate(w);if(!w.frontier)return 'Clear the frontier first';const domain=frontierDomain(w);if(!domain)return 'No frontier control domain';if(!domain.enabled)return 'Enable automatic phase control first';if(w.stats.targetPower<35)return 'Establish at least 35 target power before testing';const error=startQualification(w,domain.id,'20 s thermal drift test · minimum 32 target power');if(!error)event(w,'Commissioning started: 20 s drift profile');return error;}
export function cancelCommission(w:World){const q=frontierQualification(w);if(!q)return;q.status='idle';q.reason='Cancelled; not qualified';q.elapsed=0;q.minimum=-1;q.signature='';}
export function step(w:World,dt=DT){if(!Number.isFinite(dt)||dt<=0||dt>.25)throw new Error('Step must be between 0 and 0.25 seconds');w.time+=dt;if(w.statsRevision!==w.revision)evaluate(w);
 const tunerOwner=new Map<string,string>();for(const d of w.domains)for(const id of d.tuners)tunerOwner.set(id,d.id);
 const testingDomains=new Map<string,{kind:string;elapsed:number}>();for(const q of w.qualifications){if(q.status!=='testing')continue;const t=w.targets.find(x=>x.id===q.target);testingDomains.set(q.domain,{kind:t?.kind??'',elapsed:q.elapsed});}
 for(const e of w.entities){if(!e.powered)continue;
  if(e.kind==='extractor'){const d=w.deposits.find(d=>d.remaining>0&&overlap(e.x,e.y,footprint(e).w,footprint(e).h,d)&&(d.kind==='ore'||w.frontier));if(d){e.progress+=dt;while(e.progress>=.65&&d.remaining>0&&(d.kind==='crystal'||e.ore<20)){e.progress-=.65;d.remaining--;if(d.kind==='crystal')w.stock.crystal++;else e.ore++;}e.progress=Math.min(e.progress,.65);}}
  if(e.kind==='assembler'){if(e.ore>=2){e.progress+=dt;if(e.progress>=1.4){e.progress-=1.4;e.ore-=2;w.stock.assemblies++;w.produced++;}}else e.progress=0;}
 }
 for(const l of w.links.filter(l=>l.type==='material')){
  const a=entity(w,l.a.node)!,b=entity(w,l.b.node)!,length=routeMetrics(l.path).length;
  // Front packet moves first; a full or stopped receiver propagates a queue upstream.
  let limit=length;for(let i=0;i<l.packets.length;i++){l.packets[i]=Math.min(limit,l.packets[i]+dt*2);limit=l.packets[i]-.5;}
  if(l.packets.length&&l.packets[0]>=length&&b.powered&&b.ore<20){b.ore++;l.packets.shift();}
  if(a.powered&&a.ore>=1&&(!l.packets.length||l.packets.at(-1)!>=.5)){a.ore--;l.packets.push(0);}
 }
 automaticControl(w,evaluate);
 const processAbsorption=stepProcess(w,dt);
 stepManufacture(w,dt);
 for(const e of w.entities){if(e.health<=0)continue;
  if(e.kind==='fabrication-cell'){const absorbed=processAbsorption.get(e.id)??0;e.temperature+=dt*(.05*absorbed-.4*(e.temperature-25));e.temperature=Math.max(25,e.temperature);}
  else{const absorbed=Math.max(0,w.stats.network.absorbed[e.id]??0);const heating=e.kind==='emitter'&&e.powered?absorbed*.08:absorbed;const condition=tunerOwner.has(e.id)?testingDomains.get(tunerOwner.get(e.id)!):undefined;const testDrift=condition?.kind==='frontier'?4*Math.sin(condition.elapsed*.3):0;const drift=e.kind==='tuner'?3+2*Math.sin(w.time*.12)+testDrift:0;const cooling=e.kind==='dump'?(e.powered?.28:.04):.18;e.temperature+=dt*(heating*.32+drift-cooling*(e.temperature-25));e.temperature=Math.max(25,e.temperature);}
  if(e.temperature>85&&e.protection&&!e.tripped){e.tripped=true;invalidate(w,'Thermal protection tripped');event(w,`${DEFS[e.kind].name} tripped at 85°C. Disconnect input and repair.`);}
  if(e.temperature>105){e.health=Math.max(0,e.health-(e.temperature-105)*dt*.45);if(e.health===0){w.stock.scrap+=DEFS[e.kind].cost+e.ore;e.ore=0;invalidate(w,'Equipment destroyed');event(w,`${DEFS[e.kind].name} destroyed by heat`);}}
 }
 finalizeLostJobs(w);
 finalizeLostManufactureJobs(w);
 evaluate(w);
 if(!w.frontier){const target=frontierTarget(w);if(target){target.health=Math.max(0,target.health-Math.max(0,w.stats.targetPower-32)*dt*3);if(target.health===0){w.frontier=true;event(w,'Frontier cleared. Crystal access and commissioning unlocked.');}}}
 const integrity=w.entities.reduce((sum,e)=>sum+e.health,0);for(const message of stepEcology(w,dt))event(w,message);if(w.entities.reduce((sum,e)=>sum+e.health,0)<integrity){invalidate(w,'Wildlife damaged equipment');finalizeLostJobs(w);evaluate(w);}
 revalidate(w,'Dependencies changed');
 const test=frontierQualification(w);if(test?.status==='testing'){test.elapsed+=dt;test.minimum=test.minimum<0?w.stats.targetPower:Math.min(test.minimum,w.stats.targetPower);if(test.elapsed>=20){test.status='qualified';test.reason='Passed 20 s drift profile; rating valid for this topology';event(w,`Module qualified at ${test.minimum.toFixed(1)} target power. Blueprint ready.`);}}
}
export {captureBlueprint,blueprintCost,stampBlueprint} from './blueprints';
export type {StampOptions} from './blueprints';
