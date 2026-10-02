# VehicleSite sales-edition verification

Verified on 2026-10-02 against application/test revision `47e9a5450eb3b0f0d6c5601fdba517e79e929253` using Microsoft Edge on the connected Windows development machine. This documentation commit does not change the tested application.

## Completed production-build checks

- TypeScript validation and GitHub Pages production build: passed.
- Full static-site suite: **53 passed, 0 failed**.
- All nine sales pages loaded directly and after refresh.
- All six legacy service-site links redirected to their sales equivalents while retaining query parameters.
- Every sales page checked at 320, 390, 768, 1024, and 1440 pixels, with no horizontal page overflow.
- Inventory combinations, sorting, persistent favorites, three-car comparison limit, gallery placeholders, share links, and buying-tool handoff verified.
- Sold and incoming sample cars prevented from visit planning.
- Lifestyle finder verified against the fictional inventory.
- Payment estimates checked for zero APR, positive APR, very small positive APR, negative trade equity, taxes/fees, excess down payment, and invalid inputs.
- Trade-in notebook and payment-scenario downloads verified.
- Both pickup and test-drive drafts verified, including date restrictions, preparation notes, editing, text export, and tentative calendar export.
- Calendar exports checked for escaping, valid dates, UTC timestamps, UTF-8 line folding, tentative status, and absence of invitations/attendees.
- All twelve draft text resources, document previews, individual downloads, selected buyer packets, and the all-template view verified.
- Keyboard search, mobile navigation, focus restoration, theme persistence, malformed saved preferences, and reduced-motion controls verified.
- Automated axe checks passed on all nine routes and on the light-theme inventory and vehicle dialog.
- Compiled asset paths, real static 404 responses, and sales-edition deployment metadata verified.
- Desktop home, buying tools, pickup planner, and mobile home screenshots visually reviewed.

The development suite uses the same 52 shared checks; the static-site suite adds one deployment-metadata/asset test. These are overlapping suites, not 105 unique test cases. Some checks exercise pure calculation/calendar helpers rather than a browser.

Earlier test-selector and asynchronous URL-state issues were corrected before the clean static-suite result above. Inventory filter changes now read the latest browser URL to avoid restoring stale filters during rapid interactions.

## Publishing and repeatability

Changes were authored directly in GitHub on `sales-remap-20261002`. A separate temporary checkout was used for testing; the source working copy at `D:\VehicleSite` was not modified. The existing main-branch GitHub Pages workflow rebuilds the site and runs the static suite before deployment.

```powershell
npm.cmd run build:pages
$env:PW_CHANNEL = 'msedge'
npm.cmd run test:pages
npm.cmd test
```

## Scope and limitations

This is a public, placeholder-only automotive sales front end. It has no live stock feed, real appointment calendar, lender integration, credit application, quote, purchase, deposit, dealer notification, authenticated document storage, or payment processing. Dates are preferences, and exported calendar events are unconfirmed personal reminders. All cars, prices, equipment, and documents are sample content.

Local browser verification used Edge/Chromium. Safari, Firefox, real-device testing, full screen-reader testing, and a complete manual accessibility audit were not performed. Automated accessibility checks are not certification. The financial calculator is illustrative arithmetic, not a jurisdiction-specific tax calculator or lender offer.

## Mouse-led hero backdrop ? 2026-10-02

Application/test revision: 8285d5206c92ce5c94f3ede768c4e03929d751f0. TypeScript validation and the GitHub Pages build passed. The complete production-build suite passed **65/65 checks**, including **12 added hero-backdrop checks**; the original sales-flow and accessibility checks still pass.

The added checks cover left/right direction and sustained movement; the neutral midpoint and pointer exit; separation from the header; foreground links, carousel controls, and vehicle dialogs; the live reduced-motion preference and site motion toggle; touch input and a touch-only emulated browser; scrolling and window blur; repeating-track coverage and page overflow from 320 through 1920 pixels; and dark/light/mobile review screenshots. The dark/light desktop and final mobile hero screenshots were visually reviewed.

The background consists of four original SVG design placeholders with optional replacement image slots. It remains decorative and does not capture pointer or touch input. No new dependencies, tracking, external media services, routes, or header changes were introduced. Source changes were authored directly in GitHub; the temporary Windows checkout was used only to verify them. D:\VehicleSite source remains unchanged.

Verification used Microsoft Edge/Chromium, with touch emulation rather than physical-device testing. No Safari or Firefox verification or full manual assistive-technology audit was performed.


## Hero carousel overlap fix ? 2026-10-02

Verified application and test revision: `7bf6670152b8566751c28d67b9e45bcfb7a1992f`.

The reported bug was reproduced on the published site: six next-slide clicks increased the mounted hero car images from one to seven. The artwork and details button were sibling elements using the same React key, so older artwork was left mounted during reconciliation.

The artwork and details now use distinct, stable key namespaces. Each selection removes the previous car rather than accumulating another layer. No background, styling, header, vehicle data, or sales-flow changes were needed.

A new regression check was run against the old published revision and failed with two mounted car images after one switch. After the fix, the complete production suite passed: **71 passed, 0 failed**. The six new carousel checks also passed against the development build with no duplicate-key warnings or runtime errors.

The new checks verify repeated forward/backward cycles, direct slide selection, nine automatic transitions while the mouse-led backdrop changes direction, pause/resume, rapid clicks, car-detail synchronization, light/dark themes, mobile reduced-motion controls, and returning home. They check the actual number of mounted media/SVG elements and the selected artwork colour, not only the visible vehicle label.

Desktop and mobile screenshots after repeated transitions were visually reviewed. The existing twelve moving-background checks and all sales-site checks remain passing. Verification used Microsoft Edge/Chromium; this was not a Safari or Firefox test.

Changes were authored directly in GitHub and verified in a temporary checkout. The source working copy at D:\VehicleSite was not modified.
