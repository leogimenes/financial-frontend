import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { server } from '@/test/mocks/server';
import LoginPage from './page';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should render register link', () => {
    render(<LoginPage />);
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });

  it('should show subtitle', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sistema de Análise Financeira')).toBeInTheDocument();
  });

  it('should update email and password fields', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password');
  });

  it('should submit login form', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    // After successful login, should redirect
    const { push } = (globalThis as any).__mockRouter;
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
});
