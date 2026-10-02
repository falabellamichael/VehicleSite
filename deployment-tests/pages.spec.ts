import { test, expect } from "@playwright/test";
import { registerSalesFlows } from "../tests/sales-flows";
registerSalesFlows(true);
test("deployed assets and metadata use the VehicleSite project path", async ({ page, request, baseURL }) => {
  await page.goto(baseURL!);
  const assets = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(elements => elements.map(el => el.getAttribute("src") || el.getAttribute("href")));
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) { expect(asset).toMatch(/^\/VehicleSite\/assets\//); const response = await request.get(new URL(asset!, baseURL!).href); expect(response.status()).toBe(200); }
  const response = await request.get(new URL("deployment.json", baseURL!).href); expect(response.status()).toBe(200);
  const metadata = await response.json(); expect(metadata.edition).toBe("automotive-sales"); expect(metadata.pages).toBe(9); expect(metadata.redirects).toBe(6);
});
