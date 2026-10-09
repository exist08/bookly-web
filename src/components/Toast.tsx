import { useAtomValue } from 'jotai';
import { Icon } from './Icon';
import { toastsAtom } from '../state/toast';

/** Renders the toast list. Push toasts from anywhere with toast() from state/toast. */
export function Toaster() {
  const list = useAtomValue(toastsAtom);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {list.map(t => (
        <div key={t.id} className="toast">
          {t.kind === 'success' ? <Icon name="check" size={18} color="var(--success)" strokeWidth={2.2} /> : t.kind === 'error' ? <Icon name="info" size={18} color="var(--danger)" /> : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}
