import { test, expect } from '@playwright/test'

for(const viewport of [{width:360,height:780},{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]) {
  test(`Notebook, mood labels, and Engram layout at ${viewport.width}px`, async ({page},testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading',{name:/Make room for thought/i})).toBeVisible()
    await page.screenshot({path:testInfo.outputPath(`notebook-${viewport.width}.png`),fullPage:true,animations:'disabled'})
    await (viewport.width<=760?page.getByRole('button',{name:'Check in'}):page.getByRole('button',{name:'Mood check-in'})).click()
    for(const mood of ['Radiant','Content','Calm','Neutral','Tender','Anxious','Low','Overwhelmed']) {
      await expect(page.getByRole('button',{name:mood,exact:true})).toBeVisible()
    }
    await page.screenshot({path:testInfo.outputPath(`mood-${viewport.width}.png`),fullPage:true,animations:'disabled'})
    await page.getByRole('button',{name:'Calm',exact:true}).click()
    await page.getByRole('button',{name:'Sleep',exact:true}).click()
    await page.getByPlaceholder('What made today feel this way?').fill('The day felt steady.')
    await page.getByRole('button',{name:'Save check-in'}).click()
    await expect(page.getByRole('textbox',{name:'Page title'})).toHaveValue('Feeling calm')
    await expect(page.getByRole('textbox',{name:'Page content'})).toHaveValue('The day felt steady.')
    await (viewport.width<=760?page.getByRole('navigation',{name:'Mobile navigation'}):page.getByRole('navigation',{name:'Main navigation'})).getByRole('button',{name:'Engram'}).click()
    await expect(page.getByLabel('Your Engram visualization')).toBeVisible()
    await expect(page.locator('canvas.graph-canvas')).toBeVisible()
    await page.screenshot({path:testInfo.outputPath(`engram-${viewport.width}.png`),fullPage:true,animations:'disabled'})
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2)
    expect(overflow).toBe(false)
  })
}

test('a mood check-in saves real selected factors and intensity',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:'Mood check-in'}).click()
  await page.getByRole('button',{name:'Anxious'}).click()
  await page.getByRole('button',{name:'Work'}).click()
  await page.getByRole('slider').fill('80')
  await page.getByRole('button',{name:'Save check-in'}).click()
  await page.getByRole('button',{name:'Settings',exact:true}).first().click()
  await expect(page.getByText('1 pages saved on this device')).toBeVisible()
  const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('engram.notebook.v2')||'[]'))
  expect(data).toEqual([expect.objectContaining({kind:'mood',mood:'Anxious',intensity:80,factors:['Work']})])
})
