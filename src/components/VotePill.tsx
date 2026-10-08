import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { useVote } from '../hooks/queries';
import { compactNumber } from '../utils/format';
import type { PostView } from '../types/models';

export function VotePill({ post }: { post: PostView }) {
  const vote = useVote();
  const [bump, setBump] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 320);
    return () => clearTimeout(t);
  }, [post.score]);

  const up = post.myVote === 1;
  const down = post.myVote === -1;
  const cast = (v: 1 | -1) => {
    navigator.vibrate?.(8);
    vote.mutate({ post, value: post.myVote === v ? 0 : v });
  };
  const color = up ? 'var(--accent-text)' : down ? 'var(--downvote)' : 'var(--text)';

  return (
    <div className="vote">
      <button type="button" className="up press" aria-label="Upvote" aria-pressed={up} onClick={() => cast(1)}>
        <Icon name="upvote" size={20} filled={up} />
      </button>
      <span className={`vote__count ${bump ? 'bump' : ''}`} style={{ color }} aria-label={`Score ${post.score}`}>
        {compactNumber(post.score)}
      </span>
      <button type="button" className="down press" aria-label="Downvote" aria-pressed={down} onClick={() => cast(-1)}>
        <Icon name="downvote" size={20} filled={down} />
      </button>
    </div>
  );
}
