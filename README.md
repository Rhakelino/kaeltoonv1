# Kaeltoon - Shinigami Manga Reader

A sleek, responsive, mobile-first web application for reading manga, built with React and Vite. This project consumes a custom Cloudflare Worker API to provide a seamless reading experience.

## Features

- **Discover:** Browse Featured (Carousel Slider), Recommended, Popular, and Latest manga updates.
- **Manga Details:** View complete manga information, synopsis, and chapter lists with "Range Tabs" pagination support.
- **Reading Experience:** Full-screen chapter reading mode with infinite vertical scroll, loading states, and quick Prev/Next navigation.
- **Search:** Real-time search functionality to find your favorite titles with grid layout.
- **Taxonomies:** Browse manga by genres and authors.
- **History:** Automatically tracks your recently read manga with timestamp and quick-resume functionality (stored locally).
- **Responsive Layout:** Mobile-first design featuring a bottom navigation bar for mobile devices and a sticky top navbar for desktop.
- **Dark Theme:** Native dark mode UI utilizing shadcn/ui and Tailwind CSS. Toggleable between crisp white Light Mode and translucent blurred Dark Mode.
- **Animations:** Embla carousel for Hero section with parallax and staggered text animations (optimized for desktop performance).

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui (Base UI)
- **Icons:** Lucide React
- **Data Fetching:** Axios
- **Carousel:** Embla Carousel React & Autoplay

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `src/components/layout/` - Core layout wrappers (Navbar, Mobile Bottom Nav)
- `src/components/ui/` - Reusable UI components (buttons, cards, badges, skeletons)
- `src/pages/` - Main views (Home, MangaDetail, ReadChapter, Search, TaxonomyList, History)
- `src/services/` - Centralized API integration logic (`api.ts`)

## API Reference
This project is powered by a custom Hono worker endpoint (`https://kaeltoon-api.instanclay.workers.dev`) wrapping the Shinigami source.

### Available Endpoints
- `GET /slider` - Fetch featured manga for hero carousel
- `GET /home` - Fetch mixed home feed (latest, popular, recommended)
- `GET /latest?page=1` - Fetch latest updates
- `GET /popular?page=1` - Fetch popular manga
- `GET /recommended?page=1` - Fetch recommended manga
- `GET /explore/:category?page=1` - Fetch explore lists
- `GET /manga/:id` - Fetch manga details and metadata
- `GET /chapters/:id?page=1` - Fetch chapter list for a manga
- `GET /read/:chapter_id` - Fetch image URLs for reading a chapter
- `GET /search?q=query` - Search manga by title
- `GET /genres` - Fetch available genres
- `GET /authors?page=1` - Fetch available authors
