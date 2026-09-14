import {configurationSignature,operatingIssue} from '../sim/qualification';
import type {ControlDomain,World} from '../sim/world-types';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** Qualification/certificate and operating-range block, shared by the process inspector. */
export function renderDomainInspector(w:World,domain:ControlDomain):string{
 const qualification=w.qualifications.find(q=>q.domain===domain.id),issue=operatingIssue(w,domain);
 const tuners=domain.tuners.map(id=>w.entities.find(e=>e.id===id)).filter((e):e is NonNullable<typeof e>=>!!e);
 const reference=domain.reference?w.references.find(r=>r.id===domain.reference):undefined;
 const status=qualification?.status??'idle';
 const statusClass=status==='qualified'?'green':status==='failed'||status==='stale'?'amber':'';
 const progress=qualification?qualification.status==='testing'?`${qualification.counters}/3 accepted cycles`:`signature ${configurationSignature(w,domain).length} chars`:'—';
 return `<div class="domain-inspector" data-domain="${esc(domain.id)}">
  <div class="stat-row"><span>Control domain</span><strong>${esc(domain.name)}</strong></div>
  <div class="stat-row"><span>Reference</span><strong>${reference?esc(reference.source):'unbound'}</strong></div>
  <div class="stat-row"><span>Assigned tuners</span><strong>${tuners.length?tuners.map(t=>esc(t.id)).join(', '):'none'}</strong></div>
  <div class="stat-row"><span>Certificate</span><strong class="${statusClass}">${status.toUpperCase()}</strong></div>
  <div class="stat-row"><span>Test</span><strong>${esc(progress)}</strong></div>
  ${qualification?.reason?`<p>${esc(qualification.reason)}${qualification.code?` <small>code: ${esc(qualification.code)}</small>`:''}</p>`:''}
  ${issue?`<p class="blocker">${esc(issue.reason)} <small>code: ${esc(issue.code)}</small></p>`:''}
 </div>`;
}
