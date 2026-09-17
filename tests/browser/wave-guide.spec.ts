import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
async function point(page:Page,x:number,y:number){const p=await page.evaluate(([x,y])=>(window as any).fieldworks.screen(x,y),[x,y]);await page.mouse.click(p.x,p.y);}
async function snapshot(page:Page){return page.evaluate(()=>(window as any).fieldworks.snapshot());}

// The wave guide builds a physical route with the registered straight atlas. Existing scenarios use the
// legacy field tool for compatibility, so this is the only browser coverage of physical construction.
test('the wave guide builds a physical route with registered art and no console errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url.includes('favicon'))errors.push('console: '+m.text());});
 await ready(page);
 // Free the junction B and dump IN ports by disconnecting the starter dump route.
 await page.locator('#tool-select').click();await point(page,15,16);
 await page.locator('details[data-group=ports] summary').click();
 await page.locator('[data-disconnect]').first().click();
 // Build a physical wave guide between the two now-free field ports.
 await page.locator('#tool-guide').click();
 await point(page,14,10.5);await point(page,14,16);
 const state=await snapshot(page);
 expect(state.pieces.length).toBeGreaterThanOrEqual(3);
 const physical=state.links.filter((l:any)=>Array.isArray(l.pieces)&&l.pieces.length);
 expect(physical).toHaveLength(1);
 expect(physical[0].pieces.length).toBe(state.pieces.length);
 expect(physical[0].interfaces.length).toBe(state.pieces.length+1);
 for(const piece of state.pieces){expect(piece.condition).toBe(0);if(piece.category==='elbow')expect(piece.reach).toBeGreaterThan(0);expect(Number.isInteger(piece.spans*2)).toBe(true);}
 await page.screenshot({path:'test-results/wave-guide-route.png',fullPage:true});
 expect(errors).toEqual([]);
});

test('the wave guide previews a compact or swept bill of materials before commit',async({page})=>{
 await ready(page);
 await page.locator('#tool-select').click();await point(page,15,16);
 await page.locator('details[data-group=ports] summary').click();await page.locator('[data-disconnect]').first().click();
 await page.locator('#tool-guide').click();
 await point(page,14,10.5);
 await page.keyboard.press('b'); // compact -> swept
 const swept=await page.locator('#map-hint').textContent();
 expect(swept).toContain('swept bend');
 await page.keyboard.press('b'); // swept -> compact
 expect(await page.locator('#map-hint').textContent()).toContain('compact bend');
});
