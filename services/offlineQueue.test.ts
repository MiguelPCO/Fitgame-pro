import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getQueue, enqueue, dequeue, processQueue, withOfflineQueue } from './offlineQueue';
import { STORAGE_KEYS } from '../lib/constants';

// Shared mock client — tests modify its `from` mock directly
const mockClient = {
  from: vi.fn(),
};

// Mock supabase module — getSupabase returns the shared mock client
vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabase: vi.fn(() => Promise.resolve(mockClient)),
}));

// Mock logger to suppress output
vi.mock('../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { isSupabaseConfigured } from '../lib/supabase';

describe('Offline Queue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset mock client's from to a safe default
    mockClient.from.mockReset();
  });

  describe('getQueue', () => {
    it('returns empty array when no queue exists', () => {
      expect(getQueue()).toEqual([]);
    });

    it('returns parsed queue from localStorage', () => {
      const ops = [{ id: 'op-1', action: 'insert', table: 'profiles', payload: { name: 'Test' }, timestamp: 1000, retries: 0 }];
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(ops));
      expect(getQueue()).toEqual(ops);
    });

    it('returns empty array on corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, '{invalid-json');
      expect(getQueue()).toEqual([]);
    });
  });

  describe('enqueue', () => {
    it('adds operation to empty queue', () => {
      enqueue('templates', 'insert', { name: 'Push Day' });
      const queue = getQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0].table).toBe('templates');
      expect(queue[0].action).toBe('insert');
      expect(queue[0].payload).toEqual({ name: 'Push Day' });
      expect(queue[0].retries).toBe(0);
      expect(queue[0].id).toMatch(/^op-/);
      expect(queue[0].timestamp).toBeGreaterThan(0);
    });

    it('appends to existing queue', () => {
      enqueue('profiles', 'update', { id: '1', name: 'A' });
      enqueue('templates', 'delete', { id: '2' });
      const queue = getQueue();

      expect(queue).toHaveLength(2);
      expect(queue[0].table).toBe('profiles');
      expect(queue[1].table).toBe('templates');
    });

    it('persists queue to localStorage', () => {
      enqueue('profiles', 'upsert', { id: '1' });
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('dequeue', () => {
    it('returns undefined from empty queue', () => {
      expect(dequeue()).toBeUndefined();
    });

    it('removes and returns first item (FIFO)', () => {
      enqueue('profiles', 'insert', { name: 'First' });
      enqueue('templates', 'insert', { name: 'Second' });

      const item = dequeue();
      expect(item?.payload).toEqual({ name: 'First' });
      expect(getQueue()).toHaveLength(1);
      expect(getQueue()[0].payload).toEqual({ name: 'Second' });
    });
  });

  describe('processQueue', () => {
    it('returns 0 for empty queue', async () => {
      expect(await processQueue()).toBe(0);
    });

    it('processes successful operations and clears queue', async () => {
      mockClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      enqueue('profiles', 'insert', { name: 'Test' });
      const processed = await processQueue();

      expect(processed).toBe(1);
      expect(getQueue()).toHaveLength(0);
    });

    it('retries failed operations with incremented retry count', async () => {
      mockClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Network error' } }),
      });

      enqueue('profiles', 'insert', { name: 'Test' });
      await processQueue();

      const queue = getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].retries).toBe(1);
    });

    it('drops operations after MAX_RETRIES (5)', async () => {
      vi.useFakeTimers();

      mockClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'fail' } }),
      });

      // Manually insert an operation at max retries
      const ops = [{
        id: 'op-1', action: 'insert' as const, table: 'profiles',
        payload: { name: 'Test' }, timestamp: 1000, retries: 5,
      }];
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(ops));

      const promise = processQueue();
      await vi.runAllTimersAsync();
      await promise;

      // Should be dropped, not re-queued
      expect(getQueue()).toHaveLength(0);
      vi.useRealTimers();
    });

    it('handles update action with id extraction', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockClient.from.mockReturnValue({ update: mockUpdate });

      enqueue('profiles', 'update', { id: 'user-1', name: 'Updated' });
      await processQueue();

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated' });
    });

    it('handles delete action', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockClient.from.mockReturnValue({ delete: mockDelete });

      enqueue('templates', 'delete', { id: 'tmpl-1' });
      await processQueue();

      expect(mockClient.from).toHaveBeenCalledWith('templates');
    });

    it('handles upsert action', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockClient.from.mockReturnValue({ upsert: mockUpsert });

      enqueue('profiles', 'upsert', { id: 'u1', name: 'Test' });
      await processQueue();

      expect(mockUpsert).toHaveBeenCalledWith({ id: 'u1', name: 'Test' });
    });
  });

  describe('withOfflineQueue', () => {
    it('queues when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);
      const fn = vi.fn();

      const result = await withOfflineQueue('profiles', 'insert', { name: 'Test' }, fn);

      expect(result.queued).toBe(true);
      expect(fn).not.toHaveBeenCalled();
      expect(getQueue()).toHaveLength(1);
    });

    it('returns data on successful Supabase call', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);
      const fn = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });

      const result = await withOfflineQueue('profiles', 'insert', { name: 'Test' }, fn);

      expect(result.queued).toBe(false);
      expect(result.data).toEqual({ id: '1' });
      expect(getQueue()).toHaveLength(0);
    });

    it('queues on Supabase error response', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);
      const fn = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });

      const result = await withOfflineQueue('profiles', 'insert', { name: 'Test' }, fn);

      expect(result.queued).toBe(true);
      expect(getQueue()).toHaveLength(1);
    });

    it('queues on network exception', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);
      const fn = vi.fn().mockRejectedValue(new Error('Network failed'));

      const result = await withOfflineQueue('templates', 'upsert', { id: '1' }, fn);

      expect(result.queued).toBe(true);
      expect(getQueue()).toHaveLength(1);
    });
  });
});
