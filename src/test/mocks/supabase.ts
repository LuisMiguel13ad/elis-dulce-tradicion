import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  const mockData: Record<string, any[]> = {};

  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock_token',
          },
        },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: null },
        unsubscribe: vi.fn(),
      })),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockData[table]?.[0] || null,
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn((callback) => {
        const result = {
          data: mockData[table] || [],
          error: null,
        };
        return Promise.resolve(result).then(callback);
      }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'mock/path/image.jpg' },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
      unsubscribe: vi.fn(),
    })),
  };
};

export const mockSupabaseClient = createMockSupabaseClient();
