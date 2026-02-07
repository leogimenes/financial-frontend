import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWideEvent } from './useWideEvent';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

vi.mock('@/lib/wide-event-logger', () => ({
  createWideEventLogger: () => ({
    setEventType: vi.fn(),
    setUser: vi.fn(),
    log: vi.fn(),
    logError: vi.fn(),
    flush: vi.fn(),
    reset: vi.fn(),
    getTraceId: () => 'test-trace-id',
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useWideEvent', () => {
  it('should return log functions', () => {
    const { result } = renderHook(() => useWideEvent('test_event'), { wrapper });
    expect(result.current.log).toBeDefined();
    expect(result.current.logClick).toBeDefined();
    expect(result.current.logSubmit).toBeDefined();
    expect(result.current.logError).toBeDefined();
    expect(result.current.flush).toBeDefined();
    expect(result.current.traceId).toBe('test-trace-id');
  });

  it('should log key-value pairs', () => {
    const { result } = renderHook(() => useWideEvent('test_event'), { wrapper });
    act(() => {
      result.current.log('key', 'value');
    });
    // Should not throw
  });

  it('should log clicks', () => {
    const { result } = renderHook(() => useWideEvent('test_event'), { wrapper });
    act(() => {
      result.current.logClick('button');
    });
  });

  it('should log errors', () => {
    const { result } = renderHook(() => useWideEvent('test_event'), { wrapper });
    act(() => {
      result.current.logError(new Error('test'));
    });
  });

  it('should flush and reset', () => {
    const { result } = renderHook(() => useWideEvent('test_event'), { wrapper });
    act(() => {
      result.current.flush();
    });
  });
});
