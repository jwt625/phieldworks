import {inside, ports, type Body, type Point, type Rotation} from './geometry';
import {findRoute, type RouteOptions} from './routing';
import type {Endpoint} from './network';
import {HEIGHT, WIDTH, type Connection, type WaveInterface, type WavePiece, type World} from './world-types';
import {BASIC_STRAIGHT, COMPACT_ELBOW, partDef, partReach, type WavePartDef} from './wave-parts';

/** Cardinal direction of travel between two adjacent half-tile lattice points. */
export type Dir=0|1|2|3;
const UNIT:Point[]=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
const opposite=(d:Dir):Dir=>((d+2)%4) as Dir;
function rot(v:Point,r:Rotation):Point{let p=v;for(let i=0;i<r;i++)p={x:-p.y||0,y:p.x||0};return p;}
function dirOf(a:Point,b:Point):Dir {const dx=b.x-a.x,dy=b.y-a.y;if(dy===0&&dx>0)return 0;if(dx===0&&dy>0)return 1;if(dy===0&&dx<0)return 2;return 3;}
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);

/** Remove collinear midpoints so a path becomes a short vertex list. Shared by geometry and the compiler. */
export function simplifyPath(path:Point[]):Point[]{
 const vertices:Point[]=[];
 for(const p of path){while(vertices.length>=2){const a=vertices.at(-2)!,b=vertices.at(-1)!;if(Math.abs((b.x-a.x)*(p.y-b.y)-(b.y-a.y)*(p.x-b.x))>1e-8)break;vertices.pop();}vertices.push(p);}
 return vertices;
}

type PiecePose=Pick<WavePiece,'category'|'rotation'|'spans'|'turn'|'x'|'y'|'part'|'version'|'reach'>;
const exitDir=(p:PiecePose):Dir=>((p.rotation+(p.turn===1?1:3))%4) as Dir;

/** Assembly cost of one piece instance; fractional trimmed straights round up to whole assemblies. */
export function pieceCost(def:WavePartDef,spans:number):number{return def.category==='straight'?Math.ceil((def.costPerSpan??def.cost)*spans):def.cost;}
export function hardwareKey(id:string,version:number){return `${id}@${version}`;}

/** World-space port points for one piece; the only port authority for physics, rendering and linkage. */
export function piecePorts(piece:PiecePose):{x:number;y:number;dir:Dir}[]{
 if(piece.category==='straight'){const exit=rot({x:piece.spans/2,y:0},piece.rotation);return [{x:piece.x,y:piece.y,dir:opposite(piece.rotation)},{x:piece.x+exit.x,y:piece.y+exit.y,dir:piece.rotation}];}
 const def=partDef(piece.part,piece.version),reach=piece.reach??(def?partReach(def):.5);
 const inVec=UNIT[piece.rotation],outDir=exitDir(piece),outVec=UNIT[outDir];
 return [{x:piece.x-inVec.x*reach,y:piece.y-inVec.y*reach,dir:opposite(piece.rotation)},{x:piece.x+outVec.x*reach,y:piece.y+outVec.y*reach,dir:outDir}];
}

/** The compiled geometry of a route as a point path, derived from the authoritative piece order. */
export function routePath(pieces:WavePiece[]):Point[]{
 const path:Point[]=[];
 pieces.forEach((piece,index)=>{const [a,b]=piecePorts(piece);if(index===0)path.push({x:a.x,y:a.y});if(!(b.x===a.x&&b.y===a.y))path.push({x:b.x,y:b.y});});
 return path;
}

export interface CompiledRoute {pieces:WavePiece[]; interfaces:WaveInterface[]; bom:{assemblies:number;crystal:number;precision:number}; elbow:WavePartDef}
export type PieceAllocator=()=>string;

/**
 * Compile a validated half-tile path into ordered straights and elbows. Each bend declares a finite
 * entry/exit reach (compact .5 tile, swept 1 tile) that its neighbouring straights are trimmed by, so
 * the two elbow terminals are distinct and deleting a bend leaves a real gap. Reach is clamped to half
 * the shorter leg to keep adjacent bends valid; trimmed straights remain exact multiples of a half tile.
 */
