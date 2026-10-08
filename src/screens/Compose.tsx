import { useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { BookCover } from '../components/BookCover';
import { Icon } from '../components/Icon';
import { Button, Em, ModalBar } from '../components/ui';
import { toast } from '../components/Toast';
import { findCachedPost } from '../hooks/cache';
import { useCreatePost, useUpdatePost } from '../hooks/queries';
import { COVER_PALETTES } from '../data/seed';
import { ApiError } from '../data/api';
import { go, back } from '../store/transition';
import { pickImage } from '../utils/image';
import { compactNumber, timeAgoLong } from '../utils/format';

const MAX = 500;

/** Share a book (/share) or edit one (/p/:id/edit). Slides up like a modal. */
export function Compose() {
  const { id } = useParams();
  const qc = useQueryClient();
  const editing = useMemo(() => (id ? findCachedPost(qc, id) : undefined), [qc, id]);
  const create = useCreatePost();
  const update = useUpdatePost();
  const [cover, setCover] = useState<string | null>(editing?.coverUri ?? null);
  const [title, setTitle] = useState(editing?.bookTitle ?? '');
  const [author, setAuthor] = useState(editing?.bookAuthor ?? '');
  const [review, setReview] = useState(editing?.review ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const palette = editing?.coverPalette ?? COVER_PALETTES[(title.length * 7) % COVER_PALETTES.length];
  const dirty = editing
    ? cover !== editing.coverUri || title !== editing.bookTitle || author !== (editing.bookAuthor ?? '') || review !== editing.review
    : !!(cover || title || author || review);
  const ready = !!title.trim() && !!review.trim();
  const pending = create.isPending || update.isPending;

  if (id && !editing) {
    return (
      <main className="page page--plain" style={{ alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, textAlign: 'center' }}>
        <h1 className="t-title">Nothing to edit here.</h1>
        <Button label="Back to your shelf" variant="secondary" size="md" onClick={() => go('/shelf', { dir: 'down', replace: true })} />
      </main>
    );
  }

  const close = () => {
    if (dirty && !pending && !window.confirm(editing ? 'Discard your changes?' : 'Discard this post?')) {
      return;
    }
    back(editing ? `/p/${editing.id}` : '/feed');
  };

  const onError = (e: unknown) => (e instanceof ApiError && e.field ? setErrors({ [e.field]: e.message }) : toast.error((e as Error).message));

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const input = { bookTitle: title, bookAuthor: author || null, review, coverUri: cover, coverPalette: palette };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess: () => (toast.success('Post updated'), back(`/p/${editing.id}`)), onError });
    } else {
      create.mutate(input, { onSuccess: () => (toast.success('Shared to the feed'), go('/feed', { dir: 'down', replace: true })), onError });
    }
  };

  const pick = async (camera: boolean) => {
    const u = await pickImage('cover', camera);
    if (u) {
      setCover(u);
    }
  };

  return (
    <main className="page page--plain">
      <ModalBar title={editing ? 'Edit post' : 'Share a book'} onCancel={close} actionLabel={editing ? 'Save' : 'Post'} onAction={() => submit()} disabled={!ready || (editing ? !dirty : false)} loading={pending} />
      <form className="content stack" style={{ padding: '24px 24px 40px', maxWidth: 600 }} onSubmit={submit} noValidate>
        <div className="row gap-18" style={{ alignItems: 'flex-start', gap: 18 }}>
          {cover || title ? (
            <button type="button" className="press rise" style={{ position: 'relative' }} onClick={() => pick(false)} aria-label={cover ? 'Change cover photo' : 'Add a cover photo'}>
              <BookCover title={title || 'Untitled'} author={author} uri={cover} palette={palette} width={132} />
              <span style={{ position: 'absolute', right: -10, bottom: -10, width: 40, height: 40, borderRadius: 20, border: '3px solid var(--bg)', background: 'var(--inverse)', color: 'var(--on-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="camera" size={17} />
              </span>
            </button>
          ) : (
            <button type="button" className="press" onClick={() => pick(false)} aria-label="Add a book cover" style={{ width: 132, aspectRatio: '2/3', borderRadius: 6, border: '1.5px dashed var(--border-dashed)', background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="image" size={22} />
              </span>
              <span className="t-label">Add cover</span>
            </button>
          )}
          <div className="stack gap-8 grow" style={{ paddingTop: 4 }}>
            {editing ? (
              <>
                <span className="t-overline c-subtle">Posted {timeAgoLong(editing.createdAt)}</span>
                <span className="row gap-6 t-small t-strong">
                  <Icon name="upvote" size={16} filled color="var(--accent)" />
                  {compactNumber(editing.upvotes)} upvotes
                </span>
                <span className="t-caption c-muted">Votes stay with the post when you edit it.</span>
              </>
            ) : (
              <>
                <h2 className="t-heading">
                  The cover does the <Em>talking.</Em>
                </h2>
                <p className="t-caption c-muted">{cover ? 'Looking sharp.' : 'Snap your copy or pick a photo. No photo? We’ll set one in type for you.'}</p>
              </>
            )}
            <div className="stack gap-8" style={{ alignItems: 'flex-start', marginTop: 6 }}>
              <Button label="Take photo" icon="camera" variant="secondary" size="sm" onClick={() => pick(true)} />
              <Button label={cover ? 'Replace photo' : 'Choose photo'} icon="image" variant="secondary" size="sm" onClick={() => pick(false)} />
              {cover ? <Button label="Remove photo" icon="trash" variant="ghost" size="sm" onClick={() => setCover(null)} /> : null}
            </div>
          </div>
        </div>

        <div className="stack gap-24" style={{ marginTop: 30 }}>
          <label className="underline-field" style={errors.bookTitle ? { borderColor: 'var(--danger)' } : undefined}>
            <span className="t-overline c-subtle">Book title</span>
            <input className="serif" value={title} maxLength={200} placeholder="What did you finish?" onChange={e => (setTitle(e.target.value), setErrors({}))} />
            {errors.bookTitle ? <span className="t-caption c-danger">{errors.bookTitle}</span> : null}
          </label>
          <label className="underline-field">
            <span className="t-overline c-subtle">
              Author <span className="t-caption" style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </span>
            <input value={author} maxLength={120} placeholder="Who wrote it?" onChange={e => setAuthor(e.target.value)} />
          </label>
          <label className="stack gap-8">
            <span className="row between">
              <span className="t-overline c-subtle">Your take</span>
              <span className="t-label" style={{ color: review.length > MAX - 50 ? 'var(--danger)' : 'var(--subtle)', fontVariantNumeric: 'tabular-nums' }}>
                {review.length} / {MAX}
              </span>
            </span>
            <span className={`field__box ${errors.review ? 'field__box--error' : ''}`} style={{ padding: '4px 16px' }}>
              <textarea value={review} rows={7} placeholder="Why should someone else read it — or skip it?" onChange={e => (setReview(e.target.value.slice(0, MAX)), setErrors({}))} style={{ minHeight: 170 }} />
            </span>
            {errors.review ? <span className="t-caption c-danger">{errors.review}</span> : null}
          </label>
        </div>

        <p className="row gap-10 t-caption c-muted" style={{ marginTop: 26 }}>
          <Icon name="info" size={18} />
          Posts are public. You can edit or delete yours any time from your shelf.
        </p>
      </form>
    </main>
  );
}
