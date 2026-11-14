# JebKharch logo kit

The app icon combines an AI face, a pocket/wallet and an upward payment arrow.

## Files

- jebkharch-icon.svg: scalable app mark
- jebkharch-icon.png: 1024 x 1024 app mark
- jebkharch-logo.svg / .png: horizontal wordmark with transparent surrounding space
- jebkharch-logo-light.svg / .png: wordmark on cream
- jebkharch-logo-dark.svg / .png: wordmark on charcoal
- icon-32.png, icon-180.png, icon-192.png, icon-512.png: browser and app icon sizes

PNG wordmarks are 2400 x 600. SVG versions scale to any size. Use the light version on a pale background and the dark version on a dark background. Keep clear space around the icon and do not stretch it.

## Palette

Purple: #7044FF
Lime: #DCFA52
Charcoal: #18171C
Cream: #F3F0E7

The header and footer reference public/assets/jebkharch-icon.svg. Browser favicon, Apple touch icon, and the web manifest use the same mark. This adds app identity; a web manifest alone does not provide offline payment functionality.

Regenerate PNG assets with: node scripts/brand-assets.mjs
