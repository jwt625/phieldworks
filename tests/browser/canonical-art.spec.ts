import {test,expect} from '@playwright/test';
test('canonical art gallery covers the planned tree and supports held animation inspection',async({page})=>{
 const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
 await page.goto('/assets/technology/nodes/index.html');
 await expect(page.locator('[data-art-node]')).toHaveCount(27);
 await expect(page.locator('#art-count')).toContainText('27 / 27');
 await page.locator('[data-art-node=research]').click();
 await expect(page.locator('#art-detail')).toContainText('Research workbench');
 await expect(page.locator('#art-detail')).toContainText('Research laboratory');
 await page.locator('[data-select-art=qualification]').click();await expect(page.locator('#art-detail h2')).toHaveText('Qualified outpost');
 await page.locator('#art-search').fill('membrane');await expect(page.locator('[data-art-node=nanofab]')).toBeVisible();await expect(page.locator('[data-art-node=outpost]')).toBeHidden();await page.locator('#art-search').fill('');
 await expect(page.locator('#motion-cards canvas')).toHaveCount(10);
 const death=page.locator('[data-motion=crawler-death-v1] canvas');await expect(death).toHaveAttribute('data-frame','0');
 await page.locator('#motion-step').click();await expect(death).toHaveAttribute('data-frame','1');await page.locator('#motion-direction').selectOption('3');await expect(death).toHaveAttribute('data-direction','3');
 for(let i=0;i<4;i++)await page.locator('#motion-step').click();await expect(death).toHaveAttribute('data-frame','3');
 const held=await death.screenshot();await page.waitForTimeout(220);expect((await death.screenshot()).equals(held)).toBe(true);
 await page.screenshot({path:'test-results/canonical-art-gallery.png',fullPage:true});expect(failures).toEqual([]);
});
test('in-game research detail displays generated art without spending stock',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('phieldworks.tutorial.v1',JSON.stringify({closed:true,index:0})));
 await page.goto('/');await expect(page.locator('#runtime-status')).toHaveText('SIMULATION ONLINE');
 await page.locator('#technology').click();
 const before=await page.evaluate(()=>(window as any).phieldworks.snapshot().stock);
 await page.locator('#tech-dev-toggle').click();await page.locator('[data-tech-node=photonics]').click();
 const art=page.locator('#tech-detail img.technology-art');await expect(art).toBeVisible();await expect.poll(()=>art.evaluate((im:HTMLImageElement)=>im.complete&&im.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>(window as any).phieldworks.snapshot().stock)).toEqual(before);
 await page.screenshot({path:'test-results/technology-integrated-art.png'});
});
