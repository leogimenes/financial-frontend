import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('web-vitals', () => ({
  onLCP: vi.fn(),
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe('observability', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should register web vitals callbacks', async () => {
    const { initObservability } = await import('./observability');
    const webVitals = await import('web-vitals');
    initObservability();
    expect(webVitals.onLCP).toHaveBeenCalled();
    expect(webVitals.onCLS).toHaveBeenCalled();
    expect(webVitals.onINP).toHaveBeenCalled();
    expect(webVitals.onFCP).toHaveBeenCalled();
    expect(webVitals.onTTFB).toHaveBeenCalled();
  });

  it('should only initialize once', async () => {
    const { initObservability } = await import('./observability');
    const webVitals = await import('web-vitals');
    initObservability();
    initObservability();
    // Each metric callback should only be registered once
    expect(webVitals.onLCP).toHaveBeenCalledTimes(1);
  });

  it('should pass sendMetric callback that posts to API', async () => {
    const { initObservability } = await import('./observability');
    const webVitals = await import('web-vitals');
    initObservability();
    // Get the sendMetric callback passed to onLCP
    const sendMetric = (webVitals.onLCP as any).mock.calls[0][0];
    expect(sendMetric).toBeInstanceOf(Function);
    // Call it to exercise the function
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());
    sendMetric({ name: 'LCP', value: 100 });
    expect(fetchMock).toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
