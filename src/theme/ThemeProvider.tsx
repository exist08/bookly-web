import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeCtx {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (m: ThemeMode) => void;
}

const KEY = 'bookly.theme';
const Ctx = createContext<ThemeCtx | null>(null);

const readMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Sets data-theme on <html>; every colour in the CSS reads from the matching token set. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const mq = media();
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDark ? 'dark' : 'light';
    // Keep the browser chrome (status bar / address bar) in step with the app.
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', isDark ? '#14120F' : '#FAF7F0'));
  }, [isDark]);

  const setMode = useCallback((m: ThemeMode) => {
    try {
      localStorage.setItem(KEY, m);
    } catch {
      // ignore
    }
    setModeState(m);
  }, []);

  const value = useMemo(() => ({ mode, isDark, setMode }), [mode, isDark, setMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useTheme outside ThemeProvider');
  }
  return v;
}
