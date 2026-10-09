import { atom } from 'jotai';

/**
 * The book cover currently "in flight" for the View Transition morph.
 * `key` identifies the tapped cover (e.g. "feed:p_123"); `postId` the detail page's hero.
 * BookCover gives `view-transition-name: book-cover` only to the matching pair.
 */
export interface ActiveCover {
  key: string;
  postId: string;
}
export const activeCoverAtom = atom<ActiveCover | null>(null);