export function compileRoute(path:Point[],routeId:string,alloc:PieceAllocator,elbow:WavePartDef=COMPACT_ELBOW):CompiledRoute{
 const vertices=simplifyPath(path);
 const legLen=(i:number)=>dist(vertices[i],vertices[i+1]);
 const canonical=partReach(elbow);
 const elbowAt=new Map<number,WavePiece>();
 for(let i=1;i<vertices.length-1;i++){
  const inDir=dirOf(vertices[i-1],vertices[i]),outDir=dirOf(vertices[i],vertices[i+1]);
  if(inDir===outDir)continue;
  const reach=Math.min(canonical,legLen(i-1)/2,legLen(i)/2);
  const turn:1|-1=((inDir+1)%4)===outDir?1:-1;
  elbowAt.set(i,{id:alloc(),part:elbow.id,version:elbow.version,category:'elbow',tier:elbow.tier,x:vertices[i].x,y:vertices[i].y,rotation:inDir,spans:2,turn,reach,condition:0,route:routeId});
 }
 const straightAt=new Map<number,WavePiece>();
 for(let i=0;i<vertices.length-1;i++){
  const a=vertices[i],b=vertices[i+1],rotation=dirOf(a,b),L=legLen(i);
  const trimIn=elbowAt.get(i)?.reach??0,trimOut=elbowAt.get(i+1)?.reach??0,len=L-trimIn-trimOut;
  if(len<1e-9)continue;
  const start={x:a.x+UNIT[rotation].x*trimIn,y:a.y+UNIT[rotation].y*trimIn};
  straightAt.set(i,{id:alloc(),part:BASIC_STRAIGHT.id,version:BASIC_STRAIGHT.version,category:'straight',tier:'basic',x:start.x,y:start.y,rotation,spans:len*2,turn:0,condition:0,route:routeId});
 }
 const ordered:WavePiece[]=[];
 for(let i=0;i<vertices.length-1;i++){const s=straightAt.get(i);if(s)ordered.push(s);const e=elbowAt.get(i+1);if(e)ordered.push(e);}
 const interfaces:WaveInterface[]=[];
 let previous:{node:string;port:number}|null=null;
 for(const piece of ordered){
  if(previous)interfaces.push({a:previous,b:{node:piece.id,port:0}});
  previous={node:piece.id,port:1};
 }
 const bom=ordered.reduce((sum,piece)=>{const def=partDef(piece.part,piece.version)!;sum.assemblies+=pieceCost(def,piece.spans);return sum;},{assemblies:0,crystal:0,precision:0});
 return {pieces:ordered,interfaces,bom,elbow};
}

/** Attach the two external entity ports to the first and last piece of a compiled route. */
export function bindEndpoints(compiled:CompiledRoute,a:Endpoint,b:Endpoint):WaveInterface[]{
 const first=compiled.pieces[0],last=compiled.pieces.at(-1);
 if(!first||!last)return [];
 return [{a,b:{node:first.id,port:0}},...compiled.interfaces,{a:{node:last.id,port:1},b}];
}

/** AABB of one piece's declared swept clearance, in tiles. */
export function pieceBox(piece:PiecePose):{x:number;y:number;w:number;h:number}{
 const pts=[{x:piece.x,y:piece.y}];
 if(piece.category==='straight'){const exit=rot({x:piece.spans/2,y:0},piece.rotation);pts.push({x:piece.x+exit.x,y:piece.y+exit.y});}
 else{const reach=piece.reach??(partDef(piece.part,piece.version)?.clearance.w??1)/2;pts.push({x:piece.x+UNIT[opposite(piece.rotation)].x*reach,y:piece.y+UNIT[opposite(piece.rotation)].y*reach});pts.push({x:piece.x+UNIT[exitDir(piece)].x*reach,y:piece.y+UNIT[exitDir(piece)].y*reach});}
 const margin=piece.category==='straight'?.5:.5;
 const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
 return {x:Math.min(...xs)-margin,y:Math.min(...ys)-margin,w:Math.max(...xs)-Math.min(...xs)+margin*2,h:Math.max(...ys)-Math.min(...ys)+margin*2};
}
const boxesOverlap=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number})=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

