import { atom } from 'jotai';
import { persistedAtom, sessionAtom } from './persist';
import { store } from './store';

/** Who is signed in (null = signed out). Saved, so a reload keeps you signed in. */
export const userIdAtom = persistedAtom<string | null>('session_user_id', null);

/** Seen the three onboarding slides? Decides /onboarding vs /welcome for signed-out visitors. */
export const hasOnboardedAtom = persistedAtom('has_onboarded', false);

/** Splash plays once per tab, like a cold start. */
export const splashSeenAtom = sessionAtom('splashed', false);

/** Derived: true when someone is signed in. */
export const isSignedInAtom = atom(get => get(userIdAtom) !== null);

/** For non-React code (the API layer): the current user id. */
export const getUserId = () => store.get(userIdAtom);
