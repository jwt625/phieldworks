import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
const snapshot=(page:Page)=>page.evaluate(()=>(window as any).fieldworks.snapshot());
async function point(page:Page,x:number,y:number){const p=await page.evaluate(([x,y])=>(window as any).fieldworks.screen(x,y),[x,y]);await page.mouse.click(p.x,p.y);}
const cellAt=(state:any,x:number,y:number)=>state.entities.find((e:any)=>e.kind==='fabrication-cell'&&e.x===x&&e.y===y);

test('a fresh expedition builds and manages two independent precision cells',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Phase tuner',exact:true}).click();await point(page,10.1,24.1);
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Fabrication cell',exact:true}).click();await point(page,10.1,20.1);
 // Bind the existing emitter and the built tuner, then enable local control on the first cell.
 await page.locator('#cell-emitter').selectOption('e6');await page.locator('[data-action=assign-emitter]').click();
 const tunerId=(await snapshot(page)).entities.find((e:any)=>e.kind==='tuner').id;
 await page.locator('#cell-tuner').selectOption(tunerId);await page.locator('[data-action=assign-tuner]').click();
 await page.locator('[data-action=auto-tune]').check();
 let state=await snapshot(page);const first=cellAt(state,10,20),firstDomain=state.domains.find((d:any)=>d.target===state.targets.find((t:any)=>t.owner===first.id).id);
 expect(firstDomain.enabled).toBe(true);
 // Produce real stock for a second cell.
 await page.locator('#pause').click();await page.locator('#speed').click();await page.locator('#speed').click();
 await expect.poll(async()=>(await snapshot(page)).stock.assemblies,{timeout:30000}).toBeGreaterThan(18);
 await page.locator('#pause').click();
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Fabrication cell',exact:true}).click();await point(page,16.1,20.1);
 state=await snapshot(page);const second=cellAt(state,16,20),secondTarget=state.targets.find((t:any)=>t.owner===second.id),secondDomain=state.domains.find((d:any)=>d.target===secondTarget.id);
 expect(second).toBeTruthy();expect(secondDomain.id).not.toBe(firstDomain.id);expect(secondDomain.enabled).toBe(false);
 await expect(page.locator('#process-body')).toContainText('Certificate');
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('#session-operations').click();
 await expect(page.locator('#operations-body')).toContainText('Control domains');
 await expect(page.locator('#operations-body')).toContainText('auto tune on');
 await expect(page.locator('#operations-body')).toContainText('auto tune off');
 await page.screenshot({path:'test-results/precision-expedition.png',fullPage:true});
 expect(errors).toEqual([]);
});
