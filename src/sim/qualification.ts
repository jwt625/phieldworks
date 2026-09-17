import type {ControlDomain, World} from './world-types';
import {referenceReady} from './control';

export type QualificationCode=''|'missing-input'|'unpowered'|'guard-overexposure'|'useful-underdose'|'useful-overdose'|'incompatible-binding'|'dependency-changed';
export interface OperatingIssue {code:QualificationCode;reason:string}

/**
 * Entities and links capable of affecting one domain: its target/cell, assigned emitters, tuners, the
 * connected field component (including junctions/dumps/reflections) and electrical service participants
 * reachable over power wires. Material transport is excluded because it does not change an optical contract.
 */
export function dependencyClosure(w:World,domain:ControlDomain):string[]{
 const entities=new Set<string>(),links=new Set<string>();const target=w.targets.find(t=>t.id===domain.target),reference=domain.reference?w.references.find(r=>r.id===domain.reference):undefined;
 const queue:string[]=[];
 if(reference)queue.push(reference.source);queue.push(...domain.tuners);
 if(target){queue.push(...target.emitters);if(target.owner)queue.push(target.owner);}
 while(queue.length){
  const id=queue.pop()!;if(entities.has(id))continue;entities.add(id);
  for(const l of w.links){if(l.type!=='field'&&l.type!=='power')continue;const other=l.a.node===id?l.b.node:l.b.node===id?l.a.node:null;if(other===null)continue;links.add(l.id);if(!entities.has(other))queue.push(other);}
 }
 return [...entities].sort().concat([...links].sort());
}

/** Canonical configuration fingerprint. Phases, temperatures and progress are deliberately excluded. */
export function configurationSignature(w:World,domain:ControlDomain):string{
 const closure=new Set(dependencyClosure(w,domain)),target=w.targets.find(t=>t.id===domain.target),reference=domain.reference?w.references.find(r=>r.id===domain.reference):undefined;
 const entities=w.entities.filter(e=>closure.has(e.id)).sort((a,b)=>a.id.localeCompare(b.id)).map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,rotation:e.rotation,alive:e.health>0,tripped:e.tripped,powered:e.powered}));
 const links=w.links.filter(l=>closure.has(l.id)).sort((a,b)=>a.id.localeCompare(b.id)).map(l=>({id:l.id,type:l.type,a:l.a,b:l.b,path:l.path.map(p=>[p.x,p.y]),diagonal:l.diagonal,radius:l.radius,legacy:!l.pieces}));
 // Physical piece definitions/versions/topology are part of the fingerprint: replacing an elbow or
 // junction invalidates dependent qualifications, while an unrelated route leaves them untouched.
 const pieces=w.pieces.filter(p=>closure.has(p.route)).sort((a,b)=>a.id.localeCompare(b.id)).map(p=>({id:p.id,part:p.part,version:p.version,x:p.x,y:p.y,rotation:p.rotation,spans:p.spans,turn:p.turn,route:p.route,condition:p.condition}));
 return JSON.stringify({domain:{id:domain.id,enabled:domain.enabled,objective:domain.objective,reference:reference?{source:reference.source,group:reference.group}:null,target:domain.target,sensor:domain.sensor,tuners:[...domain.tuners].sort()},target:target?{id:target.id,kind:target.kind,owner:target.owner,x:target.x,y:target.y,emitters:[...target.emitters].sort(),contract:target.contract}:null,entities,links,pieces});
}

/** Live operating acceptance. Frontier keeps its historical ≥32 useful-power floor; process contracts arrive with A-04/A-05. */
export function operatingIssue(w:World,domain:ControlDomain):OperatingIssue|null{
 if(!domain.enabled)return {code:'dependency-changed',reason:'Automatic control is disabled'};
 const target=w.targets.find(t=>t.id===domain.target);if(!target)return {code:'dependency-changed',reason:'Delivery target is missing'};
 if(w.stats.error)return {code:'dependency-changed',reason:w.stats.error};
 const reading=w.stats.targets[target.id];if(!reading)return {code:'dependency-changed',reason:'No field reading for this target'};
 const powered=target.emitters.filter(id=>w.entities.find(e=>e.id===id)?.powered).length;
 if(!powered)return {code:'unpowered',reason:'No powered emitter delivers to this target'};
 if(target.kind==='frontier'&&reading.useful<32)return {code:'useful-underdose',reason:'Target power fell below the operating minimum'};
 return null;
}

/** Begin a fresh test: configuration is snapshotted so later automatic phase corrections do not invalidate it. */
export function startQualification(w:World,domainId:string,reason:string):string{
 const domain=w.domains.find(d=>d.id===domainId);if(!domain)return 'No such control domain';
 if(!domain.enabled)return 'Enable automatic phase control first';
 if(!referenceReady(w,domain))return 'Bind a powered reference before testing';
 const qualification=w.qualifications.find(q=>q.domain===domainId);if(!qualification)return 'No qualification record for this domain';
 const target=w.targets.find(t=>t.id===domain.target);
 qualification.status='testing';qualification.elapsed=target?.kind==='process'?w.time:0;qualification.minimum=-1;qualification.counters=0;qualification.signature=configurationSignature(w,domain);qualification.reason=reason;qualification.code='';
 return '';
}

/**
 * Invalidate only certificates whose configuration fingerprint changed or whose live operating contract is
 * breached. An unrelated repair on an independent supply leaves other domains untouched. Returns the count.
 */
export function revalidate(w:World,reason='Dependency changed'):number{
 let changed=0;
 for(const qualification of w.qualifications){
  if(qualification.status!=='testing'&&qualification.status!=='qualified')continue;
  const domain=w.domains.find(d=>d.id===qualification.domain);
  const signature=domain?configurationSignature(w,domain):'';
  if(signature!==qualification.signature){qualification.status='failed';qualification.reason=reason;qualification.code='dependency-changed';changed++;continue;}
  const issue=domain?operatingIssue(w,domain):{code:'dependency-changed' as QualificationCode,reason:'Control domain is missing'};
  if(issue){qualification.status='failed';qualification.reason=issue.reason;qualification.code=issue.code;changed++;}
 }
 return changed;
}
