import {test, expect} from '@playwright/test'

test('IRIS searches only saved Notebook content without inventing answers', async ({page})=>{
  const apiRequests:string[]=[]
  page.on('request',request=>{if(request.url().includes('/api/'))apiRequests.push(request.url())})
  await page.goto('/')
  await page.getByRole('button',{name:'New page'}).click()
  await page.getByRole('textbox',{name:'Page title'}).fill('A sunrise in Prescott')
  await page.getByRole('textbox',{name:'Page content'}).fill('The mountains looked golden at dawn.')
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'IRIS'}).click()
  await expect(page.getByText('Local recall only · Cloud AI not connected')).toBeVisible()
  await page.getByRole('textbox',{name:'SEARCH YOUR MEMORY'}).fill('golden')
  await expect(page.getByRole('button',{name:/A sunrise in Prescott/})).toBeVisible()
  await page.getByRole('textbox',{name:'SEARCH YOUR MEMORY'}).fill('unrecorded miracle')
  await expect(page.getByText('No matching pages found. IRIS only reports what your Notebook contains.')).toBeVisible()
  expect(apiRequests).toHaveLength(0)
})

test('the Engram shows real tag-linked pages only',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:'New page'}).click()
  await page.getByRole('textbox',{name:'Page title'}).fill('Reflection one')
  await page.getByRole('textbox',{name:'Tags, comma separated'}).fill('growth')
  await page.getByRole('textbox',{name:'Tags, comma separated'}).blur()
  await page.getByRole('button',{name:'New page'}).click()
  await page.getByRole('textbox',{name:'Page title'}).fill('Reflection two')
  await page.getByRole('textbox',{name:'Tags, comma separated'}).fill('growth')
  await page.getByRole('textbox',{name:'Tags, comma separated'}).blur()
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Engram'}).click()
  const viz=page.getByLabel('Your Engram visualization')
  await expect(viz.getByText('2',{exact:true}).first()).toBeVisible()
  await expect(viz.getByText('1',{exact:true}).first()).toBeVisible()
})
