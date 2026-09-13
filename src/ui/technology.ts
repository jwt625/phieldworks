import {ProductionGraph} from './production-graph';
import {directUnlocks} from './production-data';
import type {World} from '../sim/world';
import {technologies,technologyById,visibleTechnologies,technologyState,isObserved,researchCost,packs,stages,lanes,type Technology} from './technology-data';

const columnWidth=260,rowHeight=160,cardWidth=214,cardHeight=112;
export class TechnologyPanel {
 private dialog:HTMLDialogElement;
 private full=false;
 private mode:'research'|'production'='research';
 private production:ProductionGraph;
 private selected='frontier';
 private scale=.85;
 constructor(private getWorld:()=>World,private opener:HTMLButtonElement){
  this.dialog=document.createElement('dialog');this.dialog.id='technology-panel';
  this.dialog.setAttribute('aria-labelledby','technology-title');
  this.dialog.innerHTML=`<div class="tech-heading"><div><span class="eyebrow">EXPEDITION / RESEARCH ROADMAP</span><h2 id="technology-title">From outpost to planetary instrument.</h2></div><button id="close-technology" aria-label="Close technology tree">×</button></div>
   <div class="tech-toolbar"><div class="tech-view-tools" role="group" aria-label="Progression view"><button id="view-research" aria-pressed="true">Research</button><button id="view-production" aria-pressed="false">Items & equipment</button></div><p>Inspect research unlocks, ingredient chains and production equipment.</p><button id="tech-dev-toggle" aria-pressed="false">Dev: full tree</button></div>
   <div class="tech-body"><section class="tech-map-section" aria-label="Technology dependency map"><div class="tech-legend"><span>✓ Available / observed</span><span>◇ Upcoming objective</span><span>⋯ Proposed research</span><span>Arrows require every incoming branch</span></div><div id="tech-viewport" tabindex="0" aria-label="Scrollable technology map. Tab to technologies; use arrow keys to scroll."><div id="tech-canvas"></div></div><div class="tech-map-footer"><span id="tech-count"></span><div><button id="tech-zoom-out" aria-label="Zoom out technology tree">−</button><output id="tech-zoom"></output><button id="tech-zoom-in" aria-label="Zoom in technology tree">+</button><button id="tech-fit">Fit tree</button></div></div></section><section id="tech-detail" aria-label="Selected technology details"></section></div><div class="tech-footnote">I Industrial → II Precision → III Systems · Costs are proposed totals per dossier type. Existing expedition tools are available now. Viewing this plan spends no resources.</div>`;
  document.body.append(this.dialog);
  this.production=new ProductionGraph(id=>{this.selected=id;this.mode='research';this.render();});
  this.dialog.querySelector('.tech-footnote')!.before(this.production.element);
  this.el('view-research').onclick=()=>{this.mode='research';this.render();};
  this.el('view-production').onclick=()=>{this.mode='production';this.render();};
  opener.setAttribute('aria-haspopup','dialog');opener.setAttribute('aria-controls',this.dialog.id);
  opener.onclick=()=>this.open();
  this.el('close-technology').onclick=()=>this.dialog.close();
  this.dialog.addEventListener('close',()=>{opener.setAttribute('aria-expanded','false');opener.focus();});
  this.dialog.addEventListener('click',e=>{const r=this.dialog.getBoundingClientRect();if(e.target===this.dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))this.dialog.close();});
  this.el('tech-dev-toggle').onclick=()=>{this.full=!this.full;this.scale=.85;if(!visibleTechnologies(this.getWorld(),this.full).some(t=>t.id===this.selected))this.selected='frontier';this.render();this.el('tech-viewport').scrollTo(0,0);if(this.mode==='production')this.production.show(visibleTechnologies(this.getWorld(),this.full),true);};
  this.el('tech-zoom-out').onclick=()=>this.zoom(this.scale-.15);
  this.el('tech-zoom-in').onclick=()=>this.zoom(this.scale+.15);
  this.el('tech-fit').onclick=()=>{const list=visibleTechnologies(this.getWorld(),this.full);this.zoom(Math.min(this.el('tech-viewport').clientWidth/this.width(list),this.el('tech-viewport').clientHeight/(4*rowHeight+65)));};
  this.dialog.addEventListener('click',e=>{const product=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-product]')?.dataset.product;if(product){this.mode='production';this.render();this.production.select(`product:${product}`);}const id=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-tech]')?.dataset.tech;if(id){this.selected=id;this.render();const node=this.dialog.querySelector<HTMLButtonElement>(`[data-tech-node="${id}"]`);node?.focus({preventScroll:true});node?.scrollIntoView({block:'nearest',inline:'nearest'});}});
 }
 private el(id:string){return this.dialog.querySelector<HTMLElement>(`#${id}`)!;}
 private width(list:Technology[]){return (Math.max(...list.map(t=>t.column))+1)*columnWidth+24;}
 private zoom(scale:number){this.scale=Math.max(.2,Math.min(1.3,scale));this.render();}
 open(){this.dialog.showModal();this.opener.setAttribute('aria-expanded','true');this.render();this.el('close-technology').focus();}
 private render(){
  const world=this.getWorld(),list=visibleTechnologies(world,this.full),ids=new Set(list.map(t=>t.id)),selected=technologyById.get(this.selected)!;
  this.dialog.querySelector<HTMLElement>(':scope > .tech-body')!.hidden=this.mode!=='research';
  this.production.element.hidden=this.mode!=='production';
  this.el('view-research').setAttribute('aria-pressed',String(this.mode==='research'));
  this.el('view-production').setAttribute('aria-pressed',String(this.mode==='production'));
  if(this.mode==='production')this.production.show(list);
  const width=this.width(list),height=4*rowHeight+65;
  this.el('tech-dev-toggle').setAttribute('aria-pressed',String(this.full));
  this.el('tech-dev-toggle').classList.toggle('active',this.full);
  this.el('tech-count').textContent=`${list.length} / ${technologies.length} technologies · ${this.full?'Full design':'Upcoming + research foundation'}`;
  this.el('tech-zoom').textContent=`${Math.round(this.scale*100)}%`;
  const paths=list.flatMap(t=>t.requires.filter(id=>ids.has(id)).map(id=>{
   const from=technologyById.get(id)!,x1=from.column*columnWidth+24+cardWidth,y1=from.lane*rowHeight+80+cardHeight/2,x2=t.column*columnWidth+24,y2=t.lane*rowHeight+80+cardHeight/2;
   const active=t.id===selected.id||id===selected.id;
   const channel=t.lane*rowHeight+70;
   const path=from.column===t.column?`M ${x2} ${y1} H ${x2-12} V ${y2} H ${x2-5}`:from.lane===t.lane&&t.column===from.column+1?`M ${x1} ${y1} H ${x2-5}`:`M ${x1} ${y1} H ${x1+12} V ${channel} H ${x2-12} V ${y2} H ${x2-5}`;
   return `<path class="${active?'selected':''}" d="${path}" marker-end="url(#tech-arrow${active?'-active':''})"/>`;
  })).join('');
  this.el('tech-canvas').style.width=`${width*this.scale}px`;this.el('tech-canvas').style.height=`${height*this.scale}px`;
  this.el('tech-canvas').innerHTML=`<div class="tech-scene" style="width:${width}px;height:${height}px;transform:scale(${this.scale})"><svg width="${width}" height="${height}" aria-hidden="true"><defs><marker id="tech-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#63746d"/></marker><marker id="tech-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#dfcd8e"/></marker></defs><g class="tech-edges">${paths}</g></svg>${stages.slice(0,Math.max(...list.map(t=>t.column))+1).map((label,i)=>`<div class="tech-stage" style="left:${i*columnWidth+24}px"><b>${String(i).padStart(2,'0')}</b> ${label}</div>`).join('')}${lanes.map((label,i)=>`<div class="tech-lane" style="top:${i*rowHeight+58}px;width:${width}px">${label}</div>`).join('')}${list.map(t=>`<button class="tech-node ${isObserved(t,world)?'observed':t.observed?'objective':'proposal'} ${t.id===this.selected?'selected':''}" data-tech="${t.id}" data-tech-node="${t.id}" aria-pressed="${t.id===this.selected}" style="left:${t.column*columnWidth+24}px;top:${t.lane*rowHeight+80}px"><span class="tech-node-status">${isObserved(t,world)?'✓':t.observed?'◇':'⋯'} ${technologyState(t,world)}</span><strong>${t.name}</strong><small>${t.cost?`${t.cost.units} × ${t.cost.packs.map(p=>({industrial:'I',precision:'II',systems:'III'})[p]).join(' + ')}`:t.kind==='supplied'?'EXPEDITION KIT':t.observed?'FIELD MILESTONE':'PROJECT'}</small></button>`).join('')}</div>`;
  this.el('tech-detail').innerHTML=`<span class="eyebrow">${technologyState(selected,world).toUpperCase()}</span><h3>${selected.name}</h3><p>${selected.summary}</p><h4>Recipes, equipment & capabilities · ${directUnlocks(selected.id).length}</h4><div class="production-links">${directUnlocks(selected.id).map(p=>`<button data-product="${p.id}">${p.name} <small>↗ ${p.type}</small></button>`).join('')}</div><h4>Prerequisites · all required</h4><div class="tech-prerequisites">${selected.requires.map(id=>`<button data-tech="${id}">${isObserved(technologyById.get(id)!,world)?'✓ ':''}${technologyById.get(id)!.name}</button>`).join('')||'<p>Expedition starting capability.</p>'}</div><h4>Completion condition</h4><p>${selected.condition}</p><h4>${selected.cost?'Research cost':'Acquisition'}</h4><p>${researchCost(selected)}</p>${selected.cost?`<p>${selected.cost.units*selected.cost.seconds} laboratory-seconds at speed 1. Each research unit consumes one of every listed dossier. More supplied laboratories share the work.</p>${selected.cost.packs.map(p=>`<div class="tech-recipe"><b>${packs[p].name}</b><p>${packs[p].recipe}<br>${packs[p].producer} · unlocked by ${technologyById.get(packs[p].unlockedBy)!.name}</p></div>`).join('')}`:''}<h4>Planned visual work</h4><p>${selected.art}</p><p class="tech-design-note">${selected.observed?'Progress reflects the current save. Permanent milestone history is planned with the research system.':selected.kind==='supplied'?'Implemented in the current prototype.':'Design proposal awaiting review. Research, recipes and unlock gates in this entry are planned.'}</p>`;
 }
}
