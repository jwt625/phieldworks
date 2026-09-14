/** Explicit pause ownership so closing a modal never resumes a user-paused game. */
export class PauseState {
 private reasons=new Set<string>();
 get paused(){return this.reasons.size>0;}
 set(reason:string,on:boolean){if(on)this.reasons.add(reason);else this.reasons.delete(reason);}
 has(reason:string){return this.reasons.has(reason);}
 clear(){this.reasons.clear();}
}
export const PAUSE={user:'user',hidden:'hidden',modal:'modal'} as const;
