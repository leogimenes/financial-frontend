import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { server } from '@/test/mocks/server';
import RegisterPage from './page';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RegisterPage', () => {
  it('should render register form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /cadastrar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/já tem conta/i)).toBeInTheDocument();
  });

  it('should show subtitle', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/crie sua conta gratuita/i)).toBeInTheDocument();
  });

  it('should update form fields', () => {
    render(<RegisterPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });

    expect(emailInput).toHaveValue('new@test.com');
    expect(passwordInput).toHaveValue('pass123');
  });

  it('should submit register form', async () => {
    render(<RegisterPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    const { push } = (globalThis as any).__mockRouter;
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
});
