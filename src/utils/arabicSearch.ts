export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove Tashkeel / Harakat (diacritics)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alef forms
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa / Alef Maksura
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    .trim();
}

export function matchesArabicQuery(text: string, query: string): boolean {
  if (!query) return true;
  const normText = normalizeArabicText(text).toLowerCase();
  const normQuery = normalizeArabicText(query).toLowerCase();
  return normText.includes(normQuery);
}
