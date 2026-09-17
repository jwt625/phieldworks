import {DEFS} from './definitions';
import {footprint} from './geometry';
import {connect,event,invalidate,newEntity,placementError} from './world';
import {hardwareKey,pieceCost} from './wave-construction';
import {partDef} from './wave-parts';
import type {BlueprintSlot,ControlDomain,Entity,ReferenceBinding,Target,WavePiece,World} from './world-types';

export interface StampOptions {resolved?:Record<string,string|null>;allowDisconnected?:boolean}
const includedDomains=(w:World,ids:Set<string>)=>w.domains.filter(d=>{const t=w.targets.find(x=>x.id===d.target);if(!t)return false;return t.owner?ids.has(t.owner):t.kind==='frontier'&&t.emitters.length>0&&t.emitters.every(id=>ids.has(id));});

/** Capture the current outpost, or a selected subset, as a template. Runtime state is stripped. */
export function captureBlueprint(w:World,ids?:string[]):string{
 const included=new Set(ids??w.entities.map(e=>e.id));
 const entities=w.entities.filter(e=>included.has(e.id));
 if(!entities.length)return 'Select at least one machine';
 const domains=includedDomains(w,included);
 const links=w.links.filter(l=>included.has(l.a.node)&&included.has(l.b.node));
 const xs:number[]=[],ys:number[]=[];
 for(const e of entities){xs.push(e.x,e.x+footprint(e).w);ys.push(e.y,e.y+footprint(e).h);}
 for(const l of links)for(const p of l.path){xs.push(p.x);ys.push(p.y);}
 const minX=Math.floor(Math.min(...xs)),minY=Math.floor(Math.min(...ys));
 const targets=w.targets.filter(t=>t.owner?included.has(t.owner):included.size===w.entities.length).map(t=>({...t,x:t.x-minX,y:t.y-minY,emitters:t.emitters.filter(id=>included.has(id))}));
 const references=w.references.filter(r=>included.has(r.source)).map(r=>({...r}));
 const referenceById=new Map(references.map(r=>[r.id,r]));
 const slots:BlueprintSlot[]=[];
 const blueprintDomains:ControlDomain[]=[];
 for(const domain of domains){
  const target=targets.find(t=>t.id===domain.target);if(!target)continue;
  const reference=domain.reference?referenceById.get(domain.reference):undefined;
  let referenceId=reference?.id??null;
  if(domain.reference&&!reference){const slot:BlueprintSlot={id:`slot-ref-${domain.id}`,kind:'reference',label:'Reference source for '+domain.name,required:true,binding:null};slots.push(slot);referenceId=slot.id;}
  const tuners=domain.tuners.filter(id=>included.has(id));
  if(domain.tuners.length&&tuners.length<domain.tuners.length){const slot:BlueprintSlot={id:`slot-ctl-${domain.id}`,kind:'controller',label:'Controller/tuner for '+domain.name,required:true,binding:null};slots.push(slot);}
  blueprintDomains.push({...domain,target:target.id,reference:referenceId,tuners,sensor:domain.sensor&&included.has(domain.sensor)?domain.sensor:null,cursor:0,enabled:referenceId?domain.enabled:false});
 }
 slotPower(w,included,slots);
 const width=Math.ceil(Math.max(...xs))-minX,height=Math.ceil(Math.max(...ys))-minY;
 // Capture every internal physical piece so a copy restores the real hardware, not a free path.
 const pieceIds=new Set(links.flatMap(l=>l.pieces??[]));
 const pieces=w.pieces.filter(p=>pieceIds.has(p.id)).map(p=>({...p,x:p.x-minX,y:p.y-minY}));
 w.blueprint={version:2,entities:entities.map(e=>({...e,x:e.x-minX,y:e.y-minY,ore:0,progress:0,powered:false,health:100,temperature:25,tripped:false})),links:links.map(l=>({...structuredClone(l),path:l.path.map(p=>({x:p.x-minX,y:p.y-minY})),packets:[]})),pieces,targets,references,domains:blueprintDomains,slots,width,height};
 event(w,'Selected blueprint recorded');return '';
}
/** A detached power island inside the selection needs an explicit external feed. */
function slotPower(w:World,included:Set<string>,slots:BlueprintSlot[]){
 const adj=new Map<string,string[]>(),add=(a:string,b:string)=>{if(!adj.has(a))adj.set(a,[]);adj.get(a)!.push(b);};
 for(const l of w.links.filter(l=>l.type==='power'&&included.has(l.a.node)&&included.has(l.b.node))){add(l.a.node,l.b.node);add(l.b.node,l.a.node);}
 const seen=new Set<string>();
 for(const entity of w.entities.filter(e=>included.has(e.id)&&DEFS[e.kind].watts>0)){if(seen.has(entity.id))continue;const stack=[entity.id],component:string[]=[];seen.add(entity.id);while(stack.length){const id=stack.pop()!;component.push(id);for(const n of adj.get(id)??[])if(!seen.has(n)){seen.add(n);stack.push(n);}}
  if(!component.some(id=>w.entities.find(e=>e.id===id)?.kind==='generator'))slots.push({id:`slot-power-${entity.id}`,kind:'power',label:'Power feed for '+component.join(', '),required:true,binding:null});
 }
}
export function blueprintCost(w:World){return (w.blueprint?.entities.reduce((s,e)=>s+DEFS[e.kind].cost,0)??0)+(w.blueprint?.pieces??[]).reduce((s,p)=>{const def=partDef(p.part,p.version);return s+(def&&def.buildable?pieceCost(def,p.spans):0);},0);}
/** Precision hardware a stamp consumes from inventory, keyed by "partId@version". */
function blueprintHardware(w:World):Record<string,number>{const out:Record<string,number>={};for(const p of w.blueprint?.pieces??[]){const def=partDef(p.part,p.version);if(def&&!def.buildable)out[hardwareKey(def.id,def.version)]=(out[hardwareKey(def.id,def.version)]??0)+1;}return out;}

