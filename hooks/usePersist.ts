import { useEffect } from 'react';

/**
 * Hook to persist a value to localStorage whenever it changes.
 * Removes the key if value is null/undefined.
 */
export function usePersist<T>(key: string, value: T | null | undefined): void {
  useEffect(() => {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);
}

/**
 * Load a value from localStorage with a fallback.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
}

/**
 * Save a value to localStorage.
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

/**
 * Remove a value from localStorage.
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key} from localStorage`, e);
  }
}

export default usePersist;
