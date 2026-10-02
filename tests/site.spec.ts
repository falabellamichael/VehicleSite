import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";
const routes = [
  "/",
  "/fleet",
  "/experiences",
  "/concierge",
  "/documents",
  "/documents/vehicle-guides",
  "/documents/booking-options",
  "/documents/protection",
  "/documents/policies",
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("vehiclesite.motion.v1", "false"),
  );
});
for (const route of routes) {
  test(`route renders without browser errors: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page).toHaveTitle(/VehicleSite/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
test("homepage carousel, film placeholder, and modal focus restoration", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-car-tag strong")).toContainText("Apex GT");
  await page.getByRole("button", { name: "Next vehicle", exact: true }).click();
  await expect(page.locator(".hero-car-tag strong")).toContainText(
    "Noir Executive",
  );
  const trigger = page.getByRole("button", { name: "Discover the feeling" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByText("This is an animated placeholder—not a playable video.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test("vehicle category filtering, live search, and empty state", async ({
  page,
}) => {
  await page.goto("/fleet");
  await expect(page.locator(".vehicle-card")).toHaveCount(6);
  await page.getByRole("button", { name: "SUV", exact: true }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-title")).toContainText("Atlas Grand");
  await page
    .getByRole("textbox", { name: "Search vehicles" })
    .fill("unfindable");
  await expect(page.getByText("A different road awaits.")).toBeVisible();
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(6);
  await page.getByLabel("Sort vehicles").selectOption("name");
  await expect(page.locator(".vehicle-title").first()).toContainText("Apex GT");
  await page.getByLabel("Sort vehicles").selectOption("seats");
  await expect(page.locator(".vehicle-title").first()).toContainText(
    "Suite Van",
  );
});
test("saved vehicles persist and saved filter works", async ({ page }) => {
  await page.goto("/fleet");
  await page
    .getByRole("button", { name: "Save Atlas Grand", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave Atlas Grand", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Unsave Atlas Grand", exact: true })
    .click();
  await expect(page.locator(".vehicle-card")).toHaveCount(0);
});
test("comparison supports three vehicles, limit, removal, and clear", async ({
  page,
}) => {
  await page.goto("/fleet");
  for (const name of ["Apex GT", "Noir Executive", "Atlas Grand"])
    await page
      .getByRole("button", { name: `Add ${name} to comparison` })
      .click();
  await page
    .getByRole("button", { name: "Add Pulse Electric to comparison" })
    .click();
  await expect(page.locator(".toast")).toContainText("Choose up to three");
  await page
    .locator(".compare-tray")
    .getByRole("button", { name: "Compare", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(4);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove Atlas Grand from comparison" })
    .click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Clear comparison" }).click();
  await expect(page.locator(".compare-tray")).toHaveCount(0);
});
test("vehicle detail opens and transfers choice to the builder", async ({
  page,
}) => {
  await page.goto("/fleet");
  await page.getByRole("button", { name: "View Atlas Grand" }).click();
  await expect(page.getByRole("dialog")).toContainText("FICTIONAL VEHICLE");
  await page
    .getByRole("link", { name: "Design a journey", exact: true })
    .click();
  await expect(page).toHaveURL(/concierge\?vehicle=atlas/);
  await expect(page.getByLabel("Your vehicle")).toHaveValue("atlas");
});
test("command search keyboard navigation routes to documents", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page
    .getByRole("combobox", { name: "Search pages, vehicles, and documents" })
    .fill("booking");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/documents\/booking-options$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("experience tabs support keyboard navigation and builder links", async ({
  page,
}) => {
  await page.goto("/experiences");
  const first = page.getByRole("tab", { name: /City & nightlife/ });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: /Weekend escapes/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Take the longer way.",
  );
  await page.getByRole("link", { name: "Shape this experience" }).click();
  await expect(page).toHaveURL(/experience=escape/);
});
test("journey validation, capacity, sample fill, review and local download", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") submissions.push(r.url());
  });
  await page.goto("/concierge");
  await page.getByRole("button", { name: "Personalize the details" }).click();
  await expect(
    page.getByRole("heading", { name: "Set the scene." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "More guests" }),
  ).toBeDisabled();
  await page.getByLabel("Your vehicle").selectOption("atlas");
  await page.getByRole("button", { name: "More guests" }).click();
  await page.getByLabel("Journey date", { exact: true }).fill("2099-04-18");
  await page.getByRole("button", { name: "Personalize the details" }).click();
  await expect(
    page.getByRole("heading", { name: "Make it personal." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fill with sample details" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create local preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Your journey preview." }),
  ).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download your brief" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("vehiclesite-journey-preview.json");
  expect(submissions).toEqual([]);
  await page.getByRole("button", { name: "Start a new journey" }).click();
  await expect(page.getByLabel("Journey date", { exact: true })).toHaveValue(
    "",
  );
});
test("journey date cannot be in the past", async ({ page }) => {
  await page.goto("/concierge");
  await page.getByLabel("Journey date", { exact: true }).fill("2000-01-01");
  await page.getByRole("button", { name: "Personalize the details" }).click();
  await expect(
    page.getByRole("heading", { name: "Set the scene." }),
  ).toBeVisible();
});
test("document search, real text preview, and download", async ({ page }) => {
  await page.goto("/documents");
  await page
    .getByRole("textbox", { name: "Search documents" })
    .fill("self-drive");
  await expect(page.locator(".document-row")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Preview Self-drive experience" })
    .click();
  await expect(page.locator(".document-text")).toContainText(
    "DRAFT PLACEHOLDER — NOT FOR OPERATIONAL OR LEGAL USE",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download placeholder (.txt)" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("self-drive.txt");
  await page.keyboard.press("Escape");
  await page
    .getByRole("textbox", { name: "Search documents" })
    .fill("impossible document");
  await expect(page.getByText("That detail is not here yet.")).toBeVisible();
});
test("all twelve placeholder document files are served", async ({
  request,
}) => {
  for (const id of [
    "collection-overview",
    "vehicle-specifications",
    "delivery-checklist",
    "self-drive",
    "chauffeured",
    "extended",
    "coverage-overview",
    "vehicle-care",
    "support",
    "terms-template",
    "privacy-template",
    "change-template",
  ]) {
    const response = await request.get(`/documents/${id}.txt`);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain("DRAFT PLACEHOLDER");
  }
});
test("mobile navigation opens, closes, and changes routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "The fleet", exact: true })
    .click();
  await expect(page).toHaveURL(/\/fleet$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("light theme persists after a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("corrupted browser preferences fall back safely", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("vehiclesite.saved.v1", '{"wrong":true}');
    localStorage.setItem("vehiclesite.theme.v1", '"invalid"');
  });
  await page.goto("/fleet");
  await expect(page.locator(".vehicle-card")).toHaveCount(6);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("operating system reduced motion is respected without saved override", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5187");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  expect(
    await page
      .locator(".hero-media .car-art")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await context.close();
});
test("designed 404 and missing document category have recovery links", async ({
  page,
}) => {
  await page.goto("/not-a-page");
  await expect(
    page.getByRole("link", { name: "Back to the beginning" }),
  ).toBeVisible();
  await page.goto("/documents/not-a-folder");
  await page.getByRole("link", { name: "Return to Documents" }).click();
  await expect(page).toHaveURL(/\/documents$/);
});
test("all pages fit desktop, tablet, and narrow mobile widths", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      const sizing = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      expect(sizing.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(
        sizing.viewport + 1,
      );
    }
  }
});
for (const route of routes) {
  test(`automated accessibility: ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
test("automated accessibility in light theme and dialog", async ({ page }) => {
  await page.goto("/fleet");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "View Apex GT" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("capture review screenshots", async ({ page }) => {
  test.setTimeout(90000);
  mkdirSync(".artifacts", { recursive: true });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: ".artifacts/home-desktop.png",
    fullPage: true,
  });
  await page.goto("/fleet");
  await page.screenshot({
    path: ".artifacts/fleet-desktop.png",
    fullPage: true,
  });
  await page.goto("/documents");
  await page.screenshot({
    path: ".artifacts/documents-desktop.png",
    fullPage: true,
  });
  await page.goto("/concierge");
  await page.screenshot({
    path: ".artifacts/concierge-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: ".artifacts/home-mobile.png", fullPage: true });
});
