import {DEFS} from './definitions';
import {footprint,ports,routeMetrics} from './geometry';
import {findRoute} from './routing';
import {newEcology} from './ecology';
import {FIELD_PORT_LIMIT} from './network';
import type {NetworkResult} from './network';
import {HEIGHT,LINK_LIMIT,LOT_LIMIT,MACHINE_LIMIT,WIDTH,type Blueprint,type BlueprintSlot,type Connection,type ControlDomain,type Entity,type ProcessInventory,type ProcessJob,type Qualification,type QualificationStatus,type ReferenceBinding,type Stats,type Target,type World} from './world-types';

export const emptyNet = ():NetworkResult=>({ports:{},absorbed:{},sourcePower:0,linkLoss:0,escaped:0,residual:0});
export const emptyStats = ():Stats=>({network:emptyNet(),targetPower:0,targets:{},protectiveAbsorption:0,offTarget:0,radiated:0,heat:0,leaked:0,supply:0,demand:0,overload:0,wireOverload:0,controlCursor:0,bendRadiation:0,propagationLoss:0,error:'',emitterFields:{}});
export const newProcess = ():ProcessInventory=>({accepted:0,lots:[]});

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const nonnegative=(v:unknown):v is number=>finite(v)&&v>=0;
const overlap=(x:number,y:number,aw:number,ah:number,b:{x:number;y:number;w:number;h:number})=>x<b.x+b.w&&x+aw>b.x&&y<b.y+b.h&&y+ah>b.y;

/** Validate and normalize an entity list. Used for both the live world and stored blueprint geometry. */
function validateEntities(raw:unknown,fail:()=>never):Entity[]{
 if(!Array.isArray(raw)||raw.length>MACHINE_LIMIT)fail();
 const ids=new Set<string>();
 for(const e of raw as Entity[]){
  if(!e||typeof e.id!=='string'||!/^e\d+$/.test(e.id)||ids.has(e.id)||!Object.hasOwn(DEFS,e.kind)||![0,1,2,3].includes(e.rotation)||!Number.isInteger(e.x)||!Number.isInteger(e.y)||!['phase','temperature','health','ore','progress'].every(k=>finite((e as unknown as Record<string,unknown>)[k]))||e.health<0||e.health>100||e.ore<0||e.progress<0||Math.abs(e.phase)>180||e.temperature<0||typeof e.protection!=='boolean'||typeof e.tripped!=='boolean'||typeof e.powered!=='boolean')fail();
  ids.add(e.id);const d=footprint(e);if(e.x<0||e.y<0||e.x+d.w>WIDTH||e.y+d.h>HEIGHT)fail();
 }
 if((raw as Entity[]).reduce((n,e)=>n+DEFS[e.kind].ports.length,0)>FIELD_PORT_LIMIT)fail();
 for(let i=0;i<(raw as Entity[]).length;i++)for(let j=0;j<i;j++){const a=(raw as Entity[])[i],b=(raw as Entity[])[j],ad=footprint(a),bd=footprint(b);if(overlap(a.x,a.y,ad.w,ad.h,{...b,w:bd.w,h:bd.h}))fail();}
 return raw as Entity[];
}

