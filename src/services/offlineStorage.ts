const DB_NAME = 'kaeltoon_offline_db';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'chapterId' });
      }
    };
  });
}

export interface OfflineChapter {
  chapterId: string;
  mangaId: string;
  mangaTitle: string;
  chapterTitle: string;
  cover?: string;
  images: string[]; // Base64 data URLs
  savedAt: number;
}

export async function saveChapterOffline(
  chapterId: string,
  mangaId: string,
  mangaTitle: string,
  chapterTitle: string,
  imageUrls: string[],
  onProgress?: (current: number, total: number) => void,
  coverUrl?: string
): Promise<void> {
  const base64Images: string[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      base64Images.push(base64);
    } catch {
      // Fallback: save original URL if fetch fails
      base64Images.push(url);
    }
    if (onProgress) onProgress(i + 1, imageUrls.length);
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const data: OfflineChapter = {
      chapterId,
      mangaId,
      mangaTitle,
      chapterTitle,
      cover: coverUrl || base64Images[0],
      images: base64Images,
      savedAt: Date.now()
    };
    const req = store.put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineChapter(chapterId: string): Promise<OfflineChapter | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.get(chapterId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineChapter(chapterId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.delete(chapterId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function isChapterDownloaded(chapterId: string): Promise<boolean> {
  const item = await getOfflineChapter(chapterId);
  return item !== null;
}

export async function getAllOfflineChapters(): Promise<OfflineChapter[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
