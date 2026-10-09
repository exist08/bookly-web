import { memo } from 'react';
import { BookCover } from './BookCover';
import { Icon } from './Icon';
import { Avatar, IconButton } from './ui';
import { VotePill } from './VotePill';
import { usePostActions } from './PostActions';
import { go } from '../navigation/transition';
import { sharePost } from '../utils/share';
import { timeAgo } from '../utils/format';
import type { PostView } from '../types/models';

export function openPost(post: PostView, scope: string) {
  go(`/p/${post.id}`, { cover: { key: `${scope}:${post.id}`, postId: post.id } });
}

function PostCardImpl({ post }: { post: PostView }) {
  const openActions = usePostActions();
  const open = () => openPost(post, 'feed');
  return (
    <article className="post">
      <div className="post__head">
        <button type="button" className="post__author press" onClick={() => go(`/u/${post.authorId}`)} aria-label={`${post.author.displayName}, view shelf`}>
          <Avatar user={post.author} size={38} />
          <span className="stack" style={{ minWidth: 0 }}>
            <span className="t-small t-strong">{post.author.displayName}</span>
            <span className="t-caption c-subtle">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </span>
          </span>
        </button>
        <IconButton icon="more" label="More options" color="var(--muted)" onClick={() => openActions({ post })} />
      </div>

      <button type="button" className="post__stage" onClick={open} aria-label={`Open ${post.bookTitle}`}>
        <div className="post__stage-tint" style={{ background: post.coverPalette.bg }} />
        <div className="post__stage-floor" />
        <BookCover transitionKey={`feed:${post.id}`} title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width={180} elevation="high" />
      </button>

      <div className="post__actions">
        <VotePill post={post} />
        <button type="button" className="pill-btn press" onClick={() => sharePost(post)} aria-label={`Share ${post.bookTitle}`}>
          <Icon name="share" size={18} />
          Share
        </button>
      </div>

      <button type="button" className="post__text" onClick={open}>
        <span className="post__title-row">
          <span className="t-title">{post.bookTitle}</span>
          {post.bookAuthor ? <span className="t-overline c-subtle">{post.bookAuthor}</span> : null}
        </span>
        <span className="t-body c-2 clamp-3">{post.review}</span>
      </button>
    </article>
  );
}

export const PostCard = memo(PostCardImpl);
