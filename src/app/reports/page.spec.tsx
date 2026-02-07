import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { server } from '@/test/mocks/server';

vi.mock('@/hooks/useWideEvent', () => ({
  useWideEvent: () => ({
    log: vi.fn(),
    logClick: vi.fn(),
    logSubmit: vi.fn(),
    logError: vi.fn(),
    flush: vi.fn(),
    traceId: 'test-trace',
  }),
}));

vi.mock('@/components/AppBar', () => ({
  default: () => <div data-testid="appbar">AppBar</div>,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ReportsPage', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'USER' }));
  });

  it('should render the page after auth', async () => {
    const { default: ReportsPage } = await import('./page');
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('appbar')).toBeInTheDocument();
    });
  });
});
