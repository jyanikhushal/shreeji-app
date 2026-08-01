'use client';

import { ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [ready] = useState(() => typeof window !== 'undefined');

  if (!ready) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}