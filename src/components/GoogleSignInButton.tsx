import { useEffect, useRef, useState } from 'react';
import { loadGoogle, setGoogleCredentialHandler } from '../auth/google';
import { useAtomValue } from 'jotai';
import { isDarkAtom } from '../state/theme';
import { GoogleButton } from './ui';
import { toast } from '../state/toast';

/**
 * Google's official "Continue with Google" button (GIS renders it in an iframe),
 * sized to the column and themed to match light/dark. While the script loads —
 * or if it can't — Bookly's own button holds the space so the layout doesn't jump.
 */
export function GoogleSignInButton({ onCredential, loading }: { onCredential: (credential: string) => void; loading?: boolean }) {
  const isDark = useAtomValue(isDarkAtom);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const handlerRef = useRef(onCredential);
  handlerRef.current = onCredential;

  // This button receives the credential while it's mounted.
  useEffect(() => {
    const handler = (credential: string) => handlerRef.current(credential);
    setGoogleCredentialHandler(handler);
    return () => setGoogleCredentialHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const render = (id: Awaited<ReturnType<typeof loadGoogle>>) => {
      const slot = slotRef.current;
      const wrap = wrapRef.current;
      if (!slot || !wrap || cancelled) return;
      slot.replaceChildren();
      // GIS accepts 200–400 px.
      const width = Math.round(Math.min(400, Math.max(200, wrap.clientWidth)));
      id.renderButton(slot, {
        type: 'standard',
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'center',
        width,
      });
      setState('ready');
    };

    loadGoogle()
      .then(id => {
        render(id);
        // Re-fit when the column changes width (rotation, desktop resize).
        const ro = new ResizeObserver(() => render(id));
        if (wrapRef.current) ro.observe(wrapRef.current);
        cleanup = () => ro.disconnect();
      })
      .catch(() => !cancelled && setState('failed'));

    let cleanup = () => {};
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isDark]);

  return (
    <div ref={wrapRef} className="gsi-wrap" aria-busy={loading || state === 'loading' || undefined}>
      <div ref={slotRef} className="gsi-slot" hidden={state !== 'ready' || loading} />
      {(state !== 'ready' || loading) && (
        <GoogleButton
          loading={loading || state === 'loading'}
          onClick={() => toast.error('Google sign-in couldn’t load. Check your connection and try again.')}
        />
      )}
    </div>
  );
}
