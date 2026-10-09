import { flushSync } from 'react-dom';
import type { createBrowserRouter } from 'react-router';
import { store } from '../state/store';
import { activeCoverAtom, type ActiveCover } from '../state/cover';

type Router = ReturnType<typeof createBrowserRouter>;

/**
 * Web version of the app's shared-element cover transition, built on the
 * View Transitions API. Exactly one element per page may carry
 * `view-transition-name: book-cover`:
 *   - the cover that was tapped (identified by `key`, e.g. "feed:p_123"), and
 *   - the hero cover on the detail page of `postId`.
 * The browser morphs one into the other on navigation — forwards and back.
 * Browsers without the API simply navigate without the morph.
 */
export type NavDirection = 'push' | 'pop' | 'fade' | 'up' | 'down';

const supportsVT = () => typeof document !== 'undefined' && 'startViewTransition' in document;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let routerRef: Router | null = null;
export const bindRouter = (r: Router) => {
  routerRef = r;
};

/** Tells the CSS which page animation to run (slide in, slide back, fade, sheet up/down). */
export function setDirection(dir: NavDirection) {
  document.documentElement.dataset.nav = dir;
}

/** Navigate with an app-style transition. */
export function go(to: string, opts: { dir?: NavDirection; replace?: boolean; cover?: ActiveCover } = {}) {
  if (!routerRef) {
    return;
  }
  const r = routerRef;
  if (opts.cover) {
    // Name the tapped cover *before* the old page is snapshotted.
    flushSync(() => store.set(activeCoverAtom, opts.cover!));
  }
  setDirection(opts.dir ?? 'push');
  if (!supportsVT() || reducedMotion()) {
    void r.navigate(to, { replace: opts.replace });
    return;
  }
  void r.navigate(to, { replace: opts.replace, viewTransition: true });
}

/**
 * In-app back button. React Router replays a view transition when going back
 * to an entry that was pushed with `viewTransition`, so all we do is flag the
 * direction (slide back + cover morphs home) and step back in history.
 */
export function back(fallback = '/feed') {
  if ((window.history.state?.idx ?? 0) > 0) {
    setDirection('pop');
    window.history.back();
  } else {
    go(fallback, { dir: 'pop', replace: true });
  }
}

/** Browser back/forward buttons and swipe gestures animate as "back" too. */
export function installPopDirection() {
  window.addEventListener('popstate', () => setDirection('pop'));
}
