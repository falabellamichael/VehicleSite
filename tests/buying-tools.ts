import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { vehicles } from "../src/data";

const modes = [
  { id: "payment", label: "Payment studio" },
  { id: "trade", label: "Trade-in notebook" },
  { id: "cash", label: "Cash & buying steps" },
];

export function registerBuyingToolsTests() {
  test.describe("Buying Tools polish", () => {
    test.use({ reducedMotion: "reduce" });
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(new URL("buying/", baseURL!).href);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("The numbers.");
    });

    test("tab cards have valid panels and a single keyboard-selected mode", async ({ page }) => {
      for (const mode of modes) {
        await page.getByRole("tab", { name: mode.label, exact: true }).click();
        await expect(page.getByRole("tabpanel")).toHaveCount(1);
        await expect(page.getByRole("tabpanel")).toHaveAttribute("id", `buy-panel-${mode.id}`);
        await expect(page.locator('.buying-tabs [aria-selected="true"]')).toHaveCount(1);
        for (const tab of modes) await expect(page.locator(`#buy-panel-${tab.id}`)).toHaveCount(1);
      }
      await page.getByRole("tab", { name: "Cash & buying steps" }).focus();
      await page.keyboard.press("Home");
      await expect(page.getByRole("tab", { name: "Payment studio" })).toBeFocused();
      await expect(page.getByRole("tab", { name: "Payment studio" })).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("End");
      await expect(page.getByRole("tab", { name: "Cash & buying steps" })).toBeFocused();
      await expect(page.getByRole("tab", { name: "Cash & buying steps" })).toHaveAttribute("aria-selected", "true");
    });

    test("grouped fields keep a scenario and notes when changing modes", async ({ page }) => {
      await page.getByLabel("Vehicle price (CAD)", { exact: true }).fill("10000");
      await page.getByLabel("Down payment (CAD)", { exact: true }).fill("1000");
      await page.getByLabel("APR (%) — illustrative", { exact: true }).fill("0");
      await page.getByRole("combobox", { name: "Loan term", exact: true }).selectOption("36");
      await expect(page.getByLabel("Estimated monthly payment", { exact: true })).toContainText("$250.00");
      await page.getByRole("tab", { name: "Trade-in notebook" }).click();
      await page.getByLabel("Your trade-in (optional)").fill("Example trade-in");
      await page.getByLabel("Questions for the appraiser").fill("Review service history.");
      await page.getByRole("tab", { name: "Cash & buying steps" }).click();
      await expect(page.getByLabel("Estimated purchase total", { exact: true })).toContainText("$10,000.00");
      await page.getByRole("tab", { name: "Payment studio" }).click();
      await expect(page.getByLabel("Down payment (CAD)", { exact: true })).toHaveValue("1000");
      await expect(page.getByRole("combobox", { name: "Loan term", exact: true })).toHaveValue("36");
      await page.getByRole("tab", { name: "Trade-in notebook" }).click();
      await expect(page.getByLabel("Your trade-in (optional)")).toHaveValue("Example trade-in");
      await expect(page.getByLabel("Questions for the appraiser")).toHaveValue("Review service history.");
    });

    test("cash breakdown separates purchase total from loan information", async ({ page }) => {
      for (const [label, value] of [["Vehicle price (CAD)", "10000"], ["Tax rate (%) — enter your own", "10"], ["Estimated fees (CAD)", "200"]]) {
        await page.getByLabel(label, { exact: true }).fill(value);
      }
      await page.getByRole("tab", { name: "Cash & buying steps" }).click();
      await expect(page.getByLabel("Estimated purchase total", { exact: true })).toContainText("$11,200.00");
      await expect(page.locator(".buying-summary .sales-breakdown > div")).toHaveCount(3);
      await expect(page.locator(".buying-summary .sales-breakdown")).not.toContainText("Total loan interest");
      await expect(page.locator(".buying-loan-composition")).toHaveCount(0);
    });

    test("loan composition is finite at zero interest and zero principal", async ({ page }) => {
      await page.getByLabel("APR (%) — illustrative", { exact: true }).fill("0");
      await expect(page.locator(".buying-composition-legend")).toContainText("100.0%");
      await page.getByLabel("Down payment (CAD)", { exact: true }).fill("100000");
      await expect(page.getByLabel("Estimated monthly payment", { exact: true })).toContainText("$0.00");
      await expect(page.locator(".buying-composition-legend")).not.toContainText(/NaN|Infinity/);
      const widths = await page.locator(".buying-composition-bar > span").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).style.width));
      expect(widths).toEqual(["0%", "0%"]);
      await expect(page.getByText(/Your down payment and equity exceed this purchase total/)).toBeVisible();
    });

    test("negative equity is explained rather than styled as a guaranteed credit", async ({ page }) => {
      await page.getByRole("tab", { name: "Trade-in notebook" }).click();
      await page.getByLabel("Your assumed trade-in value (CAD)", { exact: true }).fill("1000");
      await page.getByLabel("Amount still owing (CAD)", { exact: true }).fill("3000");
      await expect(page.locator(".buying-equity-card")).toHaveAttribute("data-equity", "negative");
      await expect(page.locator(".buying-equity-card")).toContainText("-$2,000");
      await expect(page.locator(".buying-equity-card")).toContainText("a lender may not permit that");
    });

    test("selected car image and visit handoff track the chosen vehicle", async ({ page }) => {
      await page.getByRole("combobox", { name: "Start with a sample car", exact: true }).selectOption("noir");
      await expect(page.locator(".buying-summary-title h2")).toHaveText("Noir Executive");
      await expect(page.getByLabel("Vehicle price (CAD)", { exact: true })).toHaveValue(String(vehicles.find(v => v.id === "noir")!.price));
      await expect(page.locator(".buying-car-selection-visual img")).toHaveAttribute("alt", /Noir Executive/);
      await expect(page.locator(".buying-car-selection-visual img")).toBeVisible();
      await expect.poll(() => page.locator(".buying-car-selection-visual img").evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await page.getByRole("link", { name: "Explore a visit draft", exact: true }).click();
      await expect(page).toHaveURL(/pickup\?vehicle=noir&purpose=test-drive/);
    });

    test("input errors are visible, accessible, and prevent scenario export", async ({ page }) => {
      const price = page.getByLabel("Vehicle price (CAD)", { exact: true });
      await price.fill("");
      await expect(price).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.getByRole("button", { name: "Save this scenario", exact: true })).toBeDisabled();
      await price.fill("10000");
      await expect(price).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("button", { name: "Save this scenario", exact: true })).toBeEnabled();
      const downloaded = page.waitForEvent("download");
      await page.getByRole("button", { name: "Save this scenario", exact: true }).click();
      const file = await downloaded;
      expect(await readFile((await file.path())!, "utf8")).toContain("DEMO — NOT AN OFFER");
    });

    test("assumptions disclose the calculation without concealing the demo status", async ({ page }) => {
      await expect(page.locator(".buying-result-caption")).toContainText("Not a quote or approval");
      await page.getByText("Calculation assumptions", { exact: true }).click();
      await expect(page.locator(".buying-assumptions")).toHaveAttribute("open", "");
      await expect(page.locator(".buying-assumptions p")).toContainText("Tax is calculated on the vehicle price only");
    });

    test("all three tools fit mobile, tablet and desktop in both themes", async ({ page }) => {
      test.setTimeout(120000);
      for (const theme of ["dark", "light"]) {
        if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
        for (const width of [320, 390, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const mode of modes) {
            await page.getByRole("tab", { name: mode.label, exact: true }).click();
            await expect(page.getByRole("tabpanel")).toHaveAttribute("id", `buy-panel-${mode.id}`);
            expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${mode.id} / ${theme} / ${width}`).toBeLessThanOrEqual(1);
            await expect(page.getByRole("button", { name: "Save this scenario", exact: true })).toBeVisible();
          }
        }
      }
    });

    test("mobile summary shortcut works and motion preferences are honored", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const shortcut = page.locator(".buying-mobile-estimate");
      await expect(shortcut).toBeVisible();
      await expect(page.locator(".buying-next-copy h2 br")).toHaveCSS("display", "inline");
      await shortcut.click();
      await expect(page).toHaveURL(/#buying-summary$/);
      await expect(page.locator("#buying-summary")).toBeInViewport();
      expect(await page.locator(".buying-composition-bar > span").first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe("0s");
    });

    for (const theme of ["dark", "light"]) test(`all buying modes pass automated accessibility in ${theme} theme`, async ({ page }) => {
      if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
      for (const mode of modes) {
        await page.getByRole("tab", { name: mode.label, exact: true }).click();
        await expect(page.getByRole("tabpanel")).toHaveAttribute("id", `buy-panel-${mode.id}`);
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(result.violations, `${mode.id} / ${theme}`).toEqual([]);
      }
    });

    test("capture final buying-page review images", async ({ page }) => {
      test.setTimeout(60000);
      await mkdir(".artifacts/buying-review", { recursive: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const theme of ["dark", "light"]) {
        if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
        for (const mode of modes) {
          await page.getByRole("tab", { name: mode.label, exact: true }).click();
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: `.artifacts/buying-review/after-${mode.id}-${theme}.png`, fullPage: true });
        }
      }
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      for (const mode of modes) {
        await page.getByRole("tab", { name: mode.label, exact: true }).click();
        await page.screenshot({ path: `.artifacts/buying-review/after-${mode.id}-mobile.png`, fullPage: true });
      }
    });
  });
}
