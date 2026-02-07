import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Expose for tests
(globalThis as any).__mockRouter = { push: mockPush, replace: mockReplace, back: mockBack };

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({}),
});

// Mock crypto.randomUUID
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '12345678-1234-1234-1234-123456789012',
      getRandomValues: (arr: Uint8Array) => arr.fill(1),
    },
  });
}

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: vi.fn().mockReturnValue(true),
  writable: true,
});

// Clean up between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
