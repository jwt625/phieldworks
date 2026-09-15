import {test,expect,type Page} from '@playwright/test';

async function start(page:Page){
 await page.addInitScript(()=>{
  localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0}));
  const native=CanvasRenderingContext2D.prototype.drawImage;
  (window as any).clipDraws=[];
  CanvasRenderingContext2D.prototype.drawImage=function(this:CanvasRenderingContext2D,...args:any[]){
   const im=args[0];
   if(im instanceof HTMLImageElement&&(/pass-07|condition-v1/.test(im.src))){
    const draws=(window as any).clipDraws;draws.push({src:im.src,frame:args.slice(1,5),composite:this.globalCompositeOperation});if(draws.length>3000)draws.shift();
   }
   return (native as any).apply(this,args);
  } as any;
 });
 await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');
}
async function fixture(page:Page,health:number,rotation=0,firing=false){
 await page.evaluate(async({health,rotation,firing})=>{
  const url='/src/sim/world.ts';const sim=await import(/* @vite-ignore */ url);const w=sim.createWorld();
  for(const e of w.entities)if(e.kind==='extractor'||e.kind==='assembler'){e.health=health;e.rotation=rotation;e.ore=e.kind==='assembler'?10:0;e.progress=.2;}
  if(rotation)w.links=w.links.filter((l:any)=>!w.entities.some((e:any)=>(e.kind==='extractor'||e.kind==='assembler')&&(l.a.node===e.id||l.b.node===e.id)));
  const sentry=sim.newEntity('sentry',12,5,'e99');w.entities.push(sentry);
  sim.connect(w,'power',{node:w.entities.find((e:any)=>e.kind==='generator').id,port:0},{node:sentry.id,port:0});
  if(firing){w.ecology.defenseReady=true;w.ecology.grace=0;Object.assign(w.ecology.creatures[0],{x:16,y:5,exposure:50,health:30});}
  localStorage.setItem('fieldworks.save.v1',sim.serialize(w));
 },{health,rotation,firing});
 await page.locator('#load').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).phieldworks.snapshot().entities.some((e:any)=>e.id==='e99'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>(window as any).phieldworks.snapshot().entities.find((e:any)=>e.kind==='assembler').rotation)).toBe(rotation);
 await page.evaluate(()=>{(window as any).clipDraws=[];});
}
const frames=(page:Page,id:string)=>page.evaluate(id=>[...new Set((window as any).clipDraws.filter((d:any)=>d.src.includes(id)).map((d:any)=>JSON.stringify(d.frame)))],id);

test('promoted clips render in the real outpost, advance, pause and preserve damage',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await fixture(page,35);
 for(const id of ['extractor-severe-r0','assembler-severe-r0-cycle-v4','generator-r0'])await expect.poll(async()=>(await frames(page,id)).length).toBeGreaterThan(1);
 await expect.poll(async()=>(await frames(page,'sentry-r0')).length).toBe(1); // ready does not recoil
 expect(await page.evaluate(()=>(window as any).clipDraws.filter((d:any)=>d.src.includes('pass-07')).every((d:any)=>d.composite==='source-over'))).toBe(true);
 await page.locator('#pause').click();await page.waitForTimeout(100);await page.evaluate(()=>{(window as any).clipDraws=[];});await page.waitForTimeout(250);
 for(const id of ['extractor-severe-r0','assembler-severe-r0','generator-r0'])expect((await frames(page,id)).length).toBe(1);
 await page.screenshot({path:'test-results/pass-07-gameplay.png',fullPage:true});
 await fixture(page,85);await expect.poll(async()=>(await frames(page,'assembler-light-r0')).length).toBe(1);
 await fixture(page,0);await expect.poll(async()=>(await frames(page,'assembler-condition-v1')).length).toBeGreaterThan(0);expect((await frames(page,'assembler-severe-r0')).length).toBe(0);
 expect(errors).toEqual([]);
});

test('unsupported directions use existing views and reduced motion holds promoted mechanisms',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await start(page);await fixture(page,35);
 await page.waitForTimeout(400);for(const id of ['extractor-severe-r0','assembler-severe-r0','generator-r0'])expect((await frames(page,id)).length).toBe(1);
 await fixture(page,35,1);await page.waitForTimeout(200);expect((await frames(page,'assembler-severe-r0')).length).toBe(0);expect((await frames(page,'assembler-condition-v1')).length).toBeGreaterThan(0);
});

test('sentry recoil follows combat and power loss restores dark static condition art',async({page})=>{
 await start(page);await fixture(page,100,0,true);
 await expect.poll(async()=>(await frames(page,'sentry-r0')).length).toBeGreaterThan(1);
 await page.locator('#pause').click();await page.waitForTimeout(100);await page.evaluate(()=>{(window as any).clipDraws=[];});await page.waitForTimeout(180);
 expect((await frames(page,'sentry-r0')).length).toBe(1);
 await page.evaluate(()=>{const w=(window as any).phieldworks.snapshot();w.entities.find((e:any)=>e.kind==='generator').health=0;localStorage.setItem('fieldworks.save.v1',JSON.stringify(w));});
 await page.locator('#load').click();await page.waitForTimeout(100);await page.evaluate(()=>{(window as any).clipDraws=[];});await page.waitForTimeout(180);
 expect((await frames(page,'sentry-r0')).length).toBe(0);expect((await frames(page,'generator-r0')).length).toBe(0);
 expect((await frames(page,'sentry-condition-v1')).length).toBe(1);expect((await frames(page,'generator-condition-v1')).length).toBe(1);
});
