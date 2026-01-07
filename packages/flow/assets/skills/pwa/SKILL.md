---
name: pwa
description: PWA - native app parity, offline-first, engagement. Use when building installable web apps.
---

# PWA Guideline

## Tech Stack

* **Framework**: Next.js (with Turbopack)
* **Service Worker**: Serwist (Next.js integration)
* **Platform**: Vercel

## Non-Negotiables

* Service worker must not cache personalized/sensitive/authorized content
* Cache invalidation on deploy must be correct (no stale content)
* Offline experience must be functional, not just a fallback page
* Installation prompt must be contextual (after value demonstrated)
* Complete manifest.webmanifest required

## Web App Manifest (Complete)

```json
{
  "name": "App Name",
  "short_name": "App",
  "description": "...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshot-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshot-narrow.png", "sizes": "720x1280", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "Action", "url": "/action", "icons": [{ "src": "/shortcut-icon.png", "sizes": "96x96" }] }
  ],
  "categories": ["productivity"],
  "lang": "en",
  "dir": "ltr"
}
```

## Required Icons

| Icon | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 32x32 | Browser tab |
| `icon.svg` | any | Modern browsers |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `icon-192.png` | 192x192 | Android/PWA |
| `icon-512.png` | 512x512 | Splash screen |
| `icon-maskable.png` | 512x512 | Adaptive icon |
| `og-image.png` | 1200x630 | Social sharing |

## Native App Parity

| Capability | API |
|------------|-----|
| True offline | Cache API + localStorage/IndexedDB |
| Background sync | Background Sync API |
| App icon badge | Badging API |
| Local notifications | Notifications API |
| Push notifications | Web Push API |
| App shortcuts | manifest.json `shortcuts` |
| File handling | File Handling API |
| Protocol handling | registerProtocolHandler |
| Pull-to-refresh | Touch events + CSS |
| View transitions | View Transitions API |
| Bottom sheets | CSS + touch gestures |
| Skeleton loading | CSS + React Suspense |
| Swipe gestures | Touch/Pointer events |
| Haptic feedback | Vibration API |
| Sound effects | Web Audio API |
| Media controls | Media Session API |
| Wake lock | Screen Wake Lock API |
| Orientation lock | Screen Orientation API |
| Fullscreen | Fullscreen API |
| Picture-in-Picture | PiP API |
| Share | Web Share API |
| Receive share | Share Target API |
| Clipboard | Clipboard API |
| Camera/Mic | MediaDevices API |
| Geolocation | Geolocation API |
| Motion sensors | DeviceMotion/Orientation |
| Bluetooth | Web Bluetooth API |
| NFC | Web NFC API |
| Barcode scan | Barcode Detection API |
| Speech | Web Speech API |
| Payments | Payment Request API |
| Credentials | Credential Management API |
| Idle detection | Idle Detection API |
| Network status | Network Information API |
| Reduced motion | `prefers-reduced-motion` |
| Window controls | Window Controls Overlay |

## Context

PWA goal: users forget they're in a browser. The gap between "website" and "app" is measured in micro-interactions — haptics, gestures, offline resilience, and engagement hooks.

A bad PWA is worse than no PWA. But a great PWA can match 90% of native with 10% of the effort.

## Driving Questions

* What breaks when the user goes offline mid-action?
* What would make users install this instead of bookmarking?
* Which native gestures (swipe, pull, long-press) are missing?
* What local notifications would drive daily engagement?
* Where does the app feel "webby" instead of native?
* What's the first thing users see when they open the installed app?