/** Swept-footprint validation: reject an obstructed bend or a run overlapping another physical route. */
export function sweptError(w:World,pieces:WavePiece[],excludeRoute?:string):string {
 const bodies:Body[]=w.entities.map(e=>({kind:e.kind,x:e.x,y:e.y,rotation:e.rotation}));
 for(const piece of pieces){
  if(piece.category==='elbow'){
   const reach=piece.reach??(partDef(piece.part,piece.version)?.clearance.w??1)/2;
   if(reach>.5+1e-9){
    // A compact bend stays within the routed centerline; only a larger swept template reaches into land
    // the centerline never touched. Sample the two runs and the outer corner of the turn.
    const inVec=UNIT[opposite(piece.rotation)],outVec=UNIT[exitDir(piece)];
    for(const v of [{x:inVec.x,y:inVec.y},{x:outVec.x,y:outVec.y},{x:inVec.x+outVec.x,y:inVec.y+outVec.y}]){const p={x:piece.x+v.x*reach,y:piece.y+v.y*reach};if(bodies.some(body=>inside(p,body)))return 'A swept bend would cut an obstruction';}
   }
  }
  if(piece.category!=='straight')continue;
  const [p0,p1]=piecePorts(piece);
  for(const other of w.pieces){
   if(other.category!=='straight'||other.route===piece.route||other.route===excludeRoute)continue;
   const [q0,q1]=piecePorts(other);
   if(parallelOverlap(p0,p1,q0,q1))return 'A route would share a parallel run with installed wave hardware';
  }
 }
 return '';
}
/** True when two cardinal straight centerlines are collinear and overlap by more than a tenth of a tile. */
function parallelOverlap(a0:{x:number;y:number},a1:{x:number;y:number},b0:{x:number;y:number},b1:{x:number;y:number}):boolean{
 const horizontal=(p:{x:number;y:number},q:{x:number;y:number})=>Math.abs(p.y-q.y)<1e-9;
 if(horizontal(a0,a1)&&horizontal(b0,b1)){
  if(Math.abs(a0.y-b0.y)>.1)return false;
  const [a,b]=[Math.min(a0.x,a1.x),Math.max(a0.x,a1.x)],[c,d]=[Math.min(b0.x,b1.x),Math.max(b0.x,b1.x)];
  return Math.min(b,d)-Math.max(a,c)>.1;
 }
 if(Math.abs(a0.x-a1.x)<1e-9&&Math.abs(b0.x-b1.x)<1e-9){
  if(Math.abs(a0.x-b0.x)>.1)return false;
  const [a,b]=[Math.min(a0.y,a1.y),Math.max(a0.y,a1.y)],[c,d]=[Math.min(b0.y,b1.y),Math.max(b0.y,b1.y)];
  return Math.min(b,d)-Math.max(a,c)>.1;
 }
 return false;
}

export interface FieldPreview {a:Endpoint;b:Endpoint;route:string;path:Point[];compiled:CompiledRoute;interfaces:WaveInterface[];error:string}
const fail=(a:Endpoint,b:Endpoint,route:string,error:string):FieldPreview=>({a,b,route,path:[],compiled:{pieces:[],interfaces:[],bom:{assemblies:0,crystal:0,precision:0},elbow:COMPACT_ELBOW},interfaces:[],error});
/** Radius at or above 1 selects the larger swept template; a compact route keeps its smaller footprint. */
const elbowFor=(radius:number|undefined):WavePartDef=>radius!==undefined&&radius>=1?(partDef('elbow-swept',1)??COMPACT_ELBOW):COMPACT_ELBOW;

/** Build a deterministic physical route preview: pieces, swept footprint and aggregate BOM, before any commit. */
export function previewFieldRoute(w:World,a:Endpoint,b:Endpoint,options:RouteOptions={}):FieldPreview {
 const route=`l${w.nextId}`;
 const ea=w.entities.find(e=>e.id===a.node),eb=w.entities.find(e=>e.id===b.node);
 if(!ea||!eb||a.node===b.node)return fail(a,b,route,'Choose two different machines');
 const pa=ports(ea,'field')[a.port],pb=ports(eb,'field')[b.port];
 if(!pa||!pb)return fail(a,b,route,'Select a compatible field port');
 if(options.diagonal)return fail(a,b,route,'New diagonal guide construction is unsupported');
 if(w.links.some(l=>l.type==='field'&&[l.a,l.b].some(p=>(p.node===a.node&&p.port===a.port)||(p.node===b.node&&p.port===b.port))))return fail(a,b,route,'Port occupied — disconnect its existing route first');
 const path=findRoute(pa,pb,w.entities,WIDTH,HEIGHT,options);
 if(!path)return fail(a,b,route,'No valid grid route: check clearance and port direction');
 let counter=0;const compiled=compileRoute(path,route,()=>`p${w.nextId+counter++}`,elbowFor(options.radius));
 const error=sweptError(w,compiled.pieces,route);
 if(error)return fail(a,b,route,error);
 return {a,b,route,path,compiled,interfaces:bindEndpoints(compiled,a,b),error:''};
}

