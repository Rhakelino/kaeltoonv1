import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kaeltoon-api.kaeldev.my.id',
});

// Types based on the API response structure observed
export interface MangaItem {
  id: string;
  manga_id?: string;
  title: string;
  alternative_title?: string;
  description?: string;
  cover?: string;
  thumbnail?: string;
  type?: string;
  format?: string;
  rating?: string | number;
  status?: string;
  release_year?: string;
  latest_chapter?: string;
  chapters?: {
    id: string;
    chapter_number: number | string;
    title?: string | null;
    release_date?: string;
  }[];
}

export interface DetailManga {
  title: string;
  alternative_title?: string;
  description: string;
  cover: string;
  thumbnail?: string;
  type?: string | { name?: string }[];
  format?: string | string[];
  status: string;
  author?: string;
  artist?: string;
  authors?: { name?: string; slug?: string }[];
  artists?: { name?: string; slug?: string }[];
  manga_authors?: { authors?: { name?: string } }[];
  rating?: string | number;
  views?: number;
  bookmarks?: number;
  release_year?: string;
  manga_genres?: { genres: { name?: string; id?: string } | string }[];
  chapters?: {
    id: string;
    chapter_number: number;
    title: string | null;
    thumbnail: string;
    release_date: string;
  }[];
}

export const comicApi = {
  getSlider: async () => {
    const { data } = await api.get('/slider');
    return data;
  },
  getHome: async () => {
    const { data } = await api.get('/home');
    return data;
  },
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
  getExplore: async (category = 'explore list', page = 1) => {
    const { data } = await api.get(`/explore/${encodeURIComponent(category)}?page=${page}`);
    return data;
  },
  getDetail: async (manga_id: string) => {
    const { data } = await api.get(`/manga/${manga_id}`);
    return data.data;
  },
  getChapterList: async (manga_id: string, page = 1) => {
    const { data } = await api.get(`/chapters/${manga_id}?page=${page}`);
    return data;
  },
  readChapter: async (chapter_id: string) => {
    // 1. Ambil URL Sanka dari backend kita
    const { data: honoData } = await api.get(`/read/${chapter_id}`);
    const sankaUrl = honoData.data; 

    // 2. Fetch data aslinya (Bypass Anti-Bot karena dari browser user)
    const { data: sankaData } = await axios.get(sankaUrl);
    return sankaData.data; 
  },
  search: async (query: string) => {
    const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return data;
  }
};
