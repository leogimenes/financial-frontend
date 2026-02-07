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

// Mock useParams to return a document id
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation') as any;
  return {
    ...actual,
    useParams: () => ({ id: 'doc-1' }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/documents/doc-1',
    useSearchParams: () => new URLSearchParams(),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DocumentDetailPage', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'USER' }));
  });

  it('should render the page after auth', async () => {
    const { default: DocumentDetailPage } = await import('./page');
    render(<DocumentDetailPage />);
    await waitFor(() => {
      expect(screen.getByTestId('appbar')).toBeInTheDocument();
    });
  });

});
