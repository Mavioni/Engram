import {test,expect} from '@playwright/test'

test('Notebook loads without requiring a broken production authentication service',async({page})=>{
  await page.goto('/')
  await expect(page.getByRole('heading',{name:/Make room for thought/i})).toBeVisible()
  await page.getByRole('button',{name:'Settings',exact:true}).first().click()
  await expect(page.getByRole('dialog',{name:'Notebook settings'})).toBeVisible()
  await expect(page.getByText(/not encrypted or synced to the cloud/i)).toBeVisible()
  await expect(page.getByRole('button',{name:'Export backup'})).toBeVisible()
})

test('Notebook backup is a valid JSON export of user-authored content',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:'New page'}).click()
  await page.getByRole('textbox',{name:'Page title'}).fill('My private page')
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('engram.notebook.v2')?.includes('My private page'))).toBe(true)
  const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('engram.notebook.v2')||'[]'))
  expect(data).toHaveLength(1)
  expect(data[0]).toMatchObject({kind:'note',title:'My private page'})
  expect(typeof data[0].id).toBe('string')
})
