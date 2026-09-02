const BOOKMARK_STORAGE_KEY = 'tilawa_saved_bookmarks';

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  hizbNumber: number;
  savedAt: string;
}

export function getStoredBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveBookmark(bookmark: QuranBookmark): QuranBookmark[] {
  const current = getStoredBookmarks();
  const exists = current.some(b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber);
  const updated = exists ? current.filter(b => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)) : [bookmark, ...current];
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
