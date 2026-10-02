import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

async function transformX(page: Page) {
  return page.locator(".hero-design-track").evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
}
async function point(page: Page, fraction: number) {
  const box = await page.locator(".hero-main").boundingBox();
  if (!box) throw new Error("Hero not found");
  await page.mouse.move(box.x + box.width * fraction, box.y + 32);
}

export function registerHeroBackdropTests() {
  test.describe("Mouse-led hero background", () => {
    test.use({ reducedMotion: "no-preference" });
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(baseURL!);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-enabled", "true");
    });

    test("starts still and adds four decorative placeholder designs below the header", async ({ page }) => {
      const bg = page.locator(".hero-motion-backdrop");
      await expect(bg).toHaveAttribute("aria-hidden", "true");
      await expect(bg).toHaveAttribute("data-moving", "false");
      await expect(page.locator(".hero-design-group").first().locator(".hero-design-panel")).toHaveCount(4);
      await expect(page.locator(".site-header .hero-motion-backdrop")).toHaveCount(0);
      const before = await transformX(page);
      await page.waitForTimeout(250);
      expect(await transformX(page)).toBeCloseTo(before, 2);
      expect(await bg.evaluate(el => getComputedStyle(el).pointerEvents)).toBe("none");
    });

    test("left and right halves drive continuous motion in opposite directions", async ({ page }) => {
      await point(page, .18);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-direction", "left");
      const initial = await transformX(page);
      await expect.poll(() => transformX(page)).toBeLessThan(initial - 8);
      await point(page, .84);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-direction", "right");
      await page.waitForTimeout(450);
      const reversed = await transformX(page);
      await expect.poll(() => transformX(page)).toBeGreaterThan(reversed + 8);
    });

    test("neutral midpoint and leaving the hero settle the animation", async ({ page }) => {
      await point(page, .84);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "true");
      await page.waitForTimeout(150);
      await point(page, .5);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-direction", "still");
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      await point(page, .15);
      await page.waitForTimeout(150);
      await page.mouse.move(10, 10);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      const stopped = await transformX(page);
      await page.waitForTimeout(200);
      expect(await transformX(page)).toBeCloseTo(stopped, 2);
    });

    test("header hover never drives the background", async ({ page }) => {
      await page.mouse.move(1000, 35);
      await page.waitForTimeout(200);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-direction", "still");
    });

    test("foreground links and car controls remain clickable", async ({ page }) => {
      await point(page, .85);
      await page.getByRole("button", { name: "Next vehicle", exact: true }).click();
      await expect(page.locator(".sales-hero-tag")).toContainText("Noir Executive");
      await page.locator(".sales-hero-tag").click();
      await expect(page.getByRole("dialog")).toContainText("Noir Executive");
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      await page.getByRole("button", { name: "Close dialog" }).click();
      await page.getByRole("link", { name: "Explore inventory", exact: true }).click();
      await expect(page).toHaveURL(/inventory/);
      await expect(page.locator(".hero-motion-backdrop")).toHaveCount(0);
    });

    test("live reduced-motion preference immediately stops mouse-led movement", async ({ page }) => {
      await point(page, .8);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "true");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-enabled", "false");
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      const stopped = await transformX(page);
      await point(page, .2);
      await page.waitForTimeout(200);
      expect(await transformX(page)).toBeCloseTo(stopped, 2);
    });

    test("site motion toggle disables the backdrop even with a mouse", async ({ page }) => {
      await page.getByRole("button", { name: "Pause animations", exact: true }).click();
      await page.locator(".hero-main").scrollIntoViewIfNeeded();
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-enabled", "false");
      await point(page, .82);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      await expect(page.locator(".hero-backdrop-hint")).toBeHidden();
    });

    test("touch input does not start a mouse-only effect", async ({ page }) => {
      const box = await page.locator(".hero-main").boundingBox();
      await page.locator(".hero-main").dispatchEvent("pointermove", { pointerType: "touch", clientX: box!.x + box!.width * .85, clientY: box!.y + 25 });
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
    });

    test("touch-only browsers keep the artwork still without trapping scrolling", async ({ browser, baseURL }) => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
      try {
        const page = await context.newPage();
        await page.goto(baseURL!);
        await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-enabled", "false");
        await page.locator(".hero-main").dispatchEvent("pointermove", { pointerType: "touch", clientX: 300, clientY: 450 });
        await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
        await expect(page.locator(".hero-backdrop-hint")).toBeHidden();
        expect(await page.locator(".hero-main").evaluate(el => getComputedStyle(el).touchAction)).toBe("auto");
      } finally { await context.close(); }
    });

    test("scroll and window blur suspend active background motion", async ({ page }) => {
      await point(page, .8);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "true");
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
      await point(page, .2);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "true");
      await page.evaluate(() => window.scrollBy(0, 60));
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-moving", "false");
    });

    test("repeated design groups cover the viewport with no horizontal page overflow", async ({ page }) => {
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.waitForTimeout(100);
        const geometry = await page.locator(".hero-motion-backdrop").evaluate(el => {
          const window = el.querySelector(".hero-backdrop-window")!.getBoundingClientRect();
          const track = el.querySelector(".hero-design-track")!.getBoundingClientRect();
          return { start: track.left - window.left, end: track.right - window.right, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        expect(geometry.start, `left coverage at ${width}px`).toBeLessThanOrEqual(1);
        expect(geometry.end, `right coverage at ${width}px`).toBeGreaterThanOrEqual(-1);
        expect(geometry.overflow, `page overflow at ${width}px`).toBeLessThanOrEqual(1);
      }
    });

    test("capture the hero background in dark, light and mobile layouts", async ({ page }, info) => {
      await mkdir(".artifacts/hero-review", { recursive: true });
      await page.mouse.move(10, 10);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: info.outputPath("hero-dark.png") });
      await page.screenshot({ path: ".artifacts/hero-review/hero-dark.png" });
      await page.getByRole("button", { name: "Switch to light theme" }).click();
      await page.waitForTimeout(450);
      await page.screenshot({ path: ".artifacts/hero-review/hero-light.png" });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await page.waitForTimeout(450);
      await page.screenshot({ path: ".artifacts/hero-review/hero-mobile.png", fullPage: false });
    });
  });
}
