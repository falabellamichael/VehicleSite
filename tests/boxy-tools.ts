import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

async function expectSquare(page: Page, root: string) {
  const rounded = await page.locator(root + " *").evaluateAll(nodes => nodes
    .filter(el => el instanceof HTMLElement && el.getClientRects().length > 0
      && !el.matches('input[type="radio"], input[type="checkbox"]'))
    .flatMap(el => {
      const style = getComputedStyle(el);
      const corners = [style.borderTopLeftRadius, style.borderTopRightRadius,
        style.borderBottomRightRadius, style.borderBottomLeftRadius];
      return corners.some(value => parseFloat(value) > 0)
        ? [{ element: el.tagName, className: el.className, corners }] : [];
    }));
  expect(rounded, "All visible designed surfaces should have square corners").toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

export function registerBoxyToolsTests() {
  test.describe("Boxy Buying and Pickup styling", () => {
    test.use({ reducedMotion: "reduce" });
    for (const theme of ["dark", "light"]) {
      test("all Buying modes stay square on mobile and desktop in " + theme, async ({ page, baseURL }) => {
        test.setTimeout(60000);
        await page.goto(new URL("buying/", baseURL!).href);
        if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const label of ["Payment studio", "Trade-in notebook", "Cash & buying steps"]) {
            await page.getByRole("tab", { name: label, exact: true }).click();
            await expect(page.getByRole("tab", { name: label, exact: true })).toHaveAttribute("aria-selected", "true");
            await expectSquare(page, ".buying-page");
            await expect(page.locator(".buying-workspace")).toHaveCSS("box-shadow", "none");
            await expect(page.locator(".buying-summary")).toHaveCSS("box-shadow", "none");
          }
        }
      });
      test("all Pickup stages and purposes stay square in " + theme, async ({ page, baseURL }) => {
        test.setTimeout(90000);
        await page.goto(new URL("pickup/", baseURL!).href);
        if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
        for (const width of [320, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const purpose of ["pickup", "test-drive"]) {
            await page.goto(new URL("pickup/?purpose=" + purpose, baseURL!).href);
            await expect(page.locator(".pickup-purpose")).toBeVisible();
            await expectSquare(page, ".pickup-page");
            await expect(page.locator(".pickup-workspace")).toHaveCSS("box-shadow", "none");
            await expect(page.locator(".pickup-summary")).toHaveCSS("box-shadow", "none");
            await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
            await expect(page.locator(".pickup-readiness")).toBeVisible();
            await expectSquare(page, ".pickup-page");
            await page.getByRole("button", { name: "Review my plan", exact: true }).click();
            await expect(page.locator(".pickup-visit-ticket")).toBeVisible();
            await expectSquare(page, ".pickup-page");
          }
        }
      });
    }
    test("square preparation tile retains the live progress value", async ({ page, baseURL }) => {
      await page.goto(new URL("pickup/", baseURL!).href);
      await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
      const tile = page.locator(".pickup-readiness .sales-readiness-ring");
      await expect(tile).toHaveCSS("border-radius", "0px");
      await expect(tile).toHaveCSS("background-image", "none");
      expect(await tile.evaluate(el => parseFloat(getComputedStyle(el, "::after").width))).toBe(0);
      await page.getByRole("checkbox").first().check();
      await expect(page.locator(".pickup-readiness")).toContainText("1 of 5 points considered");
      await expect.poll(() => tile.evaluate(el => parseFloat(getComputedStyle(el, "::after").width))).toBeGreaterThan(0);
      await expect(tile).toHaveCSS("--ready", "20%");
      await page.getByRole("checkbox").first().uncheck();
      await expect(tile).toHaveCSS("--ready", "0%");
    });
    test("square controls keep keyboard focus and validation visible", async ({ page, baseURL }) => {
      await page.goto(new URL("buying/", baseURL!).href);
      const price = page.getByLabel("Vehicle price (CAD)", { exact: true });
      await price.focus();
      await expect(price).toHaveCSS("border-radius", "0px");
      await expect(price).toHaveCSS("outline-style", "solid");
      await price.fill("");
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.locator(".buying-error")).toHaveCSS("border-radius", "0px");
      await expect(page.getByRole("button", { name: "Save this scenario", exact: true })).toBeDisabled();
      await page.goto(new URL("pickup/", baseURL!).href);
      await page.getByLabel("Preferred date", { exact: true }).fill("");
      await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
      await expect(page.getByLabel("Preferred date", { exact: true })).toBeFocused();
      await expect(page.locator(".pickup-error")).toHaveCSS("border-radius", "0px");
      await expect(page.getByRole("alert")).toBeVisible();
    });
    test("capture square page treatments in both themes and on mobile", async ({ page, baseURL }) => {
      test.setTimeout(60000);
      await mkdir(".artifacts/boxy-review", { recursive: true });
      for (const theme of ["dark", "light"]) {
        for (const route of ["buying", "pickup"]) {
          await page.setViewportSize({ width: 1440, height: 1000 });
          await page.goto(new URL(route + "/", baseURL!).href);
          if (await page.locator("html").getAttribute("data-theme") !== theme)
            await page.getByRole("button", { name: "Switch to " + theme + " theme", exact: true }).click();
          await page.evaluate(() => document.fonts.ready);
          const workspace = page.locator(route === "buying" ? ".sales-buy-grid" : ".sales-visit-grid");
          await expect(workspace).toBeVisible();
          await workspace.scrollIntoViewIfNeeded();
          await page.screenshot({ path: ".artifacts/boxy-review/" + route + "-" + theme + "-desktop.png" });
          await page.setViewportSize({ width: 390, height: 844 });
          await page.evaluate(() => { const top = document.querySelector(".sales-buy-grid, .sales-visit-grid")!.getBoundingClientRect().top + scrollY; window.scrollTo({ top: top - 95, behavior: "instant" }); });
          await page.screenshot({ path: ".artifacts/boxy-review/" + route + "-" + theme + "-mobile.png" });
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
      await page.getByRole("checkbox").first().check();
      await page.locator(".pickup-readiness").scrollIntoViewIfNeeded();
      await page.screenshot({ path: ".artifacts/boxy-review/pickup-square-progress.png" });
      await page.getByRole("button", { name: "Review my plan", exact: true }).click();
      await page.locator(".pickup-visit-ticket").scrollIntoViewIfNeeded();
      await page.screenshot({ path: ".artifacts/boxy-review/pickup-square-ticket.png" });
    });
  });
}
