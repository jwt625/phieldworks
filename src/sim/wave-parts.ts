import {c, type Complex} from './complex';

/**
 * R-01 physical wave hardware: versioned definitions, explicit geometry and ports, passive
 * scattering coefficients, inventory recipes and recovery rules.
 *
 * Conventions (non-negotiable contract, 029):
 * - Port order is the terminal ordering. Port 0 is the local "entry" port on a two-port part.
 * - A link gain carries phase e^{i phi}; the scattering entry S_ij maps an incident field at
 *   terminal j to the outgoing field at terminal i. Amplitudes are game units, power = |a|^2.
 * - Every definition must be passive for arbitrary simultaneous inputs, not only unit
 *   excitation at one port. `isPassive` checks the largest singular value of the whole matrix.
 * - A zero reflection displays as infinity (open return loss); never report RL on a dark port.
 */

export type WavePartCategory = 'straight' | 'elbow' | 'junction' | 'crossing';
export type WavePartTier = 'basic' | 'precision';

/** Local, rotation-0 port geometry. `dir` is the outward normal: 0=+x, 1=+y, 2=-x, 3=-y. */
export interface WavePartPort {x:number; y:number; dir:0|1|2|3}
/**
 * Frozen prototype connector interface (032). One shared cross section so a straight, elbow,
 * junction or crossing mate edge-to-edge: centered on the port, width in tiles, no end cap.
 * Runtime physics stays authoritative; this is the geometry template asset production registers to.
 */
export const GUIDE_INTERFACE={width:.24, plane:0} as const;
export function connectorInterface(port:WavePartPort){return {center:{x:port.x,y:port.y},normal:port.dir,width:GUIDE_INTERFACE.width,plane:GUIDE_INTERFACE.plane};}

export interface WaveRecipe {
  id:string;
  version:number;
  inputs:{assemblies:number; crystal:number; precision:number};
  seconds:number;
}

export interface WavePartDef {
  id:string;
  version:number;
  name:string;
  category:WavePartCategory;
  tier:WavePartTier;
  /** Swept clearance bounding box in tiles at rotation 0, extending +x/+y from the anchor. */
  clearance:{w:number; h:number};
  /** Reflection amplitude at a terminal (power fraction is the square). Zero means RL infinity. */
  reflectance:number;
  /** Intended excess loss as a power fraction (scattering radiation, not component heat). */
  loss:number;
  /** Straights only: amplitude attenuation per tile of run. */
  attenuationPerTile?:number;
  /** Junctions only: hybrid split angle in radians (pi/4 is balanced). */
  split?:number;
  /** Starter parts build directly from assemblies. Precision parts are manufactured. */
  buildable:boolean;
  /** Assembly cost of a buildable piece (or per span for a straight). */
  cost:number;
  /** Assembles per half-tile interval for straights. */
  costPerSpan?:number;
  /** Manufacture recipe for a precision part; null when buildable. */
  recipe:WaveRecipe|null;
  /** Declared recovery: healthy recovery returns the item; damaged recovery yields this scrap. */
  recovery:{assemblies:number; crystal:number};
}

const def=(part:WavePartDef):WavePartDef=>part;

export const BASIC_STRAIGHT=def({id:'straight-basic',version:1,name:'Basic straight',category:'straight',tier:'basic',clearance:{w:2,h:1},reflectance:.005,loss:0,attenuationPerTile:.006,buildable:true,cost:1,costPerSpan:1,recipe:null,recovery:{assemblies:0,crystal:0}});
export const COMPACT_ELBOW=def({id:'elbow-compact',version:1,name:'Compact elbow',category:'elbow',tier:'basic',clearance:{w:1,h:1},reflectance:.10,loss:.09,buildable:true,cost:3,recipe:null,recovery:{assemblies:0,crystal:0}});
export const SWEPT_ELBOW=def({id:'elbow-swept',version:1,name:'Swept elbow',category:'elbow',tier:'basic',clearance:{w:2,h:2},reflectance:.05,loss:.03,buildable:true,cost:4,recipe:null,recovery:{assemblies:0,crystal:0}});
export const BASIC_JUNCTION=def({id:'junction-basic',version:1,name:'Basic four-port junction',category:'junction',tier:'basic',clearance:{w:2,h:2},reflectance:0,loss:.12,split:Math.PI/4+.14,buildable:true,cost:5,recipe:null,recovery:{assemblies:0,crystal:0}});
export const BASIC_CROSSING=def({id:'crossing-basic',version:1,name:'Two-layer crossing',category:'crossing',tier:'basic',clearance:{w:2,h:2},reflectance:.04,loss:.02,buildable:true,cost:6,recipe:null,recovery:{assemblies:0,crystal:0}});
export const PRECISION_ELBOW=def({id:'elbow-precision',version:1,name:'Precision elbow',category:'elbow',tier:'precision',clearance:{w:1,h:1},reflectance:.045,loss:.012,buildable:false,cost:0,recipe:{id:'manufacture-elbow-precision',version:1,inputs:{assemblies:4,crystal:1,precision:2},seconds:5},recovery:{assemblies:1,crystal:0}});
export const MATCHED_JUNCTION=def({id:'junction-matched',version:1,name:'Matched junction',category:'junction',tier:'precision',clearance:{w:2,h:2},reflectance:0,loss:.02,split:Math.PI/4,buildable:false,cost:0,recipe:{id:'manufacture-junction-matched',version:1,inputs:{assemblies:6,crystal:1,precision:3},seconds:6},recovery:{assemblies:2,crystal:0}});

