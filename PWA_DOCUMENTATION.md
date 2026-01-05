# Progressive Web App (PWA) Documentation

## Overview

This project has been fully converted into a production-ready Progressive Web App (PWA) with comprehensive offline support, caching strategies, and cross-platform installability.

## Table of Contents

1. [Features](#features)
2. [File Structure Changes](#file-structure-changes)
3. [Setup & Installation](#setup--installation)
4. [How It Works](#how-it-works)
5. [Offline Mode](#offline-mode)
6. [Update Handling](#update-handling)
7. [Icon Generation](#icon-generation)
8. [Backend Configuration](#backend-configuration)
9. [Nginx Configuration](#nginx-configuration)
10. [Testing & Debugging](#testing--debugging)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Features

### ✅ Implemented Features

- **Offline Support**: Full offline functionality with intelligent caching
- **Installability**: Works on Android, iOS (Safari), and Desktop browsers
- **Service Worker**: Automatic service worker registration and management
- **Update Detection**: Automatic detection and user prompts for new versions
- **Smart Caching**: 
  - Static assets (JS, CSS, images, fonts) cached aggressively
  - API GET requests cached with NetworkFirst strategy
  - POST/PUT/DELETE requests never cached
  - Authentication routes excluded from caching
- **Offline Fallback**: Custom offline page when network is unavailable
- **PWA Meta Tags**: Complete meta tag configuration for all platforms
- **Manifest.json**: Full web app manifest with icons, shortcuts, and metadata
- **Backend Support**: NestJS configured with PWA-friendly headers and CORS

---

## File Structure Changes

### New Files Created

```
termin_calender/
├── public/
│   ├── manifest.json                    # Web app manifest
│   └── icons/                           # PWA icons (to be generated)
│       ├── source-icon.png              # Source icon (1024x1024px)
│       ├── icon-72x72.png              # Generated icons
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       ├── icon-512x512.png
│       ├── icon-maskable-192x192.png
│       └── icon-maskable-512x512.png
│
├── app/
│   └── offline/
│       └── page.tsx                     # Offline fallback page
│
├── components/
│   └── PWAUpdatePrompt.tsx              # Service worker update prompt
│
├── scripts/
│   └── generate-icons.js                # Icon generation script
│
├── nginx-pwa.conf                       # Nginx configuration for PWA
└── PWA_DOCUMENTATION.md                 # This file

backend_termin_calender/
└── src/
    └── common/
        └── pwa.interceptor.ts           # PWA-friendly HTTP headers
```

### Modified Files

- `next.config.ts` - Added PWA configuration with next-pwa
- `app/layout.tsx` - Added PWA meta tags and update prompt component
- `src/main.ts` (backend) - Added PWA interceptor and enhanced CORS

---

## Setup & Installation

### Prerequisites

1. **Node.js** 18+ and npm/yarn
2. **Sharp** (for icon generation): `npm install --save-dev sharp`

### Step 1: Generate PWA Icons

1. Create a square source icon (1024x1024px recommended)
2. Save it as `public/icons/source-icon.png`
3. Run the icon generation script:

```bash
cd termin_calender
node scripts/generate-icons.js
```

This will generate all required icon sizes automatically.

### Step 2: Install Dependencies

The PWA package (`@ducanh2912/next-pwa`) is already installed. If you need to reinstall:

```bash
npm install
```

### Step 3: Build the Application

```bash
npm run build
```

The service worker and PWA files will be generated automatically during the build process.

### Step 4: Configure Backend

The backend is already configured with PWA support. Ensure the PWA interceptor is registered in `main.ts` (already done).

### Step 5: Configure Nginx

Include the PWA configuration in your Nginx setup:

```nginx
# In your site's nginx configuration
include /path/to/nginx-pwa.conf;
```

Or copy the relevant sections to your main nginx configuration file.

---

## How It Works

### Service Worker Lifecycle

1. **Registration**: Service worker is automatically registered on first page load
2. **Installation**: Service worker installs and caches essential assets
3. **Activation**: New service worker activates after page reload
4. **Update Detection**: Service worker checks for updates every 60 seconds

### Caching Strategy

The PWA uses multiple caching strategies:

1. **CacheFirst**: For static assets (fonts, images, videos)
   - Used for resources that rarely change
   - Fastest response time

2. **StaleWhileRevalidate**: For CSS, JS, and Next.js data
   - Serves cached content immediately
   - Updates cache in background

3. **NetworkFirst**: For API requests and pages
   - Tries network first, falls back to cache
   - Ensures fresh data when online

4. **No Cache**: For mutations (POST/PUT/DELETE)
   - Never cached to prevent stale data

### Request Flow

```
User Request
    ↓
Service Worker Intercepts
    ↓
Check Cache Strategy
    ↓
┌─────────────────┬─────────────────┐
│   Online?       │   Offline?       │
├─────────────────┼─────────────────┤
│ NetworkFirst    │ CacheFirst       │
│ (try network)   │ (use cache)      │
│   ↓             │   ↓              │
│ Cache Response  │ Serve Cached     │
│ Update Cache    │ or Offline Page  │
└─────────────────┴─────────────────┘
```

---

## Offline Mode

### How Offline Mode Works

1. **Pre-caching**: Essential assets are cached during service worker installation
2. **Runtime Caching**: API GET requests are cached as users browse
3. **Offline Detection**: Service worker detects network failures
4. **Fallback**: Shows offline page for uncached routes

### What Works Offline

✅ **Works Offline:**
- Previously visited pages
- Cached API GET responses
- Static assets (images, fonts, CSS, JS)
- App shell (basic UI structure)

❌ **Doesn't Work Offline:**
- New API requests (POST/PUT/DELETE)
- Unvisited pages
- Real-time data updates
- Authentication (requires network)

### Offline Page

When a user tries to access an uncached route while offline, they see the custom offline page at `/offline`. This page:

- Shows connection status
- Provides retry functionality
- Displays helpful tips
- Automatically detects when connection is restored

---

## Update Handling

### Automatic Update Detection

The PWA automatically detects when a new version is available:

1. **Background Check**: Service worker checks for updates every 60 seconds
2. **Update Found**: New service worker is downloaded and installed
3. **User Notification**: Toast notification appears prompting user to refresh
4. **Activation**: User clicks "Refresh Now" to activate new version

### Update Flow

```
New Build Deployed
    ↓
Service Worker Detects New Version
    ↓
Downloads New Service Worker
    ↓
Installs (but doesn't activate)
    ↓
PWAUpdatePrompt Component Detects
    ↓
Shows Toast Notification
    ↓
User Clicks "Refresh Now"
    ↓
New Service Worker Activates
    ↓
Page Reloads with New Version
```

### Manual Update Check

Users can manually check for updates by:

1. Closing and reopening the app
2. Refreshing the page
3. The service worker automatically checks on visibility change

### Skip Waiting

The update prompt includes a "Skip Waiting" message that tells the service worker to activate immediately, bypassing the waiting state.

---

## Icon Generation

### Creating Icons

1. **Design Source Icon**:
   - Size: 1024x1024px (recommended)
   - Format: PNG with transparency
   - Content: Your app logo/icon
   - Safe Zone: Keep important content in center 80% (for maskable icons)

2. **Save Source**:
   - Save as `public/icons/source-icon.png`

3. **Generate Icons**:
   ```bash
   node scripts/generate-icons.js
   ```

### Icon Sizes Generated

- **Regular Icons**: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Maskable Icons**: 192x192, 512x512 (with safe zone padding)

### Maskable Icons

Maskable icons have a safe zone (80% of the icon) where important content should be placed. This ensures the icon looks good when Android applies different mask shapes.

---

## Backend Configuration

### PWA Interceptor

The `PWAInterceptor` automatically adds PWA-friendly headers to all responses:

- **Cache-Control**: Appropriate caching headers based on route type
- **CORS**: Proper CORS headers for PWA cross-origin requests
- **Security**: X-Content-Type-Options, X-Frame-Options, etc.

### Cache Headers by Route Type

| Route Type | Cache Header | Reason |
|------------|--------------|--------|
| Public GET | `max-age=3600, stale-while-revalidate=86400` | Cache for 1 hour, allow stale for 1 day |
| Static Assets | `max-age=31536000, immutable` | Cache for 1 year (immutable) |
| Mutations (POST/PUT/DELETE) | `no-store, no-cache` | Never cache mutations |
| Authenticated Routes | `private, no-cache` | Don't cache sensitive data |

### CORS Configuration

The backend is configured to:

- Allow all origins (configure for production)
- Support all HTTP methods
- Include credentials
- Set appropriate headers for PWA

**⚠️ Production Note**: Update CORS origin whitelist in `src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  // ... rest of config
});
```

---

## Nginx Configuration

### Key Nginx Settings

The `nginx-pwa.conf` file includes:

1. **Service Worker Headers**:
   - `Service-Worker-Allowed: /` - Allows service worker to control entire site
   - `Cache-Control: no-cache` - Prevents service worker caching issues

2. **Manifest.json**:
   - Correct MIME type: `application/manifest+json`
   - Appropriate cache headers

3. **Static Assets**:
   - Aggressive caching (1 year) for immutable assets
   - CORS headers for cross-origin resources

4. **API Routes**:
   - No cache for mutations
   - Appropriate cache for GET requests
   - CORS headers

### Integration

Add to your Nginx site configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Include PWA configuration
    include /path/to/nginx-pwa.conf;
    
    # Your other configuration...
}
```

### HTTPS Requirement

PWAs require HTTPS in production. Ensure:

1. SSL certificate is configured
2. HTTP redirects to HTTPS
3. HSTS header is set (included in nginx-pwa.conf, commented out)

---

## Testing & Debugging

### Testing PWA Features

#### 1. Installability Test

**Chrome/Edge Desktop:**
- Open DevTools → Application → Manifest
- Check for installability issues
- Click "Add to Home Screen" in address bar

**Android Chrome:**
- Visit site
- Tap menu → "Add to Home Screen"
- Verify icon appears on home screen

**iOS Safari:**
- Visit site
- Tap Share → "Add to Home Screen"
- Verify icon appears on home screen

#### 2. Offline Test

1. Open DevTools → Network
2. Check "Offline" checkbox
3. Navigate to different pages
4. Verify cached pages load
5. Verify offline page shows for uncached routes

#### 3. Service Worker Test

1. Open DevTools → Application → Service Workers
2. Verify service worker is registered
3. Check service worker status
4. Test "Update" and "Unregister" buttons

#### 4. Update Test

1. Make a code change
2. Rebuild: `npm run build`
3. Deploy new version
4. Visit site (don't refresh)
5. Wait for update notification
6. Click "Refresh Now"
7. Verify new version loads

### Debugging Service Worker

#### Chrome DevTools

1. **Application Tab**:
   - Service Workers: View registered workers
   - Cache Storage: Inspect cached resources
   - Manifest: Check manifest.json

2. **Console Tab**:
   - Service worker logs appear here
   - Look for errors or warnings

3. **Network Tab**:
   - Check "Offline" to test offline mode
   - Verify service worker intercepts requests

#### Common Issues

**Service Worker Not Registering:**
- Check browser console for errors
- Verify HTTPS (required in production)
- Check service worker file exists at `/sw.js`

**Cache Not Working:**
- Verify service worker is active
- Check Cache Storage in DevTools
- Verify caching strategy in `next.config.ts`

**Updates Not Detecting:**
- Check service worker version
- Verify `generateBuildId` in `next.config.ts`
- Clear cache and re-register service worker

### Lighthouse Audit

Run Lighthouse PWA audit:

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Aim for 90+ score

**Common Lighthouse Issues:**

- **Missing manifest**: Verify `manifest.json` is accessible
- **No service worker**: Check service worker registration
- **Icons missing**: Generate all required icon sizes
- **HTTPS required**: Ensure site uses HTTPS
- **Offline support**: Test offline functionality

---

## Performance Optimization

### Caching Strategy Optimization

The current caching strategy is optimized for:

1. **Fast Initial Load**: Critical assets cached immediately
2. **Offline Support**: Essential pages cached for offline access
3. **Fresh Data**: API requests use NetworkFirst for freshness
4. **Storage Efficiency**: Cache limits prevent excessive storage

### Cache Limits

- **API Cache**: 50 entries, 1 hour TTL
- **Pages Cache**: 200 entries, 1 day TTL
- **Static Assets**: Unlimited (immutable), 1 year TTL

### Performance Metrics

Target metrics:

- **Time to Interactive (TTI)**: < 3.5s
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Tips

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Already handled by Next.js
3. **Lazy Loading**: Implement for non-critical components
4. **Bundle Size**: Monitor with `npm run build` output

---

## Troubleshooting

### Issue: Service Worker Not Working

**Symptoms**: No offline support, no caching

**Solutions**:
1. Check browser console for errors
2. Verify service worker file exists: `/sw.js`
3. Check HTTPS (required in production)
4. Clear browser cache and re-register

### Issue: Updates Not Detecting

**Symptoms**: New version not prompting for refresh

**Solutions**:
1. Verify `generateBuildId` changes on each build
2. Check service worker update interval (60s)
3. Manually trigger update: DevTools → Application → Service Workers → Update
4. Clear cache and hard refresh

### Issue: Icons Not Showing

**Symptoms**: Default icon or broken icon on install

**Solutions**:
1. Verify all icon sizes are generated
2. Check `manifest.json` icon paths
3. Verify icons are in `public/icons/`
4. Clear browser cache and reinstall

### Issue: Offline Page Not Showing

**Symptoms**: Blank page or error when offline

**Solutions**:
1. Verify `/offline` route exists
2. Check service worker fallback configuration
3. Test offline mode in DevTools
4. Verify offline page is cached

### Issue: API Requests Cached When They Shouldn't Be

**Symptoms**: Stale data after mutations

**Solutions**:
1. Verify POST/PUT/DELETE are excluded from caching
2. Check `next.config.ts` caching patterns
3. Clear cache and test
4. Verify backend sends `no-cache` headers

### Issue: CORS Errors

**Symptoms**: API requests failing with CORS errors

**Solutions**:
1. Verify backend CORS configuration
2. Check allowed origins in `main.ts`
3. Verify CORS headers in Nginx
4. Test with browser DevTools Network tab

---

## Production Checklist

Before deploying to production:

- [ ] Generate all PWA icons
- [ ] Update `manifest.json` with correct URLs
- [ ] Configure HTTPS
- [ ] Update CORS origins in backend
- [ ] Configure Nginx with PWA settings
- [ ] Test offline functionality
- [ ] Test update detection
- [ ] Run Lighthouse audit (aim for 90+)
- [ ] Test on Android, iOS, and Desktop
- [ ] Verify service worker registration
- [ ] Test installability on all platforms
- [ ] Monitor service worker errors in production

---

## Additional Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [next-pwa Documentation](https://github.com/DuCanhGH/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

## Support

For issues or questions:

1. Check this documentation
2. Review browser console errors
3. Check service worker logs in DevTools
4. Verify all configuration files are correct
5. Test in incognito mode to rule out cache issues

---

**Last Updated**: 2024
**PWA Version**: 1.0.0

