# VehicleSite sales media slots

All media remains placeholder-only. Use owned or licensed assets for the actual dealership and the actual cars.

- Main showroom hero film and poster: `media.heroVideo` / `media.heroPoster` in `src/data.ts`.
- Showroom film dialog: `media.brandVideo` / `media.brandPoster`.
- Inventory card and vehicle silhouette: each car's `image` field.
- Car detail gallery: each car's `gallery` array, with exterior, interior, and detail photography slots.
- Walkaround gallery tab: intentionally labeled video placeholder; no car-specific player is configured yet.
- Homepage handover/dealership image: `MediaSlot` in `src/pages/Home.tsx`, currently a styled architectural placeholder.

Place photos in `public/media/images/` and videos in `public/media/videos/`. Paths such as `/media/images/apex-exterior.webp` are resolved through the existing `publicAsset` helper so GitHub Pages' `/VehicleSite/` prefix works. Prefer appropriately sized, compressed media. Do not add customer documents, credentials, or private assets to public folders.
