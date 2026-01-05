# PWA Quick Start Guide

This is a quick reference guide for setting up and using the PWA features.

## 🚀 Quick Setup (5 minutes)

### 1. Generate Icons

```bash
# Install sharp (if not already installed)
npm install --save-dev sharp

# Create your source icon (1024x1024px PNG)
# Save it as: public/icons/source-icon.png

# Generate all PWA icons
npm run generate-icons
```

### 2. Build the App

```bash
npm run build
```

The service worker will be automatically generated during the build.

### 3. Test Locally

```bash
npm start
```

Visit `http://localhost:4500` and:
- Open DevTools → Application → Service Workers
- Verify service worker is registered
- Test offline mode (DevTools → Network → Offline)

### 4. Deploy

1. Deploy your built app
2. Configure Nginx (see `nginx-pwa.conf`)
3. Ensure HTTPS is enabled
4. Test installability on devices

## ✅ Verification Checklist

- [ ] Service worker registered (DevTools → Application → Service Workers)
- [ ] Manifest.json accessible at `/manifest.json`
- [ ] Icons generated and accessible
- [ ] Offline page works (`/offline`)
- [ ] Update prompt appears when new version deployed
- [ ] App installable on Android/iOS/Desktop
- [ ] Lighthouse PWA score > 90

## 🔧 Common Commands

```bash
# Generate icons
npm run generate-icons

# Build for production
npm run build

# Start production server
npm start

# Development (PWA disabled in dev mode)
npm run dev
```

## 📱 Testing Installation

### Android (Chrome)
1. Visit your site
2. Tap menu (⋮) → "Add to Home Screen"
3. Verify icon appears

### iOS (Safari)
1. Visit your site
2. Tap Share → "Add to Home Screen"
3. Verify icon appears

### Desktop (Chrome/Edge)
1. Visit your site
2. Click install icon in address bar
3. Or: DevTools → Application → Manifest → "Add to Home Screen"

## 🐛 Quick Troubleshooting

**Service worker not registering?**
- Check browser console for errors
- Verify HTTPS (required in production)
- Clear cache and hard refresh

**Icons not showing?**
- Run `npm run generate-icons`
- Verify icons in `public/icons/`
- Check `manifest.json` paths

**Updates not detecting?**
- Wait 60 seconds (update check interval)
- Manually check: DevTools → Application → Service Workers → Update
- Clear cache and re-register

## 📚 Full Documentation

See `PWA_DOCUMENTATION.md` for complete documentation.

