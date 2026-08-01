# Project Context: Kaeltoon (Manga Reader)

## Stack
- React 19 + Vite 8
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router v7
- Axios
- Embla Carousel

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Architecture
- `src/components/layout/`: App shell, navbars, layout wrappers.
- `src/components/ui/`: Reusable dumb components (shadcn).
- `src/pages/`: Route entry points.
- `src/services/api.ts`: Centralized API calls (Axios).
- `src/lib/utils.ts`: Utility functions (clsx, tailwind-merge).

## Rules
- Mobile-first approach. Tailwind classes must handle small screens first, then `md:`, `lg:`.
- Native Dark Mode via Tailwind `dark:` variant and `kaeltoon-theme` localStorage.
- State management relies on React state/context + localStorage (`manga_history` for reading history). No Redux/Zustand unless required.
- API requests go through `https://kaeltoon-api.instanclay.workers.dev` (Cloudflare Worker proxy).

## API Endpoints (`src/services/api.ts`)
- `/slider`: Hero carousel
- `/home`: Mixed feed (latest, popular, recommended)
- `/latest`, `/popular`, `/recommended`: Paginated lists
- `/manga/:id`: Manga details
- `/chapters/:id`: Paginated chapters list
- `/read/:chapter_id`: Chapter images
- `/search?q=...`: Search titles
- `/genres`, `/authors`: Taxonomies