import type { ReactNode } from 'react';
import { BookCover } from '../components/BookCover';
import { PALETTES } from '../data/seed';

export function CoverFan({ scale = 1 }: { scale?: number }) {
  const fan = [
    { t: 'The Odyssey', a: 'Homer', p: PALETTES.odyssey, w: 150, x: -82, y: 42, r: -9, d: 'd1' },
    { t: 'Moby-Dick', a: 'Herman Melville', p: PALETTES.moby, w: 150, x: 82, y: 42, r: 8, d: 'd2' },
    { t: 'Middlemarch', a: 'George Eliot', p: PALETTES.middlemarch, w: 176, x: 0, y: 0, r: 0, d: '' },
  ];
  return (
    <div style={{ position: 'relative', height: 360 * scale, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
      <span style={{ position: 'absolute', width: 300 * scale, height: 300 * scale, borderRadius: '50%', background: 'var(--onb-1)' }} />
      {fan.map(b => (
        <div key={b.t} style={{ position: 'absolute', transform: `translate(${b.x * scale}px, ${b.y * scale}px) rotate(${b.r}deg)` }}>
          <div className={`rise ${b.d}`}>
            <BookCover title={b.t} author={b.a} palette={b.p} width={b.w * scale} elevation="high" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Phones: the screen as-is. Desktop: illustration on the left, the form centred on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="split">
      <aside className="split__art">
        <CoverFan scale={1.25} />
      </aside>
      <div className="split__main">{children}</div>
    </div>
  );
}
