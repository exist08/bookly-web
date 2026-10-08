import { useEffect, useState } from 'react';
import { Wordmark } from '../components/ui';

const SPINES = [
  { w: 14, h: 58, c: '#D9B26A' },
  { w: 18, h: 72, c: '#F1E4C3' },
  { w: 12, h: 50, c: '#C8553A' },
  { w: 16, h: 64, c: '#8FA89A' },
];

/** First-load splash (once per browser session), like the app's launch screen. */
export function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 1250);
    const b = setTimeout(onDone, 1600);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [onDone]);
  return (
    <div className={`splash ${leaving ? 'splash--out' : ''}`} aria-hidden="true">
      <div className="stack gap-24" style={{ alignItems: 'center' }}>
        <div className="splash__shelf">
          {SPINES.map((s, i) => (
            <span key={i} className="splash__spine" style={{ width: s.w, height: s.h, background: s.c, animationDelay: `${i * 70}ms` }} />
          ))}
          <span className="splash__spine splash__lean" style={{ width: 16, height: 62, background: '#D9B26A', animationDelay: '300ms' }} />
        </div>
        <span className="rise d3">
          <Wordmark size={58} color="#FAF7F0" dot="#D9B26A" />
        </span>
      </div>
      <p className="t-overline splash__tag rise d4">A reading room for everyone</p>
    </div>
  );
}
