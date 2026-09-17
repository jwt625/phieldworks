import {test,expect,type Page} from '@playwright/test';

async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0,started:true})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
const HUD=['.map-toolbar','.objective-chip','#minimap-toggle','#minimap-wrap','#map-hint','#inspector-drawer','#catalog-popover','#tutorial'];
async function exposedPct(page:Page){
 return page.evaluate((selectors)=>{
  const cr=document.getElementById('world')!.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,rects:{x:number;y:number;w:number;h:number}[]=[];
  for(const s of selectors){const el=document.querySelector<HTMLElement>(s);if(!el||el.hidden)continue;const st=getComputedStyle(el);if(st.display==='none'||st.visibility==='hidden')continue;const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0)continue;rects.push({x:r.x,y:r.y,w:r.width,h:r.height});}
  const step=2;let total=0,occ=0;for(let y=Math.max(cr.top,0);y<Math.min(cr.bottom,vh);y+=step)for(let x=Math.max(cr.left,0);x<Math.min(cr.right,vw);x+=step){total++;let c=false;for(const r of rects)if(x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h){c=true;break;}if(c)occ++;}
  return +(((total-occ)*step*step)/(vw*vh)*100).toFixed(1);
 },HUD);
}

test('icon controls expose accessible names and pressed state',async({page})=>{
 await ready(page);
 for(const id of ['menu','technology','issues','pause','speed','home','overlay','grid','tool-select','tool-field','tool-material','tool-power','tool-module','tool-blueprint','catalog-toggle','minimap-toggle'])await expect(page.locator(`#${id}`)).toHaveAttribute('aria-label',/.+/);
 await expect(page.locator('#tool-select')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#catalog-toggle')).toHaveAttribute('aria-expanded','false');
 await page.locator('#catalog-toggle').click();await expect(page.locator('#catalog-toggle')).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#build-search')).toBeVisible();
 await page.locator('#catalog-close').click();await expect(page.locator('#build-search')).toBeHidden();
 await page.locator('#menu').click();await page.locator('#session-resume').click();
});

test('escape priority: popovers, then active tool, then session menu',async({page})=>{
 await ready(page);
 await page.locator('#catalog-toggle').click();await expect(page.locator('#catalog-popover')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('#catalog-popover')).toBeHidden();await expect(page.locator('#session')).toBeHidden();
 await expect(page.locator('#catalog-toggle')).toBeFocused();
 await page.locator('#tool-power').click();await expect(page.locator('#tool-power')).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Escape');await expect(page.locator('#tool-power')).toHaveAttribute('aria-pressed','false');await expect(page.locator('#session')).toBeHidden();
 await page.keyboard.press('Escape');await expect(page.locator('#session')).toBeVisible();
 await expect(page.locator('#runtime-status')).toHaveText('SIMULATION PAUSED');
});

test('keyboard-only placement then menu round trip',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 const before=(await page.evaluate(()=>(window as any).phieldworks.snapshot())).entities.length;
 await page.locator('#world').focus();
 await page.keyboard.press('7');
 for(let i=0;i<45;i++)await page.keyboard.press('ArrowLeft');
 for(let i=0;i<45;i++)await page.keyboard.press('ArrowUp');
 await page.keyboard.press('Enter');
 const after=await page.evaluate(()=>(window as any).phieldworks.snapshot());
 expect(after.entities.length).toBe(before+1);
 expect(after.entities.some((e:any)=>e.kind==='emitter'&&e.x===0&&e.y===0)).toBe(true);
 await page.keyboard.press('Escape');
 await page.locator('#tool-field').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#tool-field')).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Escape');
 await page.keyboard.press('Escape');await expect(page.locator('#session')).toBeVisible();
 await page.locator('#session-resume').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#session')).toBeHidden();
});

test('no console or page errors, and hidden panels stay out of tab order',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 await ready(page);
 await page.locator('#catalog-toggle').click();await page.locator('[data-build=tuner]').click();
 await page.locator('#objective-toggle').click();await page.locator('#objective-toggle').click();
 await page.locator('#minimap-toggle').click();await page.locator('#minimap-close').click();
 const p=await page.evaluate(()=>(window as any).phieldworks.screen(4,18));await page.mouse.click(p.x,p.y);await page.waitForTimeout(150);
 await expect(page.locator('#build-search')).toBeHidden();
 await expect(page.locator('#objective-panel')).toBeHidden();
 for(let i=0;i<8;i++)await page.keyboard.press('Tab');
 expect(await page.evaluate(()=>{const a=document.activeElement as HTMLElement|null;return !a||!a.closest('#catalog-popover,#objective-panel');})).toBe(true);
 expect(errors).toEqual([]);
});

test('no body scrollbars or clipped controls at required viewports',async({page})=>{
 await ready(page);
 for(const [w,h] of [[1024,768],[1366,768],[1440,1000],[1920,1080],[1093,614]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(120);
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,cw:innerWidth,ch:innerHeight,toolbar:document.querySelector('.map-toolbar')!.getBoundingClientRect(),strip:document.querySelector('.build-strip')!.getBoundingClientRect(),obj:document.querySelector('.objective-chip')!.getBoundingClientRect()}));
  expect(m.sw,w+' scrollWidth').toBeLessThanOrEqual(m.cw);
  expect(m.sh,h+' scrollHeight').toBeLessThanOrEqual(m.ch);
  expect(m.toolbar.right).toBeLessThanOrEqual(m.cw+1);
  expect(m.strip.bottom).toBeLessThanOrEqual(m.ch+1);
  expect(m.obj.right).toBeLessThanOrEqual(m.cw+1);
 }
});

test('exposed-area and minimap-cost budgets hold',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 for(const [w,h] of [[1366,768],[1440,1000],[1920,1080],[1024,768]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(150);
  const normal=await exposedPct(page);
  expect(normal,w+'x'+h+' normal').toBeGreaterThanOrEqual(w<1366?82:85);
  await page.locator('#minimap-toggle').click();await page.waitForTimeout(100);
  const expanded=await exposedPct(page);
  expect(normal-expanded,w+'x'+h+' minimap cost').toBeLessThanOrEqual(3);
  await page.locator('#minimap-close').click();
  const p=await page.evaluate(()=>(window as any).phieldworks.screen(4,18));await page.mouse.click(p.x,p.y);await page.waitForTimeout(120);
  const inspecting=await exposedPct(page);
  expect(inspecting,w+'x'+h+' inspecting').toBeGreaterThanOrEqual(w<1366?58:65);
  await page.keyboard.press('Escape');await page.waitForTimeout(80);
 }
});

test.describe('DPR2 smoke',()=>{
 test.use({deviceScaleFactor:2,viewport:{width:1366,height:768}});
 test('DPR2 backing store and pointer mapping stay correct',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0,started:true})));
  await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');
  const m=await page.evaluate(()=>{const c=document.getElementById('world') as HTMLCanvasElement;return {cssW:c.clientWidth,cssH:c.clientHeight,pxW:c.width,pxH:c.height,dpr:devicePixelRatio};});
  expect(m.dpr).toBe(2);
  expect(m.pxW).toBeGreaterThanOrEqual(m.cssW*1.5);
  const hit=await page.evaluate(()=>{const p=(window as any).phieldworks.screen(4,18),el=document.elementFromPoint(p.x,p.y);return el?.id||el?.tagName;});
  expect(hit).toBe('world');
 });
});
