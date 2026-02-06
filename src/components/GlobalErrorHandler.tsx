'use client';

import { useEffect } from 'react';
import { wideEventLogger } from '@/lib/wide-event-logger';

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        wideEventLogger?.setEventType('js_error');
        wideEventLogger?.logError(event.error || new Error(event.message));
        wideEventLogger?.log('filename', event.filename);
        wideEventLogger?.log('lineno', event.lineno);
        wideEventLogger?.flush();
      } catch {}
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      try {
        wideEventLogger?.setEventType('unhandled_rejection');
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        wideEventLogger?.logError(error);
        wideEventLogger?.flush();
      } catch {}
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return <>{children}</>;
}
