import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth, mockRpc } = vi.hoisted(() => ({
  mockAuth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  mockRpc: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  getSupabase: vi.fn().mockResolvedValue({
    auth: mockAuth,
    rpc: mockRpc,
  }),
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock('../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { signIn, signUp, signOut, deleteAccount } from './auth';

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('returns user + session on success', async () => {
      const fakeUser = { id: 'user-1', email: 'test@test.com' };
      const fakeSession = { access_token: 'tok' };
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: fakeUser, session: fakeSession },
        error: null,
      });

      const result = await signIn('test@test.com', 'password123');

      expect(result.user).toEqual(fakeUser);
      expect(result.session).toEqual(fakeSession);
      expect(result.error).toBeNull();
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('returns error message on auth failure', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await signIn('bad@test.com', 'wrongpass');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid login credentials');
    });

    it('returns error when Supabase not configured', async () => {
      const { getSupabase } = await import('../lib/supabase');
      vi.mocked(getSupabase).mockResolvedValueOnce(null);

      const result = await signIn('test@test.com', 'pass');

      expect(result.error).toBe('Supabase not configured');
    });
  });

  describe('signUp', () => {
    it('returns user on successful registration', async () => {
      const fakeUser = { id: 'user-2', email: 'new@test.com' };
      mockAuth.signUp.mockResolvedValue({
        data: { user: fakeUser, session: null },
        error: null,
      });

      const result = await signUp('new@test.com', 'securepass', 'John');

      expect(result.user).toEqual(fakeUser);
      expect(result.error).toBeNull();
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'securepass',
        options: { data: { name: 'John' } },
      });
    });

    it('defaults name to "Athlete" when not provided', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: { id: 'u3' }, session: null },
        error: null,
      });

      await signUp('new@test.com', 'pass');

      expect(mockAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ options: { data: { name: 'Athlete' } } })
      );
    });

    it('returns error on registration failure', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const result = await signUp('existing@test.com', 'pass');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('signOut', () => {
    it('calls auth.signOut and returns null error on success', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(mockAuth.signOut).toHaveBeenCalledOnce();
      expect(result.error).toBeNull();
    });

    it('returns error message on signOut failure', async () => {
      mockAuth.signOut.mockResolvedValue({ error: { message: 'Network error' } });

      const result = await signOut();

      expect(result.error).toBe('Network error');
    });
  });

  describe('deleteAccount', () => {
    it('calls delete_user_account RPC then signs out on success', async () => {
      mockRpc.mockResolvedValue({ error: null });
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await deleteAccount();

      expect(mockRpc).toHaveBeenCalledWith('delete_user_account');
      expect(mockAuth.signOut).toHaveBeenCalledOnce();
      expect(result.error).toBeNull();
    });

    it('returns RPC error and does NOT sign out when RPC fails', async () => {
      mockRpc.mockResolvedValue({ error: { message: 'Permission denied' } });

      const result = await deleteAccount();

      expect(result.error).toBe('Permission denied');
      expect(mockAuth.signOut).not.toHaveBeenCalled();
    });

    it('returns error when Supabase not configured', async () => {
      const { getSupabase } = await import('../lib/supabase');
      vi.mocked(getSupabase).mockResolvedValueOnce(null);

      const result = await deleteAccount();

      expect(result.error).toBe('Supabase not configured');
    });
  });
});
