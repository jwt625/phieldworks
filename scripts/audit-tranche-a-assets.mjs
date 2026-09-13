/** Read-only pixel/provenance audit; writes review metadata and browser screenshots, never source pixels. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const reviewPath='assets/planning/tranche-a-review.json';
const review=JSON.parse(readFileSync(reviewPath,'utf8'));
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(chrome)?{executablePath:chrome}:{});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const failures=[];page.on('pageerror',e=>failures.push(e.message));
const base=process.env.PHIELDWORKS_REVIEW_URL??'http://127.0.0.1:5176';
try{
 await page.goto(base+'/assets/planning/tranche-a-review.html');await page.waitForFunction(()=>window.reviewReady);
 for(const c of review.candidates){
  const b=readFileSync(c.path),source=JSON.parse(readFileSync(c.provenance_path,'utf8'));
  if(!source.prompt||source.tool!=='image_gen.imagegen')throw new Error('Missing provenance: '+c.id);
  for(const p of source.reference_inputs)if(!existsSync(p))throw new Error('Missing reference: '+p);
  const pixels=await page.evaluate(async path=>{
   const im=new Image();im.src='/'+path;await im.decode();const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const p=ctx.getImageData(0,0,im.width,im.height).data;
   let transparent=0,partial=0;for(let i=3;i<p.length;i+=4){if(p[i]===0)transparent++;else if(p[i]<255)partial++;}
   return {transparentFraction:transparent/(im.width*im.height),partialAlphaFraction:partial/(im.width*im.height),cornerRGBA:Array.from(p.slice(0,4))};
  },c.path);
  c.measurements={width:b.readUInt32BE(16),height:b.readUInt32BE(20),pngColorType:b[25],bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),...pixels};
  c.production_ready=false;
 }
 review.audit={command:'node scripts/audit-tranche-a-assets.mjs',timestamp:new Date().toISOString(),source_pixels:'unmodified',page_errors:failures,all_sources_have_alpha:review.candidates.every(c=>c.measurements.transparentFraction>0)};
 writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
 await page.reload();await page.waitForFunction(()=>window.reviewReady);
 for(const [width,height] of [[1440,1000],[1280,800]]){
  await page.setViewportSize({width,height});
  await page.screenshot({path:`assets/planning/tranche-a-review-${width}.png`,fullPage:true});
 }
 for(const bg of ['light','dark','checker','terrain']){
  await page.selectOption('#background',bg);
  await page.locator('#previews').screenshot({path:`assets/planning/tranche-a-sizes-${bg}.png`});
 }
 if(failures.length)throw new Error(failures.join('\n'));
 console.log(JSON.stringify({candidates:review.candidates.map(c=>({id:c.id,status:c.status,...c.measurements})),pageErrors:failures,productionReady:false},null,2));
}finally{await browser.close();}
