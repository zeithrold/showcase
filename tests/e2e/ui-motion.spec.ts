import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'

test('compact appbar keeps full targets and animated menus restore keyboard focus', async ({ page }, info) => {
  await page.goto('/')
  const appearance = page.getByRole('banner').getByRole('button', { name: 'Appearance', exact: true })
  const target = await appearance.boundingBox()
  expect(target?.height).toBeGreaterThanOrEqual(44)
  const chrome = await appearance.evaluate((node) => {
    const style = getComputedStyle(node)
    const visual = getComputedStyle(node, '::before')
    return { background: style.backgroundColor, border: style.borderTopColor, inset: visual.top }
  })
  expect(chrome.background).toBe('rgba(0, 0, 0, 0)')
  expect(chrome.border).toBe('rgba(0, 0, 0, 0)')
  expect(chrome.inset).toBe('6px')
  await appearance.press('Enter')
  const menu = page.locator('.ztd-menu[data-state="open"]')
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('animation-name', 'ztd-menu-enter')
  await captureState(page, info, 'compact-appbar-appearance-menu')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(appearance).toBeFocused()
})

test('reduced motion removes both appearance and language menu animations', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const appearance = page.getByRole('banner').getByRole('button', { name: 'Appearance', exact: true })
  const language = page.getByRole('combobox', { name: 'Language', exact: true })
  for (const trigger of [appearance, language]) {
    await trigger.press('Enter')
    const menu = page.locator('.ztd-menu[data-state="open"]')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('animation-name', 'none')
    await captureState(page, info, 'reduced-motion-shared-menu')
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
  }
})
