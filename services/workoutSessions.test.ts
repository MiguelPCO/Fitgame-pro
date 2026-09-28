import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

vi.mock('../lib/supabase', () => ({
  getSupabase: vi.fn().mockResolvedValue({ rpc: mockRpc }),
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock('../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { awardWorkoutXP } from './workoutSessions';

describe('awardWorkoutXP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls complete_workout and maps the server stats', async () => {
    mockRpc.mockResolvedValue({
      data: { xp_awarded: 120, xp: 20, level: 3, xp_to_next_level: 144, streak: 4, tier: 'Novice' },
      error: null,
    });

    const result = await awardWorkoutXP('session-1');

    expect(mockRpc).toHaveBeenCalledWith('complete_workout', {
      p_session_id: 'session-1',
      p_tz: expect.any(String),
    });
    expect(result).toEqual({ xpAwarded: 120, xp: 20, level: 3, xpToNextLevel: 144, streak: 4, tier: 'Novice' });
  });

  it('returns null when the RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Session not found' } });

    expect(await awardWorkoutXP('missing')).toBeNull();
  });
});
