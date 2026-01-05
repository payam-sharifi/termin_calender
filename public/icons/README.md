# PWA Icons Directory

This directory contains all PWA icons required for the Progressive Web App.

## Required Icons

To generate all icons, you need:

1. **Source Icon**: Create a 1024x1024px PNG image
   - Save it as `source-icon.png` in this directory
   - Use a square image with your app logo/icon
   - For maskable icons, keep important content in the center 80% (safe zone)

2. **Generate Icons**: Run the generation script
   ```bash
   npm run generate-icons
   ```

## Generated Icons

After running the script, you'll have:

### Regular Icons
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### Maskable Icons
- `icon-maskable-192x192.png`
- `icon-maskable-512x512.png`

## Icon Guidelines

- **Format**: PNG with transparency
- **Size**: 1024x1024px source (recommended)
- **Content**: App logo or icon
- **Safe Zone**: For maskable icons, keep important content in center 80%
- **Colors**: Use your brand colors
- **Background**: Transparent or solid color

## Testing Icons

After generating icons:

1. Check `manifest.json` references these icons
2. Test installation on Android/iOS/Desktop
3. Verify icons appear correctly when installed
4. Test maskable icons on Android (they adapt to different shapes)

For more information, see `PWA_DOCUMENTATION.md`.

