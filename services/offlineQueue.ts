import { QueuedOperation } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logger } from '../lib/logger';

type TableName = 'profiles' | 'templates' | 'workout_sessions' | 'personal_records';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Get the current offline queue from localStorage
 */
export function getQueue(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save the queue to localStorage
 */
function saveQueue(queue: QueuedOperation[]): void {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

/**
 * Add an operation to the offline queue
 */
export function enqueue(
  table: string,
  action: QueuedOperation['action'],
  payload: Record<string, unknown>
): void {
  const queue = getQueue();
  queue.push({
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    table,
    payload,
    timestamp: Date.now(),
    retries: 0,
  });
  saveQueue(queue);
}

/**
 * Remove the first operation from the queue
 */
export function dequeue(): QueuedOperation | undefined {
  const queue = getQueue();
  const item = queue.shift();
  saveQueue(queue);
  return item;
}

/**
 * Execute a single queued operation against Supabase
 */
async function executeOperation(op: QueuedOperation): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    let result;

    const table = op.table as TableName;

    switch (op.action) {
      case 'insert':
        result = await supabase.from(table).insert(op.payload as any);
        break;
      case 'update': {
        const { id, ...rest } = op.payload;
        result = await supabase.from(table).update(rest as any).eq('id', id as string);
        break;
      }
      case 'upsert':
        result = await supabase.from(table).upsert(op.payload as any);
        break;
      case 'delete': {
        const deleteId = op.payload.id as string;
        result = await supabase.from(table).delete().eq('id', deleteId);
        break;
      }
    }

    if (result?.error) {
      logger.error(`Offline queue: failed ${op.action} on ${op.table}:`, result.error);
      return false;
    }

    return true;
  } catch (err) {
    logger.error('Offline queue: network error:', err);
    return false;
  }
}

/**
 * Process all queued operations (FIFO order).
 * Returns the number of successfully processed operations.
 */
export async function processQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let processed = 0;
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    // Exponential backoff delay
    if (op.retries > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, op.retries - 1);
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
    }

    const success = await executeOperation(op);

    if (success) {
      processed++;
    } else if (op.retries < MAX_RETRIES) {
      remaining.push({ ...op, retries: op.retries + 1 });
    } else {
      // Drop after max retries
      logger.warn(`Offline queue: dropping operation after ${MAX_RETRIES} retries:`, op);
    }
  }

  saveQueue(remaining);
  return processed;
}

/**
 * Wrapper for service calls that queues on failure.
 * Usage: await withOfflineQueue('templates', 'upsert', payload, () => supabase.from(...))
 */
export async function withOfflineQueue<T>(
  table: string,
  action: QueuedOperation['action'],
  payload: Record<string, unknown>,
  supabaseFn: () => Promise<{ error: any; data?: T }>
): Promise<{ data?: T; queued: boolean }> {
  if (!isSupabaseConfigured()) {
    enqueue(table, action, payload);
    return { queued: true };
  }

  try {
    const result = await supabaseFn();
    if (result.error) {
      // If it's a network error, queue it
      enqueue(table, action, payload);
      return { queued: true };
    }
    return { data: result.data as T, queued: false };
  } catch {
    enqueue(table, action, payload);
    return { queued: true };
  }
}
