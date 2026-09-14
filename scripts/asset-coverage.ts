/** Full catalog requirements inventory; never treats technology concept art as product coverage. */
import {existsSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {products} from '../src/ui/production-data';
import {APPEARANCE} from '../src/presentation';
import type {Kind} from '../src/sim/definitions';
type Source={path:string;role:string;status:string};
const mapped:Record<string,Source[]>={};
const add=(id:string,path:string,role:string,status:string)=>{
 if(!existsSync(path))throw new Error(`Missing asset source: ${path}`);
 (mapped[id]??=[]).push({path,role,status});
};
for(const [id,art] of Object.entries(APPEARANCE)){
 if(art.sheet)add(id,`assets/world/${art.sheet}.png`,'direction-sheet','runtime-prototype; registration/alpha limitations remain');
 if(art.animation)add(id,`assets/animations/${art.animation.asset}.png`,'operation-animation','runtime-prototype; registration/alpha limitations remain');
 const conditions=`assets/states/${id}-condition-v1.png`;
 if(existsSync(conditions))add(id,conditions,'condition-sheet','runtime-prototype; condition crop/alpha review remains');
}
for(const [id,path] of Object.entries({workbench:'research-workbench',laboratory:'research-laboratory',processor:'material-processor'}))
 add(id,`assets/research/${path}-turnaround-v1.png`,'direction-sheet','candidate; registration and runtime integration pending');
for(const id of ['ore','assembly','raw-crystal'])
 add(id,'assets/animations/candidates/transport-items-v2.png','inventory-atlas','reviewed-item-concept; individual crops and alpha correction pending');
add('ore','assets/sprites/starter-ore-v1.png','deposit','prototype-static');
add('raw-crystal','assets/sprites/frontier-crystal-ore-v2.png','deposit','prototype-static');
for(const id of ['ore','raw-crystal'])add(id,'assets/map/depletion-debris-v1.png','depleted-deposit-atlas','runtime-prototype');
for(const id of ['industrial-dossier','precision-dossier','systems-dossier'])
 add(id,'assets/technology/industrial-science-packs-v1.png','science-package-atlas','legacy concept; canonical package mapping and crop review pending');
const oldReview=JSON.parse(readFileSync('assets/technology/art-review-status.json','utf8')).entries as Record<string,{path:string;status:string}>;
for(const [key,entry] of Object.entries(oldReview)){
 const id=['extractor','assembler','generator','sentry'].find(id=>key.startsWith(id+'-'));
 if(id)add(id,entry.path,'animation-candidate',entry.status);
}
for(const dir of ['assets/animations/candidates/tranche-a','assets/production/pass-04'])
 for(const file of readdirSync(dir).filter(f=>f.endsWith('.png')))add('fabrication-cell',`${dir}/${file}`,'direction-candidate','see tranche-a review / provenance; not registered');
for(const pass of ['pass-05','pass-06']){
 const path=`assets/production/${pass}/review.json`;
 if(!existsSync(path))continue;
 const review=JSON.parse(readFileSync(path,'utf8'));
 for(const c of review.candidates){
  const id=c.product_id??(c.id.startsWith('fabrication-cell')?'fabrication-cell':'accepted-part');
  add(id,c.path,c.variant??'process-state-candidate',c.status);
 }
}
const entries=products.map(p=>({
 id:p.id,name:p.name,type:p.type,implemented:p.implemented,
 runtime_appearance:p.id in APPEARANCE?APPEARANCE[p.id as Kind]:null,
 requirements:p.type==='capability'?['code-native-symbol','accessible-status']:
 p.id==='construction'?['inventory-icon','placement-feedback']:
 p.type==='equipment'?['inventory-icon','four-intact-views','four-light-damage-views','four-severe-damage-views','four-wreck-views','registered-operation-motion','event-driven-status-overlays']:
 p.type==='resource'?['inventory-icon','deposit','depleted-deposit']:['inventory-icon','process-state-variants-where-applicable'],
 sources:mapped[p.id]??[],
 coverage:p.type==='capability'?'code-native-review-pending':mapped[p.id]?.length?'sources-mapped; acceptance-incomplete':'no-dedicated-source-mapped',
 notes:'Technology illustrations do not count as product art. A source mapping does not satisfy every state, direction or animation requirement. Design-catalog implemented flags are not runtime authority.'
}));
writeFileSync('assets/planning/catalog-asset-coverage.json',JSON.stringify({schema_version:1,authority:'src/ui/production-data.ts',policy:{physical_states:'Versioned raster candidates with explicit review; four views for rotatable world equipment.',status:'Renderer-controlled power, starvation, blockage, trip, heat and result signals. Avoid a redundant raster for every combination.',animation:'Registered chassis plus mechanism poses; drive from actual events and active simulation time; freeze on pause and use static reduced-motion presentation.',items:'Process variants only when gameplay defines them; do not invent damage or motion for inert inventory items.',capabilities:'Code-native symbols, not invented machine sprites.'},entries},null,2)+'\n');
console.log(`Recorded requirements for ${entries.length} catalog products.`);
