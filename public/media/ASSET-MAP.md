# Media placeholder map

No production image or video has been included. All default visuals are original CSS/SVG layout placeholders, not licensed vehicle photos.

| Slot                             | Set in src/data.ts              | Suggested asset                         |
| -------------------------------- | ------------------------------- | --------------------------------------- |
| Home hero video                  | media.heroVideo                 | Landscape MP4, 16:9, muted ambient film |
| Home hero poster                 | media.heroPoster                | Landscape WebP/JPG                      |
| Brand film modal                 | media.brandVideo                | Landscape MP4 with controls             |
| Brand film poster                | media.brandPoster               | Landscape WebP/JPG                      |
| Six vehicle images               | vehicles[n].image               | Landscape WebP/JPG, approximately 3:2   |
| City experience                  | media.experienceImages.city     | Landscape WebP/JPG                      |
| Weekend escape                   | media.experienceImages.escape   | Landscape WebP/JPG                      |
| Occasion experience              | media.experienceImages.occasion | Landscape WebP/JPG                      |
| Business experience              | media.experienceImages.business | Landscape WebP/JPG                      |
| Home editorial and teaser scenes | MediaSlot src prop in Home.tsx  | Optional owned/licensed image           |

Place images in images/ and films in videos/. Paths start with /media/ when referenced in code.
Empty source strings are intentional. Do not replace them with nonexistent paths just to retain the placeholders.

There is no 360-degree model viewer and no real video until you supply actual footage. The film dialog clearly identifies its default content as an animated placeholder.
