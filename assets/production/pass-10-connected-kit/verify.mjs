/** Real-browser rendering + source-interface and assembled-route checks. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),out=resolve(root,'assets/production/pass-10-connected-kit');
const types={'.html':'text/html','.mjs':'text/javascript','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(relative(root,file).startsWith('..'))throw Error('bad path');const data=await readFile(file);res.setHeader('Content-Type',types[extname(file)]??'text/plain');res.end(data);}catch{res.statusCode=404;res.end('not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const address=`http://127.0.0.1:${server.address().port}/assets/production/pass-10-connected-kit/index.html`;
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(chrome)?{executablePath:chrome}:{});
const errors=[];
try{
 await mkdir(out,{recursive:true});
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(address);await page.waitForFunction(()=>window.ready);
 const report=await page.evaluate(()=>{
  const {kit,fixtures,texture}=window;
  const failures=[],edgeProfiles={},rendered={};
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const profile=(data,dir)=>Array.from({length:128},(_,i)=>{const x=dir==='W'?0:dir==='E'?127:i,y=dir==='N'?0:dir==='S'?127:i;const k=(y*128+x)*4;return Array.from(data.slice(k,k+4));});
  for(const kind of kit.kinds)for(const tier of ['basic','precision']){
   const c=canvas(128,128),ctx=c.getContext('2d');kit.drawTile(ctx,kind,tier,texture);const data=ctx.getImageData(0,0,128,128).data;rendered[kind+'/'+tier]=c;
   for(const dir of kit.portMap[kind])edgeProfiles[kind+'/'+tier+'/'+dir]=profile(data,dir);
   // Independent raster flood fill: every visible terminal belongs to a continuous
   // casing in the tile. Crossings have separate logical channels tested below.
   if(!kind.startsWith('cross')){
    const ports=kit.portMap[kind].map(d=>({N:[64,0],E:[127,64],S:[64,127],W:[0,64]})[d]);
    const seen=new Uint8Array(128*128),queue=[ports[0][1]*128+ports[0][0]];seen[queue[0]]=1;
    for(let j=0;j<queue.length;j++){const at=queue[j],x=at%128,y=Math.floor(at/128);for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(nx>=0&&nx<128&&ny>=0&&ny<128){const n=ny*128+nx;if(!seen[n]&&data[n*4+3]>128){seen[n]=1;queue.push(n);}}}
    if(ports.some(([x,y])=>!seen[y*128+x]))failures.push('Disconnected casing '+kind+'/'+tier);
   }
  }
  let comparisons=0,maxError=0;
  for(const [a,pa] of Object.entries(edgeProfiles))for(const [b,pb] of Object.entries(edgeProfiles)){
   const da=a.split('/').at(-1),db=b.split('/').at(-1);if(kit.opposite[da]!==db)continue;
   comparisons++;let error=0;for(let i=0;i<128;i++)for(let c=0;c<4;c++)error=Math.max(error,Math.abs(pa[i][c]-pb[i][c]));maxError=Math.max(error,maxError);
   if(error>0)failures.push(`Mating profile mismatch ${a} -> ${b}: ${error}`);
  }
  const repeat={};for(const kind of ['h','v']){const pa=edgeProfiles[kind+'/basic/'+(kind==='h'?'W':'N')],pb=edgeProfiles[kind+'/basic/'+(kind==='h'?'E':'S')];repeat[kind]={exactRGBA:JSON.stringify(pa)===JSON.stringify(pb),width:pa.filter(p=>p[3]>128).length};}
  // Test scale AND fractional camera translation with pixel readback, at DPR 1/2.
  const renderChecks=[];
  for(const dpr of [1,2])for(const scale of [.25,.5,1,1.25,2])for(const f of fixtures){
   const c=canvas(Math.ceil((f.w*128*scale+30)*dpr),Math.ceil((f.h*128*scale+30)*dpr)),ctx=c.getContext('2d');ctx.scale(dpr,dpr);
   const ox=12.37,oy=12.19,net=kit.drawAssembly(ctx,f.tiles,{scale,offsetX:ox,offsetY:oy,texture});
   const data=ctx.getImageData(0,0,c.width,c.height).data;
   const alpha=(x,y)=>data[(Math.floor(y)*c.width+Math.floor(x))*4+3];
   let minAlpha=255;
   for(const {a,dir} of net.joins){const [px,py]=kit.terminals[dir],cx=(ox+(a.x*128+px)*scale)*dpr,cy=(oy+(a.y*128+py)*scale)*dpr;
    for(let t=-3;t<=3;t++){const x=cx+(dir==='E'?t:0),y=cy+(dir==='S'?t:0);minAlpha=Math.min(minAlpha,alpha(x,y));}
   }
   if(minAlpha<250)failures.push(`Join transparency ${f.id} scale=${scale} DPR=${dpr}: ${minAlpha}`);
   let gapMax=0;if(f.id==='gap'){
    for(let x=Math.ceil((ox+3*128*scale)*dpr)+2;x<Math.floor((ox+4*128*scale)*dpr)-2;x++)for(let y=Math.ceil((oy+48*scale)*dpr);y<Math.floor((oy+80*scale)*dpr);y++)gapMax=Math.max(gapMax,alpha(x,y));
    if(gapMax!==0)failures.push(`False gap bridge scale=${scale} DPR=${dpr}: ${gapMax}`);
   }
   renderChecks.push({fixture:f.id,scale,dpr,joins:net.joins.length,openEnds:net.open.length,minJoinAlpha:minAlpha,gapMaxAlpha:gapMax});
  }
  const loop=kit.topology(fixtures.find(f=>f.id==='loop').tiles);if(loop.open.length)failures.push('Closed loop has open terminals');
  for(const kind of ['cross-h','cross-v'])if(JSON.stringify(kit.connections(kind))!==JSON.stringify([['W','E'],['N','S']]))failures.push('Crossing joins channels');
  if(kit.connections('junction')[0].length!==4)failures.push('Junction not four-way');
  const atlas=canvas(9*132,2*132),ac=atlas.getContext('2d'),entries=[];
  kit.kinds.forEach((kind,i)=>['basic','precision'].forEach((tier,j)=>{
   ac.save();ac.beginPath();ac.rect(i*132,j*132,132,132);ac.clip();ac.translate(i*132+2,j*132+2);kit.drawTile(ac,kind,tier,texture);ac.restore();
   entries.push({kind,tier,rect:[i*132+2,j*132+2,128,128],gutter:2,ports:kit.portMap[kind].map(dir=>({dir,position:kit.terminals[dir],width:32})),channels:kit.connections(kind)});
  }));
  return {failures,comparisons,maxEdgeChannelError:maxError,repeat,renderChecks,atlas:atlas.toDataURL(),entries};
 });
 const atlas=report.atlas;delete report.atlas;
 await writeFile(resolve(out,'connected-kit-atlas.png'),Buffer.from(atlas.split(',')[1],'base64'));
 await writeFile(resolve(out,'atlas.json'),JSON.stringify({version:1,status:'render-prototype-not-gameplay',tileSize:128,textureSource:'../pass-09-wave-logistics/straight-h-repeat-v1.png',entries:report.entries},null,2)+'\n');delete report.entries;
 await page.reload();await page.waitForFunction(()=>window.ready&&window.atlas);
 report.atlasChecks=await page.evaluate(()=>{
  const {kit,fixtures,atlas,texture}=window,checks=[],failures=[];
  const full=document.createElement('canvas');full.width=atlas.image.width;full.height=atlas.image.height;const fc=full.getContext('2d');fc.drawImage(atlas.image,0,0);
  let maxExportError=0;
  for(const entry of atlas.entries){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');kit.drawTile(ctx,entry.kind,entry.tier,texture);const expected=ctx.getImageData(0,0,128,128).data,actual=fc.getImageData(...entry.rect).data;for(let i=0;i<actual.length;i++)maxExportError=Math.max(maxExportError,Math.abs(expected[i]-actual[i]));}
  if(maxExportError)failures.push('Export pixels differ: '+maxExportError);
  for(const dpr of [1,2])for(const scale of [.25,.5,1,1.25,2])for(const f of fixtures){
   const c=document.createElement('canvas');c.width=Math.ceil((f.w*128*scale+30)*dpr);c.height=Math.ceil((f.h*128*scale+30)*dpr);const ctx=c.getContext('2d');ctx.scale(dpr,dpr);
   const ox=12.37,oy=12.19,net=kit.drawAssembly(ctx,f.tiles,{scale,offsetX:ox,offsetY:oy,atlas});const data=ctx.getImageData(0,0,c.width,c.height).data;
   const alpha=(x,y)=>data[(Math.floor(y)*c.width+Math.floor(x))*4+3];let minAlpha=255;
   for(const {a,dir} of net.joins){const [px,py]=kit.terminals[dir],x=(ox+(a.x*128+px)*scale)*dpr,y=(oy+(a.y*128+py)*scale)*dpr;for(let t=-3;t<=3;t++)minAlpha=Math.min(minAlpha,alpha(x+(dir==='E'?t:0),y+(dir==='S'?t:0)));}
   let gapMax=0;if(f.id==='gap')for(let x=Math.ceil((ox+3*128*scale)*dpr)+2;x<Math.floor((ox+4*128*scale)*dpr)-2;x++)for(let y=Math.ceil((oy+48*scale)*dpr);y<Math.floor((oy+80*scale)*dpr);y++)gapMax=Math.max(gapMax,alpha(x,y));
   if(minAlpha<250||gapMax)failures.push(`Atlas continuity ${f.id}/${scale}/${dpr}: ${minAlpha}, gap ${gapMax}`);
   checks.push({fixture:f.id,scale,dpr,minJoinAlpha:minAlpha,gapMaxAlpha:gapMax});
  }
  return {maxExportError,checks,failures};
 });
 report.failures.push(...report.atlasChecks.failures);
 await page.selectOption('#render','atlas');
 const captures=[];
 for(const background of ['light','dark','terrain']){
  await page.selectOption('#background',background);await page.selectOption('#scale','.5');
  const name=`assembly-${background}-dpr1.png`;await page.screenshot({path:resolve(out,name),fullPage:true});captures.push(name);
 }
 // A zoomed inspectable crop at 2x, including turns/junction and both crossings.
 await page.setViewportSize({width:2800,height:1000});await page.selectOption('#background','light');await page.selectOption('#scale','2');
 const panels=page.locator('.panel');for(const [index,name] of [[1,'loop-2x'],[4,'junction-2x'],[5,'cross-h-2x'],[6,'cross-v-2x']]){await panels.nth(index).screenshot({path:resolve(out,name+'.png')});captures.push(name+'.png');}
 await page.setViewportSize({width:1200,height:900});await page.selectOption('#background','terrain');await page.selectOption('#scale','.25');await page.screenshot({path:resolve(out,'overview-quarter.png'),fullPage:true});captures.push('overview-quarter.png');
 const retina=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});retina.on('pageerror',e=>errors.push(String(e)));await retina.goto(address);await retina.waitForFunction(()=>window.ready);await retina.selectOption('#render','atlas');await retina.selectOption('#background','terrain');await retina.selectOption('#scale','1.25');await retina.locator('.panel').nth(1).screenshot({path:resolve(out,'loop-fractional-dpr2.png')});captures.push('loop-fractional-dpr2.png');
 report.browser=browser.version();report.captures=captures;report.pageErrors=errors;
 report.sourceHashes={};for(const file of ['kit.mjs','fixtures.mjs','verify.mjs','connected-kit-atlas.png'])report.sourceHashes[file]=createHash('sha256').update(await readFile(resolve(out,file))).digest('hex');
 await writeFile(resolve(out,'validation.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({comparisons:report.comparisons,maxEdgeChannelError:report.maxEdgeChannelError,repeat:report.repeat,assembledChecks:report.renderChecks.length,atlasChecks:report.atlasChecks.checks.length,maxExportError:report.atlasChecks.maxExportError,failures:report.failures,pageErrors:errors,captures},null,2));
 if(report.failures.length||errors.length)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
