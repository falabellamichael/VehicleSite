# VehicleSite sales media slots

The fictional lineup uses AI-generated vehicle cutouts with transparent backgrounds under `public/media/images/demo/`. The showroom concept retains its scene background. None of these images depicts actual cars or the dealership. The actual inventory feed is intentionally not connected; replace the demo assets only after approved shop listings and owned or licensed photography are supplied.

- Main showroom hero film and poster: `media.heroVideo` / `media.heroPoster` in `src/data.ts`.
- Showroom film dialog: `media.brandVideo` / `media.brandPoster`.
- Inventory card and vehicle concept: each car's `image` field, currently pointing to its transparent WebP cutout. Vehicle image slots use contain sizing to keep the whole cutout visible without stretching or cropping.
- Homepage mouse-led backdrop: reuses Apex GT, Noir Executive, Pulse Electric, and Atlas Grand cutouts in contain-sized panels.
- Car detail gallery: each car's `gallery` array currently contains only the exterior concept. Add interior or detail images after real assets are available.
- Walkaround gallery tab: intentionally labeled video placeholder; no car-specific player is configured yet.
- Homepage handover/showroom concept: `/media/images/demo/showroom.webp`, shown through `MediaSlot` in `src/pages/Home.tsx`.

Place approved photos in `public/media/images/` and videos in `public/media/videos/`. Paths are resolved through the existing `publicAsset` helper so GitHub Pages' `/VehicleSite/` prefix works. Prefer appropriately sized, compressed media. Do not add customer documents, credentials, or private assets to public folders.

## Mouse-led hero background

The first showroom section, below the header, now contains four subtle vehicle concept cutouts from the fictional inventory. Move a mouse into the left half of the hero to slide them left; move into the right half to slide them right. Speed increases gently toward the edges. The midpoint and pointer exit settle to a stop. Foreground text, vehicle controls, and links remain interactive.

Edit the `designs` list in `src/components/HeroBackdrop.tsx` to point at the approved images. Missing or failed images retain the original SVG artwork. The containing CSS controls opacity, frame sizes, and the foreground readability gradient.

The decorative track is excluded from the accessibility tree and cannot intercept clicks or touches. It has no automatic motion: it stays still on touch-only devices, with the site motion toggle off, or when the operating system requests reduced motion. It also stops on scrolling, keyboard navigation, background-tab changes, and window blur. The mouse response is confined to the hero; hovering the header does not affect it.
