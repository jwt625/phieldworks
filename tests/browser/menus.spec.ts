import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');}
const snapshot=(page:Page)=>page.evaluate(()=>(window as any).fieldworks.snapshot());
const camera=(page:Page)=>page.evaluate(()=>(window as any).fieldworks.camera());

test('escape opens the session menu and modal close never steals a user pause',async({page})=>{
 await ready(page);
 await page.keyboard.press('Escape');await expect(page.locator('#session')).toBeVisible();
 await expect(page.locator('#runtime-status')).toHaveText('SIMULATION PAUSED');
 for(let i=0;i<3;i++)await page.keyboard.press('Tab');
 expect(await page.evaluate(()=>!!document.activeElement?.closest('#session'))).toBe(true);
 await page.locator('#session-resume').click();await expect(page.locator('#session')).toBeHidden();
 await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await expect(page.locator('#runtime-status')).toHaveText('SIMULATION PAUSED');
 await page.keyboard.press('Escape');await expect(page.locator('#session')).toBeVisible();
 await page.locator('#session-resume').click();
 await expect(page.locator('#runtime-status')).toHaveText('SIMULATION PAUSED');
});

test('operations lists domains and the research preview spends nothing',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await page.keyboard.press('Escape');await page.locator('#session-operations').click();
 await expect(page.locator('#operations')).toBeVisible();
 await expect(page.locator('#operations-body')).toContainText('Control domains');
 await expect(page.locator('#operations-body')).toContainText('Research preview');
 const before=(await snapshot(page)).stock;
 await page.locator('[data-action=research]').click();
 await expect(page.locator('#operations')).toBeHidden();
 expect((await snapshot(page)).stock).toEqual(before);
 await page.screenshot({path:'test-results/operations-menu.png',fullPage:true});
});

test('keyboard placement cursor builds equipment without a pointer',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await page.locator('#home').click();await page.getByRole('tab',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Build Fabrication cell',exact:true}).click();
 for(let i=0;i<45;i++)await page.keyboard.press('ArrowLeft');
 for(let i=0;i<45;i++)await page.keyboard.press('ArrowUp');
 await page.keyboard.press('Enter');
 const cell=(await snapshot(page)).entities.find((e:any)=>e.kind==='fabrication-cell');
 expect(cell).toBeTruthy();expect([cell.x,cell.y]).toEqual([0,0]);
 await page.screenshot({path:'test-results/keyboard-placement.png',fullPage:true});
});

test('build search filters the palette and shortcuts are ignored while typing',async({page})=>{
 await ready(page);
 await page.locator('#build-search').fill('tuner');
 await expect(page.locator('[data-build=tuner]')).toBeVisible();
 await expect(page.locator('[data-build=emitter]')).toBeHidden();
 const before=await camera(page);
 await page.locator('#build-search').focus();await page.keyboard.press('w');
 expect((await camera(page)).panX).toBe(before.panX);
});
