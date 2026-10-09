import { useEffect, useMemo, useRef } from 'react';
import { PostCard } from '../components/PostCard';
import { Avatar, EmptyShelf, Em, ErrorState, PostCardSkeleton, Wordmark } from '../components/ui';
import { useFeed, useMe } from '../hooks/queries';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { go } from '../navigation/transition';

export function Feed() {
  const { data: me } = useMe();
  const feed = useFeed();
  const posts = useMemo(() => feed.data?.pages.flatMap(p => p.items) ?? [], [feed.data]);
  const sentinel = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(() => feed.refetch());

  // Infinite scroll: load the next page when the sentinel comes within a screen of view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage(), { rootMargin: '800px' });
    io.observe(el);
    return () => io.disconnect();
  }, [feed]);

  return (
    <main className="page page--tabbed">
      <div className="ptr" style={{ height: refreshing ? 56 : pull, opacity: refreshing ? 1 : Math.min(1, pull / 70) }} aria-hidden={!refreshing}>
        <span className="spinner" style={{ color: 'var(--muted)', animationPlayState: refreshing || pull > 70 ? 'running' : 'paused', transform: `rotate(${pull * 4}deg)` }} />
      </div>
      <div className="content">
        <header className="row between feed-head">
          <span className="feed-brand">
            <Wordmark size={32} />
          </span>
          {me ? (
            <button type="button" className="press feed-me" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Your shelf" onClick={() => go('/shelf', { dir: 'fade' })}>
              <Avatar user={me} size={36} />
            </button>
          ) : null}
        </header>
        <div className="stack gap-4 hairline-b feed-intro" style={{ padding: '0 20px 18px' }}>
          <h1 className="t-heading" style={{ fontSize: 26 }}>
            Fresh off the <Em>nightstand.</Em>
          </h1>
          <p className="t-small c-muted">What readers finished this week</p>
        </div>

        {feed.isPending ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : feed.isError ? (
          <ErrorState message={(feed.error as Error).message} onRetry={() => feed.refetch()} />
        ) : posts.length === 0 ? (
          <EmptyShelf
            title={
              <>
                The feed is <Em>quiet.</Em>
              </>
            }
            message="Be the first to share what you finished."
            actionLabel="Share a book"
            onAction={() => go('/share', { dir: 'up' })}
          />
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
        <div ref={sentinel} />
        {feed.isFetchingNextPage ? <PostCardSkeleton /> : null}
        {!feed.hasNextPage && posts.length > 0 ? <p className="t-small c-subtle center" style={{ padding: 28 }}>You’re all caught up.</p> : null}
      </div>
    </main>
  );
}
