import { Button, Em } from '../components/ui';
import { go } from '../store/transition';

export function NotFound() {
  return (
    <main className="page page--plain" style={{ alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, textAlign: 'center' }}>
      <h1 className="t-display">
        This page is <Em>out on loan.</Em>
      </h1>
      <p className="t-body c-muted">We couldn’t find what you were looking for.</p>
      <Button label="Back to Bookly" onClick={() => go('/', { dir: 'fade', replace: true })} />
    </main>
  );
}
