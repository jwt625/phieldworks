/** Offline validation of planning artifacts; does not validate runtime implementation. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const exists=p=>existsSync(resolve(root,p));
const tasks=json('DevLog/planning/tranche-a-tasks.json');
const art=json('assets/planning/tranche-a-assets.json');
const refs=json('DevLog/references/tranche-a/manifest.json');
function graph(records,label){
 const map=new Map(records.map(x=>[x.id,x]));
 assert.equal(map.size,records.length,`${label}: duplicate ID`);
 const visiting=new Set(),done=new Set();
 function visit(id){
  assert.ok(map.has(id),`${label}: missing dependency ${id}`);
  assert.ok(!visiting.has(id),`${label}: dependency cycle at ${id}`);
  if(done.has(id))return;
  visiting.add(id);
  for(const dep of map.get(id).depends_on??[])visit(dep);
  visiting.delete(id);done.add(id);
 }
 for(const id of map.keys())visit(id);
 return map;
}
const taskMap=graph(tasks.tasks,'coding');graph(art.jobs,'assets');
assert.equal(tasks.schema_version,1);assert.equal(art.schema_version,1);
assert.equal(refs.schema_version,1);
const creates=new Map();
for(const t of tasks.tasks)for(const p of t.creates){
 if(!creates.has(p))creates.set(p,[]);creates.get(p).push(t.id);
}
function ancestors(id,set=new Set()){
 for(const dep of taskMap.get(id).depends_on){if(!set.has(dep)){set.add(dep);ancestors(dep,set);}}
 return set;
}
for(const t of tasks.tasks){
 assert.ok(['planned','in-progress'].includes(t.status));assert.ok(t.acceptance.length>20);
 if(t.status==='in-progress')assert.ok(t.scope_override,`${t.id}: premature work needs explicit scope record`);
 for(const p of t.modifies)assert.ok(exists(p)||(creates.get(p)??[]).some(owner=>ancestors(t.id).has(owner)),`${t.id}: missing prerequisite file ${p}`);
}
assert.equal(art.runtime_loader,false);
assert.equal(typeof art.generation_policy.generate_now,'boolean');
assert.deepEqual(art.equipment.footprint_tiles,[3,3]);
assert.equal(art.equipment.ports.length,1);
assert.deepEqual(art.equipment.wave_ports,[]);assert.deepEqual(art.equipment.material_ports,[]);
let selected=0;
for(const j of art.jobs){
 assert.ok(['planned','needs-correction'].includes(j.status));
 for(const ref of j.reference_inputs)assert.ok(exists(ref),`${j.id}: missing art reference ${ref}`);
 for(const k of ['source_path','sha256','measured_size','crop','ground_anchor_px','port_landmarks_px'])assert.equal(j[k],null,`${j.id}: fabricated measurement ${k}`);
 if(j.type==='generation'){assert.ok(j.prompt?.length>80);assert.equal(j.outputs,j.variants.length);selected+=j.outputs;}
}
assert.equal(selected,art.generation_policy.estimated_selected_outputs);
let candidateCount=0;
if(art.generation_policy.generate_now){
 const review=json(art.review_record);
 assert.equal(review.geometry_review.runtime_validated,false);
 const ids=new Set(review.candidates.map(c=>c.id));assert.equal(ids.size,review.candidates.length);
 assert.ok(ids.has(review.selected_candidate));
 for(const c of review.candidates){
  const data=readFileSync(resolve(root,c.path));
  assert.equal(createHash('sha256').update(data).digest('hex'),c.measurements.sha256);
  assert.ok(exists(c.provenance_path));assert.equal(c.production_ready,false);
  if(c.measurements.transparentFraction===0)assert.ok(['needs-alpha','rejected-background'].includes(c.status));
  for(const p of c.evidence_paths)assert.ok(exists(p),`${c.id}: missing evidence ${p}`);
  candidateCount++;
 }
 for(const j of art.jobs)for(const id of j.candidate_ids??[])assert.ok(ids.has(id));
}
let cachedBytes=0;
const refIds=new Set();
for(const r of refs.references){
 assert.ok(!refIds.has(r.id));refIds.add(r.id);
 const data=readFileSync(resolve(root,'DevLog/references/tranche-a',r.path));
 assert.equal(data.length,r.bytes,`${r.id}: byte length changed`);
 assert.equal(createHash('sha256').update(data).digest('hex'),r.sha256,`${r.id}: checksum mismatch`);
 if(r.path.endsWith('.pdf'))assert.equal(data.subarray(0,5).toString(),'%PDF-');
 assert.ok(r.url.startsWith('https://'));cachedBytes+=data.length;
}
const docs=['DevLog/019-tranche-a-plan.md','DevLog/020-tranche-a-contracts.md','DevLog/021-tranche-a-coding-tasks.md','DevLog/022-tranche-a-assets.md','DevLog/references/tranche-a/README.md'];
let links=0;
for(const doc of docs){
 assert.ok(!read(doc).split('\n').some(line=>/[ \t]+$/.test(line)),`${doc}: trailing whitespace`);
 for(const match of read(doc).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=match[1];if(/^(https?:|#)/.test(target))continue;
  const p=resolve(root,dirname(doc),decodeURIComponent(target.split('#')[0]));
  assert.ok(existsSync(p),`${doc}: broken link ${target}`);links++;
 }
}
// Independent analytic examples printed in 020; not a runtime solver test.
for(const [phase,want] of [[0,[40,0]],[Math.PI/2,[20,20]],[Math.PI,[0,40]]]){
 const useful=20*(1+Math.cos(phase)),guard=20*(1-Math.cos(phase));
 assert.ok(Math.abs(useful-want[0])<1e-8&&Math.abs(guard-want[1])<1e-8);
 assert.ok(Math.abs(useful+guard-40)<1e-8);
}
assert.equal(14+12+5+6+20+18,75);
assert.equal(2*(75+3*2),162);
console.log(JSON.stringify({status:'pass',scope:'Planning structure and recorded candidate hashes only; runtime integration and human acceptance remain untested',candidateCount,codingTasks:tasks.tasks.length,assetJobs:art.jobs.length,plannedRasterOutputs:selected,checkedLocalLinks:links,cachedReferences:refIds.size,cachedBytes},null,2));
