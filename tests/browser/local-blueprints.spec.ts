import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
const snapshot=(page:Page)=>page.evaluate(()=>(window as any).fieldworks.snapshot());
const screen=(page:Page,x:number,y:number)=>page.evaluate(([x,y])=>(window as any).fieldworks.screen(x,y),[x,y]);
async function point(page:Page,x:number,y:number){const p=await screen(page,x,y);await page.mouse.click(p.x,p.y);}

test('selecting a module records a template and deploys a copy without transferring certificates',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 // Open the frontier with a second emitter branch so an eastern copy can be placed.
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Phase tuner',exact:true}).click();await point(page,17.1,12.1);
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Field emitter',exact:true}).click();await point(page,20.1,12.1);
 await page.locator('#tool-power').click();await point(page,10.5,3);await point(page,21.5,12);
 await page.locator('#tool-field').click();await point(page,16,10.4);await point(page,17,12.5);await point(page,19,12.5);await point(page,20,13.5);
 await page.locator('#tool-select').click();await page.locator('#controller').check();
 await page.locator('#speed').click();await page.locator('#speed').click();
 await expect.poll(async()=>(await snapshot(page)).frontier,{timeout:45000}).toBe(true);
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 // Select the whole outpost and record a version-2 template.
 await page.locator('#tool-module').click();
 const a=await screen(page,2,2),b=await screen(page,24,20);
 await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:6});await page.mouse.up();
 await expect(page.locator('#inspector')).toContainText('Selected machines');
 expect((await snapshot(page)).blueprint).toBeNull();
 await page.locator('[data-action=record]').click();
 let state=await snapshot(page);
 expect(state.blueprint).not.toBeNull();expect(state.blueprint.version).toBe(2);expect(state.blueprint.entities.length).toBe(9);
 await expect(page.locator('#inspector')).toContainText('external slot');
 // Pay for the copy with real production, then deploy it east.
 await page.locator('#pause').click();
 await expect.poll(async()=>(await snapshot(page)).stock.assemblies,{timeout:30000}).toBeGreaterThan(85);
 await page.locator('#pause').click();
 const before=(await snapshot(page)).entities.length;
 await page.locator('[data-action=place]').click();
 await point(page,38,3);
 state=await snapshot(page);
 if(state.entities.length!==before+9)throw new Error('placement toast: '+(await page.locator('#toast').textContent()));
 expect(state.qualifications.filter((q:any)=>q.status==='qualified').length).toBe(0);
 await page.screenshot({path:'test-results/blueprint-selection.png',fullPage:true});
 expect(errors).toEqual([]);
});
