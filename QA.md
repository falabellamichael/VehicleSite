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

This is a placeholder-only front end. There is no booking, payment, email delivery, live pricing, authentication, or production hosting integration. Form details stay in page memory; downloaded briefs are local files.

Browser automation used Edge/Chromium only. Firefox, Safari, real-device testing, full assistive-technology testing, and a complete manual accessibility audit were not performed. Automated accessibility results are not a certification.

To repeat the build and tests in PowerShell:

```powershell
npm.cmd run build
$env:PW_CHANNEL = 'msedge'; npm.cmd test
```
