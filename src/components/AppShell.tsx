import { Outlet, useLocation } from 'react-router';
import { Icon } from './Icon';
import { Avatar, Wordmark } from './ui';
import { useMe } from '../hooks/queries';
import { go } from '../store/transition';

/**
 * Signed-in chrome. Phones: a floating bottom tab bar (Feed · Share a book · Shelf).
 * Tablets/desktop: the same destinations as a left rail, labels appear when there's room.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const { data: me } = useMe();
  const onFeed = pathname.startsWith('/feed');
  const onShelf = pathname.startsWith('/shelf');
  const tab = (to: string) => () => {
    if (pathname !== to) {
      go(to, { dir: 'fade' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const compose = () => go('/share', { dir: 'up' });
  // Like the app: the tab bar shows on the two tab screens only; pushed screens get the full height.
  const tabbed = onFeed || onShelf;

  return (
    <div className={`shell shell--tabs ${tabbed ? '' : 'shell--no-tabbar'}`}>
      <nav className="rail" aria-label="Primary">
        <button type="button" className="rail__brand press" onClick={tab('/feed')} aria-label="Bookly home">
          <span className="rail__label">
            <Wordmark size={30} />
          </span>
          <span className="rail__brand-mark" aria-hidden="true">
            <BrandMark />
          </span>
        </button>
        <button type="button" className="rail__item press" aria-current={onFeed ? 'page' : undefined} onClick={tab('/feed')}>
          <Icon name="home" size={24} filled={onFeed} />
          <span className="rail__label">Feed</span>
        </button>
        <button type="button" className="rail__item press" aria-current={onShelf ? 'page' : undefined} onClick={tab('/shelf')}>
          {me ? <Avatar user={me} size={26} /> : <Icon name="user" size={24} />}
          <span className="rail__label">Your shelf</span>
        </button>
        <button type="button" className="rail__share press" onClick={compose} aria-label="Share a book">
          <Icon name="plus" size={22} strokeWidth={2} />
          <span className="rail__label">Share a book</span>
        </button>
        <span className="rail__spacer" />
        <button type="button" className="rail__item press" aria-current={pathname.startsWith('/settings') ? 'page' : undefined} onClick={() => go('/settings', { dir: 'up' })}>
          <Icon name="sliders" size={22} />
          <span className="rail__label">Settings</span>
        </button>
      </nav>

      <Outlet />

      <nav className="tabbar" aria-label="Primary">
        <button type="button" className="tab press" aria-current={onFeed ? 'page' : undefined} onClick={tab('/feed')}>
          <Icon name="home" size={24} filled={onFeed} strokeWidth={onFeed ? 1.5 : 1.75} />
          Feed
        </button>
        <button type="button" className="share-cta press" onClick={compose}>
          <Icon name="plus" size={20} strokeWidth={2} />
          Share a book
        </button>
        <button type="button" className="tab press" aria-current={onShelf ? 'page' : undefined} onClick={tab('/shelf')}>
          <Icon name="user" size={24} filled={onShelf} strokeWidth={onShelf ? 1.5 : 1.75} />
          Shelf
        </button>
      </nav>
    </div>
  );
}

/** Small spines mark used where the full wordmark doesn't fit (the collapsed rail). */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="var(--inverse)" />
      <g transform="translate(118 132)">
        <rect x="0" y="62" width="44" height="186" rx="6" fill="#D9B26A" />
        <rect x="56" y="16" width="56" height="232" rx="6" fill="#F1E4C3" />
        <rect x="124" y="92" width="40" height="156" rx="6" fill="#C8553A" />
        <rect x="186" y="34" width="50" height="214" rx="6" fill="#8FA89A" transform="rotate(14 211 248)" />
      </g>
    </svg>
  );
}
