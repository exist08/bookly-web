# Bookly — web

Mobile-first, responsive web version of Bookly that behaves like the app: React 19 + Vite + TypeScript.

```sh
npm install
npm run dev        # http://localhost:5173  (also on your LAN — open it on your phone)
npm run build && npm run preview
```

Demo login: `aarav@example.com` / `bookly123` (prefilled). Data is mock and lives in the browser
(localStorage), same shape as the RN app's mock API, so it can be swapped for `bookly-backend` later.

## What makes it feel like an app

- **Installable PWA** (`manifest.webmanifest`, `sw.js`, icons): "Add to Home Screen" opens full-screen with no browser chrome; the shell works offline.
- **Native navigation**: translucent sticky top bars, a floating bottom tab bar on phones, pushed screens slide in and slide back, modals (Share a book, Edit profile) rise from the bottom — all with the View Transitions API.
- **Shared-element cover transition**: the tapped cover morphs into the book page and back (feed, shelves, "More from…"). See `src/store/transition.ts`. Browsers without View Transitions just navigate.
- **Touch details**: press-scale feedback, 44px targets, safe-area insets (notch / home bar), no tap flash or page bounce, pull-to-refresh on the feed, draggable bottom sheets, haptic tick on votes (Android), native share sheet (`navigator.share`, falls back to copy link), camera/photo picker for covers and avatars.
- **Light & dark**: follows the system, or pick System / Light / Dark in Settings; no flash on load.

## Responsive layout

| Width | Layout |
| --- | --- |
| < 768px | Phone app: bottom tabs, full-width screens |
| 768–1099px | Icon side rail, centred column |
| ≥ 1024px | Book page splits into a sticky cover column + text; sign-in screens get an illustration panel |
| ≥ 1100px | Labelled side rail with wordmark and "Share a book" |

## Structure

```
src/
  main.tsx, router.tsx          app + route guards (onboarding → welcome → setup → feed)
  styles/global.css             tokens (light/dark), layout, components, transitions
  store/transition.ts           go()/back() + shared cover transition
  data/, hooks/queries.ts       mock API + TanStack Query hooks (ported from the RN app)
  components/                   AppShell, PostCard, BookCover, Sheet, VotePill, …
  screens/                      every screen from the design
```
