import {DT, type ControlDomain, type Entity, type Stats, type World} from './world-types';

export type Evaluate=(w:World)=>Stats;
const wrap=(x:number)=>((x+180)%360+360)%360-180;

/** Enabled, referenced domains with at least one healthy owned tuner. */
export function domainTuners(w:World,d:ControlDomain):Entity[]{return d.tuners.map(id=>w.entities.find(e=>e.id===id)).filter((e):e is Entity=>!!e&&e.kind==='tuner'&&e.health>0&&!e.tripped);}
export function referenceReady(w:World,d:ControlDomain):boolean{const r=d.reference?w.references.find(x=>x.id===d.reference):undefined;if(!r)return false;const e=w.entities.find(x=>x.id===r.source);return !!e&&e.kind==='reference'&&e.health>0&&!e.tripped&&e.powered;}
export function eligibleDomains(w:World):ControlDomain[]{return w.domains.filter(d=>d.enabled&&referenceReady(w,d)&&domainTuners(w,d).length>0);}
/** Dome objective: frontier stays useful target power; process trades guard exposure against useful delivery. */
export function objective(w:World,d:ControlDomain):number{const reading=w.stats.targets[d.target];if(!reading)return 0;return d.objective==='useful-minus-guard'?reading.useful-4*reading.guard:reading.useful;}

/**
 * One world-level scheduling budget: exactly one tuner is trial-tuned per step, round-robin over eligible
 * domains and then that domain's local cursor. Returns the number of field evaluations used so callers/tests
 * can assert the bound. Trial evaluations are read-only apart from the tuner phase being tested.
 */
export function automaticControl(w:World,evaluate:Evaluate):number{
 const domains=eligibleDomains(w);if(!domains.length)return 0;
 const step=Math.floor(w.time/DT),domain=domains[step%domains.length],tuners=domainTuners(w,domain);
 const index=domain.cursor%tuners.length,tuner=tuners[index],original=tuner.phase,baseStats=w.stats,base=objective(w,domain);
 const score=(stats:Stats)=>{const reading=stats.targets[domain.target];if(!reading)return 0;return domain.objective==='useful-minus-guard'?reading.useful-4*reading.guard:reading.useful;};
 tuner.phase=wrap(original+2);const plus=score(evaluate(w));
 tuner.phase=wrap(original-2);const minus=score(evaluate(w));
 const improved=Math.max(plus,minus)>base+1e-6;
 if(!improved){tuner.phase=original;w.stats=baseStats;}
 else if(plus>=minus){tuner.phase=wrap(original+2);evaluate(w);}
 else tuner.phase=wrap(original-2);
 domain.cursor=(index+1)%tuners.length;
 w.stats.controlCursor=index;
 return improved&&plus>=minus?3:2;
}
