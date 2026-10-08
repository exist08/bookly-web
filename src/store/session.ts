import { useSyncExternalStore } from 'react';
import { storage } from './storage';

/** Session + first-launch flags. A real deployment keeps tokens in an httpOnly cookie instead. */
interface SessionState {
  userId: string | null;
  hasOnboarded: boolean;
}

const USER_KEY = 'session_user_id';
const ONBOARDED_KEY = 'has_onboarded';

let state: SessionState = {
  userId: storage.getString(USER_KEY) ?? null,
  hasOnboarded: storage.getBoolean(ONBOARDED_KEY) ?? false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const session = {
  get: () => state,
  setUser(userId: string | null) {
    if (userId) {
      storage.set(USER_KEY, userId);
    } else {
      storage.remove(USER_KEY);
    }
    state = { ...state, userId };
    emit();
  },
  finishOnboarding() {
    storage.set(ONBOARDED_KEY, true);
    state = { ...state, hasOnboarded: true };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get, session.get);
}
