import { atom } from 'jotai';
import { persistedAtom } from './persist';

export type ThemeMode = 'system' | 'light' | 'dark';

/** What the reader picked in Settings. */
export const themeModeAtom = persistedAtom<ThemeMode>('theme', 'system');

/** Follows the OS setting live while something is subscribed. */
const systemDarkAtom = atom(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
systemDarkAtom.onMount = set => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const on = (e: MediaQueryListEvent) => set(e.matches);
  mq.addEventListener('change', on);
  return () => mq.removeEventListener('change', on);
};

/** Derived: the theme actually shown. */
export const isDarkAtom = atom(get => {
  const mode = get(themeModeAtom);
  return mode === 'dark' || (mode === 'system' && get(systemDarkAtom));
});

/** Sets data-theme on <html> (every CSS colour reads from it) and the browser chrome colour. */
export function applyTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', isDark ? '#14120F' : '#FAF7F0'));
}
