import {LOT_LIMIT,type ProcessJob,type ProcessLot,type ProcessOutcome,type Target,type World} from './world-types';
import {recipeFor,STARTER_RECIPE,type ProcessRecipe} from './process-recipes';

const pushEvent=(w:World,text:string)=>{w.events.unshift({time:w.time,text});w.events=w.events.slice(0,30);};
const processTarget=(w:World,id:string)=>w.targets.find(t=>t.id===id&&t.kind==='process');
const cellEntity=(w:World,cell:string|null)=>cell?w.entities.find(e=>e.id===cell):undefined;
export function poweredEmitters(w:World,target:Target):number{return target.emitters.filter(id=>w.entities.find(e=>e.id===id)?.powered).length;}
export function cellReady(w:World,job:ProcessJob):boolean{const cell=cellEntity(w,job.cell);if(job.cell===null)return true;return !!cell&&cell.health>0&&!cell.tripped&&cell.powered;}
export function activeJobs(w:World,cell:string|null):ProcessJob[]{return w.jobs.filter(j=>j.cell===cell&&(j.stage==='reserved'||j.stage==='exposing'||j.stage==='suspended'));}
export function activeJob(w:World,cell:string|null):ProcessJob|undefined{return activeJobs(w,cell)[0];}
export function recoverableLot(w:World,cell:string|null):ProcessLot|undefined{return w.process.lots.find(l=>l.kind==='reject'&&l.disposition==='recoverable'&&l.owner===cell);}

export interface ProcessPreview {recipe:ProcessRecipe;elapsed:number;remaining:number;useful:number;guard:number;fraction:number;outcome:ProcessOutcome;}
export function preview(w:World,targetId:string):ProcessPreview|null{
 const job=w.jobs.find(j=>j.target===targetId&&j.stage!=='complete');
 const recipe=job?recipeFor(job.recipe,job.version):STARTER_RECIPE;if(!recipe)return null;
 const reading=w.stats.targets[targetId],duration=job&&job.rework?recipe.reworkSeconds:recipe.activeSeconds,elapsed=job?.elapsed??0,remaining=Math.max(0,duration-elapsed);
 const useful=(job?.useful??0)+(reading?.useful??0)*remaining,guard=(job?.guard??0)+(reading?.guard??0)*remaining,total=useful+guard;
 return {recipe,elapsed,remaining,useful,guard,fraction:total>0?guard/total:0,outcome:decide(recipe,useful,guard,job?.rework??false)};
}

/** Reservation transfers stock immediately; provenance is marked consumed on the first active exposure step. */
export function reserve(w:World,targetId:string):string{
 const target=processTarget(w,targetId);if(!target)return 'Not a process target';
 if(activeJob(w,target.owner))return 'This cell already has a batch in progress';
 if(w.process.lots.length>=LOT_LIMIT)return 'Process storage is full';
 const recipe=STARTER_RECIPE;
 if(w.stock.assemblies<recipe.inputs.assemblies||w.stock.crystal<recipe.inputs.crystal)return `Missing ingredients: ${recipe.inputs.assemblies} assemblies + ${recipe.inputs.crystal} crystal`;
 w.stock.assemblies-=recipe.inputs.assemblies;w.stock.crystal-=recipe.inputs.crystal;
 w.jobs.push({id:`j${w.nextId++}`,cell:target.owner,target:targetId,recipe:recipe.id,version:recipe.version,stage:'reserved',outcome:null,inputs:{...recipe.inputs},consumed:false,elapsed:0,useful:0,guard:0,interruptions:0,rework:false,lot:null,event:0});
 pushEvent(w,`Reserved ${recipe.inputs.assemblies} assemblies + ${recipe.inputs.crystal} crystal`);
 return '';
}

function decide(recipe:ProcessRecipe,useful:number,guard:number,rework:boolean):ProcessOutcome{
 const total=useful+guard;
 if(total<=0)return 'scrap';
 if(useful>recipe.usefulMax)return 'scrap';
 if(guard/total>recipe.guardFraction+1e-9)return 'scrap';
 if(useful<recipe.usefulMin)return rework?'scrap':'recoverable-reject';
 return 'accepted';
}
function finish(w:World,job:ProcessJob,outcome:ProcessOutcome|null,text:string){job.stage='complete';job.outcome=outcome;job.event=++w.eventSeq;pushEvent(w,text);}
function pushLot(w:World,job:ProcessJob,kind:'reject'|'scrap'){w.process.lots.push({id:`pl${w.nextId++}`,kind,recipe:job.recipe,version:job.version,parent:job.id,assemblies:job.inputs.assemblies,crystal:job.inputs.crystal,disposition:kind==='reject'?'recoverable':'spent',owner:kind==='reject'?job.cell:null,useful:job.useful,guard:job.guard});}
function commit(w:World,job:ProcessJob,outcome:ProcessOutcome,recipe:ProcessRecipe){
 if(outcome==='accepted'){w.process.accepted++;finish(w,job,outcome,`Batch accepted · useful ${job.useful.toFixed(1)}`);}
 else if(outcome==='recoverable-reject'){pushLot(w,job,'reject');finish(w,job,outcome,`Batch underdosed · recoverable reject ${job.useful.toFixed(1)}/${recipe.usefulMin}`);}
 else {pushLot(w,job,'scrap');finish(w,job,outcome,`Batch scrapped · useful ${job.useful.toFixed(1)}`);}
}
function complete(w:World,job:ProcessJob,recipe:ProcessRecipe){commit(w,job,decide(recipe,job.useful,job.guard,job.rework),recipe);}

