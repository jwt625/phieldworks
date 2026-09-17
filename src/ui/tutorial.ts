import {frontierDomain,type World,type Kind} from '../sim/world';
export interface TutorialContext {world:World;selection:string|null;cameraMoved:boolean;tool:string;build:Kind|null;diagnosticsOpen:boolean}
interface Lesson {text:string;anchor:string;focus?:{x:number;y:number};done:(c:TutorialContext)=>boolean}
const lessons:Lesson[]=[
 {text:'Welcome — your outpost is already producing. Next tours the controls.',anchor:'#objective-toggle',done:()=>true},
 {text:'Wheel zooms at the pointer; drag or arrows pan; Home recenters.',anchor:'#minimap-toggle',done:c=>c.cameraMoved},
 {text:'Select the ferrous deposit west of the outpost.',anchor:'#tool-select',focus:{x:10,y:15},done:c=>c.selection==='reserve'||c.selection==='starter'},
 {text:'Select the assembler to read its ports and power.',anchor:'#tool-select',focus:{x:13,y:10},done:c=>c.selection==='e3'},
 {text:'Build and wire a perimeter sentry near (22, 10).',anchor:'#build-palette',done:c=>c.world.ecology.defenseReady},
 {text:'Build a phase tuner near (17, 12).',anchor:'#build-palette',done:c=>c.world.entities.some(e=>e.kind==='tuner')},
 {text:'Build a field emitter and wire it to the power bus.',anchor:'#tool-power',done:c=>c.world.entities.filter(e=>e.kind==='emitter'&&e.powered).length>=2},
 {text:'Field-link junction D → tuner → second emitter.',anchor:'#tool-field',done:c=>{const t=c.world.entities.find(e=>e.kind==='tuner');return !!t&&c.world.links.filter(l=>l.type==='field'&&(l.a.node===t.id||l.b.node===t.id)).length===2;}},
 {text:'Open Diagnostics and read any active issue.',anchor:'#issues',done:c=>c.diagnosticsOpen},
 {text:'Tune phase above 32 units or enable automatic control.',anchor:'#objective-toggle',done:c=>frontierDomain(c.world)?.enabled===true&&c.world.frontier},
 {text:'Run the acceptance test, then record the blueprint.',anchor:'#objective-toggle',done:c=>!!c.world.blueprint},
 {text:'Optional: build a precision cell (fabrication cell) and run its test.',anchor:'#build-palette',done:()=>true}
];
const key='phieldworks.tutorial.v1';
export class Tutorial {
 index=0;active=true;private started=false;private cache='';private panel:HTMLElement;
 constructor(private focus:(x:number,y:number)=>void){try{const saved=JSON.parse(localStorage.getItem(key)??'null');if(saved){this.active=!saved.closed;this.index=Number.isInteger(saved.index)?Math.max(0,Math.min(lessons.length-1,saved.index)):0;this.started=!!saved.started||this.index>0;}}catch{}
 this.panel=document.createElement('section');this.panel.id='tutorial';this.panel.setAttribute('aria-label','Outpost tutorial');document.body.append(this.panel);
 this.panel.addEventListener('click',e=>{const a=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-tutorial]')?.dataset.tutorial;
  if(a==='start'){this.started=true;this.cache='';this.save();}
  if(a==='skip'){this.active=false;this.save();this.clear();}
  if(a==='next'){if(this.index===lessons.length-1){this.active=false;this.clear();}else this.index++;this.save();this.cache='';}
  if(a==='back'){this.index=Math.max(0,this.index-1);this.cache='';this.save();}
  if(a==='focus'){const f=lessons[this.index].focus;if(f)this.focus(f.x,f.y);}});
 }
 private save(){try{localStorage.setItem(key,JSON.stringify({closed:!this.active,index:this.index,started:this.started}));}catch{}}
 private clear(){document.querySelectorAll('.tutorial-target').forEach(el=>el.classList.remove('tutorial-target'));this.panel.hidden=!this.active;}
 replay(){this.active=true;this.index=0;this.started=true;this.cache='';this.save();}
 private invite(){return `<div class="tutorial-invite"><span>Take the guided tour?</span><button data-tutorial="start" class="primary">Start</button><button data-tutorial="skip">Skip</button></div>`;}
 update(c:TutorialContext){this.panel.hidden=!this.active;if(!this.active)return;
  if(this.index===0&&!this.started){const cache='invite';if(cache!==this.cache){this.clear();this.cache=cache;this.panel.className='invite';this.panel.innerHTML=this.invite();const w=this.panel.offsetWidth,h=this.panel.offsetHeight,statusBottom=document.querySelector('.status-bar')?.getBoundingClientRect().bottom??40;this.panel.style.left=`${Math.max(12,Math.round((window.innerWidth-w)/2))}px`;this.panel.style.top=`${Math.round(statusBottom+12)}px`;}return;}
  const l=lessons[this.index],done=l.done(c),cache=`${this.index}/${done}`;if(cache!==this.cache){this.cache=cache;this.panel.className='';this.panel.innerHTML=`<div class="tutorial-heading"><span>OUTPOST ORIENTATION · ${this.index+1}/${lessons.length}</span><button data-tutorial="skip" aria-label="Skip tutorial">×</button></div><p>${l.text}</p><div class="button-row"><button data-tutorial="back" ${this.index===0?'disabled':''}>Back</button>${l.focus?'<button data-tutorial="focus">Show area</button>':''}<button class="primary" data-tutorial="next" ${!done?'disabled':''}>${this.index===lessons.length-1?'Finish':done?'Next →':'Complete step'}</button></div>`;}
  const anchor=document.querySelector<HTMLElement>(l.anchor);if(anchor){anchor.classList.add('tutorial-target');const r=anchor.getBoundingClientRect(),w=Math.min(280,window.innerWidth-24),h=this.panel.offsetHeight,drawer=document.querySelector<HTMLElement>('#inspector-drawer'),drawerW=drawer&&!drawer.hidden?drawer.getBoundingClientRect().width:0,availRight=window.innerWidth-drawerW,minTop=(document.querySelector('.status-bar')?.getBoundingClientRect().bottom??0)+8;let left=r.left,top=r.bottom+10;if(top+h>window.innerHeight-10)top=r.top-h-10;if(['#build-palette','#objective-toggle','#minimap-toggle'].includes(l.anchor)){left=Math.max(10,r.left);top=r.bottom+10;if(top+h>window.innerHeight-10)top=r.top-h-10;}this.panel.style.left=`${Math.max(12,Math.min(availRight-w-12,left))}px`;this.panel.style.top=`${Math.max(minTop,Math.min(window.innerHeight-h-8,top))}px`;}
 }
}
