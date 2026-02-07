import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import CustomAppBar from './AppBar';

describe('CustomAppBar', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'user@test.com', role: 'USER' }));
  });

  it('should render app title', () => {
    render(<CustomAppBar />);
    expect(screen.getByText('Análise Financeira')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(<CustomAppBar />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Lançamentos')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Categorias')).toBeInTheDocument();
  });

  it('should show user menu when user is logged in', () => {
    render(<CustomAppBar />);
    const userButton = screen.getByTestId('AccountCircleIcon');
    expect(userButton).toBeInTheDocument();
  });

});
