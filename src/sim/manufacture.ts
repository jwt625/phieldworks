import {MACHINE_LIMIT,type ManufactureJob,type World} from './world-types';
import {hardwareKey} from './wave-construction';
import {partById,type WavePartDef,type WaveRecipe} from './wave-parts';

const pushEvent=(w:World,text:string)=>{w.events.unshift({time:w.time,text});w.events=w.events.slice(0,30);};
const active=(w:World,cell:string|null)=>w.manufacture.find(j=>j.cell===cell&&j.stage!=='complete');
const cellOf=(w:World,id:string|null)=>id?w.entities.find(e=>e.id===id):undefined;

/** Unlocked hardware definitions, in stable order, for the tooling UI. */
export function unlockedParts(w:World):WavePartDef[]{return w.unlocked.map(id=>partById(id)).filter((p):p is WavePartDef=>!!p&&!!p.recipe);}
export function recipeForPart(part:WavePartDef):WaveRecipe{return part.recipe!;}

/** Switch an assembler between ore→assembly (default) and hardware tooling. Waits for any active job. */
export function setAssemblerMode(w:World,id:string,mode:'ore'|'tooling'):string{
 const cell=cellOf(w,id);if(!cell||cell.kind!=='assembler')return 'Select an assembler';
 if(active(w,id))return 'Wait for the active job to finish';
 cell.mode=mode;return '';
}

/**
 * Reserve one hardware manufacture job. Inputs transfer from shared stock immediately; the reservation is
 * refundable until the first active exposure step marks it consumed.
 */
export function reserve(w:World,cellId:string,partId:string):string{
 const cell=cellOf(w,cellId);if(!cell||cell.kind!=='assembler')return 'Select an assembler';
 if((cell.mode??'ore')!=='tooling')return 'Switch this assembler to tooling mode first';
 if(active(w,cellId))return 'This assembler already has a job in progress';
 const part=partById(partId);if(!part||!part.recipe)return 'Unknown or non-manufactured hardware';
 if(!w.unlocked.includes(part.id))return `${part.name} recipe is not unlocked`;
 if(w.manufacture.length>=MACHINE_LIMIT)return 'Manufacture queue is full';
 const r=part.recipe;
 if((w.hardware[hardwareKey(part.id,part.version)]??0)>=99)return 'Hardware stock is full';
 if(w.stock.precision<r.inputs.precision)return `Requires ${r.inputs.precision} precision parts`;
 if(w.stock.assemblies<r.inputs.assemblies)return `Requires ${r.inputs.assemblies} assemblies`;
 if(w.stock.crystal<r.inputs.crystal)return `Requires ${r.inputs.crystal} crystal`;
 w.stock.precision-=r.inputs.precision;w.stock.assemblies-=r.inputs.assemblies;w.stock.crystal-=r.inputs.crystal;
 w.manufacture.push({id:`m${w.nextId++}`,recipe:r.id,version:r.version,output:part.id,cell:cellId,stage:'reserved',outcome:null,inputs:{...r.inputs},consumed:false,elapsed:0,count:1,started:w.time,event:0});
 pushEvent(w,`Reserved tooling inputs for ${part.name}`);
 return '';
}

function finish(w:World,job:ManufactureJob,outcome:ManufactureJob['outcome'],text:string){job.stage='complete';job.outcome=outcome;job.event=++w.eventSeq;pushEvent(w,text);}
function deliver(w:World,job:ManufactureJob,part:WavePartDef){const key=hardwareKey(part.id,part.version);w.hardware[key]=(w.hardware[key]??0)+1;finish(w,job,'done',`Manufactured ${part.name}`);}

/** Manual cancel refunds an untouched reservation; exposed material becomes declared scrap. */
export function cancel(w:World,jobId:string):string{
 const job=w.manufacture.find(j=>j.id===jobId);if(!job||job.stage==='complete')return 'No active manufacture job';
 if(!job.consumed){w.stock.precision+=job.inputs.precision;w.stock.assemblies+=job.inputs.assemblies;w.stock.crystal+=job.inputs.crystal;finish(w,job,'cancelled','Tooling reservation refunded');return '';}
 w.stock.scrap+=job.inputs.assemblies+job.inputs.precision*2;finish(w,job,'scrapped','Consumed tooling stock scrapped');
 return '';
}
/** Destruction and dismantling share one loss path with no remote refund. */
export function finalizeLoss(w:World,jobId:string,reason:string):void{
 const job=w.manufacture.find(j=>j.id===jobId);if(!job||job.stage==='complete')return;
 if(job.consumed){w.stock.scrap+=job.inputs.assemblies+job.inputs.precision*2;finish(w,job,'scrapped',`Tooling stock lost: ${reason}`);}
 else finish(w,job,'cancelled',`Reservation lost: ${reason}`);
}
export function finalizeLostJobs(w:World):void{for(const job of w.manufacture.filter(j=>j.stage!=='complete')){const cell=cellOf(w,job.cell);if(job.cell!==null&&(!cell||cell.health<=0||cell.kind!=='assembler'))finalizeLoss(w,job.id,'assembler lost');}}

/** One fixed-step advance. Suspension banks nothing and power loss suspends rather than refunds. */
export function step(w:World,dt:number):void{
 for(const job of w.manufacture.filter(j=>j.stage!=='complete')){
  const part=partById(job.output);if(!part||!part.recipe){finalizeLoss(w,job.id,'unsupported recipe');continue;}
  const cell=cellOf(w,job.cell);
  const ready=!!cell&&cell.health>0&&!cell.tripped&&cell.powered&&(cell.mode??'ore')==='tooling';
  if(!ready){if(job.stage==='running'){job.stage='suspended';pushEvent(w,'Tooling suspended: conditions lost');}continue;}
  if(job.stage==='reserved'||job.stage==='suspended'){job.consumed=true;job.stage='running';}
  job.elapsed+=dt;
  if(job.elapsed>=part.recipe.seconds-1e-9)deliver(w,job,part);
 }
 prune(w);
}
/** Bounded completed report: keep the last two completed jobs per cell. */
function prune(w:World){
 const byCell=new Map<string|null,ManufactureJob[]>();for(const j of w.manufacture)if(j.stage==='complete'){const list=byCell.get(j.cell)??[];list.push(j);byCell.set(j.cell,list);}
 const keep=new Set<string>();for(const list of byCell.values())for(const j of list.slice(-2))keep.add(j.id);
 w.manufacture=w.manufacture.filter(j=>j.stage!=='complete'||keep.has(j.id));
}
export function activeJob(w:World,cell:string|null):ManufactureJob|undefined{return active(w,cell);}
