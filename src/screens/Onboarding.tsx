import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookCover } from '../components/BookCover';
import { Icon } from '../components/Icon';
import { Avatar, Button, Em, Wordmark } from '../components/ui';
import { PALETTES } from '../data/seed';
import { session } from '../store/session';
import { go } from '../store/transition';

type Slide = { key: string; title: ReactNode; body: string; tint: string; art: ReactNode };

function ShareArt() {
  return (
    <div style={{ position: 'relative' }}>
      <div className="card stack gap-10" style={{ width: 232, padding: 14, borderRadius: 22, transform: 'rotate(-4deg)', boxShadow: '0 24px 50px -24px rgba(20,16,10,.45)' }}>
        <div className="row gap-8">
          <Avatar user={{ displayName: 'You', avatarUri: null, avatarColor: '#3D5A80' }} size={28} />
          <span className="t-label">You</span>
          <span className="t-caption c-subtle">· just now</span>
        </div>
        <div style={{ height: 200, borderRadius: 14, background: 'var(--stage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookCover title="Walden" author="H. D. Thoreau" palette={PALETTES.walden} width={116} />
        </div>
        <span className="t-heading">Walden</span>
        <span className="t-caption c-muted">Two years in a cabin, and somehow it is about my phone.</span>
      </div>
      <span style={{ position: 'absolute', right: -18, bottom: 30, width: 52, height: 52, borderRadius: 26, background: 'var(--inverse)', color: 'var(--on-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="plus" size={24} strokeWidth={2} />
      </span>
    </div>
  );
}

function PeopleArt() {
  const items = [
    { p: PALETTES.eyre, t: 'Jane Eyre', a: 'C. Brontë', who: 'Mira', c: '#2F4A3A', r: -6, y: 18 },
    { p: PALETTES.odyssey, t: 'The Odyssey', a: 'Homer', who: 'Kabir', c: '#8C5F12', r: 0, y: -10 },
    { p: PALETTES.little, t: 'Little Women', a: 'Alcott', who: 'Ines', c: '#6B2E3A', r: 6, y: 18 },
  ];
  return (
    <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
      {items.map(i => (
        <div key={i.t} className="stack gap-10" style={{ alignItems: 'center', transform: `rotate(${i.r}deg) translateY(${i.y}px)` }}>
          <BookCover title={i.t} author={i.a} palette={i.p} width={96} />
          <span className="row gap-6 t-label" style={{ padding: '4px 10px 4px 4px', borderRadius: 999, background: 'var(--surface)', boxShadow: '0 6px 14px -8px rgba(20,16,10,.4)' }}>
            <Avatar user={{ displayName: i.who, avatarUri: null, avatarColor: i.c }} size={24} />
            {i.who}
          </span>
        </div>
      ))}
    </div>
  );
}

function VoteArt() {
  return (
    <div style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', left: 26, top: 36, transform: 'rotate(-10deg)' }}>
        <BookCover title="Frankenstein" author="Mary Shelley" palette={PALETTES.frank} width={92} />
      </div>
      <div style={{ position: 'absolute', right: 24, top: 60, transform: 'rotate(9deg)' }}>
        <BookCover title="The Great Gatsby" author="Fitzgerald" palette={PALETTES.gatsby} width={92} />
      </div>
      <div className="row gap-6" style={{ marginTop: 150, padding: 6, borderRadius: 999, background: 'var(--surface)', boxShadow: '0 24px 40px -18px rgba(20,16,10,.5)' }}>
        <span style={{ width: 64, height: 56, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="upvote" size={30} filled />
        </span>
        <span className="t-display" style={{ minWidth: 76, textAlign: 'center' }}>
          1.2k
        </span>
        <span style={{ width: 64, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <Icon name="downvote" size={30} />
        </span>
      </div>
    </div>
  );
}

const slides: Slide[] = [
  { key: 'share', title: <>Share what you <Em>finish.</Em></>, body: 'Snap the cover, say what stayed with you. A post takes less time than the last chapter did.', tint: 'var(--onb-1)', art: <ShareArt /> },
  { key: 'people', title: <>Find books through <Em>people.</Em></>, body: 'Browse the shelves of readers you trust instead of an algorithm that has never read a page.', tint: 'var(--onb-2)', art: <PeopleArt /> },
  { key: 'vote', title: <>Vote the good ones <Em>up.</Em></>, body: 'Upvote the reviews that made you want the book. The best ones rise to the top of the feed.', tint: 'var(--onb-3)', art: <VoteArt /> },
];

/** Swipeable three-slide intro (CSS scroll-snap), with dots, Skip and Next. */
export function Onboarding() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) {
      return;
    }
    const on = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);

  const finish = () => {
    session.finishOnboarding();
    go('/welcome', { dir: 'fade', replace: true });
  };
  const next = () => track.current?.scrollTo({ left: (index + 1) * track.current.clientWidth, behavior: 'smooth' });
  const last = index === slides.length - 1;

  return (
    <main className="page page--plain">
      <div className="content stack" style={{ flex: 1, maxWidth: 560 }}>
        <div className="row between" style={{ height: 56, padding: '0 16px 0 24px' }}>
          <Wordmark size={24} />
          {!last ? (
            <button type="button" className="press t-strong c-2" style={{ height: 44, padding: '0 8px' }} onClick={finish}>
              Skip
            </button>
          ) : null}
        </div>
        <div ref={track} className="onb-track" aria-roledescription="carousel">
          {slides.map((s, i) => (
            <section key={s.key} className="onb-slide" aria-roledescription="slide" aria-label={`${i + 1} of 3`}>
              <div className="onb-art">
                <span className="onb-halo" style={{ background: s.tint }} />
                <div className={index === i ? 'onb-art__in' : 'onb-art__out'}>{s.art}</div>
              </div>
              <div className="stack gap-14" style={{ padding: '0 28px' }}>
                <span className="t-overline c-accent">0{i + 1} / 03</span>
                <h1 className="t-display">{s.title}</h1>
                <p className="t-body c-muted">{s.body}</p>
              </div>
            </section>
          ))}
        </div>
        <div className="row between mt-auto" style={{ padding: '16px 24px 20px 28px' }}>
          <div className="row gap-6" aria-label={`Step ${index + 1} of 3`}>
            {slides.map((s, i) => (
              <span key={s.key} style={{ height: 7, width: i === index ? 22 : 7, borderRadius: 4, background: 'var(--text)', opacity: i === index ? 1 : 0.3, transition: 'width .3s, opacity .3s' }} />
            ))}
          </div>
          {last ? (
            <Button label="Get started" icon="arrowRight" onClick={finish} />
          ) : (
            <button type="button" className="press" aria-label="Next" onClick={next} style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--inverse)', color: 'var(--on-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrowRight" size={24} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
