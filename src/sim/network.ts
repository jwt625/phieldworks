import { type Complex, ZERO, c, add, sub, mul, div, polar, power, factorLU, solveFactorization } from './complex';
export interface Component {id:string; s:Complex[][]; emission?:{group:string; fields:Complex[]}}
export interface Endpoint {node:string; port:number}
export interface WaveLink {a:Endpoint;b:Endpoint; amplitude:number; phase:number}
export interface PortResult {incoming:number;outgoing:number; fields:Record<string,{a:Complex;b:Complex}>}
export interface NetworkResult {ports:Record<string,PortResult[]>; absorbed:Record<string,number>; sourcePower:number;linkLoss:number;escaped:number;residual:number}
/** Single supported wave-port cap: placement, save validation and this solver must agree. */
export const FIELD_PORT_LIMIT=256;
/** Minimum off-diagonal magnitude treated as coupling when partitioning. */
const COUPLING=1e-30;
export const key=(p:Endpoint)=>`${p.node}:${p.port}`;
export const matched=(id:string,ports=1):Component=>({id,s:Array.from({length:ports},()=>Array.from({length:ports},()=>ZERO))});
export function source(id:string,p:number,group=id):Component {if(!Number.isFinite(p)||p<0)throw new Error('Invalid source power');return {...matched(id),emission:{group,fields:[c(Math.sqrt(p))]}};}
export const through=(id:string,phase=0):Component=>({id,s:[[ZERO,polar(1,phase)],[polar(1,phase),ZERO]]});
/** Reciprocal, lossless 180-degree hybrid: ports 0/1 on one side, 2/3 on the other. */
export function hybrid(id:string):Component {const r=c(Math.SQRT1_2),m=c(-Math.SQRT1_2);return {id,s:[[ZERO,ZERO,r,r],[ZERO,ZERO,r,m],[r,r,ZERO,ZERO],[r,m,ZERO,ZERO]]};}
export function solveNetwork(components:Component[],links:WaveLink[]):NetworkResult {
 const offsets=new Map<string,number>(),indices=new Map<string,number>();let n=0;
 for(const comp of components){if(offsets.has(comp.id))throw new Error('Duplicate component ID');offsets.set(comp.id,n);const k=comp.s.length;if(!k||comp.s.some(r=>r.length!==k||r.some(z=>!z.every(Number.isFinite))))throw new Error('Invalid scattering matrix');for(let j=0;j<k;j++)indices.set(`${comp.id}:${j}`,n++);if(comp.emission && (comp.emission.fields.length!==k || comp.emission.fields.some(z=>!z.every(Number.isFinite)) || comp.s.some(r=>r.some(z=>power(z)>0))))throw new Error('Sources must be matched with one emission per port');}
 if(n>FIELD_PORT_LIMIT)throw new Error(`Prototype limit: ${FIELD_PORT_LIMIT} wave ports`);
 const peers=new Map<number,{index:number;gain:Complex;amplitude:number}>();
 for(const link of links){const a=indices.get(key(link.a)),b=indices.get(key(link.b));if(a===undefined||b===undefined||a===b||peers.has(a)||peers.has(b))throw new Error('Invalid or occupied wave port');if(!Number.isFinite(link.phase)||!Number.isFinite(link.amplitude)||link.amplitude<0||link.amplitude>1)throw new Error('Invalid passive link gain');const gain=polar(link.amplitude,link.phase);peers.set(a,{index:b,gain,amplitude:link.amplitude});peers.set(b,{index:a,gain,amplitude:link.amplitude});}
 const matrix:Complex[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>c(i===j?1:0)));
 for(const comp of components){const start=offsets.get(comp.id)!;for(let i=0;i<comp.s.length;i++)for(let j=0;j<comp.s.length;j++){const peer=peers.get(start+j);if(peer)matrix[start+i][peer.index]=sub(matrix[start+i][peer.index],mul(comp.s[i][j],peer.gain));}}
 // Partition the coupling graph into independent blocks. Disconnected field regions solve
 // separately, and one factorization per block serves every source group in that block.
 const root=new Int32Array(n);for(let i=0;i<n;i++)root[i]=i;
 const find=(x:number):number=>{while(root[x]!==x){root[x]=root[root[x]];x=root[x];}return x;};
 for(let i=0;i<n;i++)for(let k=i+1;k<n;k++)if(power(matrix[i][k])>COUPLING||power(matrix[k][i])>COUPLING){const a=find(i),b=find(k);if(a!==b)root[b]=a;}
 const blocks=new Map<number,number[]>();for(let i=0;i<n;i++){const r=find(i);const list=blocks.get(r);if(list)list.push(i);else blocks.set(r,[i]);}
 const factors:{members:number[];lu:Complex[][];piv:number[]}[]=[];
 for(const members of blocks.values()){const m=members.length;const sub:Complex[][]=Array.from({length:m},(_,a)=>Array.from({length:m},(_,b)=>matrix[members[a]][members[b]]));const {lu,piv}=factorLU(sub);factors.push({members,lu,piv});}
 const result:NetworkResult={ports:{},absorbed:{},sourcePower:0,linkLoss:0,escaped:0,residual:0};
 for(const comp of components){result.ports[comp.id]=comp.s.map(()=>({incoming:0,outgoing:0,fields:{}}));result.absorbed[comp.id]=0;}
 const groups=[...new Set(components.flatMap(comp=>comp.emission?[comp.emission.group]:[]))];
 for(const group of groups){const rhs:Complex[]=Array.from({length:n},()=>ZERO);let supplied=0;
  for(const comp of components)if(comp.emission?.group===group){const start=offsets.get(comp.id)!;comp.emission.fields.forEach((v,i)=>{rhs[start+i]=v;supplied+=power(v);});}
  const outgoing:Complex[]=Array.from({length:n},()=>ZERO);
  for(const factor of factors){let active=false;const local=Array.from({length:factor.members.length},(_,i)=>{const v=rhs[factor.members[i]];if(v[0]!==0||v[1]!==0)active=true;return v;});if(!active)continue;const solved=solveFactorization(factor,local);factor.members.forEach((index,i)=>{outgoing[index]=solved[i];});}
  result.sourcePower+=supplied;
  for(const comp of components){const start=offsets.get(comp.id)!;let absorbed=0;
   for(let i=0;i<comp.s.length;i++){const index=start+i,peer=peers.get(index),b=outgoing[index],a=peer?mul(peer.gain,outgoing[peer.index]):ZERO;const pin=power(a),pout=power(b);const entry=result.ports[comp.id][i];entry.incoming+=pin;entry.outgoing+=pout;entry.fields[group]={a,b};absorbed+=pin-pout+power(rhs[index]);if(peer)result.linkLoss+=pout*(1-peer.amplitude**2);else result.escaped+=pout;}
   result.absorbed[comp.id]+=absorbed;
  }
 }
 result.residual=result.sourcePower-result.linkLoss-result.escaped-Object.values(result.absorbed).reduce((a,b)=>a+b,0);
 return result;
}
/**
 * Exact serial composition of two passive two-port elements. A straight run can be folded into one
 * solver element without dropping reflections or phase, keeping the port budget bounded. Throws on a
 * dark (zero-transmission) element rather than silently returning a wrong network.
 */
export function compose2Port(a:Complex[][],b:Complex[][]):Complex[][]{
 const transfer=(s:Complex[][]):Complex[][]=>{const s11=s[0][0],s12=s[0][1],s21=s[1][0],s22=s[1][1];const i21=div(c(1),s21);return [[i21,mul(c(-1),mul(s22,i21))],[mul(s11,i21),sub(s12,mul(s11,mul(s22,i21)))]];};
 const t1=transfer(a),t2=transfer(b);
 const t=[[add(mul(t1[0][0],t2[0][0]),mul(t1[0][1],t2[1][0])),add(mul(t1[0][0],t2[0][1]),mul(t1[0][1],t2[1][1]))],[add(mul(t1[1][0],t2[0][0]),mul(t1[1][1],t2[1][0])),add(mul(t1[1][0],t2[0][1]),mul(t1[1][1],t2[1][1]))]];
 const i11=div(c(1),t[0][0]);
 return [[mul(t[1][0],i11),sub(t[1][1],mul(t[1][0],mul(t[0][1],i11)))],[i11,mul(c(-1),mul(t[0][1],i11))]];
}
