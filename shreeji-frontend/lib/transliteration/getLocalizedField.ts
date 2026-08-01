import { SupportedLanguage } from '@/hooks/useLanguage';

interface LocalizedRecord {
  name?: string;
  name_gu?: string;
  name_hi?: string;
}

export function getLocalizedName(record: LocalizedRecord, lang: SupportedLanguage): string {
  if (lang === 'gu' && record.name_gu) return record.name_gu;
  if (lang === 'hi' && record.name_hi) return record.name_hi;
  return record.name || '';
}