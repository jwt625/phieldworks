import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url);
const executablePath='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(executablePath)?{executablePath}:{});
try {
 const page=await browser.newPage();const result=[];
 for(const file of ['belt-conditions-v1.png','belt-conditions-v2.png','wave-condition-effects-v1.png']){
  const bytes=readFileSync(new URL(file,root));
  const pixels=await page.evaluate(async url=>{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let zero=0,opaque=0;for(let i=3;i<d.length;i+=4){zero+=d[i]===0;opaque+=d[i]===255}return {width:im.width,height:im.height,transparentPixels:zero,opaquePixels:opaque,totalPixels:d.length/4}},'data:image/png;base64,'+bytes.toString('base64'));
  result.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),...pixels});
 }
 writeFileSync(new URL('source-audit.json',root),JSON.stringify(result,null,2)+'\n');console.log(result);
 await page.goto(new URL('index.html',root).href);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));await page.locator('#play').click();await page.screenshot({path:new URL('review.png',root).pathname,fullPage:true});
} finally {await browser.close()}