/** Rebuild saved routes through the shared geometry/route validation so occupied ports and bad paths stay rejected. */
function buildLinks(entities:Entity[],raw:unknown,legacy:boolean,fail:()=>never):Connection[]{
 if(!Array.isArray(raw)||raw.length>LINK_LIMIT)fail();
 const links:Connection[]=[];const linkIds=new Set<string>();const byId=(id:string)=>entities.find(e=>e.id===id);
 for(const l of raw as Connection[]){
  if(!l||typeof l.id!=='string'||!/^l\d+$/.test(l.id)||linkIds.has(l.id)||!['field','material','power'].includes(l.type)||!l.a||!l.b)fail();linkIds.add(l.id);
  if(!legacy&&(!Array.isArray(l.path)||typeof l.diagonal!=='boolean'||!finite(l.radius)||!Array.isArray(l.packets)))fail();
  const ea=byId(l.a.node),eb=byId(l.b.node);if(!ea||!eb||l.a.node===l.b.node||!Number.isInteger(l.a.port)||!Number.isInteger(l.b.port)||l.a.port<0||l.b.port<0)fail();
  const pa=ports(ea,l.type)[l.a.port],pb=ports(eb,l.type)[l.b.port];if(!pa||!pb)fail();
  if(l.type!=='field'&&(pa.role!=='output'||pb.role!=='input'))fail();
  if(links.some(x=>x.type===l.type&&[x.a,x.b].some(p=>(l.type!=='power'&&p.node===l.a.node&&p.port===l.a.port)||(p.node===l.b.node&&p.port===l.b.port))))fail();
  const radius=legacy?.5:l.radius;if(!finite(radius)||radius<0||radius>4)fail();
  const path=findRoute(pa,pb,entities,WIDTH,HEIGHT,legacy?{}:{path:l.path,diagonal:l.diagonal,radius:l.radius});if(!path)fail();
  const conn:Connection={id:l.id,type:l.type,a:{...l.a},b:{...l.b},path,diagonal:legacy?false:l.diagonal,radius,packets:[]};
  if(!legacy){const length=routeMetrics(path).length;if(l.packets.length>length*2+1||l.packets.some((v,i)=>!nonnegative(v)||v>length||(i>0&&l.packets[i-1]-v<.5-1e-8))||(l.type!=='material'&&l.packets.length))fail();conn.packets=[...l.packets];}
  links.push(conn);
 }
 return links;
}

/** Legacy saves had no explicit power wires; re-establish them from generator proximity without the world façade. */
function legacyPowerWires(entities:Entity[],links:Connection[],fail:()=>never){
 let counter=links.reduce((n,l)=>{const m=/^l(\d+)$/.exec(l.id);return m?Math.max(n,Number(m[1])):n;},0)+1;
 for(const e of entities.filter(e=>DEFS[e.kind].watts>0)){
  const g=entities.find(g=>g.kind==='generator'&&Math.hypot((e.x+footprint(e).w/2)-(g.x+footprint(g).w/2),(e.y+footprint(e).h/2)-(g.y+footprint(g).h/2))<=16);
  if(!g)continue;
  if(links.some(l=>l.type==='power'&&l.b.node===e.id&&l.b.port===0))fail();
  const pa=ports(g,'power')[0],pb=ports(e,'power')[0];if(!pa||!pb)fail();
  const path=findRoute(pa,pb,entities,WIDTH,HEIGHT,{});if(!path)fail();
  links.push({id:`l${counter++}`,type:'power',a:{node:g.id,port:0},b:{node:e.id,port:0},path,diagonal:false,radius:.5,packets:[]});
 }
}
function pushEvent(w:World,text:string){w.events.unshift({time:w.time,text});w.events=w.events.slice(0,30);}

