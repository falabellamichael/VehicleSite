import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { documentGroups } from "../src/data";
import { calculatePayment, dayFromToday, makeCalendar, visitDateValid } from "../src/sales";
export const salesRoutes = [
  ["", "Not just a car."], ["inventory", "Your next chapter."], ["buying", "The numbers."], ["pickup", "The keys."], ["documents", "The details."],
  ["documents/vehicle-records", "Vehicle records."], ["documents/purchase-options", "Purchase options."], ["documents/pickup-essentials", "Pickup essentials."], ["documents/policies", "Policies & essentials."],
] as const;
const go = (page: Page, baseURL: string | undefined, path = "") => page.goto(new URL(path, baseURL!).href);
export function registerSalesFlows(staticHost = false) {
  test.use({ reducedMotion: "reduce" });
  for (const [path, heading] of salesRoutes) test(`sales route and refresh: ${path || "home"}`, async ({ page, baseURL }) => {
    const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
    const response = await go(page, baseURL, path); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Inventory", exact: true })).toBeVisible();
    await page.reload(); await expect(page.getByRole("heading", { level: 1 })).toContainText(heading); await expect(page).toHaveTitle(/VehicleSite/); expect(errors).toEqual([]);
  });
  test("legacy links redirect while preserving car selection", async ({ page, baseURL }) => {
    for (const [old, current] of [["fleet", "inventory"], ["experiences", "buying"], ["concierge", "pickup"], ["documents/vehicle-guides", "documents/vehicle-records"], ["documents/booking-options", "documents/purchase-options"], ["documents/protection", "documents/pickup-essentials"]]) { await go(page, baseURL, `${old}?vehicle=noir`); await expect(page).toHaveURL(new RegExp(`${current}\\??.*vehicle=noir`)); if (current === "inventory") await page.getByRole("button", { name: "Close dialog" }).click(); }
  });
  test("inventory combines price, energy and query filters", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await expect(page.locator(".vehicle-card")).toHaveCount(9);
    await page.getByRole("combobox", { name: "Price ceiling (CAD)", exact: true }).selectOption("30000"); await expect(page.locator(".vehicle-card")).toHaveCount(2);
    await page.getByRole("combobox", { name: "Energy", exact: true }).selectOption("Electric"); await expect(page.locator(".vehicle-card")).toHaveCount(1); await expect(page.locator(".vehicle-card")).toContainText("Volt City");
    await page.reload(); await expect(page.locator(".vehicle-card")).toHaveCount(1);
    await page.getByLabel("Search inventory").fill("not-a-car"); await expect(page.getByRole("button", { name: "Show all cars", exact: true })).toBeVisible(); await page.getByRole("button", { name: "Show all cars", exact: true }).click(); await expect(page.locator(".vehicle-card")).toHaveCount(9);
  });
  test("body, condition, mileage and seating filters work", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await page.getByRole("button", { name: /^SUV/ }).click(); await expect(page.locator(".vehicle-card")).toHaveCount(2);
    await page.getByRole("combobox", { name: "Condition", exact: true }).selectOption("New"); await expect(page.locator(".vehicle-card")).toContainText("Ridge Trail");
    await page.getByRole("button", { name: "Reset all" }).click(); await page.getByRole("combobox", { name: "Maximum mileage", exact: true }).selectOption("15000"); await expect(page.locator(".vehicle-card")).toHaveCount(3);
    await page.getByRole("checkbox", { name: "Available examples only" }).click(); await expect(page.getByRole("checkbox", { name: "Available examples only" })).toBeChecked(); await expect(page.locator(".vehicle-card")).toHaveCount(2);
    await page.getByRole("combobox", { name: "Seats needed", exact: true }).selectOption("7"); await expect(page.locator(".vehicle-card")).toHaveCount(1); await expect(page.locator(".vehicle-card")).toContainText("Atlas Grand");
  });
  test("inventory sorting changes card order", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await page.getByRole("combobox", { name: "Sort inventory" }).selectOption("price-asc"); await expect(page.locator(".vehicle-card").first()).toContainText("Metro Sport"); await page.getByRole("combobox", { name: "Sort inventory" }).selectOption("price-desc"); await expect(page.locator(".vehicle-card").first()).toContainText("Apex GT"); await page.getByRole("combobox", { name: "Sort inventory" }).selectOption("year"); await expect(page.locator(".vehicle-card").first()).toContainText("Pulse Electric");
  });
  test("saved cars persist and can be removed", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await page.getByRole("button", { name: "Save Apex GT", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: "Saved (1)", exact: true }).click(); await expect(page.locator(".vehicle-card")).toHaveCount(1); await page.getByRole("button", { name: "Unsave Apex GT", exact: true }).click(); await expect(page.getByText("Your shortlist is empty.", { exact: false })).toBeVisible();
  });
  test("comparison enforces a three-car maximum and supports removal", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); for (const name of ["Apex GT", "Noir Executive", "Atlas Grand", "Pulse Electric"]) await page.getByRole("button", { name: `Add ${name} to comparison`, exact: true }).click(); await expect(page.getByText("3 cars selected", { exact: true })).toBeVisible(); await expect(page.locator(".toast")).toContainText("Compare up to three"); await page.getByRole("button", { name: "Compare", exact: true }).click(); const dialog = page.getByRole("dialog"); await expect(dialog.getByRole("table")).toContainText("Sample price (CAD)"); await dialog.getByRole("button", { name: "Remove Noir Executive from comparison", exact: true }).click(); await expect(dialog.getByRole("heading", { name: "Noir Executive" })).toHaveCount(0); await dialog.getByRole("button", { name: "Close dialog" }).click(); await page.getByRole("button", { name: "Clear comparison" }).click(); await expect(page.locator(".compare-tray")).toHaveCount(0);
  });
  test("vehicle gallery, share link and buying handoff work", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory?vehicle=apex"); const dialog = page.getByRole("dialog"); await expect(dialog).toContainText("Apex GT"); await dialog.getByRole("button", { name: "Interior", exact: true }).click(); await expect(dialog).toContainText("INTERIOR PHOTO PLACEHOLDER"); await dialog.getByRole("button", { name: "Walkaround", exact: true }).click(); await expect(dialog).toContainText("Placeholder, not a playable video."); await dialog.getByRole("button", { name: "Share car", exact: true }).click(); await expect(dialog.getByLabel("Shareable car link")).toHaveValue(/inventory\?vehicle=apex$/); await dialog.getByRole("link", { name: "Explore payments" }).click(); await expect(page).toHaveURL(/buying\?vehicle=apex/); await expect(page.getByRole("combobox", { name: "Start with a sample car", exact: true })).toHaveValue("apex");
  });
  test("sold and incoming examples do not allow visit planning", async ({ page, baseURL }) => {
    for (const id of ["vista", "ridge"]) { await go(page, baseURL, `inventory?vehicle=${id}`); await expect(page.getByRole("dialog").getByRole("link", { name: "Plan a test drive" })).toHaveCount(0); await page.getByRole("button", { name: "Close dialog" }).click(); await go(page, baseURL, `pickup?vehicle=${id}`); await page.getByRole("button", { name: "Prepare my visit" }).click(); await expect(page.getByRole("alert")).toContainText("not available for visit planning"); }
  });
  test("home carousel and showroom film keep intentional placeholders", async ({ page, baseURL }) => {
    await go(page, baseURL); await page.getByRole("button", { name: "Next vehicle", exact: true }).click(); await expect(page.locator(".sales-hero-tag")).toContainText("Noir Executive"); await page.getByRole("button", { name: "Inside the showroom" }).click(); await expect(page.getByRole("dialog")).toContainText("not a playable video"); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  });
  test("lifestyle finder transfers matching filters into inventory", async ({ page, baseURL }) => {
    await go(page, baseURL); await page.getByRole("combobox", { name: "My everyday looks like", exact: true }).selectOption("family"); await page.getByRole("combobox", { name: "My energy preference", exact: true }).selectOption("Hybrid"); await expect(page.locator(".sales-finder-result")).toContainText("1 sample match"); await page.getByRole("link", { name: "See my matches" }).click(); await expect(page.locator(".vehicle-card")).toHaveCount(1); await expect(page.locator(".vehicle-card")).toContainText("Suite Touring"); await expect(page).toHaveURL(/seats=7/);
  });
  test("payment calculator handles zero APR and an exact monthly result", async ({ page, baseURL }) => {
    await go(page, baseURL, "buying?vehicle=metro"); await page.getByLabel("Vehicle price (CAD)", { exact: true }).fill("10000"); await page.getByLabel("Down payment (CAD)", { exact: true }).fill("1000"); await page.getByLabel("APR (%) — illustrative", { exact: true }).fill("0"); await page.getByRole("combobox", { name: "Loan term", exact: true }).selectOption("36"); await expect(page.getByLabel("Estimated monthly payment", { exact: true })).toContainText("$250.00"); const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Save this scenario" }).click(); const file = await event; const text = await readFile((await file.path())!, "utf8"); expect(text).toContain("$250.00"); expect(text).toContain("DEMO — NOT AN OFFER");
  });
  test("negative trade equity, tax and fees are included explicitly", async ({ page, baseURL }) => {
    await go(page, baseURL, "buying"); for (const [label, value] of [["Vehicle price (CAD)","10000"],["Down payment (CAD)","1000"],["Assumed trade-in value (CAD)","1000"],["Amount owing on trade-in (CAD)","3000"],["Estimated fees (CAD)","200"],["Tax rate (%) — enter your own","10"],["APR (%) — illustrative","0"]]) await page.getByLabel(label, { exact: true }).fill(value); await page.getByRole("combobox", { name: "Loan term", exact: true }).selectOption("48"); await expect(page.getByLabel("Estimated monthly payment", { exact: true })).toContainText("$254.17"); await expect(page.locator(".sales-breakdown > div").filter({ hasText: "Amount financed" })).toContainText("$12,200.00");
  });
  test("invalid calculator inputs disable scenario downloads", async ({ page, baseURL }) => {
    await go(page, baseURL, "buying"); await page.getByLabel("APR (%) — illustrative", { exact: true }).fill("-1"); await expect(page.getByRole("alert")).toBeVisible(); await expect(page.getByRole("button", { name: "Save this scenario" })).toBeDisabled(); await page.getByLabel("APR (%) — illustrative", { exact: true }).fill(""); await expect(page.getByLabel("Estimated monthly payment", { exact: true })).toContainText("—");
  });
  test("trade-in notebook downloads notes without claiming an appraisal", async ({ page, baseURL }) => {
    await go(page, baseURL, "buying?tab=trade"); await page.getByLabel("Your trade-in (optional)").fill("2020 Example sedan"); await page.getByLabel("Questions for the appraiser").fill("Ask about tires and service records."); const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Download my trade-in notes" }).click(); const download = await event; const text = await readFile((await download.path())!, "utf8"); expect(text).toContain("2020 Example sedan"); expect(text).toContain("Not a valuation, appraisal, or offer.");
  });
  test("buying tabs support keyboard navigation and cash summary", async ({ page, baseURL }) => {
    await go(page, baseURL, "buying"); await page.getByRole("tab", { name: "Payment studio" }).focus(); await page.keyboard.press("ArrowRight"); await expect(page.getByRole("tab", { name: "Trade-in notebook" })).toHaveAttribute("aria-selected", "true"); await page.keyboard.press("ArrowRight"); await expect(page.getByRole("tab", { name: "Cash & buying steps" })).toHaveAttribute("aria-selected", "true"); await expect(page.getByLabel("Estimated purchase total", { exact: true })).toContainText("$68,900.00");
  });
  test("pickup draft exports an explicitly tentative calendar reminder", async ({ page, baseURL }) => {
    await go(page, baseURL, "pickup?vehicle=atlas&purpose=pickup"); await page.getByLabel("Preferred date", { exact: true }).fill(dayFromToday(3)); await page.getByLabel("13:00", { exact: true }).check(); await page.getByRole("button", { name: "Prepare my visit" }).click(); await page.getByRole("checkbox").first().check(); await page.getByLabel("Notes for your own visit draft").fill("Ask about the second key."); await page.getByRole("button", { name: "Review my plan" }).click(); await expect(page.locator(".sales-draft h2")).toContainText("Not a booking."); const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Download unconfirmed reminder" }).click(); const download = await event; expect(download.suggestedFilename()).toBe("vehiclesite-unconfirmed-pickup.ics"); const ics = await readFile((await download.path())!, "utf8"); expect(ics).toContain("STATUS:TENTATIVE"); expect(ics).toContain("SUMMARY:UNCONFIRMED:"); expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/); expect(ics).not.toContain("ATTENDEE"); expect(ics).not.toContain("ORGANIZER"); await expect(page.getByText("Draft exported. No appointment has been booked.", { exact: true })).toBeVisible();
  });
  test("test-drive preparation differs from pickup and text draft is downloadable", async ({ page, baseURL }) => {
    await go(page, baseURL, "pickup?vehicle=noir"); await page.getByRole("button", { name: "Prepare my visit" }).click(); await expect(page.getByLabel("Think about your usual routes and parking needs")).toBeVisible(); await page.getByRole("button", { name: "Review my plan" }).click(); const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Download visit draft", exact: true }).click(); const download = await event; const text = await readFile((await download.path())!, "utf8"); expect(text).toContain("Purpose: Test drive"); expect(text).toContain("Noir Executive"); expect(text).toContain("UNCONFIRMED — NOT A BOOKING");
  });
  test("past and out-of-window appointment dates are rejected", async ({ page, baseURL }) => {
    await go(page, baseURL, "pickup"); for (const date of ["2020-01-01", dayFromToday(100)]) { await page.getByLabel("Preferred date", { exact: true }).fill(date); await page.getByRole("button", { name: "Prepare my visit" }).click(); await expect(page.getByRole("alert")).toContainText("valid future date and time"); }
  });
  test("editing a visit draft preserves choices without confirming a booking", async ({ page, baseURL }) => {
    await go(page, baseURL, "pickup?purpose=pickup"); await page.getByRole("button", { name: "Prepare my visit" }).click(); await page.getByRole("checkbox").nth(1).check(); await page.getByRole("button", { name: "Review my plan" }).click(); await page.getByRole("button", { name: "Edit preparation" }).click(); await expect(page.getByRole("checkbox").nth(1)).toBeChecked(); await page.getByRole("button", { name: "Back", exact: true }).click(); await expect(page.getByLabel("Preferred date", { exact: true })).toHaveValue(dayFromToday(1)); await expect(page.getByLabel("Live visit summary")).toContainText("Not booked");
  });
  test("document search, preview and single download work", async ({ page, baseURL }) => {
    await go(page, baseURL, "documents"); await page.getByLabel("Search documents").fill("history"); await expect(page.locator(".document-row")).toHaveCount(1); await page.getByRole("button", { name: "Preview Vehicle history checklist", exact: true }).click(); await expect(page.locator(".document-text")).toContainText("NOT A VEHICLE HISTORY REPORT"); const event = page.waitForEvent("download"); await page.getByRole("link", { name: "Download template (.txt)", exact: true }).click(); const download = await event; expect(download.suggestedFilename()).toBe("history-checklist.txt");
  });
  test("every document file is a real draft text resource", async ({ request, baseURL }) => {
    for (const group of documentGroups) for (const doc of group.docs) { const response = await request.get(new URL(`documents/${doc.id}.txt`, baseURL!).href); expect(response.status()).toBe(200); const text = await response.text(); expect(text).toContain("DRAFT PLACEHOLDER"); expect(text).not.toContain("<html"); }
  });
  test("buyer packet combines selected templates into one download", async ({ page, baseURL }) => {
    await go(page, baseURL, "documents/purchase-options"); await page.getByRole("checkbox", { name: "Add Cash purchase worksheet to buyer packet" }).check(); await page.getByRole("checkbox", { name: "Add Finance comparison worksheet to buyer packet" }).check(); const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Download packet (2)", exact: true }).click(); const download = await event; const text = await readFile((await download.path())!, "utf8"); expect(download.suggestedFilename()).toBe("vehiclesite-buyer-packet.txt"); expect(text).toContain("CASH PURCHASE WORKSHEET"); expect(text).toContain("FINANCE COMPARISON WORKSHEET"); await page.getByRole("button", { name: "Clear selection" }).click(); await expect(page.getByRole("button", { name: "Download packet (0)", exact: true })).toBeDisabled();
  });
  test("all-template view supports a complete buyer packet", async ({ page, baseURL }) => {
    await go(page, baseURL, "documents"); await page.getByRole("button", { name: "Browse all 12 templates" }).click(); await expect(page.locator(".document-row")).toHaveCount(12); await page.getByRole("button", { name: "Add all shown templates to packet" }).click(); await expect(page.getByRole("button", { name: "Download packet (12)", exact: true })).toBeEnabled();
  });
  test("keyboard search navigates to sales documents", async ({ page, baseURL }) => {
    await go(page, baseURL); await page.keyboard.press("Control+k"); await page.getByRole("combobox", { name: "Search pages, cars, and documents" }).fill("purchase"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await expect(page).toHaveURL(/documents\/purchase-options/);
  });
  test("mobile menu supports navigation and Escape focus restoration", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await go(page, baseURL); await page.getByRole("button", { name: "Open menu", exact: true }).click(); await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Pickup & test drives", exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toContainText("The keys."); await page.getByRole("button", { name: "Open menu", exact: true }).click(); await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
  });
  test("theme persists and malformed saved state recovers safely", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await page.getByRole("button", { name: "Switch to light theme" }).click(); await page.reload(); await expect(page.locator("html")).toHaveAttribute("data-theme", "light"); await page.evaluate(() => localStorage.setItem("vehiclesite.saved.v1", "broken-json")); await page.reload(); await expect(page.getByRole("button", { name: "Saved (0)", exact: true })).toBeVisible();
  });
  test("reduced-motion preference and explicit motion toggle work", async ({ page, baseURL }) => {
    await go(page, baseURL); await expect(page.locator("html")).toHaveAttribute("data-motion", "off"); await page.getByRole("button", { name: "Enable animations" }).click(); await expect(page.locator("html")).toHaveAttribute("data-motion", "on"); await page.getByRole("button", { name: "Pause animations" }).click(); await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });
  test("all sales pages fit narrow mobile through desktop", async ({ page, baseURL }) => {
    test.setTimeout(120000); for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 950 }); for (const [path] of salesRoutes) { await go(page, baseURL, path); await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow, `${path || "home"} at ${width}px`).toBeLessThanOrEqual(1); } }
  });
  test("unknown URLs show a branded recovery page", async ({ page, baseURL }) => {
    const response = await go(page, baseURL, "unwritten-road"); expect(response?.status()).toBe(staticHost ? 404 : 200); await expect(page.getByRole("heading", { level: 1 })).toContainText("This turn is"); await page.getByRole("link", { name: "Explore the inventory", exact: true }).click(); await expect(page).toHaveURL(/inventory/);
  });
  for (const [path] of salesRoutes) test(`automated accessibility: ${path || "home"}`, async ({ page, baseURL }) => {
    await go(page, baseURL, path); await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(result.violations).toEqual([]);
  });
  test("light-theme inventory and vehicle dialog pass automated accessibility", async ({ page, baseURL }) => {
    await go(page, baseURL, "inventory"); await page.getByRole("button", { name: "Switch to light theme" }).click(); await expect(page.locator("html")).toHaveAttribute("data-theme", "light"); await page.waitForTimeout(400); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]); await page.getByRole("button", { name: "View Apex GT", exact: true }).click(); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  });
  test("capture sales review screenshots", async ({ page, baseURL }) => {
    await mkdir("test-results", { recursive: true }); await page.setViewportSize({ width: 1440, height: 1000 }); for (const path of ["", "inventory", "buying", "pickup", "documents"]) { await go(page, baseURL, path); await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); await page.screenshot({ path: `test-results/sales-${path || "home"}-desktop.png`, fullPage: true }); } await page.setViewportSize({ width: 390, height: 844 }); await go(page, baseURL); await page.screenshot({ path: "test-results/sales-home-mobile.png", fullPage: true });
  });
  test("payment math: zero APR, positive APR, and negative equity", () => {
    const base = { price: 10000, down: 1000, trade: 0, owing: 0, fees: 0, tax: 0, apr: 0, months: 36 }; expect(calculatePayment(base).monthly).toBe(250); expect(calculatePayment({ ...base, apr: 1e-20 }).monthly).toBeCloseTo(250, 8); const paid = calculatePayment({ ...base, apr: 12 }); expect(paid.monthly).toBeCloseTo(298.92878831566, 6); const negative = calculatePayment({ ...base, trade: 1000, owing: 3000, fees: 200, tax: 10, months: 48 }); expect(negative.principal).toBe(12200); expect(negative.monthly).toBeCloseTo(254.1666666667, 6);
  });
  test("payment math rejects invalid numbers and never produces negative installments", () => {
    const base = { price: 10000, down: 20000, trade: 0, owing: 0, fees: 0, tax: 0, apr: 0, months: 36 }; expect(calculatePayment(base).monthly).toBe(0); expect(calculatePayment(base).excess).toBe(10000); expect(() => calculatePayment({ ...base, months: 0 })).toThrow(); expect(() => calculatePayment({ ...base, apr: NaN })).toThrow(); expect(() => calculatePayment({ ...base, price: -1 })).toThrow();
  });
  test("calendar date validation and escaping are safe", () => {
    expect(visitDateValid("2020-01-01", "10:00")).toBe(false); expect(visitDateValid("2030-02-31", "10:00")).toBe(false); expect(visitDateValid(dayFromToday(1), "99:00")).toBe(false); const ics = makeCalendar(dayFromToday(2), "10:00", "Test drive", "Apex GT", "Question; one, two\nEND:VEVENT\n" + "é".repeat(120)); expect(ics).toContain("STATUS:TENTATIVE"); expect(ics.match(/^END:VEVENT$/gm)?.length).toBe(1); for (const line of ics.split("\r\n")) expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
  });
}
