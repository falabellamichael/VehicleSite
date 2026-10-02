# VehicleSite sales media slots

All media remains placeholder-only. Use owned or licensed assets for the actual dealership and the actual cars.

- Main showroom hero film and poster: `media.heroVideo` / `media.heroPoster` in `src/data.ts`.
- Showroom film dialog: `media.brandVideo` / `media.brandPoster`.
- Inventory card and vehicle silhouette: each car's `image` field.
- Car detail gallery: each car's `gallery` array, with exterior, interior, and detail photography slots.
- Walkaround gallery tab: intentionally labeled video placeholder; no car-specific player is configured yet.
- Homepage handover/dealership image: `MediaSlot` in `src/pages/Home.tsx`, currently a styled architectural placeholder.

Place photos in `public/media/images/` and videos in `public/media/videos/`. Paths such as `/media/images/apex-exterior.webp` are resolved through the existing `publicAsset` helper so GitHub Pages' `/VehicleSite/` prefix works. Prefer appropriately sized, compressed media. Do not add customer documents, credentials, or private assets to public folders.

## Mouse-led hero background

The first showroom section, below the header, now contains four original decorative design placeholders. Move a mouse into the left half of the hero to slide them left; move into the right half to slide them right. Speed increases gently toward the edges. The midpoint and pointer exit settle to a stop. Foreground text, vehicle controls, and links remain interactive.

Edit the `designs` list in `src/components/HeroBackdrop.tsx` to replace an empty `image` value with an owned image such as `/media/images/hero-design-01.webp`. Empty or failed images retain the original SVG placeholder. The containing CSS controls opacity, frame sizes, and the foreground readability gradient.

The decorative track is excluded from the accessibility tree and cannot intercept clicks or touches. It has no automatic motion: it stays still on touch-only devices, with the site motion toggle off, or when the operating system requests reduced motion. It also stops on scrolling, keyboard navigation, background-tab changes, and window blur. The mouse response is confined to the hero; hovering the header does not affect it.
