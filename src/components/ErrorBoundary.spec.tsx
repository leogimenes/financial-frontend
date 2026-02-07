import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>No error</div>;
}

// Suppress console.error for expected errors
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      </ThemeProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render default fallback on error', () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      </ThemeProvider>
    );
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Recarregar página')).toBeInTheDocument();
  });

  it('should render custom fallback on error', () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary fallback={<div>Custom error</div>}>
          <ThrowingComponent />
        </ErrorBoundary>
      </ThemeProvider>
    );
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });
});
