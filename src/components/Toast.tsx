import { useSyncExternalStore } from 'react';
import { Icon } from './Icon';

type Kind = 'info' | 'success' | 'error';
interface T {
  id: number;
  text: string;
  kind: Kind;
}

let items: T[] = [];
let seq = 0;
const ls = new Set<() => void>();
const emit = () => ls.forEach(l => l());

function push(text: string, kind: Kind = 'info') {
  const id = ++seq;
  items = [...items.slice(-2), { id, text, kind }];
  emit();
  setTimeout(() => {
    items = items.filter(t => t.id !== id);
    emit();
  }, 2800);
}

export const toast = Object.assign((t: string) => push(t), {
  success: (t: string) => push(t, 'success'),
  error: (t: string) => push(t, 'error'),
});

export function Toaster() {
  const list = useSyncExternalStore(
    l => {
      ls.add(l);
      return () => ls.delete(l);
    },
    () => items,
  );
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
