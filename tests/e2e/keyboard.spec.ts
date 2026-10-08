import { expect } from '@playwright/test'
import { test } from '../browser-test'
import { openClock, selectAppearance } from './helpers'

test('Tab exposes skip navigation and Enter moves focus to main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('.intro-aside a')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Clock', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/clock$/)
})

test('About traps keyboard focus, dismisses, and restores its trigger', async ({ page }) => {
  await openClock(page)
  await page.clock.resume()
  const trigger = page.getByRole('button', { name: 'About', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const visit = page.getByRole('dialog').getByRole('link')
  const close = page.getByRole('button', { name: 'Close', exact: true })
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(visit).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('keyboard operates clock preferences and the translated language menu', async ({ page }) => {
  await openClock(page)
  await page.clock.resume()
  const timezone = page.getByRole('combobox', { name: 'Timezone' })
  await timezone.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('option', { name: 'Coordinated Universal Time' })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('option', { name: 'Local time' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('option', { name: 'Shanghai', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(timezone).toHaveText('Shanghai')
  await expect(timezone).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: '24h', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: '12h', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  await expect(page.getByRole('switch', { name: 'Seconds' })).not.toBeChecked()
  await page.keyboard.press('Tab')
  await expect(page.locator('.clock-controls').getByRole('button', { name: 'Appearance', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menuitemradio', { name: 'System', exact: true })).toBeFocused()
  await page.keyboard.press('Home')
  for (const name of [
    'Light',
    'Dark',
    'Neutral',
    'Terracotta',
    'Moss',
  ]) {
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitemradio', { name, exact: true })).toBeFocused()
  }
  await expect(page.getByRole('menuitemradio', { name: 'Moss', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'moss')
  const language = page.getByRole('combobox', { name: 'Language', exact: true })
  await language.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('option', { name: '简体中文' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('combobox', { name: '语言', exact: true })).toBeFocused()
})

test('an open select makes its hidden background inert and restores it on dismissal', async ({ page }) => {
  await openClock(page)
  await page.clock.resume()
  const timezone = page.getByRole('combobox', { name: 'Timezone' })
  await timezone.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect.poll(async () => await page.locator('header').evaluate(
    element => element instanceof HTMLElement && element.inert,
  )).toBe(true)
  await expect.poll(async () => await page.locator('.clock-controls').evaluate(
    element => element instanceof HTMLElement && element.inert,
  )).toBe(true)
  await page.keyboard.press('Escape')
  await expect(timezone).toBeFocused()
  await expect(page.locator('[inert]')).toHaveCount(0)
  await selectAppearance(page, 'Dark')
  await expect(page.locator('html')).toHaveClass(/(?:^|\s)dark(?:\s|$)/u)
})
