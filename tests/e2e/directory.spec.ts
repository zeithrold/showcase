import { test, expect } from "@playwright/test";

test("homepage lists real pages and opens the clock as a separate route", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(await response!.text()).toContain('href="/clock"');
  await expect(page).toHaveTitle("zeithrold/showcase");
  await expect(page.getByRole("heading", { name: "Pages", exact: true })).toBeVisible();
  await expect(page.locator(".page-list > li")).toHaveCount(1);
  await expect(page.locator("#clock, time.clock-digits")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Clock", exact: true })).toHaveAttribute("href", "/clock");
  await page.getByRole("link", { name: "Clock", exact: true }).click();
  await expect(page).toHaveURL(/\/clock$/);
  await expect(page.locator("time.clock-digits")).toHaveAttribute("aria-label", /^\d{2}:\d{2}:\d{2}/);
  await page.getByRole("link", { name: "All pages", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Pages", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/clock$/);
  await expect(page.locator("#clock")).toBeVisible();
  await page.getByRole("link", { name: "zeithrold/showcase home", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Pages", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("language, palette, theme and clock settings survive navigation and reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: "简体中文" }).click();
  await expect(page.getByRole("heading", { name: "页面目录", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "海蓝", exact: true }).click();
  await page.getByRole("button", { name: "切换到深色模式", exact: true }).click();
  await page.getByRole("link", { name: "时钟", exact: true }).click();
  await expect(page).toHaveURL(/\/clock$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ocean");
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("combobox", { name: "时区", exact: true }).click();
  await page.getByRole("option", { name: "东京", exact: true }).click();
  await page.getByRole("button", { name: "12 小时", exact: true }).click();
  await page.getByRole("switch", { name: "显示秒数", exact: true }).click();
  await page.getByRole("link", { name: "所有页面", exact: true }).click();
  await expect(page.getByRole("heading", { name: "页面目录", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("button", { name: "海蓝", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("link", { name: "时钟", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "时区", exact: true })).toHaveText("东京");
  await expect(page.getByRole("button", { name: "12 小时", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("switch", { name: "显示秒数", exact: true })).not.toBeChecked();
  await page.reload();
  await expect(page.locator(".sliding-digit")).toHaveCount(4);
  await expect(page.locator(".clock-location")).toContainText("东京");
});

for (const width of [1440, 390, 320]) {
  for (const language of ["en", "zh-CN"]) {
    test(`directory fits ${width}px in ${language}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((locale) => {
        localStorage.setItem("showcase.clock.v1", JSON.stringify({ locale }));
      }, language);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      expect(widths.document).toBeLessThanOrEqual(widths.viewport);
      await expect(page.getByRole("link", { name: language === "en" ? "Clock" : "时钟", exact: true })).toBeVisible();
      await page.screenshot({ path: `/tmp/showcase-directory-${language}-${width}.png`, fullPage: true, animations: "disabled" });
    });
  }
}
