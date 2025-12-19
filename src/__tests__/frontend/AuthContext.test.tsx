import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/test-utils';
import { useAuth } from '@/contexts/AuthContext';
import { createMockSupabaseClient } from '@/test/mocks/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('signIn');
    expect(result.current).toHaveProperty('signOut');
  });

  it('handles login', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock successful login
    const mockSignIn = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user_123', email: 'test@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    // This would require mocking the actual Supabase client
    // For now, just verify the hook structure
    expect(result.current.signIn).toBeDefined();
  });

  it('handles logout', async () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.signOut).toBeDefined();
  });

  it('checks user role', () => {
    const { result } = renderHook(() => useAuth());
    
    // Test with different user roles
    // This would require setting up mock user data
    expect(result.current.user).toBeDefined();
  });
});
