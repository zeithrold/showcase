import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import { test } from '../browser-test'

async function centeredFrames(dialog: Locator, state: 'open' | 'closed'): Promise<void> {
  await expect(dialog).toHaveAttribute('data-state', state)
  const frames = await dialog.evaluate((element, currentState) => {
    const name = `ztd-dialog-${currentState === 'open' ? 'enter' : 'exit'}`
    const animation = element.getAnimations().find(candidate =>
      candidate instanceof CSSAnimation && candidate.animationName === name,
    )
    const duration = animation?.effect?.getTiming().duration
    if (animation === undefined || typeof duration !== 'number') {
      throw new Error(`Missing ${currentState} dialog animation`)
    }
    const samples = [
      0,
      duration / 2,
      duration - 1,
    ].map((time) => {
      animation.currentTime = time
      const rect = element.getBoundingClientRect()
      return {
        time,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        expectedX: window.innerWidth / 2,
        expectedY: window.innerHeight / 2,
      }
    })
    animation.finish()
    return samples
  }, state)
  for (const frame of frames) {
    expect(Math.abs(frame.centerX - frame.expectedX), `${state} at ${frame.time}ms: horizontal center`).toBeLessThan(1)
    expect(Math.abs(frame.centerY - frame.expectedY), `${state} at ${frame.time}ms: vertical center`).toBeLessThan(1)
  }
}

for (const width of [390, 1440]) {
  test(`About dialog remains centered throughout opening and closing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    // Pause native CSS motion before the dialog mounts to inspect its first painted frame.
    await page.addStyleTag({ content: '.ztd-dialog { animation-play-state: paused !important; }' })
    const trigger = page.getByRole('button', { name: 'About', exact: true })
    await trigger.click()
    const dialog = page.locator('.about-dialog')
    await expect(dialog).toBeVisible()
    await centeredFrames(dialog, 'open')
    const close = dialog.getByRole('button', { name: 'Close', exact: true })
    await expect(close).toBeFocused()
    await close.click()
    await centeredFrames(dialog, 'closed')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
}

test('About dialog respects reduced motion and stays centered', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'About', exact: true })
  await trigger.click()
  const dialog = page.locator('.about-dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('animation-name', 'none')
  const center = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })
  expect(center.x).toBeCloseTo(195, 0)
  expect(center.y).toBeCloseTo(370, 0)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
