'use client';

import { useLanguage, SupportedLanguage } from '@/hooks/useLanguage';

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
];

interface LanguageSwitcherProps {
  userType: 'malik' | 'grahak';
  phone: string | null | undefined;
}

export default function LanguageSwitcher({ userType, phone }: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleChange = async (lang: SupportedLanguage) => {
    changeLanguage(lang); // instant UI switch, same as before

    if (!phone) return; // no phone yet (e.g. still loading) — skip persistence, UI still switched

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/language/${userType}/${phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
    } catch (err) {
      console.error('Failed to save language preference:', err);
      // silent fail — language already switched in UI, just won't persist to next login
    }
  };

  return (
    <select
      value={currentLanguage}
      onChange={(e) => handleChange(e.target.value as SupportedLanguage)}
      style={{
        fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)',
        background: 'transparent', border: '1px solid rgba(35,42,59,0.3)',
        borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', outline: 'none',
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}