import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { BookCover } from '../components/BookCover';
import { Icon } from '../components/Icon';
import { openPost } from '../components/PostCard';
import { usePostActions } from '../components/PostActions';
import { Avatar, Button, IconButton } from '../components/ui';
import { VotePill } from '../components/VotePill';
import { findCachedPost } from '../hooks/cache';
import { usePost, useUserPosts } from '../hooks/queries';
import { useSession } from '../store/session';
import { back, go } from '../store/transition';
import { sharePost } from '../utils/share';
import { timeAgoLong } from '../utils/format';

function splitReview(review: string) {
  const m = review.match(/^(.{20,160}?[.!?…”])\s+([\s\S]+)$/);
  return !m || review.length < 140 ? { quote: null, rest: review } : { quote: m[1], rest: m[2] };
}

export function PostDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const initial = useMemo(() => findCachedPost(qc, id), [qc, id]);
  const { data: post, isError, error } = usePost(id, initial);
  const more = useUserPosts(post?.authorId);
  const { userId } = useSession();
  const actions = usePostActions();
  const others = useMemo(() => (more.data?.pages.flatMap(p => p.items) ?? []).filter(p => p.id !== id).slice(0, 10), [more.data, id]);

  useEffect(() => {
    if (post) {
      document.title = `${post.bookTitle} — ${post.author.displayName} on Bookly`;
    }
    return () => {
      document.title = 'Bookly';
    };
  }, [post]);

  if (!post) {
    return (
      <main className="page page--plain" style={{ alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, textAlign: 'center' }}>
        <h1 className="t-title">{isError ? 'This post is gone.' : 'Opening…'}</h1>
        {isError ? (
          <>
            <p className="t-small c-muted">{(error as Error).message}</p>
            <Button label="Back to the feed" variant="secondary" size="md" onClick={() => go('/feed', { dir: 'pop', replace: true })} />
          </>
        ) : null}
      </main>
    );
  }

  const { quote, rest } = splitReview(post.review);
  const mine = post.authorId === userId;
  const first = post.author.displayName.split(' ')[0];

  return (
    <main className="page page--plain" style={{ paddingTop: 0 }}>
      <div className="detail">
        <div className="hero">
          <div className="hero-bar">
            <IconButton icon="back" label="Back" glass onClick={() => back('/feed')} />
            <IconButton icon="more" label="More options" glass onClick={() => actions.open(post, { onDeleted: () => back('/feed') })} />
          </div>
          <div className="hero__tint" style={{ background: post.coverPalette.bg }} />
          <span className="hero__ring" style={{ width: 340, height: 340, top: 'calc(50% - 150px)' }} />
          <span className="hero__ring" style={{ width: 270, height: 270, top: 'calc(50% - 115px)' }} />
          <div style={{ width: 'min(200px, 52vw)' }} className="detail__cover">
            <BookCover heroFor={post.id} title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width="100%" elevation="high" />
          </div>
        </div>

        <div className="detail__body">
          <div className="action-card rise d2">
            <VotePill post={post} />
            <Button label="Share post" icon="share" size="sm" onClick={() => sharePost(post)} />
          </div>

          <div className="stack gap-6 rise d2" style={{ padding: '28px 24px 0' }}>
            {post.bookAuthor ? <span className="t-overline c-subtle">{post.bookAuthor}</span> : null}
            <h1 className="t-hero">{post.bookTitle}</h1>
          </div>

          <button type="button" className="reader-row press rise d3" onClick={() => go(`/u/${post.authorId}`)}>
            <Avatar user={post.author} size={40} />
            <span className="stack grow">
              <span className="t-small t-strong">{mine ? 'You' : post.author.displayName}</span>
              <span className="t-caption c-subtle">
                Finished it · shared {timeAgoLong(post.createdAt)}
                {post.updatedAt !== post.createdAt ? ' · edited' : ''}
              </span>
            </span>
            <Icon name="chevronRight" size={20} color="var(--subtle)" />
          </button>

          <article className="stack gap-14 rise d3" style={{ padding: '22px 24px 0' }}>
            {quote ? <p className="t-serif-body">{quote}</p> : null}
            {rest.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="t-body c-2">
                {para}
              </p>
            ))}
          </article>

          {others.length ? (
            <section className="stack gap-14" style={{ paddingTop: 36 }}>
              <div className="row between" style={{ padding: '0 24px' }}>
                <h2 className="t-heading">{mine ? 'More from your shelf' : `More from ${first}`}</h2>
                <button type="button" className="link" onClick={() => go(`/u/${post.authorId}`)}>
                  See shelf
                </button>
              </div>
              <div className="hscroll">
                {others.map(p => (
                  <button key={p.id} type="button" className="stack gap-8 press" style={{ width: 104, textAlign: 'left' }} onClick={() => openPost(p, `more-${id}`)}>
                    <BookCover transitionKey={`more-${id}:${p.id}`} title={p.bookTitle} author={p.bookAuthor} uri={p.coverUri} palette={p.coverPalette} width={104} />
                    <span className="t-label clamp-3">{p.bookTitle}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
