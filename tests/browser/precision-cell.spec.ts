import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
async function point(page:Page,x:number,y:number){const p=await page.evaluate(([x,y])=>(window as any).fieldworks.screen(x,y),[x,y]);await page.mouse.click(p.x,p.y);}
const state=(page:Page)=>page.evaluate(()=>(window as any).fieldworks.snapshot());

test('a placed precision cell is inspected, bound, tuned and run through the real UI',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Phase tuner',exact:true}).click();await point(page,10.1,24.1);
 await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Fabrication cell',exact:true}).click();
 await point(page,10.1,20.1);
 await expect(page.locator('#process-body')).toBeVisible();
 await expect(page.locator('#process-body')).toContainText('Batch stage');
 await expect(page.locator('#process-body')).toContainText('Emitter assignment');
 await expect(page.locator('#process-body')).toContainText('band 80–640');
 await expect(page.locator('#process-body')).toContainText('Certificate');
 let snapshot=await state(page);const cellId=snapshot.entities.find((e:any)=>e.kind==='fabrication-cell').id,targetId=snapshot.targets.find((t:any)=>t.owner===cellId).id;
 // Bind the existing emitter with the native select and keyboard-activated button.
 await page.locator('#cell-emitter').selectOption('e6');
 await page.locator('[data-action=assign-emitter]').focus();await page.keyboard.press('Enter');
 snapshot=await state(page);expect(snapshot.targets.find((t:any)=>t.id===targetId).emitters).toContain('e6');
 await expect(page.locator('#process-body')).toContainText('1/2');
 // Bind the already-built tuner, then tune it by keyboard.
 const tunerId=(await state(page)).entities.find((e:any)=>e.kind==='tuner').id;
 await page.locator('#cell-tuner').selectOption(tunerId);
 await page.locator('[data-action=assign-tuner]').focus();await page.keyboard.press('Enter');
 snapshot=await state(page);expect((snapshot.domains.find((d:any)=>d.target===targetId) as any).tuners.length).toBe(1);
 const phase=page.locator('#cell-phase');await expect(phase).toBeEnabled();await phase.focus();
 const before=await phase.inputValue();await page.keyboard.press('ArrowRight');
 expect(await phase.inputValue()).not.toBe(before);
 // Run once is a real command: with no crystal it reports the missing ingredient.
 await page.locator('[data-action=run-once]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#toast')).toContainText('Missing');
 await page.screenshot({path:'test-results/precision-cell-inspector.png',fullPage:true});
 expect(errors).toEqual([]);
});

test('the tutorial includes a skippable first-cell lesson',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:false,index:11})));
 await page.goto('/');await expect(page.locator('#tutorial')).toContainText('precision cell');
 await expect(page.locator('[data-tutorial=next]')).toBeEnabled();
 await page.locator('[data-tutorial=skip]').click();await expect(page.locator('#tutorial')).toBeHidden();
});
