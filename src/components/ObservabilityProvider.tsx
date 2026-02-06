'use client';
import { useEffect } from 'react';
import { initObservability } from '@/lib/observability';

export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initObservability();
  }, []);
  return <>{children}</>;
}
