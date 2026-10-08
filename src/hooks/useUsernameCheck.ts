import { useEffect, useState } from 'react';
import { checkUsername } from '../data/api';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

/** Debounced availability check for the username field. */
export function useUsernameCheck(username: string, current?: string) {
  const [status, setStatus] = useState<UsernameStatus>('idle');
  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (!u || u === current) {
      setStatus('idle');
      return;
    }
    if (!/^[a-z0-9._]{3,24}$/.test(u)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    let live = true;
    const t = setTimeout(async () => {
      const ok = await checkUsername(u);
      if (live) {
        setStatus(ok ? 'available' : 'taken');
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [username, current]);
  return status;
}

export const usernameMessage: Record<UsernameStatus, string | null> = {
  idle: null,
  checking: 'Checking…',
  available: 'is available',
  taken: 'That username is taken.',
  invalid: '3–24 characters: letters, numbers, dots and underscores.',
};
