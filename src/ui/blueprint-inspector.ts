import {blueprintCost} from '../sim/blueprints';
import type {World} from '../sim/world-types';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** Blueprint selection summary plus external-service resolution for the recorded template. */
export function renderBlueprintInspector(w:World,selection:string[],resolved:Record<string,string|null>,deployDisconnected:boolean):string{
 const blueprint=w.blueprint;
 const referenceOptions=w.references.map(r=>`<option value="${esc(r.id)}">${esc(r.source)}</option>`).join('');
 const tunerOptions=w.entities.filter(e=>e.kind==='tuner').map(e=>`<option value="${esc(e.id)}">${esc(e.id)}</option>`).join('');
 const slots=blueprint?.slots??[];
 const slotRows=slots.map(slot=>`<div class="assign-block"><label>${esc(slot.label)}</label>${slot.kind==='reference'?`<select data-slot="${esc(slot.id)}"><option value="">unresolved</option>${referenceOptions}</select>`:slot.kind==='controller'?`<select data-slot="${esc(slot.id)}"><option value="">unresolved</option>${tunerOptions}</select>`:'<strong>power feed</strong>'}</div>`).join('');
 return `<div class="blueprint-inspector">
  <div class="stat-row"><span>Selected machines</span><strong>${selection.length}</strong></div>
  <div class="stat-row"><span>Recorded template</span><strong>${blueprint?`${blueprint.entities.length} machines · ${blueprintCost(w)} assemblies`:'none'}</strong></div>
  ${blueprint?`<p>${blueprint.slots.length} external slot(s). Unresolved required slots block placement unless you deploy disconnected; a disconnected deployment is never qualified.</p>`:''}
  ${slotRows}
  ${blueprint&&blueprint.slots.some(s=>s.kind==='power')?`<label class="switch"><input type="checkbox" data-disconnected ${deployDisconnected?'checked':''}>Deploy disconnected where allowed</label>`:''}
  <div class="button-row"><button data-action="record" ${selection.length?'':'disabled'}>Record selection</button><button data-action="clear" ${selection.length||blueprint?'':'disabled'}>Clear</button><button data-action="place" ${blueprint?'':'disabled'}>Place blueprint</button></div>
 </div>`;
}
