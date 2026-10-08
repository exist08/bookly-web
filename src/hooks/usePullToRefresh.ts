import { useEffect, useRef, useState } from 'react';

/** Native-style pull-to-refresh for touch screens: pull down at the top of the page past 70px to refresh. */
export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<number | null>(null);
  const cb = useRef(onRefresh);
  cb.current = onRefresh;

  useEffect(() => {
    const down = (e: TouchEvent) => {
      start.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const move = (e: TouchEvent) => {
      if (start.current === null) {
        return;
      }
      const dy = e.touches[0].clientY - start.current;
      setPull(dy > 0 ? Math.min(110, dy * 0.5) : 0);
    };
    const up = async () => {
      if (start.current === null) {
        return;
      }
      start.current = null;
      setPull(p => {
        if (p > 70) {
          setRefreshing(true);
          navigator.vibrate?.(10);
          cb.current().finally(() => setRefreshing(false));
        }
        return 0;
      });
    };
    window.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('touchstart', down);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);

  return { pull, refreshing };
}
