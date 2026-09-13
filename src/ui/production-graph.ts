import {technologies,technologyById,researchCost,type Technology} from './technology-data';
import {products,productById,dependencyEdges,productKey,technologyKey,recipeText,directUnlocks,consumers,outputs,type Product,type Relation,type DependencyEdge} from './production-data';

const relationNames:Record<Relation,string>={unlocks:'Unlocks recipe',ingredient:'Ingredient consumed',produces:'Produced in / extracted by',service:'Operating service',science:'Science consumed',milestone:'Milestone condition',prerequisite:'Research prerequisite'};
const colors:Record<Relation,string>={unlocks:'#c7a0ed',ingredient:'#e6bd6d',produces:'#71c8cc',service:'#8bc493',science:'#edabb9',milestone:'#e5e1bc',prerequisite:'#9aa9aa'};
interface GraphNode {key:string;name:string;technology:Technology;product?:Product;x:number;y:number}
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export class ProductionGraph {
 readonly element:HTMLElement;
 private allowed=new Set<string>();
 private selected=productKey('assembly');
 private scope:'all'|'chain'|'recipe'='recipe';
 private scale=.85;
 private edges=dependencyEdges();
 private services=true;
 constructor(private onTechnology:(id:string)=>void){
  this.element=document.createElement('section');this.element.id='production-panel';this.element.hidden=true;
  this.element.innerHTML=`<div class="production-controls"><label>Find technology, item or equipment <input id="production-search" type="search" placeholder="e.g. photonic module" autocomplete="off"></label><div id="production-results" aria-label="Search results"></div><label>Show <select id="production-scope"><option value="recipe">Selected recipe & uses</option><option value="chain">Complete ingredient ancestry</option><option value="all">All visible connections</option></select></label><label><input id="production-services" type="checkbox" checked> Machines & services</label></div><div class="tech-body"><section class="tech-map-section"><div class="tech-legend production-legend">${(['unlocks','ingredient','produces','service','science','milestone'] as Relation[]).map(r=>`<span style="--edge-color:${colors[r]}">${relationNames[r]}</span>`).join('')}</div><div id="production-viewport" tabindex="0" aria-label="Scrollable production dependency graph"><div id="production-canvas"></div></div><div class="tech-map-footer"><span id="production-count"></span><div><button id="production-minus" aria-label="Zoom out production graph">−</button><output id="production-zoom"></output><button id="production-plus" aria-label="Zoom in production graph">+</button><button id="production-fit">Fit graph</button></div></div></section><section id="production-detail" aria-label="Item and equipment details"></section></div>`;
  this.el('production-scope').onchange=e=>{this.scope=(e.target as HTMLSelectElement).value as 'all'|'chain'|'recipe';this.draw();};
  this.el('production-services').onchange=e=>{this.services=(e.target as HTMLInputElement).checked;this.draw();};
  this.el('production-minus').onclick=()=>{this.scale=Math.max(.15,this.scale-.15);this.draw();};
  this.el('production-plus').onclick=()=>{this.scale=Math.min(1.4,this.scale+.15);this.draw();};
  this.el('production-fit').onclick=()=>{const {width,height}=this.layout();this.scale=Math.max(.08,Math.min(1,this.el('production-viewport').clientWidth/width,this.el('production-viewport').clientHeight/height));this.draw();};
  this.el('production-search').oninput=()=>this.search();
  this.element.addEventListener('click',e=>{
   const target=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-production]');
   if(target){this.select(target.dataset.production!);this.el('production-results').innerHTML='';(this.el('production-search') as HTMLInputElement).value='';}
   const tech=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-research]')?.dataset.openResearch;
   if(tech)this.onTechnology(tech);
  });
 }
 private el(id:string){return this.element.querySelector<HTMLElement>(`#${id}`)!;}
 show(allowed:Technology[],reset=false){this.allowed=new Set(allowed.map(t=>t.id));if(!this.allNodes().some(n=>n.key===this.selected))this.selected=productKey('assembly');if(reset){this.scope='all';this.scale=.7;}this.draw();}
 select(key:string){if(!this.allNodes().some(n=>n.key===key))return;this.selected=key;this.scope='recipe';this.scale=.85;this.draw();const node=this.element.querySelector<HTMLButtonElement>(`[data-graph-node="${key}"]`);node?.focus({preventScroll:true});node?.scrollIntoView({block:'nearest',inline:'nearest'});}
 private allNodes():GraphNode[]{
  return [...technologies.filter(t=>this.allowed.has(t.id)).map(t=>({key:technologyKey(t.id),name:t.name,technology:t,x:0,y:0})),...products.filter(p=>this.allowed.has(p.technology)).map(p=>({key:productKey(p.id),name:p.name,technology:technologyById.get(p.technology)!,product:p,x:0,y:0}))];
 }
 private visible(){
  const all=this.allNodes(),available=new Set(all.map(n=>n.key));
  const edges=this.edges.filter(e=>available.has(e.from)&&available.has(e.to)&&(this.services||!['service','produces'].includes(e.relation)));
  if(this.scope==='all')return {nodes:all,edges};
  if(this.scope==='recipe'){
   const touching=edges.filter(e=>e.from===this.selected||e.to===this.selected);
   const keys=new Set([this.selected,...touching.flatMap(e=>[e.from,e.to])]);
   return {nodes:all.filter(n=>keys.has(n.key)),edges:touching};
  }
  // Include all ingredient ancestry; producer/service context and direct downstream uses.
  // Do not recursively expand technology science inputs or infrastructure feedback loops.
  const keys=new Set([this.selected]),queue=[this.selected];
  while(queue.length){const key=queue.pop()!;for(const e of edges.filter(e=>e.to===key&&e.relation==='ingredient'))if(!keys.has(e.from)){keys.add(e.from);queue.push(e.from);}}
  for(const e of edges)if(e.from===this.selected)keys.add(e.to);
  for(const key of [...keys])for(const e of edges)if(e.to===key)keys.add(e.from);
  return {nodes:all.filter(n=>keys.has(n.key)),edges:edges.filter(e=>keys.has(e.from)&&keys.has(e.to))};
 }
 private layout(){
  const {nodes,edges}=this.visible();
  if(this.scope==='recipe'){
   const incoming=new Set(edges.filter(e=>e.to===this.selected).map(e=>e.from));
   const left=nodes.filter(n=>incoming.has(n.key)),right=nodes.filter(n=>n.key!==this.selected&&!incoming.has(n.key));
   const rightColumns=right.length>6?2:1,rightRows=Math.ceil(right.length/rightColumns);
   const rows=Math.max(left.length,rightRows,1);
   for(const [i,node] of left.entries()){node.x=20;node.y=55+((rows-left.length)/2+i)*126;}
   for(const [i,node] of right.entries()){node.x=610+Math.floor(i/Math.max(1,rightRows))*250;node.y=55+((rows-rightRows)/2+i%Math.max(1,rightRows))*126;}
   const selected=nodes.find(n=>n.key===this.selected)!;selected.x=315;selected.y=55+(rows-1)*63;
   return {nodes,edges,columns:[],width:860+(rightColumns-1)*250,height:rows*126+80};
  }
  const columns=[...new Set(nodes.map(n=>n.technology.column))].sort((a,b)=>a-b);
  let height=260;
  for(const [ci,column] of columns.entries()){
   let y=55;
   for(const tech of technologies.filter(t=>t.column===column).sort((a,b)=>a.lane-b.lane)){
    const group=nodes.filter(n=>n.technology.id===tech.id);if(!group.length)continue;
    const techNode=group.find(n=>!n.product),items=group.filter(n=>n.product);
    if(techNode){techNode.x=ci*530+20;techNode.y=y;}
    for(const [i,node] of items.entries()){node.x=ci*530+275;node.y=y+i*126;}
    y+=Math.max(1,items.length)*126+35;
   }
   height=Math.max(height,y);
  }
  return {nodes,edges,columns,width:Math.max(1,columns.length)*530+20,height};
 }
 private draw(){
  const {nodes,edges,columns,width,height}=this.layout(),byKey=new Map(nodes.map(n=>[n.key,n]));
  (this.el('production-scope') as HTMLSelectElement).value=this.scope;
  this.el('production-count').textContent=`${nodes.length} nodes · ${edges.length} connections · ${this.scope==='all'?'All visible':this.scope==='recipe'?'Inputs → selection → uses':'Ingredient ancestry + direct uses'}`;
  this.el('production-zoom').textContent=`${Math.round(this.scale*100)}%`;
  const canvas=this.el('production-canvas');canvas.style.width=`${width*this.scale}px`;canvas.style.height=`${height*this.scale}px`;
  const paths=edges.sort((a,b)=>Number(a.from===this.selected||a.to===this.selected)-Number(b.from===this.selected||b.to===this.selected)).map(e=>{
   const a=byKey.get(e.from)!,b=byKey.get(e.to)!,active=e.from===this.selected||e.to===this.selected;
   const parallel=edges.filter(v=>v.from===e.from&&v.to===e.to),offset=(parallel.indexOf(e)-(parallel.length-1)/2)*16;
   const forward=a.x<b.x,x1=a.x+(forward?218:0),x2=b.x+(forward?0:218),y1=a.y+52+offset,y2=b.y+52+offset;
   const detour=this.scope==='recipe'&&b.x-a.x>400,channel=b.y-12;
   const d=detour?`M ${x1} ${y1} H ${x1+18} V ${channel} H ${x2-14} V ${y2} H ${x2-4}`:a.x===b.x?`M ${a.x} ${y1} H ${a.x-18} V ${y2} H ${b.x-4}`:`M ${x1} ${y1} C ${x1+(forward?28:-28)} ${y1},${x2+(forward?-28:28)} ${y2},${x2+(forward?-4:4)} ${y2}`;
   return `<g class="production-edge ${active?'connected':''}" style="color:${colors[e.relation]}" data-relation="${e.relation}"><path d="${d}" marker-end="url(#production-arrow-${e.relation})" ${['produces','service','prerequisite'].includes(e.relation)?'stroke-dasharray="5 4"':''}><title>${escape(a.name)} → ${escape(b.name)}: ${relationNames[e.relation]} · ${e.label}</title></path>${active?`<text x="${(x1+x2)/2}" y="${detour?channel-4:(y1+y2)/2-7}">${e.label}</text>`:''}</g>`;
  }).join('');
  canvas.innerHTML=`<div class="tech-scene" style="width:${width}px;height:${height}px;transform:scale(${this.scale})"><svg width="${width}" height="${height}" aria-hidden="true"><defs>${Object.entries(colors).map(([r,color])=>`<marker id="production-arrow-${r}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`).join('')}</defs>${paths}</svg>${this.scope==='recipe'?['INPUTS / UNLOCK / PRODUCER','SELECTED ITEM OR TECHNOLOGY','USED IN / ENABLES'].map((label,i)=>`<div class="production-stage" style="left:${20+i*295}px">${label}</div>`).join(''):columns.map((col,i)=>`<div class="production-stage" style="left:${i*530+20}px">TIER ${col} · RESEARCH → RECIPES & EQUIPMENT</div>`).join('')}${nodes.map(n=>`<button class="production-node ${n.product?.type??'technology'} ${n.key===this.selected?'selected':''}" data-production="${n.key}" data-graph-node="${n.key}" aria-pressed="${n.key===this.selected}" style="left:${n.x}px;top:${n.y}px"><span>${n.product?n.product.type.toUpperCase()+(n.product.implemented?' · CURRENT':' · PROPOSED'):'TECHNOLOGY'}</span><strong>${n.name}</strong><small>${n.product?.producer?`Made by ${productById.get(n.product.producer)!.name}`:n.product?.type==='capability'?'Operating condition':n.product?'Supplied':`${directUnlocks(n.technology.id).length} specific unlocks`}</small></button>`).join('')}</div>`;
  this.detail();
 }
 private link(key:string,label:string){const technology=key.startsWith('tech:')?key.slice(5):productById.get(key.slice(8))!.technology;return `<button data-production="${key}" ${this.allowed.has(technology)?'':'disabled title="Enable Dev: full tree to inspect this future connection"'}>${label}</button>`;}
 private productLink(id:string,label=productById.get(id)!.name){return this.link(productKey(id),label);}
 private detail(){
  const node=this.allNodes().find(n=>n.key===this.selected)!;
  if(!node.product){const t=node.technology;this.el('production-detail').innerHTML=`<span class="eyebrow">TECHNOLOGY</span><h3>${t.name}</h3><p>${t.summary}</p><h4>Every unlocked recipe / capability</h4><div class="production-links">${directUnlocks(t.id).map(p=>this.productLink(p.id)).join('')}</div><h4>Research prerequisites</h4><div class="production-links">${t.requires.map(id=>this.link(technologyKey(id),technologyById.get(id)!.name)).join('')||'Expedition kit'}</div><h4>Research / completion</h4><p>${researchCost(t)}</p><p>${t.condition}</p><button data-open-research="${t.id}">Open research details</button>`;return;}
  const p=node.product,used=consumers(p.id),makes=outputs(p.id),serviceUsers=products.filter(v=>v.needs.includes(p.id)),researchUses=this.edges.filter(e=>e.from===node.key&&['science','milestone'].includes(e.relation));
  const links=(items:Product[])=>items.map(v=>this.productLink(v.id)).join('')||'<p>None in this design.</p>';
  this.el('production-detail').innerHTML=`<span class="eyebrow">${p.type.toUpperCase()} · ${p.implemented?'CURRENT PROTOTYPE':'DESIGN PROPOSAL'}</span><h3>${p.name}</h3><p>${p.description}</p><h4>Unlocked by</h4><div class="production-links">${this.link(technologyKey(p.technology),node.technology.name)}</div><h4>Exact recipe / construction</h4><p class="production-recipe">${recipeText(p)}</p><div class="production-links">${p.ingredients.map(i=>this.productLink(i.id,`${i.amount} × ${productById.get(i.id)!.name}`)).join('')}</div>${p.producer?`<h4>Produced in / extracted by</h4><div class="production-links">${this.productLink(p.producer)}</div>`:''}<h4>Operating requirements</h4><p>${p.operation}</p><div class="production-links">${p.needs.map(id=>this.productLink(id)).join('')}</div><h4>Ingredient for · ${used.length}</h4><div class="production-links">${links(used)}</div><h4>Produces · ${makes.length}</h4><div class="production-links">${links(makes)}</div><h4>Supplies / enables · ${serviceUsers.length}</h4><div class="production-links">${links(serviceUsers)}</div>${researchUses.length?`<h4>Research / milestone uses</h4><div class="production-links">${researchUses.map(e=>this.link(e.to,`${technologyById.get(e.to.slice(5))!.name} · ${e.label}`)).join('')}</div>`:''}<p class="tech-design-note">${p.implemented?'Existing costs and behavior are retained. Connections to proposed recipes describe the future design.':'Recipe quantities and service budgets are proposed for review; this panel does not enable crafting or research.'}</p>`;
 }
 private search(){
  const query=(this.el('production-search') as HTMLInputElement).value.trim().toLowerCase();
  const matches=this.allNodes().filter(n=>n.name.toLowerCase().includes(query)).slice(0,12);
  this.el('production-results').innerHTML=query?(matches.map(n=>this.link(n.key,`${n.name} · ${n.product?.type??'technology'}`)).join('')||'<p>No visible matches. Enable Dev: full tree to search future tiers.</p>'):'';
 }
}
