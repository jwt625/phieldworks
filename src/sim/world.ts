import {newEcology,stepEcology} from './ecology';
import {footprint,ports,inside,routeMetrics,type Rotation,type Point,type Transport} from './geometry';
import {findRoute,segmentClear,type RouteOptions} from './routing';
export {footprint,ports,routeMetrics} from './geometry';
import {c,type Complex} from './complex';
import {source,hybrid,through,matched,solveNetwork,FIELD_PORT_LIMIT,type NetworkResult,type Component,type Endpoint,type WaveLink} from './network';
import {RADIATION_EFFICIENCY,coupledField,projectFrontier,projectTwoZone} from './targets';
export {FIELD_PORT_LIMIT} from './network';
import {DEFS,type Kind} from './definitions';
export {DEFS,type Kind} from './definitions';
import {WIDTH,HEIGHT,DT,MACHINE_LIMIT,LINK_LIMIT,WIRE_CAPACITY,type World,type Entity,type Connection,type Deposit,type Blueprint,type Stats,type Target,type ReferenceBinding,type ControlDomain,type Qualification} from './world-types';
export {WIDTH,HEIGHT,DT,MACHINE_LIMIT,LINK_LIMIT,WIRE_CAPACITY} from './world-types';
export type {World,Entity,Connection,Deposit,Blueprint,Stats,Target,ReferenceBinding,ControlDomain,Qualification,ProcessInventory,ProcessLot,ControlObjective,QualificationStatus,TargetKind,LotKind} from './world-types';
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
export function invalidate(w:World,reason:string){w.revision++;let changed=false;for(const q of w.qualifications)if(q.status==='testing'||q.status==='qualified'){q.status='failed';q.reason=reason;q.code='dependency-changed';changed=true;}if(changed)event(w,`Qualification invalidated: ${reason}`);}
function overlap(x:number,y:number,aw:number,ah:number,b:{x:number;y:number;w:number;h:number}){return x<b.x+b.w&&x+aw>b.x&&y<b.y+b.h&&y+ah>b.y;}
export function placementError(w:World,kind:Kind,x:number,y:number,extra:Entity[]=[],rotation:Rotation=0):string {
 const d={...DEFS[kind],...footprint({kind,rotation})};if(![0,1,2,3].includes(rotation))return 'Invalid rotation';if(w.entities.length+extra.length>=MACHINE_LIMIT)return `Prototype limit: ${MACHINE_LIMIT} machines`;if([...w.entities,...extra].reduce((n,e)=>n+DEFS[e.kind].ports.length,0)+d.ports.length>FIELD_PORT_LIMIT)return `Prototype limit: ${FIELD_PORT_LIMIT} field ports`;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x+d.w>WIDTH||y+d.h>HEIGHT)return 'Outside the build area';
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
 w.stock.assemblies-=DEFS[kind].cost;const created=newEntity(kind,x,y,`e${w.nextId++}`,rotation);w.entities.push(created);autoAssign(w,created);invalidate(w,'Installation changed');event(w,`${DEFS[kind].name} built`);return '';
}
export function remove(w:World,id:string):void {const e=entity(w,id);if(!e)return;w.stock.assemblies+=e.health>0?DEFS[e.kind].cost:0;w.stock.scrap+=e.ore;e.ore=0;w.entities=w.entities.filter(x=>x.id!==id);for(const t of w.targets)t.emitters=t.emitters.filter(x=>x!==id);for(const d of w.domains)d.tuners=d.tuners.filter(x=>x!==id);for(const l of w.links.filter(l=>l.a.node===id||l.b.node===id))disconnect(w,l.id);invalidate(w,'Equipment removed');event(w,e.health>0?'Equipment recovered; buffered ore becomes scrap':'Wreck cleared');}
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
export function disconnect(w:World,id:string){const l=w.links.find(l=>l.id===id);if(!l)return;w.stock.scrap+=l.packets.length;w.links=w.links.filter(l=>l.id!==id);invalidate(w,'Routing changed');}
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
export function setPhase(w:World,id:string,degrees:number){const e=entity(w,id);if(!e||e.kind!=='tuner'||!Number.isFinite(degrees))return;e.phase=Math.max(-180,Math.min(180,degrees));invalidate(w,'Manual phase adjustment');}
export function repair(w:World,id:string):string{const e=entity(w,id);if(!e)return 'Select equipment';if(w.stock.assemblies<3)return 'Repair needs 3 assemblies';w.stock.assemblies-=3;e.health=100;e.temperature=25;e.tripped=false;invalidate(w,'Equipment repaired');event(w,`${DEFS[e.kind].name} repaired and reset`);return '';}
export function createWorld():World {
  const w:World={version:4,ecology:newEcology(),time:0,nextId:1,entities:[],links:[],deposits:[{id:'starter',x:3,y:5,w:4,h:4,remaining:1400,kind:'ore'},{id:'reserve',x:3,y:17,w:4,h:3,remaining:900,kind:'ore'},{id:'remote-ore',x:38,y:5,w:4,h:4,remaining:1200,kind:'ore'},{id:'frontier',x:29,y:7,w:4,h:4,remaining:500,kind:'crystal'}],stock:{assemblies:28,crystal:0,scrap:0},produced:0,targets:[],references:[],domains:[],qualifications:[],process:newProcess(),frontier:false,revision:0,statsRevision:-1,blueprint:null,events:[],stats:emptyStats()};
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
/** Geometry uses effective phase rad/tile, not real optical wavelength. */
export function waveLinks(w:World):WaveLink[]{return w.links.filter(l=>l.type==='field').map(l=>{const m=routeMetrics(l.path,l.radius);return {a:l.a,b:l.b,amplitude:Math.exp(-.5*(m.propagationExponent+m.bendExponent)),phase:.31*m.length};});}
export function evaluate(w:World):Stats {
 const grid=powerGrid(w);const comps:Component[]=w.entities.filter(e=>DEFS[e.kind].ports.length).map(e=>{
  if(e.health<=0)return matched(e.id,DEFS[e.kind].ports.length);
  if(e.tripped&&e.kind!=='reference')return {id:e.id,s:DEFS[e.kind].ports.map((_,i)=>DEFS[e.kind].ports.map((_,j)=>c(i===j?1:0)))};
  if(e.tripped)return matched(e.id,DEFS[e.kind].ports.length);
  if(e.kind==='reference')return source(e.id,e.powered?100:0,e.id);
  if(e.kind==='junction')return hybrid(e.id);
  if(e.kind==='tuner')return through(e.id,e.phase*Math.PI/180+(e.temperature-25)*.045);
  if(e.kind==='emitter')return {id:e.id,s:[[c(.08)]]};return matched(e.id);
 });
 const stats=emptyStats();Object.assign(stats,grid);
 try{stats.network=solveNetwork(comps,waveLinks(w));}catch(err){stats.error=err instanceof Error?err.message:'Wave solve failed';w.stats=stats;w.statsRevision=w.revision;return stats;}
 for(const l of w.links.filter(l=>l.type==='field')){const m=routeMetrics(l.path,l.radius),total=m.propagationExponent+m.bendExponent;const outgoing=(stats.network.ports[l.a.node]?.[l.a.port]?.outgoing??0)+(stats.network.ports[l.b.node]?.[l.b.port]?.outgoing??0);const loss=outgoing*(1-Math.exp(-total));stats.bendRadiation+=total?loss*m.bendExponent/total:0;stats.propagationLoss+=total?loss*m.propagationExponent/total:0;}
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
function automaticControl(w:World){
 const domain=frontierDomain(w);
 if(!domain?.enabled||!w.entities.some(e=>e.kind==='reference'&&e.powered))return;
 const tuners=w.entities.filter(e=>e.kind==='tuner'&&e.health>0&&!e.tripped);if(!tuners.length)return;
 // Bound work: one tuner per step on a deterministic cursor, and reuse the step's evaluation as the
 // baseline instead of re-solving it. Two trial phases are compared; only a winning trial re-settles
 // stats, so unchanged candidates cost nothing beyond the two trials.
 const cursor=Math.floor(w.time/DT)%tuners.length,e=tuners[cursor],original=e.phase,baseStats=w.stats,base=baseStats.targetPower;
 e.phase=wrap(original+2);const plus=evaluate(w).targetPower;
 e.phase=wrap(original-2);const minus=evaluate(w).targetPower;
 const improved=Math.max(plus,minus)>base+1e-6;
 if(!improved){e.phase=original;w.stats=baseStats;}
 else if(plus>=minus){e.phase=wrap(original+2);evaluate(w);}
 else e.phase=wrap(original-2);
 w.stats.controlCursor=cursor;
}
const wrap=(x:number)=>((x+180)%360+360)%360-180;
export function setController(w:World,on:boolean){const d=frontierDomain(w);if(d)d.enabled=on;invalidate(w,'Controller mode changed');event(w,on?'Automatic phase control enabled':'Automatic phase control disabled');}
export function beginCommission(w:World):string{evaluate(w);if(!w.frontier)return 'Clear the frontier first';const q=frontierQualification(w);if(!q)return 'No frontier qualification record';if(!frontierDomain(w)?.enabled)return 'Enable automatic phase control first';if(w.stats.targetPower<35)return 'Establish at least 35 target power before testing';q.status='testing';q.elapsed=0;q.minimum=-1;q.counters=0;q.signature='';q.reason='20 s thermal drift test · minimum 32 target power';q.code='';event(w,'Commissioning started: 20 s drift profile');return '';}
export function cancelCommission(w:World){const q=frontierQualification(w);if(!q)return;q.status='idle';q.reason='Cancelled; not qualified';q.elapsed=0;q.minimum=-1;}
export function step(w:World,dt=DT){if(!Number.isFinite(dt)||dt<=0||dt>.25)throw new Error('Step must be between 0 and 0.25 seconds');w.time+=dt;if(w.statsRevision!==w.revision)evaluate(w);
 const qualification=frontierQualification(w),testing=qualification?.status==='testing'?qualification:undefined;
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
 automaticControl(w);
 for(const e of w.entities){if(e.health<=0)continue;const absorbed=Math.max(0,w.stats.network.absorbed[e.id]??0);const heating=e.kind==='emitter'&&e.powered?absorbed*.08:absorbed;const drift=e.kind==='tuner'?3+2*Math.sin(w.time*.12)+(testing?4*Math.sin(testing.elapsed*.3):0):0;const cooling=e.kind==='dump'?(e.powered?.28:.04):.18;e.temperature+=dt*(heating*.32+drift-cooling*(e.temperature-25));e.temperature=Math.max(25,e.temperature);
  if(e.temperature>85&&e.protection&&!e.tripped){e.tripped=true;invalidate(w,'Thermal protection tripped');event(w,`${DEFS[e.kind].name} tripped at 85°C. Disconnect input and repair.`);}
  if(e.temperature>105){e.health=Math.max(0,e.health-(e.temperature-105)*dt*.45);if(e.health===0){w.stock.scrap+=DEFS[e.kind].cost+e.ore;e.ore=0;invalidate(w,'Equipment destroyed');event(w,`${DEFS[e.kind].name} destroyed by heat`);}}
 }
 evaluate(w);
 if(!w.frontier){const target=frontierTarget(w);if(target){target.health=Math.max(0,target.health-Math.max(0,w.stats.targetPower-32)*dt*3);if(target.health===0){w.frontier=true;event(w,'Frontier cleared. Crystal access and commissioning unlocked.');}}}
 const integrity=w.entities.reduce((sum,e)=>sum+e.health,0);for(const message of stepEcology(w,dt))event(w,message);if(w.entities.reduce((sum,e)=>sum+e.health,0)<integrity){invalidate(w,'Wildlife damaged equipment');evaluate(w);}
 const test=frontierQualification(w);if(test&&test.status==='testing'){test.elapsed+=dt;test.minimum=test.minimum<0?w.stats.targetPower:Math.min(test.minimum,w.stats.targetPower);if(w.stats.error||w.stats.targetPower<32||w.entities.some(e=>e.health<=0||e.tripped)){test.status='failed';test.reason='Output fell below 32 or equipment protection failed';event(w,'Commissioning failed. Inspect the network and retry.');}else if(test.elapsed>=20){test.status='qualified';test.reason='Passed 20 s drift profile; rating valid for this topology';event(w,`Module qualified at ${test.minimum.toFixed(1)} target power. Blueprint ready.`);}}
 if(test&&test.status==='qualified'&&(w.stats.targetPower<32||w.stats.error)){test.status='failed';test.reason='Operating conditions left the qualified range';event(w,'Qualification lost: output below operating limit');}
}
export function captureBlueprint(w:World):string {
 const qualification=frontierQualification(w);if(qualification?.status!=='qualified')return 'Commission the installation before recording a blueprint';
 const points=w.links.flatMap(l=>l.path),minX=Math.floor(Math.min(...w.entities.map(e=>e.x),...points.map(p=>p.x))),minY=Math.floor(Math.min(...w.entities.map(e=>e.y),...points.map(p=>p.y)));
 w.blueprint={entities:w.entities.map(e=>({...e,x:e.x-minX,y:e.y-minY,ore:0,progress:0})),links:w.links.map(l=>({...structuredClone(l),path:l.path.map(p=>({x:p.x-minX,y:p.y-minY})),packets:[]})),width:Math.ceil(Math.max(...w.entities.map(e=>e.x+footprint(e).w),...points.map(p=>p.x)))-minX,height:Math.ceil(Math.max(...w.entities.map(e=>e.y+footprint(e).h),...points.map(p=>p.y)))-minY};event(w,'Qualified outpost blueprint recorded');return '';
}
export function blueprintCost(w:World){return w.blueprint?.entities.reduce((s,e)=>s+DEFS[e.kind].cost,0)??0;}
export function stampBlueprint(w:World,x:number,y:number):string {
 const bp=w.blueprint;if(!bp)return 'Record a blueprint first';const cost=blueprintCost(w);if(w.stock.assemblies<cost)return `Blueprint requires ${cost} assemblies`;
 const staged:Entity[]=[];for(const e of bp.entities){const err=placementError(w,e.kind,x+e.x,y+e.y,staged,e.rotation);if(err)return err;staged.push({...newEntity(e.kind,x+e.x,y+e.y,`e${w.nextId+staged.length}`,e.rotation),phase:e.phase,protection:e.protection});}
 const ids=new Map(bp.entities.map((e,i)=>[e.id,staged[i].id]));
 const draft={...w,entities:[...w.entities,...staged],links:[...w.links],events:[],qualifications:w.qualifications.map(q=>({...q})),nextId:w.nextId+staged.length};
 for(const l of bp.links){const error=connect(draft,l.type,{node:ids.get(l.a.node)!,port:l.a.port},{node:ids.get(l.b.node)!,port:l.b.port},{path:l.path.map(p=>({x:p.x+x,y:p.y+y})),radius:l.radius,diagonal:l.diagonal});if(error)return error;}
 w.nextId=draft.nextId;w.entities=draft.entities;w.links=draft.links;w.stock.assemblies-=cost;for(const e of staged)autoAssign(w,e);invalidate(w,'Blueprint placed — local commissioning required');event(w,'Blueprint placed; recheck power, deposits and phase at this site');return '';
}
