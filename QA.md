# VehicleSite verification

Verified on 2026-10-02 on the project's Windows development machine.

## Results

- TypeScript validation and Vite production build: passed.
- Playwright browser suite using Microsoft Edge: 37 tests passed, 0 failed.
- Nine routes checked for rendering and browser runtime errors.
- Nine routes checked at widths of 320, 390, 768, 1024, and 1440 pixels.
- Fleet filters, search, saved favorites, comparison limits, and vehicle dialogs tested.
- Hero carousel, keyboard command search, experience tabs, and mobile menu tested.
- Journey validation, past-date rejection, sample fill, and local JSON download tested.
- Document previews, search, downloads, and all twelve placeholder text files tested.
- Theme persistence, corrupt preference recovery, and reduced motion tested.
- Automated axe accessibility checks passed on all nine routes, plus light-theme fleet and its vehicle dialog.
- Desktop home, fleet, documents, and concierge screenshots and mobile home screenshot visually reviewed.

## Scope and limitations

This is a placeholder-only front end. There is no booking, payment, email delivery, live pricing, authentication, or server-side customer processing. GitHub Pages provides static hosting for the public concept. Form details stay in page memory; downloaded briefs are local files.

Browser automation used Edge/Chromium only. Firefox, Safari, real-device testing, full assistive-technology testing, and a complete manual accessibility audit were not performed. Automated accessibility results are not a certification.

To repeat the build and tests in PowerShell:

```powershell
npm.cmd run build
$env:PW_CHANNEL = 'msedge'; npm.cmd test
```

## GitHub Pages deployment checks

Reverified on 2026-10-02 for the `/VehicleSite/` deployment.

- Standard production build and GitHub Pages production build: passed, including TypeScript validation.
- Existing Edge regression suite: 37 passed, 0 failed.
- Additional static-host deployment suite in Edge: 13 passed, 0 failed.
- All nine routes return HTTP 200 on direct visits and refreshes, including document subpages.
- The static test server has no SPA fallback, so route checks exercise the generated page directories.
- All twelve document downloads, document preview, CSS/JS/favicon paths, desktop/mobile navigation, query strings, and anchors passed.
- Unknown URLs return HTTP 404 with the branded recovery page.
- Deployment workflow uses locked dependencies, SHA-pinned GitHub actions, and browser checks before publishing. The CI browser is Chromium.

The deployment suite can also run against the public site by setting `PAGES_URL`; that does not start a local server. See `README.md` for commands. These checks do not turn placeholder forms into a live booking service.
