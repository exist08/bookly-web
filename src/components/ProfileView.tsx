import { useMemo, type ReactNode } from 'react';
import { Avatar, Button, EmptyShelf, ErrorState, SkeletonBlock, Em } from './ui';
import { ShelfGrid } from './ShelfGrid';
import { usePostActions } from './PostActions';
import { useProfile, useUserPosts } from '../hooks/queries';
import { compactNumber } from '../utils/format';
import { shareProfile } from '../utils/share';
import { go } from '../navigation/transition';

export function ProfileView({ userId, isMe, scope, header }: { userId: string; isMe: boolean; scope: string; header: ReactNode }) {
  const profile = useProfile(userId);
  const posts = useUserPosts(userId);
  const openActions = usePostActions();
  const list = useMemo(() => posts.data?.pages.flatMap(p => p.items) ?? [], [posts.data]);
  const user = profile.data?.user;
  const stats = profile.data?.stats;

  if (profile.isError) {
    return (
      <>
        {header}
        <ErrorState message={(profile.error as Error).message} onRetry={() => profile.refetch()} />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="content">
        {!user || !stats ? (
          <div className="stack gap-12 pulse" style={{ alignItems: 'center', padding: '24px 0' }}>
            <SkeletonBlock w={96} h={96} r={48} />
            <SkeletonBlock w={180} h={28} />
            <SkeletonBlock w={240} h={14} alt />
          </div>
        ) : isMe ? (
          <div className="stack gap-14 pad rise" style={{ paddingTop: 8, paddingLeft: 24, paddingRight: 24 }}>
            <div className="row gap-16">
              <Avatar user={user} size={88} />
              <div className="stack gap-6 grow">
                <h1 className="t-title">{user.displayName}</h1>
                <span className="t-small c-muted">
                  <b style={{ color: 'var(--text)' }}>{stats.books}</b> books · <b style={{ color: 'var(--text)' }}>{compactNumber(stats.upvotes)}</b> upvotes
                </span>
              </div>
            </div>
            {user.bio ? <p className="t-body c-2">{user.bio}</p> : null}
            <div className="row gap-10">
              <Button label="Edit profile" size="md" className="grow" onClick={() => go('/settings', { dir: 'up' })} />
              <Button label="Share profile" variant="secondary" size="md" className="grow" onClick={() => shareProfile(user)} />
            </div>
          </div>
        ) : (
          <div className="stack rise" style={{ alignItems: 'center', padding: '12px 24px 0', textAlign: 'center' }}>
            <span className="avatar-ring">
              <Avatar user={user} size={96} />
            </span>
            <h1 className="t-display" style={{ marginTop: 14 }}>
              {user.displayName}
            </h1>
            {user.bio ? (
              <p className="t-body c-muted" style={{ marginTop: 8, maxWidth: 320 }}>
                {user.bio}
              </p>
            ) : null}
            <div className="row hairline-t hairline-b" style={{ alignSelf: 'stretch', marginTop: 22, padding: '16px 0' }}>
              <Stat value={String(stats.books)} label="Books shared" />
              <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
              <Stat value={compactNumber(stats.upvotes)} label="Upvotes earned" />
              <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
              <Stat value={String(new Date(user.createdAt).getFullYear())} label="Reading since" />
            </div>
          </div>
        )}

        <div className={`row between ${isMe ? 'hairline-t' : ''}`} style={{ margin: '26px 24px 16px', paddingTop: 18, alignItems: 'baseline' }}>
          <h2 className="t-title" style={{ fontSize: 26 }}>
            {isMe ? 'Your shelf' : 'The shelf'}
          </h2>
          <span className="t-caption c-subtle">{stats ? `${stats.books} book${stats.books === 1 ? '' : 's'}` : ''}</span>
        </div>

        {posts.isPending ? (
          <div className="shelf pulse">
            {[0, 1, 2].map(i => (
              <div key={i} className="sk" style={{ aspectRatio: '2/3', borderRadius: 3 }} />
            ))}
          </div>
        ) : list.length ? (
          <ShelfGrid posts={list} scope={scope} onMore={isMe ? p => openActions({ post: p }) : undefined} />
        ) : isMe ? (
          <EmptyShelf
            title={
              <>
                Your shelf is <Em>waiting.</Em>
              </>
            }
            message="Share the last book you finished. It doesn’t have to be a classic — it just has to be yours."
            actionLabel="Share your first book"
            onAction={() => go('/share', { dir: 'up' })}
          />
        ) : (
          <EmptyShelf title="Nothing here yet." message={`${user?.displayName ?? 'This reader'} hasn’t shared a book yet.`} />
        )}
      </div>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stack grow" style={{ alignItems: 'center', gap: 2 }}>
      <span className="t-title">{value}</span>
      <span className="t-caption c-subtle">{label}</span>
    </div>
  );
}
