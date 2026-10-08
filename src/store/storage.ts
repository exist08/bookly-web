/** localStorage with a `bookly.` prefix. Every access is guarded: private mode and full quotas throw. */
const PREFIX = 'bookly.';

export const storage = {
  getString(key: string): string | undefined {
    try {
      return localStorage.getItem(PREFIX + key) ?? undefined;
    } catch {
      return undefined;
    }
  },
  getBoolean(key: string): boolean | undefined {
    const v = storage.getString(key);
    return v === undefined ? undefined : v === 'true';
  },
  set(key: string, value: string | boolean | number): boolean {
    try {
      localStorage.setItem(PREFIX + key, String(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};

export function readJSON<T>(key: string): T | undefined {
  const raw = storage.getString(key);
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** Returns false when the browser refused the write (usually storage full from cover photos). */
export function writeJSON(key: string, value: unknown): boolean {
  return storage.set(key, JSON.stringify(value));
}
