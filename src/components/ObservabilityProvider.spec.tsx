import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ObservabilityProvider } from './ObservabilityProvider';

vi.mock('@/lib/observability', () => ({
  initObservability: vi.fn(),
}));

describe('ObservabilityProvider', () => {
  it('should render children', () => {
    render(
      <ObservabilityProvider>
        <div>Observable content</div>
      </ObservabilityProvider>
    );
    expect(screen.getByText('Observable content')).toBeInTheDocument();
  });

  it('should call initObservability on mount', async () => {
    const { initObservability } = await import('@/lib/observability');
    render(
      <ObservabilityProvider>
        <div>Content</div>
      </ObservabilityProvider>
    );
    expect(initObservability).toHaveBeenCalled();
  });
});
