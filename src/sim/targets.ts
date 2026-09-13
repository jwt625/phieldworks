import {add, c, mul, polar, power, sub, type Complex} from './complex';
import type {ZoneReading} from './world-types';

/** Current emitter model constants: amplitude reflection and absorbed-to-radiated fraction. */
export const REFLECTANCE = .08, RADIATION_EFFICIENCY = .92;
/** Free-space coupling surrogate in game units; the distance coefficients are not an atmosphere or diffraction model. */
export function captureEfficiency(distance:number){return Math.min(.88, 50/(distance*distance+30));}
/** Coupled per-emitter field x[e,g] used by both the frontier single-mode and process two-mode projections. */
export function coupledField(incident:Complex,distance:number):Complex{return mul(incident,polar(Math.sqrt((1-REFLECTANCE*REFLECTANCE)*RADIATION_EFFICIENCY*captureEfficiency(distance)),distance*.23));}

/** Frontier projection: the historical single-mode coherent sum with n = max(2, assigned emitter count). */
export function projectFrontier(groups:Record<string,Complex[]>,emitters:number):ZoneReading{
 const n=Math.max(2,emitters);let useful=0;
 for(const xs of Object.values(groups)){if(!xs.length)continue;const sum=xs.reduce((a,b)=>add(a,b),c(0));useful+=power(sum)/n;}
 return {useful,guard:0,captured:useful};
}

/**
 * Process projection: an orthonormal two-mode surrogate. Amplitudes interfere within a group and group
 * powers add, so P_useful + P_guard = sum of coupled powers regardless of relative phase. For the standard
 * two-emitter recipe this reduces to u = (x0+x1)/sqrt(2) and v = (x0-x1)/sqrt(2).
 */
export function projectTwoZone(groups:Record<string,Complex[]>):ZoneReading{
 let useful=0,guard=0;
 for(const xs of Object.values(groups)){
  const n=xs.length;if(!n)continue;
  const sum=xs.reduce((a,b)=>add(a,b),c(0)),mean=mul(sum,c(1/n));
  useful+=power(sum)/n;
  for(const x of xs)guard+=power(sub(x,mean));
 }
 return {useful,guard,captured:useful+guard};
}
