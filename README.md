# VehicleSite

**The art of arrival.** A premium automotive front-end concept, built for `D:\VehicleSite`.

Inspired by the dark/champagne visual language of the existing SICKOS website, but implemented as an independent, original project. Every vehicle, specification, image area, film area, service description, and document is placeholder content. Nothing books a vehicle, takes a payment, emails a customer, or submits personal data.

## Published preview

Website: https://falabellamichael.github.io/VehicleSite/

The public concept is hosted on GitHub Pages. Your computer and local development server are not needed to view it. Every push to `main` triggers `.github/workflows/pages.yml`: install the locked dependencies, build, test the static output, then publish it. GitHub Pages uses **GitHub Actions** as its source.

The Pages build uses `/VehicleSite/` as its base path; the normal local build remains at `/`. Images, video posters, videos, and document downloads resolve through the same base-aware helper.

```powershell
npm run build:pages
$env:PW_CHANNEL = 'msedge'
npm run test:pages
```

To run those checks against the hosted site instead of a local static preview, set `$env:PAGES_URL = 'https://falabellamichael.github.io/VehicleSite/'` before `npm run test:pages`, then clear it with `Remove-Item Env:PAGES_URL`. The test-only preview server binds to loopback port 4189 and never serves the source tree.

The live site remains a clearly labeled placeholder concept, not a booking or payment service. The existing no-index settings are retained; they do not make the site private.

## Run locally

Node.js 22.12+ (or a supported newer release) and npm are required. The development machine used for this project has Node 24.

```powershell
cd D:\VehicleSite
npm install
npm run dev
```

Open the local URL printed by Vite. The default is `http://127.0.0.1:5173`.

```powershell
npm run typecheck
npm run build
npm run preview
```

`build` runs TypeScript validation and creates `dist/`. The production preview runs on `http://127.0.0.1:4173`. The lockfile pins the installed dependency tree; use `npm ci` for reproducible installations. Both servers bind to loopback only, not the public network.

## Page map

Four main pages plus a Documents hub and four subpages:

| Route                        | Page                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| `/`                          | Home: cinematic hero, collection, experiences, brand story         |
| `/fleet`                     | Fleet: live search, category filters, sorting, saved vehicles      |
| `/experiences`               | Experiences: four editorial concepts with keyboard-accessible tabs |
| `/concierge`                 | Concierge: three-step local journey brief builder                  |
| `/documents`                 | Documents: searchable hub, four folders, featured templates        |
| `/documents/vehicle-guides`  | Vehicle guides and checklists                                      |
| `/documents/booking-options` | Self-drive, chauffeured, and extended journey options              |
| `/documents/protection`      | Protection and care placeholders                                   |
| `/documents/policies`        | Policy and essential-information placeholders                      |

Unknown routes render a designed 404 page. Vehicle details open in accessible dialogs instead of adding extra primary pages.

## Interactive features

- Three-slide hero, manual navigation, pause control, subtle pointer parallax.
- Persistent dark/light theme and animation preference; operating-system reduced-motion support.
- Six fictional vehicles with filters, live search, sorting, and browser-local favorites.
- Up to three vehicles in a side-by-side comparison dialog.
- Global command search with Ctrl/Command+K, arrow navigation, Enter, and Escape.
- Four experience tabs that can be shared through a query parameter.
- Validated journey builder with vehicle capacity limits, date validation, sample-data fill, and JSON brief download.
- Twelve real `.txt` placeholder downloads and in-page previews of the same files.
- Responsive mobile menu, skip link, native modal focus trapping and focus restoration, route focus management, and scroll reveal.
- No externally hosted photos, videos, webfonts, trackers, or API calls. Fonts are installed as npm packages and served locally.

## Replace the placeholders

The main content entry point is `src/data.ts`.

1. Add owned/licensed images to `public/media/images/`.
2. Set each vehicle's `image` value to `/media/images/your-file.webp`.
3. Set `media.experienceImages.city`, `.escape`, `.occasion`, or `.business` to the corresponding image paths.
4. Add owned/licensed video files to `public/media/videos/`.
5. Set `media.heroVideo` / `media.heroPoster` and `media.brandVideo` / `media.brandPoster` in `src/data.ts`.
6. Empty paths render intentional CSS/SVG placeholders, not broken image icons or failed video requests. Broken images fall back to placeholders.
7. Replace vehicle names/specifications and editorial copy with verified content.
8. Replace the files under `public/documents/` with approved content. Update titles, descriptions, and download paths in `src/pages/Documents.tsx` if changing file types.

`public/media/ASSET-MAP.md` lists the asset slots. Colors, typography, layout, and motion tokens live in `src/styles.css`.

## Project structure

```text
src/
  App.tsx                Shell, routes, menus, modals, global search and comparison
  SiteContext.tsx        Typed shared UI state
  data.ts                Fictional collection, experiences, documents and media paths
  lib.ts                 Safe local preferences and download utilities
  styles.css             Design tokens, responsive layouts and motion
  components/
    Media.tsx            Original SVG vehicle silhouettes and CSS scenery
    UI.tsx               Shared headings, cards, dialogs and CTAs
  pages/
    Home.tsx
    Fleet.tsx
    Experiences.tsx
    Concierge.tsx
    Documents.tsx        Hub and all four document subpages
public/
  media/                 Replaceable image/video locations
  documents/             Twelve clearly marked text templates
  robots.txt             Blocks indexing while the concept is under development
  _redirects             SPA fallback for compatible static hosts
```

## Browser tests

```powershell
npx playwright install chromium
npm test
```

On Windows with Microsoft Edge installed, the same tests can use Edge without downloading Chromium:

```powershell
$env:PW_CHANNEL = 'msedge'
npm test
```

Tests start an isolated Vite server on loopback port 5187 and cover routes, filtering, saving, comparison, dialogs, journey validation/download, document search/download, mobile layouts, theme persistence, reduced motion, and automated accessibility checks. Screenshots and reports are ignored by Git.

## Before going live

This is intentionally a **front-end prototype**. GitHub repository privacy is not website authentication. The `noindex` meta tag and `robots.txt` are not access controls. There is no authenticated document storage, live inventory, pricing engine, payment flow, booking API, consent system, or message delivery.

Add and verify any required backend services, authentication/authorization, server-side validation, anti-abuse controls, approved legal/privacy content, and production hosting configuration before accepting real customers. Do not put private documents or credentials in `public/`. Public directories are served to every visitor.

The journey builder holds form values in memory only. Favorites and theme/motion preferences use localStorage and degrade gracefully when storage is unavailable. Downloads happen locally. No user data is transmitted.

GitHub Pages uses generated static HTML entry points for all nine routes, plus a branded `404.html`. Direct links and refreshes do not require a local server or a server-side rewrite. Netlify-style `_redirects` and `vercel.json` remain available for alternative hosts. Add new routes to `scripts/pages-routes.json` when expanding the site.
