import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/test/test-utils';
import { server } from '@/test/mocks/server';
import CategoriasPage from './page';

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

describe('CategoriasPage', () => {
  it('should render page title', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Categorias')).toBeInTheDocument();
    });
  });

  it('should render Nova Categoria button', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    });
  });

  it('should show system categories section', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Categorias do Sistema')).toBeInTheDocument();
    });
  });

  it('should show custom categories section', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Minhas Categorias')).toBeInTheDocument();
    });
  });

  it('should load and display categories from API', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument();
    });
    // Receita appears in both category name and type chip
    expect(screen.getAllByText('Receita').length).toBeGreaterThanOrEqual(1);
  });

  it('should open create dialog when clicking Nova Categoria', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Nova Categoria'));
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    });
  });

  it('should open and close create dialog', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    });
    // Open
    fireEvent.click(screen.getByText('Nova Categoria'));
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    });
    // Close
    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => {
      expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    });
  });

  it('should show validation error when submitting empty form', async () => {
    render(<CategoriasPage />);
    await waitFor(() => {
      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Nova Categoria'));
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
    // Click save without filling in data
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => {
      // Should show validation snackbar
      expect(screen.getByText(/obrigatórios/i)).toBeInTheDocument();
    });
  });
});
