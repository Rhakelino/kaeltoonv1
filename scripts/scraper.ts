/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY; // Using anon key since RLS is disabled in schema

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_BASE = 'https://www.sankavollerei.web.id/comic/shinigami';
const DELAY_MS = 2000; // 2 seconds delay as requested to avoid rate limit (50 req/min)

const api = axios.create({
  baseURL: API_BASE,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithDelay(url: string) {
  await delay(DELAY_MS);
  try {
    const { data } = await api.get(url);
    if (data.status !== 'success') {
      throw new Error(`API returned non-success status: ${JSON.stringify(data)}`);
    }
    return data;
  } catch (error: any) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

async function scrapeGenres() {
  console.log("Scraping genres...");
  const res = await fetchWithDelay('/genres');
  if (!res || !res.data) return;

  for (const genre of res.data) {
    const { error } = await supabase
      .from('genres')
      .upsert({ name: genre.name, slug: genre.slug }, { onConflict: 'name' });
    if (error) console.error(`Error inserting genre ${genre.name}:`, error.message);
  }
  console.log("Genres scraped.");
}

async function scrapeMangaDetails(mangaId: string, supabaseMangaId: string) {
  console.log(`  Fetching details for manga: ${mangaId}`);
  const detailRes = await fetchWithDelay(`/detail/${mangaId}`);
  if (!detailRes || !detailRes.data) return;

  const mData = detailRes.data;

  // Insert Genres relations
  if (mData.genres && Array.isArray(mData.genres)) {
    for (const g of mData.genres) {
      const gName = typeof g === 'object' ? g.name : g;
      const gSlug = typeof g === 'object' ? g.slug : g.toLowerCase().replace(/\\s+/g, '-');
      
      // Upsert genre first just in case
      const { data: gData } = await supabase
        .from('genres')
        .upsert({ name: gName, slug: gSlug }, { onConflict: 'name' })
        .select('id')
        .single();
      
      if (gData) {
        await supabase
          .from('manga_genres')
          .upsert({ manga_id: supabaseMangaId, genre_id: gData.id }, { onConflict: 'manga_id,genre_id' });
      }
    }
  }

  // Insert Authors relations
  if (mData.authors && Array.isArray(mData.authors)) {
    for (const a of mData.authors) {
      const { data: aData } = await supabase
        .from('authors')
        .upsert({ name: a.name, slug: a.slug }, { onConflict: 'name' })
        .select('id')
        .single();
      
      if (aData) {
        await supabase
          .from('manga_authors')
          .upsert({ manga_id: supabaseMangaId, author_id: aData.id }, { onConflict: 'manga_id,author_id' });
      }
    }
  }
}

async function scrapeChapters(mangaId: string, supabaseMangaId: string) {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    console.log(`  Fetching chapters for manga ${mangaId}, page ${page}/${totalPages}`);
    const chapRes = await fetchWithDelay(`/chapters/${mangaId}?page=${page}`);
    if (!chapRes || !chapRes.data) break;

    if (chapRes.pagination) {
      totalPages = chapRes.pagination.total_pages;
    }

    const chapters = chapRes.data.map((c: any) => ({
      manga_id: supabaseMangaId,
      source_chapter_id: c.chapter_id,
      chapter_number: c.chapter_number,
      title: c.chapter_title,
      release_date: new Date(c.release_date).toISOString(),
    }));

    if (chapters.length > 0) {
      const { error } = await supabase
        .from('chapters')
        .upsert(chapters, { onConflict: 'source_chapter_id' });
      
      if (error) console.error(`  Error inserting chapters:`, error.message);
    }

    page++;
  }
}

async function scrapePopular() {
  let page = 1;
  let totalPages = 1;

  console.log("Starting scrape on /popular...");

  while (page <= totalPages) {
    console.log(`\\n--- Scraping Page ${page}/${totalPages} ---`);
    const res = await fetchWithDelay(`/popular?page=${page}`);
    
    if (!res || !res.data) {
      console.log("No data returned, stopping.");
      break;
    }

    if (res.pagination) {
      totalPages = res.pagination.total_pages;
    }

    await processMangaList(res.data);
    page++;
  }

  console.log("Popular scraping finished.");
}

async function scrapeLatest() {
  let page = 1;
  let totalPages = 1;

  console.log("Starting scrape on /latest...");

  while (page <= totalPages) {
    console.log(`\\\\n--- Scraping Latest Page ${page}/${totalPages} ---`);
    const res = await fetchWithDelay(`/latest?page=${page}`);

    if (!res || !res.data) {
      console.log("No data returned, stopping.");
      break;
    }

    if (res.pagination) {
      totalPages = res.pagination.total_pages;
    }

    await processMangaList(res.data);
    page++;
  }

  console.log("Latest scraping finished.");
}

async function updateNewChapters() {
  let page = 1;
  let totalPages = 1;
  let updatedCount = 0;
  let skippedCount = 0;
  let newMangaCount = 0;
  let consecutiveFullyUpToDatePages = 0;

  console.log("Starting chapter update from /latest...");

  while (page <= totalPages) {
    console.log(`\n--- Checking Latest Page ${page}/${totalPages} ---`);
    const res = await fetchWithDelay(`/latest?page=${page}`);

    if (!res || !res.data) {
      console.log("No data returned, stopping.");
      break;
    }

    if (res.pagination) {
      totalPages = res.pagination.total_pages;
    }

    let pageHasUpdates = false;

    for (const manga of res.data) {
      const { data: existingManga } = await supabase
        .from('mangas')
        .select('id')
        .eq('source_id', manga.manga_id)
        .single();

      if (!existingManga) {
        console.log(`  [NEW] ${manga.title} — inserting...`);
        newMangaCount++;
        pageHasUpdates = true;
        await processMangaList([manga]);
        continue;
      }

      const { count } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('manga_id', existingManga.id);

      const dbChapterCount = count || 0;
      const apiLatestChapter = manga.latest_chapter || 0;

      if (apiLatestChapter > dbChapterCount) {
        console.log(`  [UPDATE] ${manga.title} — DB: ${dbChapterCount} chapters, API: ${apiLatestChapter}`);
        updatedCount++;
        pageHasUpdates = true;
        await scrapeChapters(manga.manga_id, existingManga.id);
      } else {
        skippedCount++;
      }
    }

    if (!pageHasUpdates) {
      consecutiveFullyUpToDatePages++;
      console.log(`  Page ${page} fully up-to-date (${consecutiveFullyUpToDatePages} consecutive)`);
      if (consecutiveFullyUpToDatePages >= 3) {
        console.log("3 consecutive pages with no updates — stopping early.");
        break;
      }
    } else {
      consecutiveFullyUpToDatePages = 0;
    }

    page++;
  }

  console.log(`\nUpdate complete: ${updatedCount} updated, ${newMangaCount} new, ${skippedCount} skipped.`);
}

async function processMangaList(mangas: any[]) {
  for (const manga of mangas) {
    console.log(`Processing: ${manga.title}`);

    const typeStr = Array.isArray(manga.type) ? manga.type[0]?.name || manga.type[0] : manga.type;
    const formatStr = Array.isArray(manga.format) ? manga.format[0]?.name || manga.format[0] : manga.format;

    const { data: insertedManga, error: mangaErr } = await supabase
      .from('mangas')
      .upsert({
        source_id: manga.manga_id,
        title: manga.title,
        alternative_title: manga.alternative_title,
        description: manga.description,
        cover: manga.cover,
        thumbnail: manga.thumbnail || manga.cover_portrait,
        status: manga.status,
        rating: parseFloat(manga.rating) || 0,
        views: manga.views || 0,
        bookmarks: manga.bookmarks || 0,
        release_year: manga.release_year,
        type: typeStr,
        format: formatStr,
      }, { onConflict: 'source_id' })
      .select('id')
      .single();

    if (mangaErr) {
      console.error(`Error upserting ${manga.title}:`, mangaErr.message);
      continue;
    }

    const supabaseMangaId = insertedManga.id;

    await scrapeMangaDetails(manga.manga_id, supabaseMangaId);
    await scrapeChapters(manga.manga_id, supabaseMangaId);
  }
}

async function run() {
  await scrapeGenres();
  await updateNewChapters();
}

run();