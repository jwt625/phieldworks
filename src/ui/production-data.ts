import {DEFS,type Kind} from '../sim/definitions';
import {technologies} from './technology-data';

export type ProductType='resource'|'item'|'equipment'|'capability';
export interface Ingredient {id:string;amount:number}
export interface Product {
 id:string;name:string;type:ProductType;technology:string;description:string;
 ingredients:Ingredient[];producer?:string;quantity:number;seconds?:number;
 needs:string[];operation:string;implemented:boolean;
}
const inputs=(values:Record<string,number>):Ingredient[]=>Object.entries(values).map(([id,amount])=>({id,amount}));
const item=(id:string,name:string,technology:string,producer:string,materials:Record<string,number>,seconds:number,description:string,quantity=1):Product=>({id,name,type:'item',technology,producer,ingredients:inputs(materials),seconds,quantity,description,needs:[],operation:'Consume the listed inputs once per completed recipe.',implemented:false});
const machine=(id:string,name:string,technology:string,materials:Record<string,number>,operation:string,needs:string[]=[],producer='construction'):Product=>({id,name,type:'equipment',technology,producer,ingredients:inputs(materials),quantity:1,description:operation,needs,operation,implemented:false});
const ability=(id:string,name:string,technology:string,needs:string[],description:string):Product=>({id,name,type:'capability',technology,ingredients:[],quantity:1,needs,description,operation:description,implemented:false});
const resource=(id:string,name:string,technology:string,description:string):Product=>({id,name,type:'resource',technology,ingredients:[],producer:'extractor',quantity:1,needs:[],description,operation:description,implemented:false});
const starter=(kind:Kind,technology:string,operation:string,needs:string[]=[]):Product=>({...machine(kind,DEFS[kind].name,technology,{assembly:DEFS[kind].cost},operation,needs),implemented:true});

