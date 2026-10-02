# VehicleSite sales media slots

The fictional lineup uses AI-generated concept art under `public/media/images/demo/`. These images do not depict actual cars or the dealership. The actual inventory feed is intentionally not connected; replace the demo assets only after approved shop listings and owned or licensed photography are supplied.

- Main showroom hero film and poster: `media.heroVideo` / `media.heroPoster` in `src/data.ts`.
- Showroom film dialog: `media.brandVideo` / `media.brandPoster`.
- Inventory card and vehicle concept: each car's `image` field, currently pointing to its generated WebP concept.
- Car detail gallery: each car's `gallery` array currently contains only the exterior concept. Add interior or detail images after real assets are available.
- Walkaround gallery tab: intentionally labeled video placeholder; no car-specific player is configured yet.
- Homepage handover/showroom concept: `/media/images/demo/showroom.webp`, shown through `MediaSlot` in `src/pages/Home.tsx`.

Place approved photos in `public/media/images/` and videos in `public/media/videos/`. Paths are resolved through the existing `publicAsset` helper so GitHub Pages' `/VehicleSite/` prefix works. Prefer appropriately sized, compressed media. Do not add customer documents, credentials, or private assets to public folders.

## Mouse-led hero background

The first showroom section, below the header, now contains four original decorative design placeholders. Move a mouse into the left half of the hero to slide them left; move into the right half to slide them right. Speed increases gently toward the edges. The midpoint and pointer exit settle to a stop. Foreground text, vehicle controls, and links remain interactive.

Edit the `designs` list in `src/components/HeroBackdrop.tsx` to replace an empty `image` value with an owned image such as `/media/images/hero-design-01.webp`. Empty or failed images retain the original SVG placeholder. The containing CSS controls opacity, frame sizes, and the foreground readability gradient.

The decorative track is excluded from the accessibility tree and cannot intercept clicks or touches. It has no automatic motion: it stays still on touch-only devices, with the site motion toggle off, or when the operating system requests reduced motion. It also stops on scrolling, keyboard navigation, background-tab changes, and window blur. The mouse response is confined to the hero; hovering the header does not affect it.
