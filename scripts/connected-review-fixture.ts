/** Deterministic, route-valid stress worlds. Setup cost is excluded from timings. */
import {createWorld,newEntity,connect,deserialize,serialize,DEFS,FIELD_PORT_LIMIT,placementError,type Kind,type Entity} from '../src/sim/world';
export function connectedFixture(machines=120,groups=1){
 const w=createWorld();w.entities=[];w.links=[];w.deposits=[];w.ecology.creatures=[];w.frontier=true;w.stock.assemblies=100000;w.nextId=1000;
 const add=(kind:Kind,x:number,y:number,rotation:0|2=0)=>{const e=newEntity(kind,x,y,`e${w.nextId++}`,rotation);w.entities.push(e);return e;};
 const junctionCount=Math.min(Math.floor((FIELD_PORT_LIMIT-groups-15)/4),machines-2*groups-8);
 const junctions=Array.from({length:junctionCount},(_,i)=>{const row=Math.floor(i/15),col=row%2?14-i%15:i%15;return add('junction',1+col*4,2+row*6,row%2?2:0);});
 const tuners=Array.from({length:7},(_,i)=>add('tuner',1+i*4,25));
 const refs=Array.from({length:groups},(_,i)=>add('reference',1+i*4,28));
 const gens=Array.from({length:groups},(_,i)=>add('generator',1+i*4,34));
 const emitter=add('emitter',57,24);
 let count=w.entities.reduce((n,e)=>n+DEFS[e.kind].ports.length,0);
 const dumps:Entity[]=[];while(count<FIELD_PORT_LIMIT&&w.entities.length<machines&&junctionCount>=50){dumps.push(add('dump',33+dumps.length*4,25));count++;}
 const link=(type:'field'|'power',a:Entity,ap:number,b:Entity,bp:number)=>{const error=connect(w,type,{node:a.id,port:ap},{node:b.id,port:bp},{diagonal:true});if(error)throw Error(`${type} ${a.id}->${b.id}: ${error}`);};
 for(let i=1;i<junctions.length;i++)link('field',junctions[i-1],2,junctions[i],0);
 refs.forEach((r,i)=>{link('field',r,0,junctions[i],1);link('power',gens[i],0,r,0);});
 link('field',junctions.at(-1)!,2,tuners[0],0);for(let i=1;i<tuners.length;i++)link('field',tuners[i-1],1,tuners[i],0);link('field',tuners.at(-1)!,1,emitter,0);link('power',gens[0],0,emitter,0);
 dumps.forEach((d,i)=>{link('field',junctions.at(-1-i)!,3,d,0);link('power',gens[0],0,d,0);});
 // Pad after routing so sentries cannot obstruct the connected fixture's ports.
 for(let y=0;y<34&&w.entities.length<machines;y++)for(let x=0;x<62&&w.entities.length<machines;x++)if(!placementError(w,'sentry',x,y))add('sentry',x,y);
 w.targets=[{id:`t${w.nextId++}`,kind:'frontier',owner:null,x:57,y:24,health:0,emitters:[emitter.id],contract:null}];
 w.references=refs.map(r=>({id:`r${w.nextId++}`,source:r.id,group:r.id}));
 w.domains=[{id:`d${w.nextId++}`,name:'Benchmark domain',target:w.targets[0].id,reference:w.references[0]?.id??null,sensor:null,tuners:tuners.map(t=>t.id),enabled:false,objective:'target-power',cursor:0}];
 w.qualifications=[{id:`q${w.nextId++}`,domain:w.domains[0].id,target:w.targets[0].id,status:'idle',signature:'',elapsed:0,minimum:-1,counters:0,dependencies:[],reason:'',code:''}];
 const loaded=deserialize(serialize(w));if(loaded.stats.error)throw Error(loaded.stats.error);
 return loaded;
}
