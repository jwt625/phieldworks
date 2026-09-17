import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.argv[2]?new URL(process.argv[2].replace(/\/?$/, '/') , 'file://'+process.cwd()+'/'):new URL('./',import.meta.url), ledger=JSON.parse(readFileSync(new URL('jobs.json',root)));
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(chrome)?{executablePath:chrome}:{});
try{
const page=await browser.newPage();
for(const j of ledger.jobs){
 const path=new URL(j.file,root);if(!existsSync(path))continue;
 const bytes=readFileSync(path);j.measurement=await page.evaluate(async({url,rows,columns})=>{
 const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const histogram=Array(256).fill(0);for(let i=3;i<d.length;i+=4)histogram[d[i]]++;
 const cells=[];for(let r=0;r<rows;r++)for(let col=0;col<columns;col++){
 const x0=Math.round(col*c.width/columns),y0=Math.round(r*c.height/rows),x1=Math.round((col+1)*c.width/columns),y1=Math.round((r+1)*c.height/rows);let left=x1,top=y1,right=-1,bottom=-1,n=0,edge=0;
 for(let y=y0;y<y1;y++)for(let xx=x0;xx<x1;xx++){const a=d[(y*c.width+xx)*4+3];if(a>=128){n++;left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,y);bottom=Math.max(bottom,y);if(xx-x0<2||x1-xx<=2||y-y0<2||y1-y<=2)edge++}}
 cells.push({row:r,column:col,previewRect:[x0,y0,x1-x0,y1-y0],occupiedBounds:n?[left,top,right+1,bottom+1]:null,occupiedPixels:n,cellEdgePixels:edge,registeredAnchor:null,ports:null});}
 return {width:c.width,height:c.height,alphaHistogram:histogram,transparentFraction:histogram[0]/(c.width*c.height),nearOpaqueFraction:histogram.slice(250).reduce((a,b)=>a+b,0)/(c.width*c.height),cells};
 },{url:'data:image/png;base64,'+bytes.toString('base64'),rows:j.rows,columns:j.columns});
 j.sha256=createHash('sha256').update(bytes).digest('hex');j.status=j.review?.status??'generated-needs-visual-review';j.runtimeReady=false;
}
ledger.summary={jobs:ledger.jobs.length,generated:ledger.jobs.filter(j=>j.measurement).length,reviewed:ledger.jobs.filter(j=>j.review).length,runtimeReady:0};
writeFileSync(new URL('jobs.json',root),JSON.stringify(ledger,null,2)+'\n');
console.log(ledger.summary);
}finally{await browser.close()}
