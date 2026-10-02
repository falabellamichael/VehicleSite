import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
const routes: { path: string; title: string }[] = JSON.parse(
  readFileSync(
    new URL("../scripts/pages-routes.json", import.meta.url),
    "utf8",
  ),
);
for (const route of routes) {
  test(
    "direct visit and refresh: " + (route.path || "home"),
    async ({ page }) => {
      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          failures.push(response.status() + " " + response.url());
      });
      const response = await page.goto(route.path || "./");
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page).toHaveTitle(/VehicleSite/);
      await expect(page).not.toHaveTitle(/Not found/i);
      const refresh = await page.reload();
      expect(refresh?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page).not.toHaveTitle(/Not found/i);
      expect(failures).toEqual([]);
    },
  );
}

test("document previews and every placeholder download work under the project path", async ({
  page,
  request,
  baseURL,
}) => {
  const documents = readdirSync(
    new URL("../public/documents/", import.meta.url),
  ).filter((name) => name.endsWith(".txt"));
  expect(documents).toHaveLength(12);
  for (const name of documents) {
    const response = await request.get(
      new URL("documents/" + name, baseURL).href,
    );
    expect(response.status(), name).toBe(200);
    expect(response.headers()["content-type"], name).toContain("text/plain");
    expect(await response.text(), name).toMatch(/placeholder/i);
  }
  await page.goto("documents/");
  await page
    .locator('.document-row button[aria-label^="Preview "]')
    .first()
    .click();
  await expect(page.locator(".document-text")).toContainText(/placeholder/i);
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download placeholder (.txt)", exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/\.txt$/);
  expect(await download.failure()).toBeNull();
});

test("compiled assets and navigation stay within VehicleSite", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("./");
  const root = new URL(baseURL!);
  const assets = await page
    .locator('script[src], link[rel="stylesheet"], link[rel="icon"]')
    .evaluateAll((elements) =>
      elements.map((element) =>
        element instanceof HTMLScriptElement
          ? element.src
          : (element as HTMLLinkElement).href,
      ),
    );
  expect(assets.length).toBeGreaterThan(2);
  for (const asset of assets) {
    expect(new URL(asset).pathname).toMatch(/^\/VehicleSite\//);
    expect((await request.get(asset)).status()).toBe(200);
  }
  const links = await page
    .locator("a[href]")
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLAnchorElement).href),
    );
  for (const link of links) {
    const url = new URL(link);
    if (url.origin === root.origin)
      expect(url.pathname).toMatch(/^\/VehicleSite\//);
  }
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "The fleet", exact: true })
    .click();
  await expect(page).toHaveURL(/\/VehicleSite\/fleet\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Documents", exact: true })
    .click();
  await expect(page).toHaveURL(/\/VehicleSite\/documents\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("subpage redirects and refresh preserve query strings and anchors", async ({
  page,
}) => {
  const response = await page.goto(
    "documents/booking-options?source=pages-test#main-content",
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("source")).toBe("pages-test");
  expect(new URL(page.url()).hash).toBe("#main-content");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("source")).toBe("pages-test");
});

test("unknown URLs return an actual 404 and the branded recovery page", async ({
  page,
}) => {
  const response = await page.goto("not-a-real-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "still unwritten",
  );
  await page.getByRole("link", { name: "Back to the beginning" }).click();
  await expect(page).toHaveURL(/\/VehicleSite\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Presence",
  );
});
