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
- **Shared-element cover transition**: the tapped cover morphs into the book page and back (feed, shelves, "More from…"). See `src/navigation/transition.ts` and `src/state/cover.ts`. Browsers without View Transitions just navigate.
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
  state/                        client state as Jotai atoms (one concern per file)
    store.ts                      the Jotai store (shared by React and plain modules)
    persist.ts                    persistedAtom / sessionAtom (localStorage / sessionStorage)
    session.ts                    userIdAtom, hasOnboardedAtom, splashSeenAtom
    theme.ts                      themeModeAtom → isDarkAtom (follows the OS live)
    toast.ts                      toastsAtom + toast() callable from anywhere
    cover.ts                      activeCoverAtom for the cover morph
    postActions.ts                the "…" sheet: open / close
  hooks/queries.ts              server state: TanStack Query hooks (feed, posts, profiles, auth)
  data/                         api.ts (mock today) + mockDb + storage
  navigation/transition.ts      go()/back() with View Transitions
  styles/global.css             tokens (light/dark), layout, components, transitions
  components/                   AppShell, PostCard, BookCover, Sheet, VotePill, …
  screens/                      every screen from the design
```

### How data flows

- **Client state lives in atoms.** A component reads one with `useAtomValue(atom)` and changes it with `useSetAtom(atom)` (or `useAtom` for both). Non-React code (`data/api.ts`, `toast()`, `go()`) uses `store.get` / `store.set`.
- **Server data lives in TanStack Query.** Screens call hooks from `hooks/queries.ts`, which call `data/api.ts`. On sign-in, `useAuth()` primes the `me` query and sets `userIdAtom`, and the route guards in `router.tsx` react to that atom.
- **Derived values are atoms too:** `isDarkAtom` combines `themeModeAtom` with the OS setting, and `<ThemeSync />` in `main.tsx` applies it to `<html data-theme>`.
