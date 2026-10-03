# Boxy Buying Tools and Pickup & Test Drives

Styling-only change to the two tool pages: square panel, input, tab, icon-tile, badge, date/time choice, visit-ticket, and download-card corners. Soft card shadows and floating card hover motion are removed; colors, typography, dimensions, layout, and working interactions are preserved.

The circular preparation indicator is now a square count tile with a straight bottom progress edge driven by the same existing checklist value. Native radio and checkbox controls retain their behavior. Keyboard focus and validation feedback are retained.

Changes are confined to Buying.css and Pickup.css; no application TypeScript components or calculation, date, export, inventory, header, or home-carousel logic was changed. The previous calendar-radius test is updated to the requested square shape. Seven new style regressions check both themes, responsive variants, all tool states, progress, focus, and errors.

## Verification

At application revision `2b7203db5507a94216ae56e5fa59a15ffc7a58a1`, TypeScript validation and the GitHub Pages production build passed. All **35 targeted tests passed**: the seven new square-style checks plus the existing Buying Tools and Pickup & Test Drives suites. Coverage includes mobile/desktop variants, both themes, all three buying modes, both visit purposes and all stages, the live progress tile, keyboard focus, validation, calculations, state preservation, and downloads. Automated accessibility checks for both pages also passed. Dark/light desktop, mobile, and preparation-progress screenshots were visually reviewed.

Tests used Microsoft Edge/Chromium and browser viewport emulation, not physical devices or a complete manual accessibility audit. The existing deployment workflow runs the full site suite before publishing. A temporary Windows checkout was used for verification only; `D:\VehicleSite` was not changed.
