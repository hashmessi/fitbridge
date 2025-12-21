/**
 * Vitest test setup file.
 * Configures mocks for external services and browser APIs.
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// -----------------------------------------------------------------------------
// Mock localStorage
// -----------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// -----------------------------------------------------------------------------
// Mock fetch API
// -----------------------------------------------------------------------------

global.fetch = vi.fn();

export function mockFetch(response: unknown, ok = true, status = 200) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

export function mockFetchError(error: string) {
  (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(error));
}

// -----------------------------------------------------------------------------
// Mock Supabase client
// -----------------------------------------------------------------------------

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  getCurrentUser: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

// -----------------------------------------------------------------------------
// Mock import.meta.env
// -----------------------------------------------------------------------------

vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:8000',
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
});

// -----------------------------------------------------------------------------
// Cleanup after each test
// -----------------------------------------------------------------------------

afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
