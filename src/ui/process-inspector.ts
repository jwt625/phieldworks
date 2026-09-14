import {activeJob,blocker,preview,recoverableLot} from '../sim/process';
import {recipeFor} from '../sim/process-recipes';
import type {Target,World} from '../sim/world-types';
import {renderDomainInspector} from './domain-inspector';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const fmt=(n:number)=>n.toFixed(1);

/** Contextual cell inspector: assignment, manual tuning, run/test controls, forecast and last results. */
export function renderProcessInspector(w:World,target:Target,continuous:boolean):string{
 const job=activeJob(w,target.owner),reading=w.stats.targets[target.id],forecast=preview(w,target.id),block=blocker(w,target.id);
 const domain=w.domains.find(d=>d.target===target.id),qualification=domain?w.qualifications.find(q=>q.domain===domain.id):undefined;
 const cell=target.owner?w.entities.find(e=>e.id===target.owner):undefined;
 const emitters=w.entities.filter(e=>e.kind==='emitter');
 const tuners=w.entities.filter(e=>e.kind==='tuner');
 const ownerOf=(emitterId:string)=>w.targets.find(t=>t.emitters.includes(emitterId))?.id??'';
 const tunerOwner=(tunerId:string)=>w.domains.find(d=>d.tuners.includes(tunerId))?.id??'';
 const recipe=recipeFor(target.contract??'standard-cell',1);
 const stage=job?job.stage.toUpperCase():'IDLE';
 const dose=forecast?`${fmt(forecast.useful)} p·s (band 80–640)`:'—';
 const guard=forecast?`${fmt(forecast.guard)} p·s`:'—';
 const fraction=forecast?`${(forecast.fraction*100).toFixed(1)}% (limit 10%)`:'—';
 const results=w.jobs.filter(j=>j.target===target.id&&j.stage==='complete').slice(-2).reverse();
 const reworkable=recoverableLot(w,target.owner);
 const emitterOptions=emitters.map(e=>`<option value="${esc(e.id)}" ${ownerOf(e.id)===target.id?'selected':''}>${esc(e.id)}${e.powered?' · powered':' · unpowered'}</option>`).join('');
 const tunerOptions=tuners.map(t=>`<option value="${esc(t.id)}" ${domain&&tunerOwner(t.id)===domain.id?'selected':''}>${esc(t.id)}</option>`).join('');
 const assignedTuner=domain?.tuners[0]?w.entities.find(e=>e.id===domain.tuners[0]):undefined;
 return `<div class="process-inspector" data-target="${esc(target.id)}">
  <div class="stat-row"><span>Batch stage</span><strong>${stage}</strong></div>
  <div class="stat-row"><span>Assigned emitters</span><strong>${target.emitters.length}/2</strong></div>
  <div class="stat-row"><span>Reserved material</span><strong>${job?(job.consumed?'consumed: 2 assemblies + 1 crystal':'reserved: 2 assemblies + 1 crystal'):`stock ${w.stock.assemblies} assemblies · ${w.stock.crystal} crystal`}</strong></div>
  ${block?`<p class="blocker" data-blocker-code="${esc(block.code)}">${esc(block.reason)} <small>code: ${esc(block.code)}</small></p>`:''}
  <p>Forecast (unchanged conditions): useful dose ${dose}, guard dose ${guard}, guard fraction ${fraction}; predicted result <b>${forecast?forecast.outcome.toUpperCase():'—'}</b>. Active window ${recipe?.activeSeconds??8} s; workpiece absorbs only while exposing.</p>
  <div class="assign-block"><label for="cell-emitter">Emitter assignment</label><select id="cell-emitter" data-select="emitter">${emitterOptions||'<option value="">no emitters</option>'}</select><button data-action="assign-emitter">Move to this cell</button></div>
  <div class="assign-block"><label for="cell-tuner">Tuner assignment</label><select id="cell-tuner" data-select="tuner">${tunerOptions||'<option value="">no tuners</option>'}</select><button data-action="assign-tuner">Assign tuner</button></div>
  <label class="phase-label" for="cell-phase">Manual phase <output id="cell-phase-value">${assignedTuner?fmt(assignedTuner.phase):'—'}</output></label>
  <input id="cell-phase" data-phase type="range" min="-180" max="180" step="1" value="${assignedTuner?Math.round(assignedTuner.phase):0}" ${assignedTuner?'':'disabled'}>
  <div class="button-row"><button data-action="run-once" ${job||block?'disabled':''}>Run once</button><button data-action="rework" ${!reworkable||job?'disabled':''}>Rework reject</button></div>
  <label class="switch"><input type="checkbox" data-action="continuous" ${continuous?'checked':''}>Run continuously</label>
  <label class="switch"><input type="checkbox" data-action="auto-tune" ${domain?.enabled?'checked':''}>Auto tune</label>
  <div class="button-row"><button class="primary" data-action="start-test" ${!domain||qualification?.status==='testing'?'disabled':''}>Start 3-cycle test</button><button data-action="cancel-test" ${qualification?.status==='testing'?'':'disabled'}>Cancel test</button></div>
  ${domain?renderDomainInspector(w,domain):'<p>No control domain.</p>'}
  <div class="result-list"><span class="eyebrow">LAST TWO RESULTS</span>${results.length?results.map(j=>`<div>${esc(j.outcome??'—')} · useful ${fmt(j.useful)} · guard ${fmt(j.guard)}</div>`).join(''):'<div>No completed batches yet</div>'}</div>
 </div>`;
}