/** Design catalog only. No recipes here alter the simulation. IDs are independent of research IDs. */
export const products:Product[]=[
 {id:'construction',name:'Expedition construction kit',type:'equipment',technology:'outpost',ingredients:[],quantity:1,needs:[],description:'Supplied construction tooling. Builds equipment directly from shared stock; later fabrication cells manufacture precision items.',operation:'Starting capability; consumes listed construction materials instantly. Not a craftable machine.',implemented:true},
 {...resource('ore','Mixed ferrous ore','outpost','Finite starter/remote deposits; extractor produces one ore every 0.65 s with 8 power. Belt output.'),implemented:true},
 {...item('assembly','Construction assembly','outpost','assembler',{ore:2},1.4,'Basic mixed-material construction part. Shared stock in the current prototype.'),implemented:true},
 starter('extractor','outpost','8 power; place on a deposit. 1 ore / 0.65 s; belt output. New mineral types are proposed.', ['generator']),
 starter('assembler','outpost','6 power; 2 ore → 1 assembly / 1.4 s. Starter machine is already built.', ['generator']),
 starter('generator','outpost','240 power units per generator; connect a wire to each active load. Fuel abstracted.'),
 {...ability('belt-route','Material belt route','outpost',['extractor','assembler'],'Existing free material routes: 2 tiles/s, spacing and backpressure.'),implemented:true},
 {...ability('wire-route','Electrical wire route','outpost',['generator'],'Existing free point-to-point wires; 240-unit generator capacity.'),implemented:true},
 {...ability('repair','Repair and recovery','outpost',[],'Each manual repair consumes 3 assemblies. Recovery returns an intact machine’s existing construction cost.'),ingredients:inputs({assembly:3}),implemented:true},
 starter('reference','fieldcraft','125 power → 100 field units; coherent reference OUT.', ['generator']),
 starter('junction','fieldcraft','Passive four-port splitter/combiner; terminate unused ports.'),
 starter('tuner','fieldcraft','Passive ±180° trim; thermal drift changes phase.'),
 starter('emitter','fieldcraft','4 power and field input; directs useful power toward the guardian.', ['generator','reference']),
 starter('dump','fieldcraft','2 cooling power; absorbs rejected field, trips at 85 °C.', ['generator']),
 {...ability('field-route','Field link','fieldcraft',['reference','junction'],'Existing free field routes. Length and bends affect phase, attenuation and radiation.'),implemented:true},
 {...ability('diagnostics','Baseline diagnostics','fieldcraft',[],'Available from the start: faults, remedies, energy balance and object location.'),implemented:true},
 {...ability('phase-control','Automatic phase control','fieldcraft',['reference','tuner'],'Bounded phase search follows thermal drift. No extra research lock in the starter scenario.'),implemented:true},
 {...ability('focused-field','Focused target delivery','fieldcraft',['reference','junction','tuner','emitter'],'Two powered emitter branches plus phase trim can exceed 32 useful units; this is a measured output, not an inventory item.'),implemented:true},
 starter('sentry','perimeter','6 wired power; 8-tile defense radius; ammunition abstracted for this original model.', ['generator']),
 {...ability('defense-ready','Defense readiness','perimeter',['sentry'],'First powered sentry starts a 30-second grace period. It enables the existing wildlife-aggression gate.'),implemented:true},
 {...resource('raw-crystal','Frontier crystal','frontier','Clear the guardian, build an extractor over the deposit and supply 8 power. Crystal enters shared stock.'),implemented:true},
 {...ability('eastern-access','Eastern frontier access','frontier',['focused-field'],'Guardian defeated: access the eastern sector and crystal deposit.'),implemented:true},
 {...ability('crystal-supply','Harvested crystal milestone','crystal',['raw-crystal'],'Observe the first harvested crystal. Proposed permanent milestone history survives later spending.'),implemented:true},
 {...ability('blueprint','Qualified outpost blueprint','qualification',['reference','phase-control'],'Enable automatic control and reach 35 target units to begin. Hold at least 32 for 20 seconds with no trips or destroyed equipment, then record topology. Stamping costs the sum of its machines; every placement requires local qualification.'),implemented:true},
 machine('workbench','Research workbench','research',{assembly:12,'raw-crystal':2},'6 power; produces all unlocked dossier recipes.',['generator']),
 machine('laboratory','Research laboratory','research',{assembly:8,'raw-crystal':3},'12 power; consumes each required dossier per research unit, at one laboratory-second per simulated second.',['generator']),
 item('industrial-dossier','Industrial dossier','research','workbench',{assembly:2,'raw-crystal':1},4,'Consumed by laboratories to fund industrial research.'),
 ability('research-queue','Research queue','research',['laboratory'],'One active technology across all supplied labs. Queue prerequisites, retain partial progress and show input shortages.'),
 machine('splitter','Belt splitter','logistics',{assembly:4},'Passive 1:2 or 2:1 routing; priority selection and explicit throughput.'),
 machine('underground','Underground belt pair','logistics',{assembly:6},'One recipe builds a matched entry/exit pair; up to 6 tiles beneath crossings.'),
 item('belt-segment','Constructible belt segment','logistics','construction',{assembly:1},0,'New paid belt model; existing free routes retain their legacy behavior.',4),
 ability('segment-editing','Transport segment editing','logistics',['belt-segment','splitter','underground'],'Select and replace individual transport segments; show costs and preserve packet accounting.'),
 machine('monitor','Monitor station','instrumentation',{assembly:6,'raw-crystal':2},'4 power; precise traces and history export. Basic faults stay visible without this equipment.',['generator']),
 machine('probe','Branch probe','instrumentation',{assembly:2,'raw-crystal':1},'Passive incident/return sample at a port; no hidden field energy gain.'),
 machine('power-pole','Power pole','grid',{assembly:2},'Passive electrical branch support; explicit network capacity.'),
 machine('substation','Substation','grid',{assembly:12,'raw-crystal':2},'Multi-generator bus with breaker-isolated load branches; 960-unit nominal throughput.'),
 ability('shared-bus','Shared electrical bus','grid',['substation','power-pole','generator'],'Aggregate supply by connected component; overload and islanding are visible faults.'),
 resource('copper-ore','Copper-rich ore','materials','Proposed guaranteed post-frontier surface deposit; mined by the existing extractor. No advanced transport needed.'),
 resource('silica','Silica gravel','materials','Proposed guaranteed surface deposit within the first cleared sector; mined by extractor.'),
 resource('carbon','Carbon nodules','materials','Proposed guaranteed surface deposit within the first cleared sector; mined by extractor.'),
 machine('processor','Material processor','materials',{assembly:16,'raw-crystal':4},'12 power; one refining/chemical recipe at a time. Construction uses the starter supply chain.',['generator']),
 item('steel','Structural steel','materials','processor',{ore:4,carbon:1},4,'Structural input for freight, cooling, defenses and large equipment.',2),
 item('conductor','Copper conductor','materials','processor',{'copper-ore':2},2,'Winding and electrical interconnect stock.',4),
 item('ceramic','Ceramic substrate','materials','processor',{silica:2,ore:1},4,'Insulating mechanical substrate.',2),
 item('polished-crystal','Polished crystal','materials','processor',{'raw-crystal':2},4,'Precision transparent input.'),
 item('control-board','Control board','materials','processor',{assembly:2,conductor:2,ceramic:1},6,'Revision B: explicit conductor/substrate chain replaces the previous abstract assembly-plus-crystal recipe.'),
 item('service-connector','Service connector','modules','assembler',{steel:2,conductor:2,'control-board':1},4,'Standard material, power and reference boundary for a selected-area module.'),
 ability('module-blueprint','Selected-area blueprint','modules',['blueprint','service-connector'],'Capture a chosen cell and its declared service connectors rather than the whole outpost.'),
 ability('construction-request','Construction request','modules',['module-blueprint'],'Display a bill of materials and place requested components using the construction kit. No unimplemented robots implied.'),
 item('coolant','Coolant charge','thermal','processor',{carbon:1,'raw-crystal':1},4,'Sealed synthetic coolant; charges a closed loop. No new water-resource dependency.',4),
 item('coolant-pipe','Coolant pipe','thermal','assembler',{conductor:2,steel:1},2,'Closed-loop coolant transport.',4),
 machine('pump','Coolant pump','thermal',{assembly:6,steel:2,conductor:4},'4 power; moves coolant around a closed loop.',['generator']),
 machine('heat-exchanger','Heat exchanger','thermal',{assembly:12,steel:6,conductor:8},'8 power; rejects loop heat. Connect pump, pipes and at least 4 coolant charges.',['generator','pump','coolant-pipe','coolant']),
 machine('branch-isolator','Branch isolation switch','thermal',{assembly:4,ceramic:2,'polished-crystal':1},'Trips a branch on return power/heat; isolation redirects energy to a matched dump.',['dump']),
 machine('wall','Perimeter wall','defense',{steel:2,ceramic:2},'Passive barrier; gates and routing clearances remain explicit.'),
 item('magazine','Sentry magazine','defense','assembler',{assembly:1},4,'Consumable for the new supplied-sentry model.',4),
 item('repair-kit','Repair kit','defense','assembler',{assembly:2,conductor:1},4,'Consumed by the repair depot; baseline manual repair remains available.'),
 machine('supplied-sentry','Supplied perimeter sentry','defense',{sentry:1,steel:4,'control-board':2},'8 power; magazine-fed upgrade. Building consumes one recovered original sentry and the listed parts.',['generator','magazine']),
 machine('repair-depot','Repair depot','defense',{assembly:10,steel:4,'control-board':2},'8 power; restores nearby damaged equipment by consuming repair kits.',['generator','repair-kit']),
 item('precision-dossier','Precision dossier','precision','workbench',{'industrial-dossier':1,'control-board':1,'polished-crystal':1},6,'Laboratory input for precision research.'),
 item('precision-lens','Precision lens','precision','processor',{'polished-crystal':2,ceramic:1},6,'Controlled aperture or focusing component.'),
 item('actuator','Precision actuator','precision','assembler',{steel:2,conductor:4,'control-board':1},6,'Positioning input for tuners, tracking, carriers and manufacturing stages.'),
 item('resonator','Resonator core','precision','processor',{'polished-crystal':2,ceramic:2,conductor:2},8,'Frequency-selective source component with a declared thermal operating range.'),
 item('sensor','Sensor head','precision','assembler',{'precision-lens':1,'control-board':2},6,'Measured target/position feedback for advanced equipment.'),
 machine('freight-depot','Freight depot','transport',{assembly:16,steel:12,'service-connector':4},'12 power; buffers items and dispatches scheduled carriers.',['generator']),
 machine('cargo-carrier','Cargo carrier','transport',{steel:12,actuator:4,'control-board':4},'Battery-powered vehicle charged at the depot. Capacity 40 item stacks; schedules use explicit loading conditions.',['freight-depot']),
 item('restricted-conduit','Restricted-mode conduit','transport','processor',{'polished-crystal':2,ceramic:2},6,'Narrower accepted mode set; lower dispersion with a throughput tradeoff.',4),
 machine('locked-source','Reference-locked source','coherent',{reference:1,resonator:2,'control-board':4},'160 power; upgraded source locks to a reference and reports lock margin. Recovered reference station is consumed.',['generator','reference']),
 item('gain-core','Gain core','coherent','processor',{'polished-crystal':4,ceramic:2,resonator:1},10,'Active gain medium; requires supplied electrical energy and cooling.'),
 machine('amplifier','Field amplifier','coherent',{assembly:16,'gain-core':2,conductor:8},'80 power plus field input and cooling; adds field energy through an explicit ledger.',['generator','heat-exchanger']),
 machine('return-guard','Return-power guard','coherent',{dump:1,'branch-isolator':1,sensor:1},'Dump-backed return protection; directed rejected energy is still accounted as heat.',['heat-exchanger']),
 item('capacitor','Pulse capacitor','pulses','processor',{conductor:4,ceramic:4,carbon:2},8,'Stored electrical energy with explicit charge/discharge losses.'),
 machine('pulse-driver','Pulse driver','pulses',{emitter:1,capacitor:4,'control-board':4},'40 power while charging; existing emitter body becomes a pulse-delivery device.',['generator','heat-exchanger']),
 ability('pulse-diagnostics','Pulse timing diagnostics','pulses',['monitor','pulse-driver'],'Read delivered pulse energy, peak power, duty cycle and thermal limits.'),
 machine('fabrication-cell','Field-assisted fabrication cell','fabrication',{assembler:1,steel:8,actuator:2,'precision-lens':2},'24 power plus ≥10 stable useful process-field units and cooling for accepted precision parts. Starter reference/emitter can supply this contract.',['generator','emitter','heat-exchanger']),
 item('accepted-part','Accepted precision part','fabrication','fabrication-cell',{'polished-crystal':2,'control-board':1},8,'Accepted only if process-field delivery stays within ±5% over the cycle and there are no trips. Otherwise the batch becomes accounted scrap.'),
 item('wafer','Semiconductor wafer','fabrication','processor',{'raw-crystal':4,silica:2},8,'Coarse semiconductor substrate; proposed material model, not a physical purity claim.',2),
 item('resist','Patterning resist','fabrication','processor',{carbon:2,'raw-crystal':1},4,'Patterning consumable.',4),
 item('patterned-die','Patterned die','photonics','fabrication-cell',{wafer:1,resist:1},10,'Lithographic patterning with the same cell acceptance contract.',4),
 item('optical-coupler','Optical coupler','photonics','processor',{'precision-lens':1,ceramic:1},6,'Chip-to-field coupling component.',2),
 item('photonic-module','Photonic module','photonics','fabrication-cell',{'patterned-die':2,'optical-coupler':1,'control-board':1},8,'Packaged optical control module. Explicit die/coupler chain replaces the earlier abstract recipe.'),
 item('systems-dossier','Systems dossier','photonics','workbench',{'precision-dossier':1,'photonic-module':1,'accepted-part':1},10,'Laboratory input for systems research.'),
 item('communication-module','Communication module','distributed','fabrication-cell',{'photonic-module':2,'control-board':2},8,'Transmitter/receiver pair for regional coordination.'),
 machine('relay','Communication relay','distributed',{steel:8,'communication-module':2,actuator:1},'12 power; transports commands and telemetry with finite delay.',['generator']),
 machine('regional-controller','Regional scheduler','distributed',{assembly:12,'control-board':4,'communication-module':2},'12 power; coordinates depot schedules across linked regions.',['generator','relay','freight-depot']),
 machine('calibration-beacon','Calibration beacon','adaptive',{sensor:2,'photonic-module':2,steel:4},'8 power; provides a surveyed field calibration target.',['generator']),
 machine('sector-controller','Aperture sector controller','adaptive',{'control-board':6,'photonic-module':4,sensor:2},'20 power; bounds adaptive phase updates using beacon feedback.',['generator','calibration-beacon']),
 machine('observatory','Frontier observatory','survey',{steel:16,'precision-lens':4,sensor:4,actuator:2},'20 power; surveys build corridors and measures a target trajectory.',['generator']),
 machine('tracking-receiver','Tracking receiver','survey',{sensor:2,'photonic-module':2,actuator:2},'12 power; live trajectory corrections and stale-data alarms.',['generator','observatory']),
 ability('site-survey','Surveyed aperture site','survey',['observatory'],'One observatory survey certifies an unobstructed site. Certification is invalidated by incompatible construction; it is not a consumable item.'),
 machine('membrane-line','Membrane deposition line','nanofab',{steel:20,actuator:4,'photonic-module':4,'accepted-part':8},'48 power, process field and cooling; produces film panels with counted rejects.',['generator','emitter','heat-exchanger']),
 machine('metrology-gantry','Metrology gantry','nanofab',{steel:12,sensor:4,actuator:2,'photonic-module':2},'16 power; inspects membrane output. Uninspected film cannot fund a flight sail.',['generator']),
 item('sail-panel','Accepted sail panel','nanofab','membrane-line',{'accepted-part':2,'photonic-module':1},12,'Every panel requires gantry acceptance; failed panels become scrap.'),
 machine('aperture-sector','Aperture sector assembly','aperture',{'locked-source':2,amplifier:4,emitter:4,'sector-controller':1,'return-guard':2,steel:40},'Install recovered machines as a sector; requires a surveyed site, grid supply, coolant, relay, tracking and beacon services.',['substation','heat-exchanger','relay','tracking-receiver','calibration-beacon','site-survey']),
 ability('qualified-sector','Qualified aperture sector','aperture',['aperture-sector'],'One installed sector passes ≥100 useful units for 60 s with no thermal trips. Local service failures invalidate its qualification.'),
 machine('sail-dock','Lightsail assembly dock','sail',{steel:40,actuator:8,'photonic-module':8,'accepted-part':16},'32 power; joins and tensions an inspected flight sail.',['generator','metrology-gantry']),
 item('flight-sail','Inspected flight sail','sail','sail-dock',{'sail-panel':100,'photonic-module':20},120,'The completed sail must pass dock inspection before launch.'),
 machine('launch-cradle','Lightsail launch cradle','launch',{'sail-dock':1,steel:40,actuator:8,'sector-controller':1},'24 power; recovered sail dock is integrated into the release structure.',['generator','tracking-receiver']),
 ability('launch-acceptance','Integrated launch acceptance','launch',['flight-sail','qualified-sector','tracking-receiver','launch-cradle'],'Require one inspected sail and four qualified sectors; sustain ≥400 combined useful units for 120 s with no trip or tracking loss, then release the sail.')
];
products.find(p=>p.id==='sail-panel')!.needs=['metrology-gantry'];
export const productById=new Map(products.map(p=>[p.id,p]));
export type Relation='unlocks'|'ingredient'|'produces'|'service'|'science'|'milestone'|'prerequisite';
export interface DependencyEdge {from:string;to:string;relation:Relation;label:string}
export const productKey=(id:string)=>`product:${id}`;
export const technologyKey=(id:string)=>`tech:${id}`;
export const scienceProducts={industrial:'industrial-dossier',precision:'precision-dossier',systems:'systems-dossier'} as const;
export function dependencyEdges():DependencyEdge[]{
 const edges:DependencyEdge[]=[];
 for(const t of technologies){
  for(const id of t.requires)edges.push({from:technologyKey(id),to:technologyKey(t.id),relation:'prerequisite',label:'Prerequisite'});
  if(t.cost){
   for(const p of t.cost.packs)edges.push({from:productKey(scienceProducts[p]),to:technologyKey(t.id),relation:'science',label:`${t.cost.units} consumed`});
   edges.push({from:productKey('laboratory'),to:technologyKey(t.id),relation:'service',label:'Researched in'});
  }
 }
 for(const p of products){
  edges.push({from:technologyKey(p.technology),to:productKey(p.id),relation:'unlocks',label:p.type==='resource'?'Access':p.type==='capability'?'Enables':'Recipe unlock'});
  for(const i of p.ingredients)edges.push({from:productKey(i.id),to:productKey(p.id),relation:'ingredient',label:`${i.amount} consumed`});
  if(p.producer)edges.push({from:productKey(p.producer),to:productKey(p.id),relation:'produces',label:p.type==='resource'?'Extracted by':'Produced by'});
  for(const id of p.needs)edges.push({from:productKey(id),to:productKey(p.id),relation:'service',label:'Requires service'});
 }
 for(const [id,inputs] of Object.entries({frontier:['focused-field'],crystal:['raw-crystal'],qualification:['phase-control','reference'],research:['raw-crystal','blueprint'],launch:['flight-sail','qualified-sector']}))for(const p of inputs)edges.push({from:productKey(p),to:technologyKey(id),relation:'milestone',label:'Demonstrate'});
 return edges;
}
export function recipeText(p:Product){
 if(!p.ingredients.length)return p.type==='resource'?'Extract from a finite deposit':p.type==='capability'?'Operating capability / milestone':'Supplied with the expedition';
 return `${p.ingredients.map(i=>`${i.amount} ${productById.get(i.id)!.name}`).join(' + ')} → ${p.quantity} ${p.name}${p.seconds===undefined?' · build instantly':p.seconds===0?' · construct instantly':` / ${p.seconds} s`}`;
}
export function directUnlocks(technology:string){return products.filter(p=>p.technology===technology);}
export function consumers(id:string){return products.filter(p=>p.ingredients.some(i=>i.id===id));}
export function outputs(id:string){return products.filter(p=>p.producer===id);}
