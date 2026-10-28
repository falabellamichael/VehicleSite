# VehicleSite — car sales and mechanical services

**Car sales. Expert care. One garage.** The Harlan Street Garage cover introduces both car sales and mechanical services, with featured demo cars, interactive inspections, and sample service paperwork. The cinematic showroom, inventory, buying tools, test-drive and pickup planning, and buyer-document library remain available.

Live site: https://falabellamichael.github.io/VehicleSite/

## Main pages

| Route | Purpose |
| --- | --- |
| `/` | Garage cover: car sales, servicing, interactive inspection, estimates, and a sample service request |
| `/showroom` | Cinematic showroom, lifestyle finder, featured cars, buying journey, FAQs |
| `/inventory` | Nine fictional listings; combinable filters; saved cars; comparison; detail galleries and share links |
| `/buying` | Payment studio, trade-in notebook, cash-purchase preparation |
| `/pickup` | Test-drive or pickup preference; future dates; preparation checklist; downloadable visit draft and tentative calendar reminder |
| `/documents` | Searchable template library and build-your-own downloadable buyer packet |
| `/documents/vehicle-records` | Specification, history, and inspection templates |
| `/documents/purchase-options` | Cash, finance, and trade-in worksheets |
| `/documents/pickup-essentials` | Pickup, handover, and ownership-care templates |
| `/documents/policies` | Draft sales terms, privacy, and warranty information |

The old `/fleet`, `/experiences`, `/concierge`, `/documents/vehicle-guides`, `/documents/booking-options`, and `/documents/protection` links redirect to their sales equivalents. Query strings are retained. There is no concierge or chauffeur service in the new site.

## Functional features

- Inventory filters combine search, body style, price ceiling, energy, condition, mileage, seating, saved state, and sample availability. Filters live in shareable URL parameters.
- Favorites store valid car IDs in this browser; comparison supports up to three cars. Car-detail dialogs have replaceable gallery slots and shareable listing links.
- The lifestyle finder is an explicit filter-based tool, not a simulated AI or suitability recommendation.
- Payment estimates use fixed-rate monthly amortization, including zero-APR handling. Negative trade equity is displayed and included in the hypothetical amount financed. Tax is entered manually and applied to vehicle price only; trade-in tax credits and tax on fees are intentionally not modeled. Invalid inputs cannot be exported.
- Trade-in notes are a personal notebook, not an appraisal. No instant price, lender approval, or credit check is fabricated.
- Pickup and test-drive drafts reject past dates, invalid dates, dates beyond 90 days, and unavailable sample cars. Calendar files use UTC timestamps derived from the browser's displayed time zone, a 45-minute placeholder duration, `STATUS:TENTATIVE`, and no organizer or attendees. Calendar text is escaped and UTF-8 line-folded.
- Twelve distinct text templates can be previewed, downloaded individually, or combined into a buyer packet.
- Dark/light themes, reduced motion, carousel controls, keyboard command search, native dialogs, skip link, and responsive navigation are retained.

## Demo boundaries

Every vehicle, year, specification, condition, equipment list, price, and stock status is fictional. Prices are illustrative CAD amounts excluding tax and fees. The 6.9% initial APR is an invented calculator example, not a rate offer. Vehicle images are AI-generated transparent concepts; the showroom image is also a fictional concept. None depicts actual vehicles or the dealership. Videos and documents remain placeholders. No verified vehicle history, inspection, warranty, real appointment availability, reservation, purchase, deposit, credit application, quote, appraisal, or dealer notification exists.

No customer information is submitted. Favorites and theme/motion preferences are stored locally. Visit drafts, notes, calculator values, and document selections are held in page memory. Downloads contain the inputs the visitor elected to export. The host still receives normal requests for the static site and files. There are no analytics integrations or external image/video providers configured.

This is a **public static demo**, not authenticated document storage. Never put credentials, customer documents, identification, signed agreements, or private records in `public/`. `noindex` is not access control. Production dealer inventory, actual taxes and fees, appointment availability, forms, policies, financing, and sales processes need appropriate services, validation, permissions, and reviewed content.

## Content and media editing

- `src/data.ts`: fictional inventory, sales prices, specifications, status, gallery slots, navigation, document metadata, FAQs, and preparation checklists.
- `src/garage/`: isolated cover design, Three.js inspection lighting, spring-driven lamp, findings, sample estimates, and local-only service form.
- `src/pages/`: the five sales page components. Document category pages share `Documents.tsx`.
- `src/sales.ts`: filtering, amount formatting, amortization, date validation, and calendar export helpers.
- `src/App.tsx`: shell, themes, search, comparison, vehicle dialogs, and old-link redirects.
- `src/styles.css`: original design system. `src/sales.css`: sales-edition layouts and responsive additions.
- `public/media/images/demo/`: AI-generated transparent car cutouts and a fictional showroom scene. The Home hero backdrop reuses four car cutouts. Replace them with approved, owned/licensed imagery when real listings and dealership assets are provided. `public/media/` also contains video slots; videos remain placeholders.
- `public/documents/`: twelve public, clearly labeled draft text templates. Replace only with approved, non-private content.
- `scripts/pages-routes.json`: ten page routes plus six legacy redirect entry points. Keep it synchronized when adding routes.

## Development and verification

Node.js 24 is used by the existing deployment workflow. The garage cover adds Three.js 0.170 and locally served Reddit Mono and Sofia Sans Extra Condensed fonts. Vite is patched to 8.3.5.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
$env:PW_CHANNEL = 'msedge'
npm.cmd test
npm.cmd run build:pages
npm.cmd run test:pages
```

The development suite runs on an isolated loopback server. The Pages suite tests the actual static build under `/VehicleSite/`, including direct refreshes and real 404 behavior. For hosted verification:

```powershell
$env:PAGES_URL = 'https://falabellamichael.github.io/VehicleSite/'
$env:PW_CHANNEL = 'msedge'
npm.cmd run test:pages
Remove-Item Env:PAGES_URL
```

The same sales-flow tests run against development and production builds. They cover routes, redirects, interactive tools, downloads, mobile layouts, automated accessibility, calculator math, and calendar escaping. Browser reports and screenshots remain ignored by Git. See `QA.md` for actual execution results and limitations.

## Publishing

Pushes to `main` trigger `.github/workflows/pages.yml`: install locked dependencies, build the static site, run the Pages suite, and publish only after it passes. The hosted website does not depend on a local server or a PC remaining on. The garage cover is integrated with the current sales edition in `D:\VehicleSite`.

A local checkout can be brought up to date later using `git pull --ff-only` when it has no conflicting local work.

## Harlan Street Garage cover

The cover uses locally served Pexels photographs and depth maps computed with Depth Anything V2 Small. Credits and model provenance are in `public/media/garage/README.md`. Three.js loads dynamically for visible inspection scenes, rendering pauses off-screen and in hidden tabs, and reduced motion disables automatic lamp travel. Sound is opt-in. A static photo remains available if WebGL fails.

The estimate uses integer cents and illustrative USD amounts, separate from the showroom’s sample CAD vehicle prices. Changing selected repairs clears the sample approval. The labor guide and business hours are illustrative; the service form validates locally, displays a RECEIVED stamp, and neither transmits nor persists personal information. The fictional shop, certifications, warranty, customer notes, inspection findings, and estimates are not verified business claims. Mobile LCP below two seconds has not been certified on a midrange phone.
