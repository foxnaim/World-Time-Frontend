# App icons

This directory contains the PWA / install icons for **Tact** referenced from
`/public/manifest.webmanifest`.

## TODO before production / app store submission

The `.png` files (`icon-192.png`, `icon-512.png`) referenced in the manifest
are currently **placeholders** and must be exported from the matching SVG
sources (`icon-192.svg`, `icon-512.svg`) before shipping.

Suggested pipeline:

```sh
# requires `rsvg-convert` (librsvg) or ImageMagick
rsvg-convert -w 192 -h 192 icon-192.svg -o icon-192.png
rsvg-convert -w 512 -h 512 icon-512.svg -o icon-512.png
```

Or via ImageMagick:

```sh
magick -background none -density 384 icon-192.svg -resize 192x192 icon-192.png
magick -background none -density 384 icon-512.svg -resize 512x512 icon-512.png
```

## Design notes

- Background: `#EAE7DC` (cream), matching the app `background_color`.
- Accent arc: `#E85A4F` (coral), matching the `theme_color`.
- Wordmark: Fraunces serif **T** centered, in `#2F2A26` (stone) — the
  Tact glyph.
- `purpose: "any maskable"` — keep the dial and letter well within the
  safe zone (≈ 80% of canvas) so Android adaptive-icon cropping does not
  clip the glyph.
