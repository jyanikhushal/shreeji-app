interface ProductLanguageEntry {
  canonical_gu: string;
  canonical_hi: string;
  canonical_en: string;
  source: 'curated' | 'learned';
}

type ProductLanguageMap = Record<string, ProductLanguageEntry>;

let cachedMap: ProductLanguageMap | null = null;
let fetchPromise: Promise<ProductLanguageMap> | null = null;

export async function getProductLanguageMap(): Promise<ProductLanguageMap> {
  if (cachedMap) return cachedMap;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/productLanguage`)
    .then(res => res.json())
    .then((json): ProductLanguageMap => {
      cachedMap = json.data || {};
      return cachedMap as ProductLanguageMap;
    })
    .catch((): ProductLanguageMap => {
      cachedMap = {};
      return cachedMap;
    });

  return fetchPromise;
}

export function lookupProduct(rawText: string): ProductLanguageEntry | null {
  if (!cachedMap) return null;
  const key = (rawText || '').trim().toLowerCase();
  return cachedMap[key] || null;
}

export function learnProduct(rawText: string, gu: string, hi: string, en: string) {
  const key = (rawText || '').trim().toLowerCase();
  if (cachedMap && !cachedMap[key]) {
    cachedMap[key] = { canonical_gu: gu, canonical_hi: hi, canonical_en: en, source: 'learned' };
  }
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/productLanguage/learn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, canonical_gu: gu, canonical_hi: hi, canonical_en: en }),
  }).catch(() => {});
}