/** Execute a previewed physical route as one transaction. Failure leaves stock, topology and IDs untouched. */
export function commitFieldRoute(w:World,preview:FieldPreview):string {
 if(preview.error)return preview.error;
 if(preview.compiled.pieces.length===0)return 'Nothing to install';
 const cost=preview.compiled.bom.assemblies;
 if(w.stock.assemblies<cost)return `Route requires ${cost} assemblies`;
 const routeId=w.links.some(l=>l.id===preview.route)?`l${w.nextId++}`:preview.route;
 const compiled=compileRoute(preview.path,routeId,()=>`p${w.nextId++}`,preview.compiled.elbow);
 for(const piece of compiled.pieces)piece.route=routeId;
 const interfaces=bindEndpoints(compiled,preview.a,preview.b);
 w.pieces.push(...compiled.pieces);
 w.links.push({id:routeId,type:'field',a:{...preview.a},b:{...preview.b},path:preview.path.map(p=>({...p})),diagonal:false,radius:preview.compiled.elbow.clearance.w>=2?1:.5,packets:[],pieces:compiled.pieces.map(p=>p.id),interfaces});
 w.stock.assemblies-=cost;
 return '';
}

/** Consume one manufactured part from inventory, or its buildable assembly cost. */
function installValue(w:World,def:WavePartDef):string {
 if(def.buildable){if(w.stock.assemblies<def.cost)return `Requires ${def.cost} assemblies`;w.stock.assemblies-=def.cost;return '';}
 const key=hardwareKey(def.id,def.version);
 if((w.hardware[key]??0)<1)return `No ${def.name} in inventory — manufacture one first`;
 w.hardware[key]!--;return '';
}
/** Healthy recovery returns the same item; damaged recovery follows the declared scrap rule. */
function recoverValue(w:World,def:WavePartDef,condition:number){
 if(condition===0){if(def.buildable)w.stock.assemblies+=def.cost;else w.hardware[hardwareKey(def.id,def.version)]=(w.hardware[hardwareKey(def.id,def.version)]??0)+1;return;}
 w.stock.scrap+=def.recovery.assemblies;w.stock.crystal+=def.recovery.crystal;
}

/** Replace one installed piece locally. IDs, endpoints and unchanged neighbours are preserved. */
export function replacePiece(w:World,pieceId:string,newPartId:string):string {
 const piece=w.pieces.find(p=>p.id===pieceId);if(!piece)return 'Select an installed piece';
 const def=partDef(newPartId,1);if(!def)return 'Unknown hardware definition';
 if(def.category!==piece.category)return `${def.name} cannot replace a ${piece.category}`;
 if(piece.part===def.id&&piece.version===def.version)return 'That hardware is already installed';
 const old=partDef(piece.part,piece.version)!;
 const candidate:WavePiece={...piece,part:def.id,version:def.version,tier:def.tier};
 const error=sweptError(w,[candidate],piece.route);
 if(error)return error;
 const consume=installValue(w,def);if(consume)return consume;
 recoverValue(w,old,piece.condition);
 Object.assign(piece,{part:def.id,version:def.version,tier:def.tier});
 return '';
}

/** Delete one piece locally; a gap opens the optical path. Rebuilding repairs only coincident interfaces. */
export function removePiece(w:World,pieceId:string):string {
 const piece=w.pieces.find(p=>p.id===pieceId);if(!piece)return 'Select an installed piece';
 const link=w.links.find(l=>l.pieces?.includes(pieceId));
 if(!link)return 'This piece has no installed route';
 if(link.pieces!.length<=1)return 'A route must keep at least one piece; delete the whole route instead';
 link.pieces=link.pieces!.filter(id=>id!==pieceId);
 link.interfaces=link.interfaces!.filter(i=>i.a.node!==pieceId&&i.b.node!==pieceId);
 recoverValue(w,partDef(piece.part,piece.version)!,piece.condition);
 const remaining=w.pieces.filter(p=>p.id!==pieceId);w.pieces=remaining;
 const ordered=link.pieces.map(id=>remaining.find(p=>p.id===id)).filter((p):p is WavePiece=>!!p);
 if(ordered.length)link.path=routePath(ordered);
 return '';
}

/** Recycle every piece of a removed route using the declared healthy/damaged recovery rule. */
export function recycleRoute(w:World,link:Connection){
 for(const id of link.pieces??[]){const piece=w.pieces.find(p=>p.id===id);if(!piece)continue;recoverValue(w,partDef(piece.part,piece.version)!,piece.condition);}
 const ids=new Set(link.pieces??[]);w.pieces=w.pieces.filter(p=>!ids.has(p.id));
}

export type {Connection};
