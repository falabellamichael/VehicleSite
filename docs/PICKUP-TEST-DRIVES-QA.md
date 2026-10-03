# Pickup & Test Drives — styling and verification

## Scope

The Pickup & Test Drives page was refined directly in GitHub, beginning at `f8fbbf88861713bdc762629faa2db0ae7c6608bb`. Its visual treatment now matches Buying Tools. Application changes are limited to `src/pages/Pickup.tsx` and its new page-scoped stylesheet, `src/pages/Pickup.css`. Existing vehicle artwork, the header, inventory, Buying Tools, the mouse-controlled home background, and the carousel fix are unchanged. No dependencies or external services were added.

## Design and interaction changes

- A rounded planning workspace with restrained champagne accents, consistent typography, clear spacing, and matched dark/light themes.
- A numbered three-stage progress indicator, with links back to completed stages without discarding the draft.
- Dedicated Test Drive and Vehicle Pickup cards, with clearly differentiated selected states.
- Grouped vehicle, date, and time controls; a native calendar field; seven suggested dates; readable time-zone information; and explicit preference-not-availability messaging.
- A redesigned live summary with the selected vehicle, a calendar-style date panel, visit details, preparation progress, and an unconfirmed status.
- Styled optional preparation cards, a progress indicator, notes with an 800-character limit and counter, and relevant document links.
- A review-stage visit ticket and two distinct download cards for a personal calendar reminder or text draft.
- More consistent focus handling, associated validation errors, accessible status graphics, larger mobile controls, and a mobile shortcut to the summary.
- Supporting cards linking to preparation documents and Buying Tools for the selected car.

The date-validation and calendar-generation helpers are unchanged. Unavailable sample vehicles are blocked, past/invalid dates and dates beyond the 90-day window are rejected, and exported calendar reminders remain tentative personal placeholders. There is no real appointment availability, booking, reservation, purchase, or dealer notification. Completing the preparation checklist never confirms a visit. Draft content remains in page memory unless the visitor downloads it.

## Executed checks

The complete production-site suite passed at application/test revision `e0ddab3f6fa03e467b6741541a8dfd9e254847ac`: **99 passed, 0 failed**. This includes all pre-existing sales, Buying Tools, home-carousel, mouse-background, route, download, responsive-layout, and automated accessibility checks, plus 15 new Pickup & Test Drives checks.

After visual review, mobile step-marker widths and native calendar-field styling were refined. At final application revision `028a9fe4b4d24c67c54aaadb50321b8ec2e77766`, TypeScript validation, the GitHub Pages production build, and all **15 focused Pickup checks passed**. The publishing workflow runs the complete 99-check suite again before deployment.

The new checks exercise both visit types and all three stages: selected states; date/time synchronization; errors and focus; unavailable-vehicle recovery; optional checklists; returning to completed steps; purpose changes; calendar and text downloads; entered-note preservation; selected-vehicle imagery; Buying Tools handoff; and reduced-motion behavior.

All three stages, both visit types, and both themes were checked for horizontal overflow at widths of 320, 390, 768, 1024, and 1440 pixels. Automated axe checks passed for every stage in dark and light themes. Desktop planning and light-theme review screenshots, preparation screenshots, and mobile planning screenshots were visually reviewed. A preparation-status ARIA issue found during the initial run was corrected before the passing results above.

## Repeat the checks

```powershell
npm.cmd run build:pages
$env:PW_CHANNEL = 'msedge'
npm.cmd run test:pages
npm.cmd run test:pages -- pickup-tools
```

For hosted checks, set `PAGES_URL` to `https://falabellamichael.github.io/VehicleSite/` before running `test:pages`. The same 15 Pickup tests are also registered in the development suite.

## Limits

Local verification used Microsoft Edge/Chromium. Responsive checks are browser emulation, not physical-device testing. Safari, Firefox, full screen-reader testing, and a complete manual accessibility audit were not performed. Automated accessibility checks are not certification. No backend, live dealer calendar, payment flow, or customer-data submission was introduced.

A temporary Windows checkout was used only for verification. The source working copy at `D:\VehicleSite` was not modified.
