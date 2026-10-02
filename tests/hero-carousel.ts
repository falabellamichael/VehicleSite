import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { vehicles } from "../src/data";

const featured = vehicles.slice(0, 3);

/** Check actual mounted artwork, not just a label that can hide orphaned cars. */
async function expectSingleCar(page: Page, index: number) {
  const vehicle = featured[index];
  const stage = page.locator(".hero-stage");
  await expect(stage.locator(".hero-car-tag strong")).toHaveText(vehicle.name);
  await expect(stage.locator(".hero-car-tag")).toHaveCount(1);
  await expect(stage.locator(".hero-media")).toHaveCount(1);
  await expect(stage.locator(".hero-media .car-art")).toHaveCount(1);
  await expect(stage.locator('.slide-dots button[aria-pressed="true"]')).toHaveCount(1);
  await expect(stage.locator(".slide-dots button").nth(index)).toHaveAttribute("aria-pressed", "true");
  expect(await stage.locator(".hero-media").evaluate(el => (el as HTMLElement).style.getPropertyValue("--vehicle-accent"))).toBe(vehicle.color);
}

async function openHome(page: Page, baseURL: string | undefined) {
  await page.goto(baseURL!);
  await expectSingleCar(page, 0);
}

async function pointAtHero(page: Page, fraction: number) {
  const box = await page.locator(".hero-main").boundingBox();
  if (!box) throw new Error("Hero not found");
  await page.mouse.move(box.x + box.width * fraction, box.y + 30);
}

async function pauseTestClock(page: Page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 100);
}

export function registerHeroCarouselTests() {
  test.describe("Single-car hero carousel regression", () => {
    test.use({ reducedMotion: "no-preference" });
    const errors = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      const messages: string[] = [];
      errors.set(page, messages);
      page.on("pageerror", error => messages.push(error.message));
      page.on("console", message => {
        if (/same key|unique [\"']key[\"']|Encountered two children/i.test(message.text())) messages.push(message.text());
      });
    });
    test.afterEach(async ({ page }) => {
      expect(errors.get(page) || [], "No duplicate-key warnings or runtime errors").toEqual([]);
    });

    test("repeated next and previous transitions remove the old car", async ({ page, baseURL }) => {
      await openHome(page, baseURL);
      let index = 0;
      for (const step of [1, -1]) {
        for (let count = 0; count < 12; count++) {
          await page.getByRole("button", { name: step === 1 ? "Next vehicle" : "Previous vehicle", exact: true }).click();
          index = (index + step + featured.length) % featured.length;
          await expectSingleCar(page, index);
        }
      }
    });

    test("direct slide selections never leave earlier artwork behind", async ({ page, baseURL }) => {
      await openHome(page, baseURL);
      for (const index of [2, 0, 1, 2, 1, 0, 2, 0, 1, 1, 2, 0]) {
        await page.getByRole("button", { name: `Show ${featured[index].name}`, exact: true }).click();
        await expectSingleCar(page, index);
      }
    });

    test("automatic rotation keeps one car while the mouse background moves", async ({ page, baseURL }) => {
      await page.clock.install();
      await openHome(page, baseURL);
      await pauseTestClock(page);
      for (let count = 1; count <= 9; count++) {
        const right = count % 2 === 1;
        await pointAtHero(page, right ? 0.84 : 0.18);
        await page.clock.runFor(100);
        await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-direction", right ? "right" : "left");
        await page.clock.fastForward(8500);
        await expectSingleCar(page, count % featured.length);
      }
    });

    test("pause, resume and manual selection stay synchronized", async ({ page, baseURL }) => {
      await page.clock.install();
      await openHome(page, baseURL);
      await pauseTestClock(page);
      await page.getByRole("button", { name: "Pause carousel", exact: true }).click();
      await page.clock.fastForward(30000);
      await expectSingleCar(page, 0);
      await page.getByRole("button", { name: "Next vehicle", exact: true }).click();
      await expectSingleCar(page, 1);
      await page.clock.fastForward(30000);
      await expectSingleCar(page, 1);
      await page.getByRole("button", { name: "Play carousel", exact: true }).click();
      await page.clock.fastForward(8500);
      await expectSingleCar(page, 2);
      await page.clock.fastForward(8500);
      await expectSingleCar(page, 0);
    });

    test("rapid changes preserve the background and open the selected car details", async ({ page, baseURL }) => {
      await openHome(page, baseURL);
      await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
      for (let count = 1; count <= 14; count++) {
        await pointAtHero(page, count % 2 ? 0.18 : 0.84);
        await page.getByRole("button", { name: "Next vehicle", exact: true }).click();
        await expectSingleCar(page, count % featured.length);
        await expect(page.locator(".hero-motion-backdrop")).toHaveCount(1);
      }
      await page.locator(".hero-car-tag").click();
      await expect(page.getByRole("dialog").getByRole("heading", { name: "Atlas Grand", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Close dialog", exact: true }).click();
      await expectSingleCar(page, 2);
      await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
      await page.mouse.move(5, 5);
      await mkdir(".artifacts/carousel-review", { recursive: true });
      await page.screenshot({ path: ".artifacts/carousel-review/fixed-desktop.png", animations: "disabled" });
    });

    test("mobile reduced-motion transitions and returning home keep one car", async ({ page, baseURL }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      await openHome(page, baseURL);
      await expect(page.locator(".hero-motion-backdrop")).toHaveAttribute("data-enabled", "false");
      for (let count = 1; count <= 8; count++) {
        await page.getByRole("button", { name: "Next vehicle", exact: true }).click();
        await expectSingleCar(page, count % featured.length);
      }
      await mkdir(".artifacts/carousel-review", { recursive: true });
      await page.screenshot({ path: ".artifacts/carousel-review/fixed-mobile.png", animations: "disabled" });
      await page.getByRole("link", { name: "Explore inventory", exact: true }).click();
      await expect(page.locator(".hero-stage")).toHaveCount(0);
      await page.getByRole("link", { name: "VehicleSite home", exact: true }).first().click();
      await expectSingleCar(page, 0);
    });
  });
}