/** Manual cancel refunds an untouched reservation or returns an untouched rework lot; exposed material becomes scrap. */
export function cancel(w:World,jobId:string):string{
 const job=w.jobs.find(j=>j.id===jobId);if(!job||job.stage==='complete')return 'No active batch';
 if(job.rework&&job.elapsed===0){const lot=w.process.lots.find(l=>l.id===job.lot);if(lot)lot.owner=job.cell;else w.process.lots.push({id:`pl${w.nextId++}`,kind:'reject',recipe:job.recipe,version:job.version,parent:job.id,assemblies:job.inputs.assemblies,crystal:job.inputs.crystal,disposition:'recoverable',owner:job.cell,useful:job.useful,guard:job.guard});finish(w,job,null,'Rework cancelled; lot returned');return '';}
 if(!job.consumed){w.stock.assemblies+=job.inputs.assemblies;w.stock.crystal+=job.inputs.crystal;finish(w,job,null,'Reservation refunded');return '';}
 commit(w,job,'scrap',recipeFor(job.recipe,job.version)??STARTER_RECIPE);
 return '';
}

/** Destruction and dismantling use one loss path with no remote refund. */
export function finalizeLoss(w:World,jobId:string,reason:string):void{
 const job=w.jobs.find(j=>j.id===jobId);if(!job||job.stage==='complete')return;
 if(job.rework||job.consumed)commit(w,job,'scrap',recipeFor(job.recipe,job.version)??STARTER_RECIPE);
 else finish(w,job,null,`Reservation lost: ${reason}`);
}
export function finalizeLostJobs(w:World):void{for(const job of w.jobs.filter(j=>j.stage!=='complete')){const cell=cellEntity(w,job.cell);if(job.cell!==null&&(!cell||cell.health<=0))finalizeLoss(w,job.id,'cell destroyed');}}

/** Rework removes one owned reject lot atomically and starts a further exposure with cumulative doses retained. */
export function rework(w:World,targetId:string):string{
 const target=processTarget(w,targetId);if(!target)return 'Not a process target';
 if(activeJob(w,target.owner))return 'This cell already has a batch in progress';
 const lot=recoverableLot(w,target.owner);if(!lot)return 'No recoverable reject lot at this cell';
 w.process.lots=w.process.lots.filter(l=>l.id!==lot.id);
 w.jobs.push({id:`j${w.nextId++}`,cell:target.owner,target:targetId,recipe:lot.recipe,version:lot.version,stage:'reserved',outcome:null,inputs:{assemblies:lot.assemblies,crystal:lot.crystal},consumed:true,elapsed:0,useful:lot.useful,guard:lot.guard,interruptions:0,rework:true,lot:lot.id,event:0});
 pushEvent(w,'Rework started on a recoverable reject lot');
 return '';
}

/** One fixed-step process advance. Doses integrate only over the remaining active duration; suspension banks nothing. */
export function step(w:World,dt:number):void{
 for(const job of w.jobs.filter(j=>j.stage!=='complete')){
  const target=processTarget(w,job.target);const recipe=recipeFor(job.recipe,job.version);
  if(!target){finalizeLoss(w,job.id,'target removed');continue;}
  if(!recipe){finalizeLoss(w,job.id,'unsupported recipe');continue;}
  const ready=cellReady(w,job)&&!w.stats.error&&poweredEmitters(w,target)===2;
  if(!ready){if(job.stage==='exposing'){job.stage='suspended';job.interruptions++;pushEvent(w,'Batch suspended: exposure conditions lost');}continue;}
  if(job.stage==='reserved'||job.stage==='suspended'){job.consumed=true;job.stage='exposing';}
  const duration=job.rework?recipe.reworkSeconds:recipe.activeSeconds,remaining=duration-job.elapsed;
  if(remaining<=0){complete(w,job,recipe);continue;}
  const activeDt=Math.min(dt,remaining),reading=w.stats.targets[target.id];
  if(reading){job.useful+=reading.useful*activeDt;job.guard+=reading.guard*activeDt;}
  job.elapsed+=activeDt;
  if(job.elapsed>=duration-1e-9)complete(w,job,recipe);
 }
 prune(w);
}
/** Bounded completed report: keep the last two completed jobs per cell; cumulative counters persist. */
function prune(w:World){
 const byCell=new Map<string|null,ProcessJob[]>();for(const j of w.jobs)if(j.stage==='complete'){const list=byCell.get(j.cell)??[];list.push(j);byCell.set(j.cell,list);}
 const keep=new Set<string>();for(const list of byCell.values())for(const j of list.slice(-2))keep.add(j.id);
 w.jobs=w.jobs.filter(j=>j.stage!=='complete'||keep.has(j.id));
}
/** Blocking reason for starting or continuing a standard cycle, for inspectors/diagnostics. */
export function blocker(w:World,targetId:string):{code:string;reason:string}|null{
 const target=processTarget(w,targetId);if(!target)return {code:'incompatible-binding',reason:'Not a process target'};
 const job=activeJob(w,target.owner);
 if(!job)return null;
 const cell=cellEntity(w,job.cell);
 if(job.cell!==null&&(!cell||cell.health<=0))return {code:'dependency-changed',reason:'Cell destroyed'};
 if(job.cell!==null&&cell?.tripped)return {code:'dependency-changed',reason:'Cell protection tripped'};
 if(job.cell!==null&&!cell?.powered)return {code:'unpowered',reason:'Cell has no power'};
 if(w.stats.error)return {code:'dependency-changed',reason:w.stats.error};
 if(poweredEmitters(w,target)!==2)return {code:'missing-input',reason:'Exactly two powered emitters must deliver to the workpiece'};
 return null;
}
