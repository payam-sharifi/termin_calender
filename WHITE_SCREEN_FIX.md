# White Screen of Death - Fix Implementation

## Overview
This document describes the fixes implemented to resolve the "White Screen of Death" issue affecting some mobile users of the Next.js PWA.

## Root Causes Identified

1. **Corrupted Service Workers**: Old or corrupted service workers may be intercepting requests and causing white screens
2. **Service Worker Interfering with RSC**: The service worker may have been caching or intercepting Next.js React Server Component (RSC) requests
3. **SSR/Hydration Issues**: Potential issues with window/localStorage access during SSR
4. **Lack of Error Visibility**: No error logging to diagnose issues on affected devices

## Fixes Implemented

### 1. Service Worker Cleanup Component (`components/ServiceWorkerCleanup.tsx`)

**Purpose**: Automatically unregisters all service workers and clears caches on first load to resolve corrupted SW issues.

**Features**:
- Unregisters all service worker registrations
- Clears all browser caches
- Force-reloads the page once after cleanup
- Only runs once per session (uses sessionStorage)
- Safe for SSR (only runs on client)
- Comprehensive logging for debugging

**How it works**:
1. On first page load, checks if cleanup was already performed
2. Unregisters all service workers
3. Deletes all caches
4. Marks cleanup as performed in sessionStorage
5. Force-reloads the page to ensure fresh start

### 2. Global Error Logger (`components/GlobalErrorLogger.tsx`)

**Purpose**: Captures all unhandled errors and promise rejections to help diagnose white screen issues.

**Features**:
- Captures `window.onerror` events
- Captures unhandled promise rejections
- Logs detailed error information including:
  - Error message and stack trace
  - Source file, line, and column numbers
  - User agent and platform information
  - Current URL
  - Timestamp
- Attempts to send errors to backend (non-blocking)
- Always logs to console for immediate debugging
- Safe for SSR (only runs on client)

**Error Details Captured**:
```typescript
{
  message: string,
  source: string,
  line: number,
  column: number,
  stack: string,
  userAgent: string,
  url: string,
  timestamp: string,
  platform: string,
  language: string
}
```

### 3. Fixed SSR Issues in `services/axiosConfig.ts`

**Problem**: `getBaseURL()` was called at module level, which could cause issues during SSR.

**Solution**:
- Made baseURL lazy-loaded
- Added proper window checks
- Updates baseURL dynamically on client side
- Falls back to localhost during SSR (safe default)

### 4. Updated PWA Configuration (`next.config.ts`)

**Problem**: Service worker may have been interfering with Next.js internal routes and RSC requests.

**Solution**:
- Added exclusions for Next.js internal routes:
  - `/_next/*` - Next.js static assets and data
  - `/_rsc/*` - React Server Components requests
  - `/api/*` - API routes
  - `*.json`, `*.xml`, `*.txt` - Data files
- Updated runtime caching to explicitly exclude these routes
- Ensured service worker doesn't intercept critical Next.js requests

### 5. Fixed Offline Page (`app/offline/page.tsx`)

**Problem**: Direct access to `navigator.onLine` without checking if navigator exists.

**Solution**:
- Added proper checks for `window` and `navigator` before use
- Safe for SSR

### 6. Added Components to Root Layout (`app/layout.tsx`)

Both `ServiceWorkerCleanup` and `GlobalErrorLogger` components have been added to the root layout to ensure they run on every page load.

## How to Use

### For Users Experiencing White Screen

The cleanup component will automatically run on first page load and should resolve most issues. Users don't need to do anything - the fix is automatic.

### For Developers

1. **Monitor Console Logs**: Check browser console for:
   - `[SW Cleanup]` messages - Service worker cleanup progress
   - `[Global Error Logger]` messages - Any errors that occur

2. **Check Backend Logs**: If configured, errors will be sent to `/api/errors` endpoint (you may need to create this endpoint in your backend).

3. **Session Storage**: The cleanup uses `sessionStorage.getItem("sw-cleanup-performed")` to ensure it only runs once per session.

## Testing

1. **Test on Affected Devices**:
   - Clear browser cache and service workers manually first
   - Load the app
   - Check console for cleanup messages
   - Verify app loads correctly

2. **Test Error Logging**:
   - Intentionally cause an error (e.g., in console: `throw new Error("test")`)
   - Verify error is logged to console
   - Check if error is sent to backend (if endpoint exists)

3. **Test Service Worker Exclusion**:
   - Check Network tab in DevTools
   - Verify `/_next/*` and `/_rsc/*` requests are NOT intercepted by service worker
   - Verify these requests go directly to network

## Backend Error Endpoint (Optional)

To receive error logs on your backend, create an endpoint:

```typescript
// backend_termin_calender/src/app/app.controller.ts or similar
@Post('/api/errors')
async logError(@Body() errorData: any) {
  // Log to your logging service
  console.error('Client Error:', errorData);
  // Or send to logging service like Sentry, LogRocket, etc.
  return { success: true };
}
```

## Browser Compatibility

All fixes are designed to work on:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Older mobile browsers (with graceful degradation)
- Browsers without service worker support (components check before use)

## Next Steps

1. **Deploy and Monitor**: Deploy these changes and monitor for white screen reports
2. **Collect Error Data**: Review error logs to identify patterns
3. **Iterate**: Based on error data, make additional fixes if needed

## Rollback Plan

If these fixes cause issues:
1. Remove `ServiceWorkerCleanup` and `GlobalErrorLogger` from `app/layout.tsx`
2. Revert `next.config.ts` changes
3. Revert `services/axiosConfig.ts` changes

## Notes

- The cleanup component only runs once per session to avoid infinite reload loops
- Error logging is non-blocking and won't cause additional errors
- All components are SSR-safe and only run on the client
- Service worker exclusions ensure Next.js App Router works correctly
