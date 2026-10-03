# Boxy Buying Tools and Pickup & Test Drives

Styling-only change to the two tool pages: square panel, input, tab, icon-tile, badge, date/time choice, visit-ticket, and download-card corners. Soft card shadows and floating card hover motion are removed; colors, typography, dimensions, layout, and working interactions are preserved.

The circular preparation indicator is now a square count tile with a straight bottom progress edge driven by the same existing checklist value. Native radio and checkbox controls retain their behavior. Keyboard focus and validation feedback are retained.

Changes are confined to Buying.css and Pickup.css; no application TypeScript components or calculation, date, export, inventory, header, or home-carousel logic was changed. The previous calendar-radius test is updated to the requested square shape. Seven new style regressions check both themes, responsive variants, all tool states, progress, focus, and errors.
