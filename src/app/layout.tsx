import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import { ObservabilityProvider } from '@/components/ObservabilityProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';

export const metadata: Metadata = {
  title: 'Análise Financeira',
  description: 'Sistema de análise de faturas e extratos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeRegistry>
          <ErrorBoundary>
            <GlobalErrorHandler>
              <AuthProvider>
                <ObservabilityProvider>{children}</ObservabilityProvider>
              </AuthProvider>
            </GlobalErrorHandler>
          </ErrorBoundary>
        </ThemeRegistry>
      </body>
    </html>
  );
}
