import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';

let initialized = false;

export function initObservability() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const sendMetric = (metric: { name: string; value: number }) => {
    const page = window.location.pathname;
    const body = JSON.stringify({ metric: metric.name, value: metric.value, page });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/metrics/web-vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  };

  onLCP(sendMetric);
  onCLS(sendMetric);
  onINP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
}
