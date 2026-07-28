'use client';

import { Suspense } from 'react';
import GrahakKhataClient from './GrahakKhataClient';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        color: 'var(--color-ink)',
        fontSize: '16px',
        fontWeight: 500
      }}>
        Loading your Khata...
      </div>
    }>
      <GrahakKhataClient />
    </Suspense>
  );
}