function normalizeBlueprint(raw:unknown,legacy:boolean,fail:()=>never):Blueprint{
 const bp=raw as {entities?:unknown;links?:unknown;version?:unknown;targets?:unknown;references?:unknown;domains?:unknown;slots?:unknown};
 if(!bp||!Array.isArray(bp.entities)||!bp.entities.length||!Array.isArray(bp.links))fail();
 const source=legacy?(bp.entities as Entity[]).map(e=>({...e,x:e.x+1,y:e.y+1,rotation:0 as const})):bp.entities;
 const entities=validateEntities(source,fail);
 const links=buildLinks(entities,bp.links,legacy,fail);
 if(legacy)legacyPowerWires(entities,links,fail);
 const points=links.flatMap(l=>l.path);
 const width=Math.ceil(Math.max(...entities.map(e=>e.x+footprint(e).w),...points.map(p=>p.x)));
 const height=Math.ceil(Math.max(...entities.map(e=>e.y+footprint(e).h),...points.map(p=>p.y)));
 const ids=new Set(entities.map(e=>e.id));
 let targets:Target[]=[],references:ReferenceBinding[]=[],domains:ControlDomain[]=[],slots:BlueprintSlot[]=[];
 if(bp.version===2){
  if(bp.targets!==undefined&&!Array.isArray(bp.targets))fail();
  const targetIds=new Set<string>();
  for(const t of (bp.targets??[]) as Target[]){if(!t||typeof t.id!=='string'||!/^t\d+$/.test(t.id)||targetIds.has(t.id)||!['frontier','process'].includes(t.kind)||!finite(t.x)||!finite(t.y)||!nonnegative(t.health)||!Array.isArray(t.emitters)||(t.owner!==null&&(typeof t.owner!=='string'||!ids.has(t.owner)))||!(t.contract===null||typeof t.contract==='string')||t.emitters.some(id=>!ids.has(id)))fail();targetIds.add(t.id);targets.push({...t,emitters:[...t.emitters]});}
  if(bp.references!==undefined&&!Array.isArray(bp.references))fail();
  const referenceIds=new Set<string>();
  for(const r of (bp.references??[]) as ReferenceBinding[]){if(!r||typeof r.id!=='string'||!/^r\d+$/.test(r.id)||referenceIds.has(r.id)||!ids.has(r.source)||typeof r.group!=='string')fail();referenceIds.add(r.id);references.push({...r});}
  if(bp.domains!==undefined&&!Array.isArray(bp.domains))fail();
  for(const d of (bp.domains??[]) as ControlDomain[]){if(!d||typeof d.id!=='string'||!/^d\d+$/.test(d.id)||typeof d.target!=='string'||!targetIds.has(d.target)||!(d.reference===null||typeof d.reference==='string')||!(d.sensor===null||(typeof d.sensor==='string'&&ids.has(d.sensor)))||!Array.isArray(d.tuners)||d.tuners.some(id=>!ids.has(id))||typeof d.enabled!=='boolean'||!['target-power','useful-minus-guard'].includes(d.objective)||!Number.isInteger(d.cursor)||d.cursor<0)fail();domains.push({...d,tuners:[...d.tuners]});}
  if(bp.slots!==undefined&&!Array.isArray(bp.slots))fail();
  for(const s of (bp.slots??[]) as BlueprintSlot[]){if(!s||typeof s.id!=='string'||!['power','reference','controller'].includes(s.kind)||typeof s.label!=='string'||typeof s.required!=='boolean'||!(s.binding===null||typeof s.binding==='string'))fail();slots.push({...s});}
 }
 return {version:2,entities,links,targets,references,domains,slots,width,height};
}

