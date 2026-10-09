import { atomWithStorage } from 'jotai/utils';

/**
 * localStorage / sessionStorage as a Jotai storage. Values are saved as JSON;
 * older raw values (e.g. `dark`, `u_abc`) still read correctly. Every access is
 * guarded because private mode and full quotas throw.
 */
function jsonStorage<T>(area: () => Storage) {
  return {
    getItem(key: string, initial: T): T {
      try {
        const raw = area().getItem(key);
        if (raw === null) return initial;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T; // legacy plain string
        }
      } catch {
        return initial;
      }
    },
    setItem(key: string, value: T) {
      try {
        area().setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked — keep the in-memory value */
      }
    },
    removeItem(key: string) {
      try {
        area().removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/** An atom saved in localStorage under `bookly.<key>` (survives reloads). */
export const persistedAtom = <T>(key: string, initial: T) =>
  atomWithStorage<T>(`bookly.${key}`, initial, jsonStorage<T>(() => localStorage), { getOnInit: true });

/** An atom saved in sessionStorage under `bookly.<key>` (cleared when the tab closes). */
export const sessionAtom = <T>(key: string, initial: T) =>
  atomWithStorage<T>(`bookly.${key}`, initial, jsonStorage<T>(() => sessionStorage), { getOnInit: true });
