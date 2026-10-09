import { atom } from 'jotai';
import type { PostView } from '../types/models';

/**
 * The "…" sheet for a post. `post` stays set after closing so the sheet can
 * animate out (and the delete dialog can still show it).
 */
interface PostActionsState {
  open: boolean;
  post: PostView | null;
  onDeleted?: () => void;
}
export const postActionsAtom = atom<PostActionsState>({ open: false, post: null });

/** Write-only: open the sheet for a post. */
export const openPostActionsAtom = atom(null, (_get, set, target: { post: PostView; onDeleted?: () => void }) =>
  set(postActionsAtom, { ...target, open: true }),
);

/** Write-only: close the sheet (keeps the post for the exit animation). */
export const closePostActionsAtom = atom(null, (get, set) => set(postActionsAtom, { ...get(postActionsAtom), open: false }));