function loadRecords(s:Record<string,unknown>,w:World,fail:()=>never){
 const entityIds=new Set(w.entities.map(e=>e.id));
 const emitterIds=new Set(w.entities.filter(e=>e.kind==='emitter').map(e=>e.id));
 const tunerIds=new Set(w.entities.filter(e=>e.kind==='tuner').map(e=>e.id));
 if(!Array.isArray(s.targets)||s.targets.length>MACHINE_LIMIT+1)fail();
 const targetIds=new Set<string>(),assignedEmitters=new Set<string>(),targets:Target[]=[];
 for(const t of s.targets as Target[]){
  if(!t||typeof t.id!=='string'||!/^t\d+$/.test(t.id)||targetIds.has(t.id)||!['frontier','process'].includes(t.kind)||!finite(t.x)||!finite(t.y)||!nonnegative(t.health)||!Array.isArray(t.emitters)||(t.owner!==null&&(typeof t.owner!=='string'||!entityIds.has(t.owner)))||!(t.contract===null||typeof t.contract==='string'))fail();
  targetIds.add(t.id);
  for(const id of t.emitters){if(typeof id!=='string'||!emitterIds.has(id)||assignedEmitters.has(id))fail();assignedEmitters.add(id);}
  targets.push({id:t.id,kind:t.kind,owner:t.owner??null,x:t.x,y:t.y,health:t.health,emitters:[...t.emitters],contract:t.contract??null});
 }
 if(!Array.isArray(s.references)||s.references.length>MACHINE_LIMIT)fail();
 const referenceIds=new Set<string>(),references:ReferenceBinding[]=[];
 for(const r of s.references as ReferenceBinding[]){
  if(!r||typeof r.id!=='string'||!/^r\d+$/.test(r.id)||referenceIds.has(r.id)||typeof r.source!=='string'||!entityIds.has(r.source)||typeof r.group!=='string'||!r.group.length)fail();
  referenceIds.add(r.id);references.push({id:r.id,source:r.source,group:r.group});
 }
 if(!Array.isArray(s.domains)||s.domains.length>MACHINE_LIMIT)fail();
 const domainIds=new Set<string>(),assignedTuners=new Set<string>(),domainTargets=new Set<string>(),domains:ControlDomain[]=[];
 for(const d of s.domains as ControlDomain[]){
  if(!d||typeof d.id!=='string'||!/^d\d+$/.test(d.id)||domainIds.has(d.id)||typeof d.name!=='string'||d.name.length>100||typeof d.target!=='string'||!targetIds.has(d.target)||domainTargets.has(d.target)||!(d.reference===null||(typeof d.reference==='string'&&referenceIds.has(d.reference)))||!(d.sensor===null||(typeof d.sensor==='string'&&entityIds.has(d.sensor)))||!Array.isArray(d.tuners)||typeof d.enabled!=='boolean'||!['target-power','useful-minus-guard'].includes(d.objective)||!Number.isInteger(d.cursor)||d.cursor<0)fail();
  domainIds.add(d.id);domainTargets.add(d.target);
  for(const id of d.tuners){if(typeof id!=='string'||!tunerIds.has(id)||assignedTuners.has(id))fail();assignedTuners.add(id);}
  domains.push({id:d.id,name:d.name,target:d.target,reference:d.reference??null,sensor:d.sensor??null,tuners:[...d.tuners],enabled:d.enabled,objective:d.objective,cursor:d.cursor});
 }
 if(!Array.isArray(s.qualifications)||s.qualifications.length>MACHINE_LIMIT)fail();
 const qualificationIds=new Set<string>(),qualifications:Qualification[]=[];
 for(const q of s.qualifications as Qualification[]){
  if(!q||typeof q.id!=='string'||!/^q\d+$/.test(q.id)||qualificationIds.has(q.id)||typeof q.domain!=='string'||!domainIds.has(q.domain)||typeof q.target!=='string'||!targetIds.has(q.target)||!['idle','testing','qualified','failed','stale'].includes(q.status)||typeof q.signature!=='string'||!nonnegative(q.elapsed)||!finite(q.minimum)||q.minimum< -1||!Number.isInteger(q.counters)||q.counters<0||!Array.isArray(q.dependencies)||q.dependencies.some(x=>typeof x!=='string')||typeof q.reason!=='string'||typeof q.code!=='string')fail();
  qualificationIds.add(q.id);qualifications.push({...q,dependencies:[...q.dependencies]});
 }
 const proc=s.process as ProcessInventory|undefined;
 if(!proc||!Number.isInteger(proc.accepted)||proc.accepted<0||!Array.isArray(proc.lots)||proc.lots.length>LOT_LIMIT)fail();
 const lotIds=new Set<string>();
 for(const lot of proc.lots){if(!lot||typeof lot.id!=='string'||!/^pl\d+$/.test(lot.id)||lotIds.has(lot.id)||!['reject','scrap'].includes(lot.kind)||typeof lot.recipe!=='string'||!Number.isInteger(lot.version)||lot.version<0||typeof lot.parent!=='string'||!nonnegative(lot.assemblies)||!nonnegative(lot.crystal)||!['recoverable','spent'].includes(lot.disposition)||!(lot.owner===undefined||lot.owner===null||(typeof lot.owner==='string'&&entityIds.has(lot.owner)))||!(lot.useful===undefined||nonnegative(lot.useful))||!(lot.guard===undefined||nonnegative(lot.guard)))fail();lotIds.add(lot.id);}
 const rawJobs=Array.isArray(s.jobs)?s.jobs as ProcessJob[]:[];
 if(rawJobs.length>MACHINE_LIMIT*2)fail();
 const jobIds=new Set<string>();
 for(const j of rawJobs){if(!j||typeof j.id!=='string'||!/^j\d+$/.test(j.id)||jobIds.has(j.id)||!(j.cell===null||(typeof j.cell==='string'&&entityIds.has(j.cell)))||typeof j.target!=='string'||!targetIds.has(j.target)||typeof j.recipe!=='string'||!Number.isInteger(j.version)||j.version<0||!['reserved','exposing','suspended','complete'].includes(j.stage)||!(j.outcome===null||['accepted','recoverable-reject','scrap'].includes(j.outcome))||!j.inputs||!nonnegative(j.inputs.assemblies)||!nonnegative(j.inputs.crystal)||typeof j.consumed!=='boolean'||!nonnegative(j.elapsed)||!nonnegative(j.useful)||!nonnegative(j.guard)||!Number.isInteger(j.interruptions)||j.interruptions<0||typeof j.rework!=='boolean'||!(j.lot===null||typeof j.lot==='string')||!(j.started===undefined||nonnegative(j.started))||!Number.isInteger(j.event)||j.event<0||(j.stage==='complete')!==(j.event>0))fail();jobIds.add(j.id);}
 w.targets=targets;w.references=references;w.domains=domains;w.qualifications=qualifications;
 w.process={accepted:proc.accepted,lots:proc.lots.map(l=>({...l,owner:l.owner??null,useful:l.useful??0,guard:l.guard??0}))};
 w.jobs=rawJobs.map(j=>({...j,inputs:{...j.inputs},started:j.started??0}));
 w.eventSeq=Number.isInteger(s.eventSeq)?s.eventSeq as number:w.jobs.reduce((n,j)=>Math.max(n,j.event),0);
}

