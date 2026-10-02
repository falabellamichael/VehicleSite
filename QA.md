# VehicleSite sales-edition verification

The previous service-site test results do not establish correctness of this sales remap. This file is updated with actual execution results before publication.

## Test coverage

The shared Playwright sales suite covers nine pages and refreshes; six legacy redirects; inventory filters, sort, favorites, comparison limits, galleries and share links; lifecycle finder; payment and trade-in tools; zero APR and negative equity; invalid financial inputs; pickup versus test-drive preparation; future-date validation; calendar and text exports; all twelve draft documents and combined buyer packets; keyboard navigation; mobile layouts; themes; reduced motion; automated accessibility; screenshot capture; and iCalendar escaping and line folding.

The deployment suite additionally checks project-prefixed asset URLs, static 404 responses, and sales-edition deployment metadata.

## Limitations

Automated browser checks are not an accessibility certification. Full screen-reader testing, real-device testing, Safari and Firefox, live dealership inventory, real lender calculations, jurisdiction-specific tax calculations, actual appointment availability, and production backend integrations are outside this demo. A calendar export is an unconfirmed personal reminder, never an appointment.

No new dependencies or hosting services are required.
