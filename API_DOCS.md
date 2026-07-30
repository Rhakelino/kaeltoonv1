# Shinigami API Configuration

Dokumentasi dan konfigurasi API Shinigami untuk digunakan di project frontend React / TypeScript.

## Base URL
```text
https://www.sankavollerei.web.id/comic/shinigami
```

## TypeScript Interfaces

Gunakan interface ini untuk tipe data balikan dari API.

```typescript
export interface MangaItem {
  manga_id: string;
  title: string;
  alternative_title?: string;
  description?: string;
  cover?: string;
  thumbnail?: string;
  type?: string;
  rating?: string;
  status?: string;
  latest_chapter?: string;
}

export interface DetailManga {
  title: string;
  alternative_title: string;
  description: string;
  cover: string;
  thumbnail: string;
  type: string;
  status: string;
  author: string;
  artist: string;
  rating: string;
  genres: { id: number, name: string, slug: string }[];
  // Note: API getDetail tidak mereturn list chapters. Gunakan getChapterList.
}

export interface Chapter {
  chapter_id: string;
  manga_id: string;
  chapter_number: number;
  chapter_title: string | null;
  thumbnail: string;
  views: number;
  release_date: string;
}

export interface ReadChapterData {
  chapter_id: string;
  manga_id: string;
  chapter_number: number;
  chapter_title: string | null;
  thumbnail: string;
  views: number;
  release_date: string;
  prev_chapter: { chapter_id: string, chapter_number: number } | null;
  next_chapter: { chapter_id: string, chapter_number: number } | null;
  images: string[];
  total_images: number;
}
```

## Axios Service Setup

Install axios terlebih dahulu:
```bash
npm install axios
```

Buat file service (misal: `src/services/api.ts`) dan copy kode di bawah ini:

```typescript
import axios from 'axios';

// 1. Setup Axios Instance
const api = axios.create({
  baseURL: 'https://www.sankavollerei.web.id/comic/shinigami',
});

// 2. API Methods
export const comicApi = {
  // Homepage (Latest, Recommended, Popular)
  getHome: async () => {
    const { data } = await api.get('/home');
    return data; // Returns { status, data: { latest: [], recommended: [], popular: [] } }
  },
  
  // Pagination Lists
  getLatest: async (page = 1) => {
    const { data } = await api.get(`/latest?page=${page}`);
    return data;
  },
  getPopular: async (page = 1) => {
    const { data } = await api.get(`/popular?page=${page}`);
    return data;
  },
  getRecommended: async (page = 1) => {
    const { data } = await api.get(`/recommended?page=${page}`);
    return data;
  },
  
  // Explore by Category
  getExplore: async (category = 'explore list', page = 1) => {
    const { data } = await api.get(`/explore/${encodeURIComponent(category)}?page=${page}`);
    return data;
  },
  
  // Manga Detail (Info, Cover, Synopsis, dll)
  getDetail: async (manga_id: string) => {
    const { data } = await api.get(`/detail/${manga_id}`);
    return data.data; // Returns DetailManga object
  },
  
  // Manga Chapters Pagination
  getChapterList: async (manga_id: string, page = 1) => {
    const { data } = await api.get(`/chapters/${manga_id}?page=${page}`);
    return data; // Returns { data: Chapter[], pagination: { current_page, total_pages, total_record, page_size } }
  },
  
  // Read Chapter (Daftar gambar halaman, prev/next chapter)
  readChapter: async (chapter_id: string) => {
    const { data } = await api.get(`/read/${chapter_id}`);
    return data.data; // Returns ReadChapterData object
  },
  
  // Search
  search: async (query: string) => {
    const { data } = await api.get(`/search/${encodeURIComponent(query)}`);
    return data;
  },
  
  // Taxonomies
  getGenres: async () => {
    const { data } = await api.get('/genres');
    return data.data;
  },
  getAuthors: async (page = 1) => {
    const { data } = await api.get(`/authors?page=${page}`);
    return data.data;
  }
};
```

## Cara Penggunaan Endpoint Chapters dengan Pagination (Load More)

```tsx
import { useEffect, useState } from 'react';
import { comicApi, Chapter } from './services/api';

export default function DetailComponent({ mangaId }: { mangaId: string }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      const response = await comicApi.getChapterList(mangaId, 1);
      setChapters(response.data);
      if (response.pagination) {
        setHasMore(1 < response.pagination.total_pages);
      }
    }
    fetchChapters();
  }, [mangaId]);

  const loadMore = async () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    const response = await comicApi.getChapterList(mangaId, nextPage);
    
    setChapters(prev => [...prev, ...response.data]);
    setPage(nextPage);
    if (response.pagination) {
      setHasMore(nextPage < response.pagination.total_pages);
    }
  };

  return (
    <div>
      {chapters.map(ch => (
        <div key={ch.chapter_id}>Chapter {ch.chapter_number}</div>
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  )
}
```
