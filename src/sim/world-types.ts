import type {Complex} from './complex';
import type {Kind} from './definitions';
import type {Point, Rotation, Transport} from './geometry';
import type {Endpoint, NetworkResult} from './network';

/** Shared simulation constants. Kept runtime-free so persistence and ecology can import types without the world façade. */
export const WIDTH = 64, HEIGHT = 36, DT = .1;
/** Provisional scale guards. See README deliberate limits; large-factory performance is unbenchmarked. */
export const MACHINE_LIMIT = 120, LINK_LIMIT = 512;
/** Per-wire provisional capacity; a single load never exceeds it today. Real buses await power poles. */
export const WIRE_CAPACITY = 240;
/** Bounded retained process lots so untrusted saves cannot allocate unbounded arrays. */
export const LOT_LIMIT = 1000;

export interface Entity {id:string;kind:Kind;x:number;y:number;rotation:Rotation;phase:number;temperature:number;health:number;tripped:boolean;protection:boolean;ore:number;progress:number;powered:boolean}
export interface Connection {id:string;a:Endpoint;b:Endpoint;type:Transport;path:Point[];diagonal:boolean;radius:number;packets:number[]}
export interface Deposit {id:string;x:number;y:number;w:number;h:number;remaining:number;kind:'ore'|'crystal'}
export interface Blueprint {entities:Entity[];links:Connection[];width:number;height:number}

export interface Creature extends Point {id:string;health:number;state:'patrol'|'investigate'|'attack'|'flee';heading:number;target:Point;exposure:number}
export interface Ecology {creatures:Creature[];defenseReady:boolean;grace:number;threat:number;shots:{from:Point;to:Point;ttl:number}[]}

export interface ZoneReading {useful:number;guard:number;captured:number}
export interface TargetReading extends ZoneReading {emitters:number}

export interface Stats {network:NetworkResult;targetPower:number;targets:Record<string,TargetReading>;protectiveAbsorption:number;offTarget:number;radiated:number;heat:number;leaked:number;supply:number;demand:number;overload:number;wireOverload:number;controlCursor:number;bendRadiation:number;propagationLoss:number;error:string;emitterFields:Record<string,Record<string,Complex>>}

/** A delivery target. Frontier armour health lives here because it is authoritative progress, not a derived field reading. */
export type TargetKind = 'frontier' | 'process';
export interface Target {
  id:string;
  kind:TargetKind;
  owner:string|null;
  x:number;
  y:number;
  health:number;
  emitters:string[];
  contract:string|null;
}

/** A source entity's coherence identity. Sources default to their own group; sharing a group is explicit. */
export interface ReferenceBinding {id:string;source:string;group:string}

export type ControlObjective = 'target-power' | 'useful-minus-guard';
export interface ControlDomain {
  id:string;
  name:string;
  target:string;
  reference:string|null;
  sensor:string|null;
  tuners:string[];
  enabled:boolean;
  objective:ControlObjective;
  cursor:number;
}

export type QualificationStatus = 'idle' | 'testing' | 'qualified' | 'failed' | 'stale';
export interface Qualification {
  id:string;
  domain:string;
  target:string;
  status:QualificationStatus;
  signature:string;
  elapsed:number;
  /** Measured minimum during a test; -1 means no sample has been taken yet. */
  minimum:number;
  counters:number;
  dependencies:string[];
  reason:string;
  code:string;
}

export type LotKind = 'reject' | 'scrap';
export interface ProcessLot {
  id:string;
  kind:LotKind;
  recipe:string;
  version:number;
  parent:string;
  assemblies:number;
  crystal:number;
  disposition:'recoverable' | 'spent';
}
export interface ProcessInventory {accepted:number;lots:ProcessLot[]}

export interface World {
  version:4;
  ecology:Ecology;
  time:number;
  nextId:number;
  entities:Entity[];
  links:Connection[];
  deposits:Deposit[];
  stock:{assemblies:number;crystal:number;scrap:number};
  produced:number;
  targets:Target[];
  references:ReferenceBinding[];
  domains:ControlDomain[];
  qualifications:Qualification[];
  process:ProcessInventory;
  frontier:boolean;
  revision:number;
  statsRevision:number;
  blueprint:Blueprint|null;
  events:{time:number;text:string}[];
  stats:Stats;
}
