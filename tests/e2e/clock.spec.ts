import { test, expect, type Page } from "@playwright/test";

const instant = new Date("2026-10-01T15:59:58.500Z");

async function openClock(page: Page) {
  await page.clock.install({ time: instant });
  await page.clock.pauseAt(instant);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("showcase-test-seeded")) {
      localStorage.setItem("showcase.clock.v1", JSON.stringify({ timezone: "UTC", format: "24", seconds: true, theme: "light" }));
      sessionStorage.setItem("showcase-test-seeded", "true");
    }
  });
  await page.goto("/");
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "15:59:58, UTC");
}

test("hydrates cleanly and animates only changed digits through minute rollover", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await openClock(page);
  const hours = await page.locator(".digit-pair").first().innerHTML();
  await page.clock.runFor(600);
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "15:59:59, UTC");
  expect(await page.locator(".digit-pair").first().innerHTML()).toBe(hours);
  const lastDigit = page.locator(".sliding-digit").last();
  await expect(lastDigit.locator(".digit-out")).toHaveText("8");
  await expect(lastDigit.locator(".digit-in")).toHaveText("9");
  expect(await lastDigit.locator(".digit-in").evaluate((element) => getComputedStyle(element).animationName)).toBe("digit-enter");
  await page.clock.runFor(1000);
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "16:00:00, UTC");
  expect(errors).toEqual([]);
});

test("timezone, format, seconds, and theme controls work and persist", async ({ page }) => {
  await openClock(page);
  await page.getByRole("combobox", { name: "Timezone" }).click();
  await page.getByRole("option", { name: "Shanghai", exact: true }).click();
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "23:59:58, Shanghai");
  await page.getByRole("button", { name: "12h", exact: true }).click();
  await page.getByRole("switch", { name: "Seconds" }).click();
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "11:59 PM, Shanghai");
  await expect(page.locator(".sliding-digit")).toHaveCount(4);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("showcase.clock.v1") ?? "{}"))).toEqual({ timezone: "Asia/Shanghai", format: "12", seconds: false, theme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "11:59 PM, Shanghai");
  await page.screenshot({ path: "/tmp/showcase-dark.png", fullPage: true, animations: "disabled" });
});

test("copy returns displayed time, and About opens an accessible dialog", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openClock(page);
  await page.getByRole("button", { name: "Copy current time" }).click();
  await expect(page.getByRole("status")).toHaveText("Time copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("15:59:58");
  await page.getByRole("button", { name: "About" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("fullscreen keeps timezone controls usable and exits correctly", async ({ page }) => {
  await openClock(page);
  await page.getByRole("button", { name: "Enter fullscreen" }).click();
  await expect(page.locator("#clock")).toHaveAttribute("data-focused", "true");
  await page.getByRole("combobox", { name: "Timezone" }).click();
  await page.getByRole("option", { name: "Tokyo", exact: true }).click();
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", "00:59:58, Tokyo");
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await expect(page.locator("#clock")).toHaveAttribute("data-focused", "false");
});

test("reduced motion shows the current digit without sliding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openClock(page);
  await page.clock.runFor(600);
  expect(await page.locator(".sliding-digit").last().locator(".digit-in").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  await expect(page.locator(".sliding-digit").last().locator(".digit-out")).not.toBeVisible();
});

for (const viewport of [{ width: 1440, height: 1100 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`layout fits ${viewport.width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openClock(page);
    await page.clock.runFor(600);
    const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
    await page.screenshot({ path: `/tmp/showcase-${viewport.width}.png`, fullPage: true, animations: "disabled" });
  });
}

test("live clock advances using real browser timers", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", /^\d{2}:\d{2}:\d{2}/);
  const timestamp = await page.locator("time.clock-digits").getAttribute("datetime");
  await expect.poll(() => page.locator("time.clock-digits").getAttribute("datetime")).not.toBe(timestamp);
  await page.screenshot({ path: "/tmp/showcase-live.png", fullPage: true, animations: "disabled" });
});
