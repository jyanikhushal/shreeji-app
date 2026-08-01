import Sanscript from '@indic-transliteration/sanscript';

export function toGujarati(text: string): string {
  if (!text) return text;
  try {
    return Sanscript.t(text, 'itrans', 'gujarati');
  } catch {
    return text; // fail-safe: if conversion errors, just keep original text
  }
}

export function toHindi(text: string): string {
  if (!text) return text;
  try {
    return Sanscript.t(text, 'itrans', 'devanagari');
  } catch {
    return text;
  }
}

export interface Translations {
  en: string;
  gu: string;
  hi: string;
}

export function generateTranslations(text: string): Translations {
  return {
    en: text,
    gu: toGujarati(text),
    hi: toHindi(text),
  };
}