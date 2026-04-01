'use client';

import { Suspense } from 'react';
import GrahakKhataClient from './GrahakKhataClient';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GrahakKhataClient />
    </Suspense>
  );
}