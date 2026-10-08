import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'

test('compact appbar keeps full targets and animated menus restore keyboard focus', async ({ page }, info) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  // Radix modal menus temporarily hide the trigger's banner from the accessibility tree.
  const appearance = page.getByRole('banner', { includeHidden: true }).getByRole('button', {
    name: 'Appearance',
    exact: true,
    includeHidden: true,
  })
  const target = await appearance.boundingBox()
  expect(target?.height).toBe(44)
  expect(target?.width).toBeGreaterThanOrEqual(44)
  const chrome = await appearance.evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      background: style.backgroundColor,
      border: style.borderTopColor,
      padding: style.paddingTop,
      fontSize: style.fontSize,
    }
  })
  expect(chrome.background).toBe('rgba(0, 0, 0, 0)')
  expect(chrome.border).toBe('rgba(0, 0, 0, 0)')
  expect(chrome.padding).toBe('8px')
  expect(chrome.fontSize).toBe('16px')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await appearance.hover()
  await expect(appearance).toHaveCSS('background-color', 'rgb(240, 240, 240)')
  expect(await appearance.boundingBox()).toEqual(target)
  await appearance.press('Enter')
  await expect(appearance).toHaveCSS('background-color', 'rgb(240, 240, 240)')
  const menu = page.locator('.ztd-menu[data-state="open"]')
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('animation-name', 'ztd-menu-enter')
  await captureState(page, info, 'compact-appbar-appearance-menu')
  await page.mouse.move(0, 0)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(appearance).toBeFocused()
  await expect(appearance).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(widths.document).toBeLessThanOrEqual(widths.viewport)
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
