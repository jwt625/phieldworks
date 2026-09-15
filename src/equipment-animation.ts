import registration from '../assets/production/pass-07/runtime-clips.json';
import type {EquipmentState} from './equipment-state';
import type {Kind} from './sim/world';
import type {Rotation} from './sim/geometry';

/** Explicit prototype promotion: other directions retain their existing drawn views. */
export function equipmentAnimation(
 e:{kind:Kind;rotation:Rotation;progress?:number}, state:EquipmentState|undefined,
 time:number, reducedMotion=false,
) {
 const clip=registration.clips.find(c=>c.kind===e.kind&&c.rotation===e.rotation&&c.condition===(state?.condition??0));
 if(!clip||state?.condition===3)return undefined;
 // Keep the dark condition source for unpowered/tripped service equipment.
 if((e.kind==='generator'||e.kind==='sentry')&&state&&!state.powered)return undefined;
 let frame=0;
 if(!reducedMotion){
  if(e.kind==='extractor'||e.kind==='assembler'){
   const period=e.kind==='extractor'?.65:1.4;
   frame=Math.min(clip.frames.length-1,Math.max(0,Math.floor((e.progress??0)/period*clip.frames.length)));
  }else if(e.kind==='generator'&&state?.moving)frame=Math.floor(time*8)%clip.frames.length;
  else if(e.kind==='sentry'&&state?.work==='firing')frame=Math.floor((state.shotAge??0)/.04)%3;
 }
 return {clip,frame};
}
