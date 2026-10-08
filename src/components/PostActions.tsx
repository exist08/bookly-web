import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookCover } from './BookCover';
import { Icon, type IconName } from './Icon';
import { Button } from './ui';
import { Dialog, Sheet } from './Sheet';
import { toast } from './Toast';
import { useDeletePost } from '../hooks/queries';
import { useSession } from '../store/session';
import { go } from '../store/transition';
import { sharePost } from '../utils/share';
import { compactNumber, timeAgoLong } from '../utils/format';
import type { PostView } from '../types/models';

interface Ctx {
  open: (post: PostView, opts?: { onDeleted?: () => void }) => void;
}
const C = createContext<Ctx>({ open: () => {} });
export const usePostActions = () => useContext(C);

/** One "…" sheet for every post. Owners: Edit / Share / Delete (confirmed). Others: Share / View shelf. */
export function PostActionsProvider({ children }: { children: ReactNode }) {
  const { userId } = useSession();
  const [post, setPost] = useState<PostView | null>(null);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const onDeleted = useRef<(() => void) | undefined>(undefined);
  const del = useDeletePost();

  const open = useCallback<Ctx['open']>((p, opts) => {
    setPost(p);
    onDeleted.current = opts?.onDeleted;
    setSheet(true);
  }, []);
  const value = useMemo(() => ({ open }), [open]);
  const mine = !!post && post.authorId === userId;
  const close = () => setSheet(false);
  const then = (fn: () => void) => {
    close();
    setTimeout(fn, 180);
  };

  return (
    <C.Provider value={value}>
      {children}
      <Sheet open={sheet} onClose={close} label="Post options">
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
                      onDeleted.current?.();
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
    </C.Provider>
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
