# City cover images

Drop a photo here for a city to give its detail panel a cover image.

- **Naming:** `<city-id>.jpg`, where `<city-id>` is the city's `id` in
  [`app/data/croatiaData.ts`](../../app/data/croatiaData.ts) (`CITIES`).
  Examples: `split.jpg`, `dubrovnik.jpg`, `rovinj.jpg`, `slavonski-brod.jpg`.
- **Fallback:** any city without a matching file automatically shows a styled
  gradient placeholder with the city name — nothing breaks if the file is missing.
- **Override:** to point a city at a different path/URL, set `coverImage` on that
  city entry (it defaults to `/cities/<id>.jpg` via the `cityCover` helper).

Recommended: landscape JPG/WebP, roughly 800×360 or wider, optimized for web.
