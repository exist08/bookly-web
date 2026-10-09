import type { CSSProperties } from 'react';
import { useAtomValue } from 'jotai';
import { activeCoverAtom } from '../state/cover';
import type { CoverPalette } from '../types/models';

interface Props {
  title: string;
  author?: string | null;
  uri?: string | null;
  palette: CoverPalette;
  width: number | string;
  elevation?: 'none' | 'low' | 'high';
  /**
   * Shared-transition identity. A list cover passes `key` ("feed:p_1"); the
   * detail hero passes `heroFor` (its post id). Only the matching one gets
   * `view-transition-name: book-cover`, so the browser morphs exactly one pair.
   */
  transitionKey?: string;
  heroFor?: string;
}

/** The reader's photo, or a typographic cover set in the post's palette. Sizes itself with container units. */
export function BookCover({ title, author, uri, palette, width, elevation = 'low', transitionKey, heroFor }: Props) {
  const active = useAtomValue(activeCoverAtom);
  const named = !!active && ((transitionKey && active.key === transitionKey) || (heroFor && active.postId === heroFor));
  const style: CSSProperties = {
    width,
    background: palette.bg,
    color: palette.fg,
    viewTransitionName: named ? 'book-cover' : undefined,
  };
  return (
    <div className={`cover ${elevation !== 'none' ? `cover--${elevation}` : ''}`} style={style} role="img" aria-label={`${title}${author ? ` by ${author}` : ''}, cover`}>
      {uri ? (
        <img src={uri} alt="" draggable={false} />
      ) : (
        <>
          <div className="cover__frame" />
          <div className="cover__content">
            {author ? <span className="cover__author">{author}</span> : <span />}
            <span className={`cover__title ${title.length > 11 ? 'cover__title--long' : ''}`}>{title}</span>
            <span className="cover__rule" />
          </div>
        </>
      )}
      <div className="cover__spine" />
    </div>
  );
}
