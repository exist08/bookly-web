import { BookCover } from './BookCover';
import { Icon } from './Icon';
import { openPost } from './PostCard';
import { compactNumber } from '../utils/format';
import type { PostView } from '../types/models';

/** Bookshelf grid used on profiles; 3 columns on phones, more on wider screens. */
export function ShelfGrid({ posts, scope, onMore }: { posts: PostView[]; scope: string; onMore?: (p: PostView) => void }) {
  return (
    <div className="shelf">
      {posts.map(p => (
        <div key={p.id} className="rise">
          <button type="button" className="press" style={{ width: '100%', display: 'block' }} onClick={() => openPost(p, scope)} aria-label={`Open ${p.bookTitle}`}>
            <BookCover transitionKey={`${scope}:${p.id}`} title={p.bookTitle} author={p.bookAuthor} uri={p.coverUri} palette={p.coverPalette} width="100%" />
          </button>
          <div className="shelf__meta">
            <span className="row gap-4 t-caption t-strong c-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <Icon name="upvote" size={13} filled color="var(--accent)" />
              {compactNumber(p.upvotes)}
            </span>
            {onMore ? (
              <button type="button" className="press" style={{ width: 36, height: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: 'var(--muted)' }} aria-label={`Manage ${p.bookTitle}`} onClick={() => onMore(p)}>
                <Icon name="more" size={18} />
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
