import { expect, test } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { selectAppearance, watchErrors } from './helpers'
import { COOKIE_NAME, setSharedCookie } from './shared-fixtures'

test('cookie snapshots vary SSR content and remain uncached per request', async ({ request }) => {
  for (const locale of ['en', 'zh-CN']) {
    const value = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'ocean', locale }))
    const response = await request.get('/clock', { headers: { cookie: `${COOKIE_NAME}=${value}` } })
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain(`lang="${locale}"`)
    expect(body).toContain('data-frontend-mode="dark"')
    expect(body).toContain('data-frontend-palette="ocean"')
    expect(body).toContain(locale === 'en' ? 'Time, in motion' : '让时间，轻轻流动')
    expect(response.headers()['cache-control']).toMatch(/private|no-store/u)
  }
})

test('system dark and Chinese content render before JavaScript runs', async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark', locale: 'zh-CN' })
  const page = await context.newPage()
  await page.goto(info.project.use.baseURL ?? 'http://localhost:4173')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('小小工具。')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(23, 23, 23)')
  await captureState(page, info, 'system-dark-before-javascript')
  await context.close()
})

test('malformed, oversized and duplicate cookies cannot contaminate the server snapshot', async ({ request }) => {
  const valid = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }))
  for (const cookie of [
    `${COOKIE_NAME}=%broken`,
    `${COOKIE_NAME}=${'x'.repeat(1025)}`,
    `${COOKIE_NAME}=${valid}; ${COOKIE_NAME}=${valid}`,
  ]) {
    const response = await request.get('/clock', { headers: { cookie, 'accept-language': 'en' } })
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('lang="en"')
    expect(body).toContain('data-frontend-mode="system"')
    expect(body).toContain('data-frontend-palette="neutral"')
    expect(body).toContain('Time, in motion')
  }
})

test('Chinese browser-language variants preserve Showcase localization before hydration', async ({ request }) => {
  const response = await request.get('/clock', { headers: { 'accept-language': 'zh-TW, en;q=0.5' } })
  const body = await response.text()
  expect(body).toContain('lang="zh-CN"')
  expect(body).toContain('让时间，轻轻流动')
})

test('system changes update clock tokens while explicit mode and palette stay independent', async ({ page }) => {
  const errors = watchErrors(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/clock')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(23, 23, 23)')
  await selectAppearance(page, 'Ocean')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 243, 245)')
  await selectAppearance(page, 'Dark')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 33, 38)')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 33, 38)')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  expect(errors).toEqual([])
})

test('current UI cookie and clock settings restore independently', async ({ page, context }) => {
  const errors = watchErrors(page)
  await setSharedCookie(context)
  await page.addInitScript(() => {
    localStorage.setItem('showcase.clock.settings.v1', JSON.stringify({
      version: 1,
      timezone: 'Asia/Tokyo',
      format: '12',
      seconds: false,
    }))
  })
  await page.goto('/clock')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await expect(page.getByRole('combobox', { name: '时区', exact: true })).toHaveText('东京')
  await expect(page.getByRole('button', { name: '12 小时', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '显示秒数', exact: true })).not.toBeChecked()
  expect(errors).toEqual([])
})

test('development ignores production cookies and forwarded host claims', async ({ page, context, request }) => {
  const production = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }))
  await context.addCookies([
    { name: 'ztd.frontend.v1', value: production, domain: 'localhost', path: '/' },
  ])
  const response = await request.get('/', {
    headers: { 'cookie': `ztd.frontend.v1=${production}`, 'x-forwarded-host': 'showcase.ztd.me' },
  })
  expect(await response.text()).toContain('data-frontend-palette="neutral"')
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await selectAppearance(page, 'Plum')
  const cookies = await context.cookies()
  expect(cookies.find(cookie => cookie.name === 'ztd.frontend.v1')?.value).toBe(production)
  expect(cookies.some(cookie => cookie.name === COOKIE_NAME && !cookie.secure)).toBe(true)
})

test('future shared values remain untouched by clock updates', async ({ page, context }) => {
  const future = encodeURIComponent(JSON.stringify({ version: 2, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }))
  await context.addCookies([
    { name: COOKIE_NAME, value: future, domain: 'localhost', path: '/' },
  ])
  await page.goto('/clock')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await page.getByRole('combobox', { name: 'Timezone' }).click()
  await page.getByRole('option', { name: 'Tokyo', exact: true }).click()
  expect((await context.cookies()).find(cookie => cookie.name === COOKIE_NAME)?.value).toBe(future)
})

for (const width of [320, 390]) {
  test(`shared header stays compact and project controls remain usable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/clock')
    const header = await page.getByRole('banner').boundingBox()
    expect(header?.height).toBeLessThanOrEqual(65)
    await expect(page.getByRole('link', { name: 'zeithrold/showcase home', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'About', exact: true })).toHaveText('About', { useInnerText: true })
    await page.getByRole('button', { name: 'About', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: /^Pages/u }).click()
    await expect(page).toHaveURL(/\/#pages$/u)
    await captureState(page, info, `compact-project-header-${width}`)
  })
}
