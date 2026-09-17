import registration from '../assets/production/pass-07/runtime-clips.json';
import pass08 from '../assets/production/pass-08/runtime-clips.json';
import type {EquipmentState} from './equipment-state';
import type {Kind} from './sim/world';
import type {Rotation} from './sim/geometry';

const clips=[...registration.clips,...pass08.clips];

/** Recipe motion uses simulation progress, so pausing never advances the mechanism. */
export function recipeFrame(progress:number,period:number,frames:number,reducedMotion=false){
 return reducedMotion?0:Math.min(frames-1,Math.max(0,Math.floor(progress/period*frames)));
}

/** Explicit prototype promotion: other directions retain their existing drawn views. */
export function equipmentAnimation(
 e:{kind:Kind;rotation:Rotation;progress?:number}, state:EquipmentState|undefined,
 time:number, reducedMotion=false,
) {
 const clip=clips.find(c=>c.kind===e.kind&&c.rotation===e.rotation&&c.condition===(state?.condition??0));
 if(!clip||state?.condition===3)return undefined;
 // Keep the dark condition source for unpowered/tripped service equipment.
 if(['generator','sentry','reference','dump'].includes(e.kind)&&state&&!state.powered)return undefined;
 let frame=0;
 if(!reducedMotion){
  if(e.kind==='extractor'||e.kind==='assembler'){
   const period=e.kind==='extractor'?.65:1.4;
   frame=recipeFrame(e.progress??0,period,clip.frames.length);
  }else if(e.kind==='generator'&&state?.moving)frame=Math.floor(time*8)%clip.frames.length;
  else if(e.kind==='sentry'&&state?.work==='firing')frame=Math.floor((state.shotAge??0)/.04)%3;
  // Reference stabilizer follows actual source field activity; idle holds a stable pose.
  else if(e.kind==='reference'&&state?.field)frame=Math.floor(time*1.5)%clip.frames.length;
  // Dump fans spin only under powered cooling; idle or UNCOOLED holds frame zero.
  else if(e.kind==='dump'&&state?.moving)frame=Math.floor(time*6)%clip.frames.length;
 }
 return {clip,frame};
}
