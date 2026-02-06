'use client';

import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { wideEventLogger } from '@/lib/wide-event-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    try {
      wideEventLogger?.setEventType('react_error');
      wideEventLogger?.logError(error);
      wideEventLogger?.log('component_stack', errorInfo.componentStack?.slice(0, 500));
      wideEventLogger?.flush();
    } catch {}
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Algo deu errado
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