/** Transactional placement: every validation, route, cost and id is staged before one commit. */
export function stampBlueprint(w:World,x:number,y:number,options:StampOptions={}):string{
 const blueprint=w.blueprint;if(!blueprint)return 'Record a blueprint first';
 const unresolved=blueprint.slots.filter(s=>s.required&&!(options.resolved?.[s.id]??s.binding));
 if(unresolved.length&&!options.allowDisconnected)return `Resolve external services (${unresolved.map(s=>s.kind).join(', ')}) or deploy disconnected`;
 const cost=blueprintCost(w);if(w.stock.assemblies<cost)return `Blueprint requires ${cost} assemblies`;
 for(const [key,num] of Object.entries(blueprintHardware(w)))if((w.hardware[key]??0)<num)return `Blueprint requires manufactured hardware (${num} × ${key})`;
 const staged:Entity[]=[];const newIds=new Map<string,string>();
 for(const entity of blueprint.entities){
  const error=placementError(w,entity.kind,x+entity.x,y+entity.y,staged,entity.rotation);if(error)return error;
  const id=`e${w.nextId+staged.length}`;newIds.set(entity.id,id);
  staged.push({...newEntity(entity.kind,x+entity.x,y+entity.y,id,entity.rotation),phase:entity.phase});
 }
 let nextId=w.nextId+staged.length;
 const draft:World={...w,entities:[...w.entities,...staged],links:[...w.links],pieces:[...w.pieces],events:[],targets:[...w.targets],references:[...w.references],domains:[...w.domains],qualifications:w.qualifications.map(q=>({...q,dependencies:[...q.dependencies]})),nextId};
 for(const link of blueprint.links){const from=newIds.get(link.a.node),to=newIds.get(link.b.node);if(!from||!to)return 'Blueprint route references missing equipment';
   const error=connect(draft,link.type,{node:from,port:link.a.port},{node:to,port:link.b.port},{path:link.path.map(p=>({x:p.x+x,y:p.y+y})),radius:link.radius,diagonal:link.diagonal});if(error)return error;
   if(!link.pieces?.length)continue;
   const conn=draft.links.at(-1)!,pieceIdMap=new Map<string,string>(),bpPieceById=new Map((blueprint.pieces??[]).map(p=>[p.id,p]));
   for(const id of link.pieces){const bpPiece=bpPieceById.get(id);if(!bpPiece)return 'Blueprint piece is missing from the template';const pid=`p${draft.nextId++}`;pieceIdMap.set(id,pid);draft.pieces.push({...bpPiece,id:pid,x:bpPiece.x+x,y:bpPiece.y+y,route:conn.id} as WavePiece);}
   const remap=(e:{node:string;port:number})=>({node:pieceIdMap.get(e.node)??newIds.get(e.node)??e.node,port:e.port});
   conn.pieces=link.pieces.map(id=>pieceIdMap.get(id)!);conn.interfaces=link.interfaces?.map(i=>({a:remap(i.a),b:remap(i.b)}));delete conn.legacy;
  }
 nextId=draft.nextId;
 // Fresh identities for targets, references, domains and qualifications. Frontier identities are never copied.
 const targetId=new Map<string,string>();
 for(const target of blueprint.targets.filter(t=>t.kind!=='frontier')){const id=`t${nextId++}`;targetId.set(target.id,id);draft.targets.push({...target,id,owner:target.owner?newIds.get(target.owner)??null:null,x:target.x+x,y:target.y+y,health:0,emitters:target.emitters.map(e=>newIds.get(e)!).filter(Boolean)});}
 const referenceId=new Map<string,string>();
 for(const reference of blueprint.references){const id=`r${nextId++}`;referenceId.set(reference.id,id);draft.references.push({id,source:newIds.get(reference.source)??reference.source,group:newIds.get(reference.source)??reference.source});}
 for(const domain of blueprint.domains.filter(d=>d.target&&targetId.has(d.target))){const id=`d${nextId++}`,target=targetId.get(domain.target)!;
  const resolvedController=options.resolved?.[`slot-ctl-${domain.id}`];
  const tuners=domain.tuners.map(t=>newIds.get(t)!).filter(Boolean);
  if(resolvedController){const tuner=w.entities.find(e=>e.id===resolvedController);if(!tuner||tuner.kind!=='tuner')return 'Resolved controller is not a tuner';if(w.domains.some(d=>d.tuners.includes(resolvedController)))return 'Resolved tuner is already owned by another domain';tuners.push(resolvedController);}
  const resolvedReference=options.resolved?.[`slot-ref-${domain.id}`];
  if(resolvedReference&&!w.references.some(r=>r.id===resolvedReference))return 'Resolved reference binding is invalid';
  const internalReference=domain.reference?referenceId.get(domain.reference):undefined,reference=internalReference??resolvedReference??null;
  draft.domains.push({...domain,id,target,reference,tuners,sensor:domain.sensor?newIds.get(domain.sensor)??null:null,cursor:0,enabled:!!reference&&domain.enabled});
  draft.qualifications.push({id:`q${nextId++}`,domain:id,target,status:'idle',signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[],reason:'Blueprint deployed — local qualification required',code:''});}
 w.nextId=nextId;w.entities=draft.entities;w.links=draft.links;w.pieces=draft.pieces;w.targets=draft.targets;w.references=draft.references;w.domains=draft.domains;w.qualifications=draft.qualifications;w.stock.assemblies-=cost;
 for(const [key,num] of Object.entries(blueprintHardware(w)))w.hardware[key]=(w.hardware[key]??0)-num;
 invalidate(w,'Blueprint placed — local commissioning required');event(w,'Blueprint placed; resolve services and qualify at this site');return '';
}
