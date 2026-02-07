import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, useRequireAuth } from './AuthContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  describe('useAuth', () => {
    it('should throw when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
    });

    it('should initialize with null user and token', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });

    it('should load user from localStorage on mount', () => {
      localStorage.setItem('token', 'stored-token');
      localStorage.setItem('user', JSON.stringify({ id: 'u1', email: 'e@t.com', role: 'USER' }));

      const { result } = renderHook(() => useAuth(), { wrapper });
      // After the useEffect runs
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should store token and user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const user = { id: 'u1', email: 'test@test.com', role: 'USER' as const };

      act(() => {
        result.current.login('new-token', user);
      });

      expect(result.current.token).toBe('new-token');
      expect(result.current.user).toEqual(user);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });
  });

  describe('logout', () => {
    it('should clear token and user and redirect', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const mockRouter = (globalThis as any).__mockRouter;

      act(() => {
        result.current.login('token', { id: 'u1', email: 'e@t.com', role: 'USER' });
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  describe('useRequireAuth', () => {
    it('should redirect to /login when no user', () => {
      const mockRouter = (globalThis as any).__mockRouter;
      renderHook(() => useRequireAuth(), { wrapper });
      // The redirect happens after isLoading becomes false
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });
});