/** Migrate v1/v2/v3 geometry/ecology state into explicit frontier target/domain/qualification records. */
function migrateRecords(s:{target:{x:number;y:number;health:number};controller:boolean;commission?:{state?:string}},w:World){
 const alloc=(p:string)=>`${p}${w.nextId++}`;
 const targetId=alloc('t');
 const emitters=w.entities.filter(e=>e.kind==='emitter').map(e=>e.id);
 w.targets=[{id:targetId,kind:'frontier',owner:null,x:s.target.x,y:s.target.y,health:s.target.health,emitters,contract:null}];
 w.references=w.entities.filter(e=>e.kind==='reference').map(e=>({id:alloc('r'),source:e.id,group:e.id}));
 const first=w.references[0]??null;
 const domainId=alloc('d');
 w.domains=[{id:domainId,name:'Frontier',target:targetId,reference:first?.id??null,sensor:null,tuners:w.entities.filter(e=>e.kind==='tuner').map(e=>e.id),enabled:s.controller===true&&first!==null,objective:'target-power',cursor:0}];
 const status:QualificationStatus=s.commission?.state==='qualified'?'stale':'idle';
 w.qualifications=[{id:alloc('q'),domain:domainId,target:targetId,status,signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[],reason:status==='stale'?'Loaded legacy certificate — re-verify':'Loaded installation — recommission to verify rating',code:''}];
 w.process=newProcess();w.jobs=[];w.eventSeq=0;
}

/** A loaded certificate is not fresh evidence: reset partial tests and stale existing qualifications. */
function freshenOnLoad(w:World){
 for(const q of w.qualifications){
  if(q.status==='qualified'){q.status='stale';q.reason='Loaded installation — re-verify certificate';}
  else if(q.status==='testing'){q.status='idle';q.elapsed=0;q.minimum=-1;q.reason='Loaded installation — test reset';}
 }
}

export function serialize(w:World){const {stats,statsRevision,...save}=w;return JSON.stringify(save);}