export const WAVE_PART_DEFS:WavePartDef[]=[BASIC_STRAIGHT,COMPACT_ELBOW,SWEPT_ELBOW,BASIC_JUNCTION,BASIC_CROSSING,PRECISION_ELBOW,MATCHED_JUNCTION];

export function partDef(id:string,version:number):WavePartDef|undefined{return WAVE_PART_DEFS.find(p=>p.id===id&&p.version===version);}
export function partById(id:string):WavePartDef|undefined{const matches=WAVE_PART_DEFS.filter(p=>p.id===id);return matches.length?matches.reduce((a,b)=>b.version>a.version?b:a):undefined;}
export function partsByCategory(category:WavePartCategory):WavePartDef[]{return WAVE_PART_DEFS.filter(p=>p.category===category);}

/** Declared canonical bend reach in tiles (P9): compact/precision .5, swept 1. */
export function partReach(part:WavePartDef):number{return part.category==='elbow'?part.clearance.w/2:0;}
/** Local, rotation-0 ports. Straights scale the exit run with their half-tile span; bends declare finite entry/exit runs. */
export function partPorts(part:WavePartDef,spans=2,reach=partReach(part)):WavePartPort[]{
 if(part.category==='straight')return [{x:0,y:0,dir:2},{x:spans/2,y:0,dir:0}];
 if(part.category==='elbow')return [{x:-reach,y:0,dir:2},{x:0,y:reach,dir:1}];
 return [{x:0,y:0,dir:2},{x:0,y:1,dir:1},{x:2,y:1,dir:0},{x:2,y:0,dir:3}];
}

const TAU=Math.SQRT1_2;
/** Lossless balanced/imbalanced four-port hybrid. split=pi/4 reduces to the historical junction. */
export function hybridMatrix(split:number):Complex[][]{const co=Math.cos(split),si=Math.sin(split);return [[c(0),c(0),c(co),c(si)],[c(0),c(0),c(si),c(-co)],[c(co),c(si),c(0),c(0)],[c(si),c(-co),c(0),c(0)]];}
export const IDEAL_HYBRID:Complex[][]=hybridMatrix(Math.PI/4);

/**
 * Build the passive scattering matrix for one installed instance. All constructions keep every
 * singular value <= 1 by construction; `isPassive` is still asserted in tests and at definition time.
 */
export function partScattering(part:WavePartDef,spans=2):Complex[][]{
 const r=part.reflectance, loss=part.loss;
 if(part.category==='straight'){
  const t=Math.sqrt(Math.max(0,(1-r*r)*Math.exp(-2*(part.attenuationPerTile??0)*(spans/2))));
  return [[c(r),c(t)],[c(t),c(-r)]];
 }
 if(part.category==='elbow'){
  const t=Math.sqrt(Math.max(0,1-r*r-loss));
  return [[c(r),c(t)],[c(t),c(-r)]];
 }
 if(part.category==='junction'){
  const scale=Math.sqrt(Math.max(0,1-loss));
  return hybridMatrix(part.split??Math.PI/4).map(row=>row.map(v=>c(v[0]*scale,v[1]*scale)));
 }
 const t=Math.sqrt(Math.max(0,1-r*r-loss));
 return [[c(r),c(0),c(t),c(0)],[c(0),c(r),c(0),c(t)],[c(t),c(0),c(-r),c(0)],[c(0),c(t),c(0),c(-r)]];
}

/** Largest singular value by deterministic power iteration; used to reject non-passive definitions. */
export function largestSingularValue(s:Complex[][]):number{
 const n=s.length;let v=Array.from({length:n},()=>c(1/Math.sqrt(n)));
 for(let iter=0;iter<80;iter++){
  const w=Array.from({length:n},()=>c(0));
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=s[i][j];w[i]=[w[i][0]+a[0]*v[j][0]-a[1]*v[j][1],w[i][1]+a[0]*v[j][1]+a[1]*v[j][0]];}
  const norm=Math.sqrt(w.reduce((sum,z)=>sum+z[0]*z[0]+z[1]*z[1],0));if(norm<1e-300)return 0;v=w.map(z=>c(z[0]/norm,z[1]/norm));
 }
 const sv=Array.from({length:n},()=>c(0));
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=s[i][j];sv[i]=[sv[i][0]+a[0]*v[j][0]-a[1]*v[j][1],sv[i][1]+a[0]*v[j][1]+a[1]*v[j][0]];}
 return Math.sqrt(sv.reduce((sum,z)=>sum+z[0]*z[0]+z[1]*z[1],0));
}
export function isPassive(s:Complex[][],tolerance=1e-9):boolean{return largestSingularValue(s)<=1+tolerance;}

/** Reflection amplitude as return loss in dB, or Infinity for a matched (dark) port. */
export function returnLossDb(reflectance:number):number{return reflectance<=0?Infinity:-20*Math.log10(reflectance);}
/** Insertion loss in dB for an amplitude transmission, or Infinity when the path is dark. */
export function insertionLossDb(transmission:number):number{return transmission<=0?Infinity:-20*Math.log10(transmission);}

/** R-01 starter BOM/resource budget with a recovery reserve and no advanced-item dependency. */
export const STARTER_BUDGET={assemblies:28, crystal:0, precision:0, recoveryReserve:6};
/** The first accepted cycle unlocks exactly these two hardware recipes. */
export const UNLOCKED_RECIPES=[PRECISION_ELBOW.recipe,MATCHED_JUNCTION.recipe].filter((r):r is WaveRecipe=>!!r);
