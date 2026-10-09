import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { BookCover } from './BookCover';
import { Icon, type IconName } from './Icon';
import { Button } from './ui';
import { Dialog, Sheet } from './Sheet';
import { toast } from '../state/toast';
import { useDeletePost } from '../hooks/queries';
import { userIdAtom } from '../state/session';
import { closePostActionsAtom, openPostActionsAtom, postActionsAtom } from '../state/postActions';
import { go } from '../navigation/transition';
import { sharePost } from '../utils/share';
import { compactNumber, timeAgoLong } from '../utils/format';

/** Open the "…" sheet for a post from anywhere: const open = usePostActions(); open({ post, onDeleted }). */
export const usePostActions = () => useSetAtom(openPostActionsAtom);

/** One "…" sheet for every post, mounted once in the signed-in shell. Owners: Edit / Share / Delete (confirmed). Others: Share / View shelf. */
export function PostActionsSheet() {
  const userId = useAtomValue(userIdAtom);
  const { open, post, onDeleted } = useAtomValue(postActionsAtom);
  const close = useSetAtom(closePostActionsAtom);
  const [confirm, setConfirm] = useState(false);
  const del = useDeletePost();
  const mine = !!post && post.authorId === userId;
  const then = (fn: () => void) => {
    close();
    setTimeout(fn, 180);
  };

  return (
    <>
      <Sheet open={open} onClose={close} label="Post options">
        {post ? (
          <div className="stack gap-14">
            <div className="row gap-14 hairline-b" style={{ padding: '4px 8px 14px' }}>
              <BookCover title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width={52} />
              <div className="stack gap-4 grow">
                <span className="t-heading" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.bookTitle}
                </span>
                <span className="t-caption c-subtle">
                  {mine ? 'Your post' : post.author.displayName} · {timeAgoLong(post.createdAt)} · {compactNumber(post.upvotes)} upvotes
                </span>
              </div>
            </div>
            <div className="list-group">
              {mine ? <Row icon="edit" label="Edit post" onClick={() => then(() => go(`/p/${post.id}/edit`, { dir: 'up' }))} /> : null}
              <Row icon="share" label="Share post" onClick={() => then(() => sharePost(post))} />
              {!mine ? <Row icon="user" label={`View ${post.author.displayName.split(' ')[0]}’s shelf`} onClick={() => then(() => go(`/u/${post.authorId}`))} /> : null}
            </div>
            {mine ? (
              <div className="list-group">
                <Row icon="trash" label="Delete post" danger onClick={() => then(() => setConfirm(true))} />
              </div>
            ) : null}
            <Button label="Cancel" variant="soft" size="md" onClick={close} />
          </div>
        ) : null}
      </Sheet>
      <Dialog open={confirm} onClose={() => setConfirm(false)} label="Delete post">
        {post ? (
          <>
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <BookCover title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width={72} />
              <span style={{ position: 'absolute', right: -14, bottom: -10, width: 36, height: 36, borderRadius: 18, border: '3px solid var(--bg)', background: 'var(--danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={16} />
              </span>
            </div>
            <h2 className="t-title">Delete this post?</h2>
            <p className="t-small c-muted">
              Your post on <em>{post.bookTitle}</em> and its {post.upvotes} upvotes will be removed for everyone. This can’t be undone.
            </p>
            <div className="stack gap-8" style={{ alignSelf: 'stretch', marginTop: 10 }}>
              <Button
                label="Delete post"
                variant="danger"
                size="md"
                loading={del.isPending}
                onClick={() =>
                  del.mutate(post, {
                    onSuccess: () => {
                      setConfirm(false);
                      toast.success('Post deleted');
                      onDeleted?.();
                    },
                    onError: e => toast.error((e as Error).message),
                  })
                }
              />
              <Button label="Keep it" variant="soft" size="md" onClick={() => setConfirm(false)} />
            </div>
          </>
        ) : null}
      </Dialog>
    </>
  );
}

function Row({ icon, label, onClick, danger }: { icon: IconName; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" className="list-row press" onClick={onClick} style={{ justifyContent: 'flex-start', gap: 14, color: danger ? 'var(--danger)' : 'var(--text)', fontWeight: 600 }}>
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}
