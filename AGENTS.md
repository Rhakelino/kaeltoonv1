# Project Context: Kaeltoon (Manga Reader)

## Stack
- React 19 + Vite 8
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router v7
- Axios
- Embla Carousel
- Capacitor v8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/splash-screen`)

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Android APK (Android SDK di `D:\android-sdk`, set `ANDROID_HOME`):
  - `npx cap sync android`
  - `cd android; .\gradlew.bat assembleRelease --no-daemon`
  - Output: `android/app/build/outputs/apk/release/app-release.apk` (~4.5MB, debug-signed by default)

## Architecture
- `src/components/layout/`: App shell, navbars, layout wrappers.
- `src/components/ui/`: Reusable dumb components (shadcn).
- `src/components/BackHandler.tsx`: Android back button handler via `@capacitor/app`.
- `src/pages/`: Route entry points.
- `src/services/api.ts`: Centralized API calls (Axios).
- `src/lib/utils.ts`: Utility functions (clsx, tailwind-merge).
- `capacitor.config.ts`: Capacitor WebView configuration.

## Rules
- Mobile-first approach. Tailwind classes must handle small screens first, then `md:`, `lg:`.
- Native Dark Mode via Tailwind `dark:` variant and `kaeltoon-theme` localStorage.
- State management relies on React state/context + localStorage (`manga_history` for reading history). No Redux/Zustand unless required.
- API requests go through `https://kaeltoon-api.kaeldev.my.id` (Cloudflare Worker proxy, see `src/services/api.ts`).
- Support Android WebView via Capacitor (`BackHandler` handles hardware back button).
- `Card` component (`src/components/ui/card.tsx`) has `ring-0` — no ring/outline by default. Do not add `ring-*` back.
- `DownloadBanner` (`src/components/DownloadBanner.tsx`): APK download prompt, shows only on Android browser (non-native). Download link → Google Drive, NOT bundled in repo. Never put APK in `public/` again (15MB bloat in every build).
- Use `useState` lazy initializer instead of `useEffect` + `setState` for sync init (lint rule `react-hooks/set-state-in-effect`).

## API Endpoints (`src/services/api.ts`)
- `/slider`: Hero carousel
- `/home`: Mixed feed (latest, popular, recommended)
- `/latest`, `/popular`, `/recommended`: Paginated lists
- `/manga/:id`: Manga details
- `/chapters/:id`: Paginated chapters list
- `/read/:chapter_id`: Chapter images
- `/search?q=...`: Search titles
- `/genres`, `/authors`: Taxonomies