/** Reject malformed saves rather than allowing NaNs, missing endpoints or unbounded solves. Returns an unevaluated world. */
export function deserializeCore(raw:string):World{
 const s=JSON.parse(raw);const fail=():never=>{throw new Error('Invalid or unsupported save');};
 const legacy=s?.version===1;if(legacy&&Array.isArray(s.entities)){s.version=2;for(const e of s.entities)if(e)e.rotation=0;}
 if(s?.version===2){s.version=3;s.ecology=newEcology();}
 const isV4=s?.version===4;
 if(!isV4&&s?.version!==3)fail();
 if(!Array.isArray(s.entities)||s.entities.length>MACHINE_LIMIT||!Array.isArray(s.links)||s.links.length>LINK_LIMIT||!Array.isArray(s.deposits)||s.deposits.length>20||!nonnegative(s.time)||!Number.isSafeInteger(s.nextId)||s.nextId<1||!s.stock||!['assemblies','crystal','scrap'].every(k=>nonnegative(s.stock[k]))||!nonnegative(s.produced)||typeof s.frontier!=='boolean'||!nonnegative(s.revision))fail();
 if(!isV4&&(!s.target||!nonnegative(s.target.health)||!finite(s.target.x)||!finite(s.target.y)||typeof s.controller!=='boolean'))fail();
 const eco=s.ecology;
 if(!eco||typeof eco.defenseReady!=='boolean'||!nonnegative(eco.grace)||eco.grace>30||!nonnegative(eco.threat)||eco.threat>60||!Array.isArray(eco.creatures)||eco.creatures.length>20)fail();
 const creatureIds=new Set<string>();for(const c of eco.creatures){if(!c||typeof c.id!=='string'||!/^c\d+$/.test(c.id)||creatureIds.has(c.id)||!['patrol','investigate','attack','flee'].includes(c.state)||![0,1,2,3].includes(c.heading)||!['x','y','health','exposure'].every(k=>nonnegative(c[k]))||c.x>WIDTH||c.y>HEIGHT||c.health>30||c.exposure>60||!c.target||!finite(c.target.x)||!finite(c.target.y))fail();creatureIds.add(c.id);}eco.shots=[];
 const entities=validateEntities(s.entities,fail);
 const clean:World={version:4,ecology:eco,time:s.time,nextId:s.nextId,entities,links:[],deposits:[],stock:s.stock,produced:s.produced,targets:[],references:[],domains:[],qualifications:[],process:newProcess(),jobs:[],eventSeq:0,frontier:s.frontier,revision:s.revision,statsRevision:-1,blueprint:null,events:[],stats:emptyStats()};
 for(const dep of s.deposits)if(!dep||!['ore','crystal'].includes(dep.kind)||!['x','y','w','h','remaining'].every(k=>nonnegative(dep[k]))||dep.w<1||dep.h<1||dep.x+dep.w>WIDTH||dep.y+dep.h>HEIGHT||!Number.isInteger(dep.remaining))fail();
 clean.deposits=s.deposits;
 clean.links=buildLinks(entities,s.links,legacy,fail);
 if(legacy)legacyPowerWires(clean.entities,clean.links,fail);
 clean.revision=s.revision;
 if(isV4)loadRecords(s,clean,fail);else migrateRecords(s,clean);
 freshenOnLoad(clean);
 if(s.blueprint!=null)clean.blueprint=normalizeBlueprint(s.blueprint,legacy,fail);
 const seen=new Set<string>();
 for(const arr of [clean.entities,clean.links,clean.targets,clean.references,clean.domains,clean.qualifications,clean.process.lots])for(const r of arr){const m=/^[a-z]+(\d+)$/.exec(r.id);if(m)seen.add(m[1]);}
 clean.nextId=Math.max(clean.nextId,...[...seen].map(Number).filter(Number.isSafeInteger).map(v=>v+1));
 if(Array.isArray(s.events))clean.events=s.events.filter((e:{time:unknown;text:unknown})=>e&&nonnegative(e.time)&&typeof e.text==='string'&&e.text.length<=1000).slice(0,30);
 pushEvent(clean,'Save loaded. Installation restored; qualification requires a fresh test.');
 return clean;
}
