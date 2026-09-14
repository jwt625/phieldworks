import {blueprintCost} from '../sim/blueprints';
import type {World} from '../sim/world-types';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** Operations surfaces: domains, qualification and recorded modules. Research stays a preview with no spending. */
export function renderOperations(w:World):string{
 const ownership=(targetId:string)=>{const owner=w.targets.find(t=>t.id===targetId)?.owner;return owner??targetId;};
 const domains=w.domains.map(d=>{const q=w.qualifications.find(x=>x.domain===d.id);const target=w.targets.find(t=>t.id===d.target);
  return `<div class="op-row"><div><b>${esc(d.name)}</b><small>${d.enabled?'auto tune on':'auto tune off'} · ${target?esc(target.id):'no target'}</small></div><span>${q?esc(q.status.toUpperCase()):'NONE'}</span><button data-locate="${esc(target?.owner??d.id)}">Locate</button></div>`;}).join('');
 const qualifications=w.qualifications.map(q=>`<div class="op-row"><div><b>${esc(q.status.toUpperCase())}</b><small>${esc(q.reason)}${q.code?` · ${esc(q.code)}`:''}</small></div><button data-locate="${esc(ownership(q.target))}">Locate</button></div>`).join('');
 const module=w.blueprint?`<div class="op-row"><div><b>${w.blueprint.entities.length} machines · ${w.blueprint.slots.length} external slot(s)</b><small>version ${w.blueprint.version} · ${blueprintCost(w)} assemblies</small></div><button data-locate="blueprint">Select module</button></div>`:'<p>No recorded module yet. Use Select module to capture one.</p>';
 return `<section><h3>Control domains</h3>${domains||'<p>No domains yet.</p>'}</section>
 <section><h3>Qualification</h3>${qualifications||'<p>No certificates yet.</p>'}</section>
 <section><h3>Modules</h3>${module}</section>
 <section><h3>Research preview</h3><p>Tranche A exposes the technology map read-only. Opening it never spends stock or unlocks a researched capability.</p><button data-action="research">Open technology map</button></section>`;
}
