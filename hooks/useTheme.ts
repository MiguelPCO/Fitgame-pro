import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_KEY = 'fitgame-theme';

function getSystemPreference(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#f1f5f9');
  }
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as ThemeMode) || 'dark';
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_KEY, newMode);
    applyTheme(newMode);
  }, []);

  // Apply on mount and listen for system changes
  useEffect(() => {
    applyTheme(mode);

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode]);

  const resolvedTheme = mode === 'system' ? getSystemPreference() : mode;

  return { mode, setMode, resolvedTheme };
}
