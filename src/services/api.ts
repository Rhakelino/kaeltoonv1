import axios from 'axios';

const api = axios.create({
  baseURL: 'https://www.sankavollerei.web.id/comic/shinigami',
});

// Types based on the API response structure observed
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
  genres: any[];
  chapters: {
    chapter_id: string;
    chapter_number: number;
    chapter_title: string | null;
    thumbnail: string;
    release_date: string;
  }[];
}

export const comicApi = {
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
    const { data } = await api.get(`/detail/${manga_id}`);
    return data.data;
  },
  getChapterList: async (manga_id: string, page = 1) => {
    const { data } = await api.get(`/chapters/${manga_id}?page=${page}`);
    return data;
  },
  readChapter: async (chapter_id: string) => {
    const { data } = await api.get(`/read/${chapter_id}`);
    return data.data; // API returns an object containing images array inside data
  },
  search: async (query: string) => {
    const { data } = await api.get(`/search/${encodeURIComponent(query)}`);
    return data;
  },
  getGenres: async () => {
    const { data } = await api.get('/genres');
    return data.data;
  },
  getAuthors: async (page = 1) => {
    const { data } = await api.get(`/authors?page=${page}`);
    return data.data;
  }
};
