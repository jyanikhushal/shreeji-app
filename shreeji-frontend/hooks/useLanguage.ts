import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'gu' | 'hi' | 'en';

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
  };

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
  };
}