import { createStore } from 'jotai';

/**
 * The one Jotai store for the app.
 * - React components read/write atoms through <Provider store={store}> (main.tsx) with useAtom / useAtomValue / useSetAtom.
 * - Plain modules (data/api.ts, toast(), go()) use store.get / store.set directly.
 */
export const store = createStore();
