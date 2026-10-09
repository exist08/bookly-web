import { atom } from 'jotai';
import { store } from './store';

export type ToastKind = 'info' | 'success' | 'error';
export interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
}

/** Visible toasts (max 3). <Toaster /> renders this list. */
export const toastsAtom = atom<Toast[]>([]);

let seq = 0;
function push(text: string, kind: ToastKind = 'info') {
  const id = ++seq;
  store.set(toastsAtom, list => [...list.slice(-2), { id, text, kind }]);
  setTimeout(() => store.set(toastsAtom, list => list.filter(t => t.id !== id)), 2800);
}

/** Call from anywhere: toast('Saved'), toast.success(...), toast.error(...). */
export const toast = Object.assign((text: string) => push(text), {
  success: (text: string) => push(text, 'success'),
  error: (text: string) => push(text, 'error'),
});
