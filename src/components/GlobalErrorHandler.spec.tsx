import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalErrorHandler } from './GlobalErrorHandler';

vi.mock('@/lib/wide-event-logger', () => ({
  wideEventLogger: {
    setEventType: vi.fn(),
    logError: vi.fn(),
    log: vi.fn(),
    flush: vi.fn(),
  },
}));

describe('GlobalErrorHandler', () => {
  it('should render children', () => {
    render(
      <GlobalErrorHandler>
        <div>Child content</div>
      </GlobalErrorHandler>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should register error event listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    render(
      <GlobalErrorHandler>
        <div>Content</div>
      </GlobalErrorHandler>
    );
    expect(addSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    addSpy.mockRestore();
  });
});
