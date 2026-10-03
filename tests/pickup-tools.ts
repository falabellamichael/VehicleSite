import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { dayFromToday, formatDay } from "../src/sales";
import { pickupChecklist, testDriveChecklist } from "../src/data";

const purposes = ["test-drive", "pickup"] as const;
async function prepare(page: Page) {
  await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
  await expect(page.locator(".pickup-checklist")).toBeVisible();
}
async function review(page: Page) {
  await prepare(page);
  await page.getByRole("button", { name: "Review my plan", exact: true }).click();
  await expect(page.locator(".sales-draft h2")).toContainText("Not a booking.");
}

export function registerPickupToolsTests() {
  test.describe("Pickup and Test Drives polish", () => {
    test.use({ reducedMotion: "reduce" });
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(new URL("pickup/", baseURL!).href);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("The keys.");
    });

    test("purpose cards and the summary stay synchronized without claiming a booking", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Test drive", exact: true })).toHaveAttribute("aria-pressed", "true");
      await page.getByRole("button", { name: "Vehicle pickup", exact: true }).click();
      await expect(page.getByRole("button", { name: "Vehicle pickup", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".pickup-summary-car > p")).toContainText("Vehicle pickup");
      await expect(page.locator(".pickup-status-row")).toContainText("Not booked");
      await expect(page.locator(".pickup-stepper [aria-current='step']")).toHaveCount(1);
      await expect(page.getByRole("button", { name: "Return to your draft", exact: true })).toBeDisabled();
      await expect(page).toHaveURL(/purpose=pickup/);
    });

    test("date suggestions update the native calendar and preferred moment", async ({ page }) => {
      const day = dayFromToday(4);
      const date = page.getByLabel("Preferred date", { exact: true });
      await expect(date).toHaveAttribute("min", dayFromToday(0));
      await expect(date).toHaveAttribute("max", dayFromToday(90));
      await expect(page.locator(".pickup-date-rail button")).toHaveCount(7);
      await page.getByRole("button", { name: formatDay(day), exact: true }).click();
      await expect(date).toHaveValue(day);
      await expect(page.locator('.pickup-date-rail [aria-pressed="true"]')).toHaveCount(1);
      await page.getByRole("radio", { name: "14:30", exact: true }).check();
      await expect(page.locator(".pickup-date-feature")).toContainText("14:30");
      await expect(page.locator(".pickup-summary .sales-breakdown")).toContainText("14:30");
    });

    test("empty and out-of-window dates show associated errors and restore focus", async ({ page }) => {
      const date = page.getByLabel("Preferred date", { exact: true });
      for (const value of ["", "2020-01-01", dayFromToday(100)]) {
        await date.fill(value);
        await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
        await expect(page.getByRole("alert")).toContainText("valid future date and time");
        await expect(date).toHaveAttribute("aria-invalid", "true");
        await expect(date).toBeFocused();
        await expect(date).toHaveAttribute("aria-describedby", /pickup-validation/);
      }
      await date.fill(dayFromToday(2));
      await expect(date).not.toHaveAttribute("aria-invalid", "true");
      await prepare(page);
    });

    test("unavailable examples remain blocked and an available selection recovers", async ({ page, baseURL }) => {
      for (const id of ["vista", "ridge"]) {
        await page.goto(new URL(`pickup/?vehicle=${id}`, baseURL!).href);
        await page.getByRole("button", { name: "Prepare my visit", exact: true }).click();
        const vehicle = page.getByRole("combobox", { name: "Your sample vehicle", exact: true });
        await expect(vehicle).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByRole("alert")).toContainText("not available for visit planning");
        await vehicle.selectOption("noir");
        await expect(vehicle).not.toHaveAttribute("aria-invalid", "true");
        await prepare(page);
      }
    });

    test("optional preparation can be skipped and all checked items never confirm a visit", async ({ page }) => {
      await review(page);
      await expect(page.locator(".pickup-review-heading")).toContainText("0/5 considered");
      await page.getByRole("button", { name: "Edit preparation", exact: true }).click();
      for (const item of testDriveChecklist) await page.getByRole("checkbox", { name: item, exact: true }).check();
      await expect(page.locator(".pickup-readiness")).toContainText("5 of 5 points considered");
      await page.getByRole("button", { name: "Review my plan", exact: true }).click();
      await expect(page.locator(".pickup-review-checklist > p > .checked")).toHaveCount(5);
      await expect(page.locator(".pickup-status-row")).toContainText("Not booked");
    });

    test("completed step navigation preserves date, time, notes and checklist", async ({ page }) => {
      const day = dayFromToday(3);
      await page.getByLabel("Preferred date", { exact: true }).fill(day);
      await page.getByRole("radio", { name: "13:00", exact: true }).check();
      await prepare(page);
      await page.getByRole("checkbox").nth(1).check();
      await page.getByLabel("Notes for your own visit draft").fill("Ask about the second key.");
      await page.getByRole("button", { name: "Review my plan", exact: true }).click();
      await page.getByRole("button", { name: "Return to your visit", exact: true }).click();
      await expect(page.getByLabel("Preferred date", { exact: true })).toHaveValue(day);
      await expect(page.getByRole("radio", { name: "13:00", exact: true })).toBeChecked();
      await prepare(page);
      await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
      await expect(page.getByLabel("Notes for your own visit draft")).toHaveValue("Ask about the second key.");
      await expect(page.locator(".pickup-tool-intro h2")).toBeFocused();
    });

    test("changing visit purpose swaps checklists and clears checked status", async ({ page }) => {
      await prepare(page);
      await page.getByRole("checkbox").first().check();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByRole("button", { name: "Vehicle pickup", exact: true }).click();
      await prepare(page);
      await expect(page.getByRole("checkbox", { name: pickupChecklist[0], exact: true })).toBeVisible();
      await expect(page.locator('.pickup-checklist input:checked')).toHaveCount(0);
      await expect(page.getByRole("checkbox", { name: testDriveChecklist[2], exact: true })).toHaveCount(0);
    });

    test("both calendar exports remain tentative personal reminders without invitations", async ({ page, baseURL }) => {
      for (const purpose of purposes) {
        await page.goto(new URL(`pickup/?purpose=${purpose}&vehicle=atlas`, baseURL!).href);
        await page.getByLabel("Preferred date", { exact: true }).fill(dayFromToday(5));
        await review(page);
        const event = page.waitForEvent("download");
        await page.getByRole("button", { name: "Download unconfirmed reminder", exact: true }).click();
        const file = await event;
        expect(file.suggestedFilename()).toBe(`vehiclesite-unconfirmed-${purpose}.ics`);
        const ics = await readFile((await file.path())!, "utf8");
        expect(ics).toContain("STATUS:TENTATIVE");
        expect(ics).toContain("SUMMARY:UNCONFIRMED:");
        expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
        expect(ics).not.toContain("ATTENDEE");
        expect(ics).not.toContain("ORGANIZER");
        await expect(page.getByText("Draft exported. No appointment has been booked.", { exact: true })).toBeVisible();
      }
    });

    test("the notes counter, draft preview and text export preserve user-entered text", async ({ page }) => {
      const note = "Ask about tires & keys.\nReview service records.";
      await prepare(page);
      await page.getByLabel("Notes for your own visit draft").fill(note);
      await expect(page.locator(".pickup-notes-footer")).toContainText(`${note.length}/800`);
      await expect(page.getByLabel("Notes for your own visit draft")).toHaveAttribute("maxlength", "800");
      await page.getByRole("button", { name: "Review my plan", exact: true }).click();
      await expect(page.locator(".pickup-draft-notes p")).toHaveText(note);
      const event = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download visit draft", exact: true }).click();
      const file = await event;
      const text = await readFile((await file.path())!, "utf8");
      expect(text).toContain(note);
      expect(text).toContain("UNCONFIRMED — NOT A BOOKING");
    });

    test("vehicle preview and buying-tools handoff follow the selection", async ({ page }) => {
      await page.getByRole("combobox", { name: "Your sample vehicle", exact: true }).selectOption("noir");
      await expect(page.locator(".pickup-summary-car h3")).toHaveText("Noir Executive");
      await expect(page.locator(".pickup-summary-visual img")).toHaveCount(1);
      await expect(page.locator(".pickup-summary-visual img")).toHaveAttribute("alt", /Noir Executive/);
      await expect.poll(() => page.locator(".pickup-summary-visual img").evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await page.getByRole("link", { name: "Explore this car's numbers", exact: true }).click();
      await expect(page).toHaveURL(/buying\?vehicle=noir/);
    });

    test("mobile summary shortcut works and reduced-motion styling remains still", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator(".pickup-mobile-summary")).toBeVisible();
      await expect(page.locator(".pickup-step-number").first()).toHaveCSS("width", "32px");
      await expect(page.getByLabel("Preferred date", { exact: true })).toHaveCSS("border-radius", "8px");
      await page.locator(".pickup-mobile-summary").click();
      await expect(page).toHaveURL(/#pickup-summary$/);
      await expect(page.locator("#pickup-summary")).toBeInViewport();
      expect(await page.locator(".pickup-next-card").first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe("0s");
      await expect(page.locator(".pickup-next-copy h2 br")).toHaveCSS("display", "inline");
    });

    test("all steps fit mobile through desktop in both themes and both visit types", async ({ page, baseURL }) => {
      test.setTimeout(180000);
      for (const theme of ["dark", "light"]) {
        if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
        for (const width of [320, 390, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const purpose of purposes) {
            await page.goto(new URL(`pickup/?purpose=${purpose}`, baseURL!).href);
            for (const step of [1, 2, 3]) {
              if (step === 2) await prepare(page);
              if (step === 3) await page.getByRole("button", { name: "Review my plan", exact: true }).click();
              expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${purpose} / step ${step} / ${theme} / ${width}`).toBeLessThanOrEqual(1);
              await expect(page.locator(".pickup-summary")).toBeVisible();
            }
          }
        }
      }
    });

    for (const theme of ["dark", "light"]) test(`every planning step passes automated accessibility in ${theme} theme`, async ({ page, baseURL }) => {
      test.setTimeout(90000);
      if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
      for (const purpose of purposes) {
        await page.goto(new URL(`pickup/?purpose=${purpose}`, baseURL!).href);
        for (const step of [1, 2, 3]) {
          if (step === 2) await prepare(page);
          if (step === 3) await page.getByRole("button", { name: "Review my plan", exact: true }).click();
          const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
          expect(result.violations, `${purpose} / ${step} / ${theme}`).toEqual([]);
        }
      }
    });

    test("capture polished planner, preparation and visit draft screenshots", async ({ page, baseURL }) => {
      test.setTimeout(60000);
      await mkdir(".artifacts/pickup-review", { recursive: true });
      for (const [theme, width] of [["dark", 1440], ["light", 1440], ["dark", 390]] as const) {
        await page.goto(new URL("pickup/?purpose=pickup&vehicle=apex", baseURL!).href);
        const current = await page.locator("html").getAttribute("data-theme");
        if (current !== theme) await page.getByRole("button", { name: `Switch to ${theme} theme`, exact: true }).click();
        await page.setViewportSize({ width, height: 1000 });
        for (const step of [1, 2, 3]) {
          if (step === 2) { await prepare(page); await page.getByRole("checkbox").first().check(); }
          if (step === 3) await page.getByRole("button", { name: "Review my plan", exact: true }).click();
          await page.evaluate(() => document.fonts.ready);
          await expect.poll(() => page.locator(".pickup-summary-visual img").evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
          await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
          await page.screenshot({ path: `.artifacts/pickup-review/after-${theme}-${width}-step-${step}.png`, fullPage: true });
        }
      }
    });
  });
}
