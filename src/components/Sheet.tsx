import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Bottom sheet that behaves like a native one: slides up, drag the grabber
 * (or the sheet) down to dismiss, tap the backdrop or press Escape to close.
 * On tablets/desktop it becomes a centred card.
 */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  const onDown = (e: React.PointerEvent) => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      return;
    }
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }
    drag.current = { y: e.clientY, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) {
      return;
    }
    const dy = Math.max(0, e.clientY - drag.current.y);
    drag.current.dy = dy;
    ref.current.style.transform = `translateY(${dy}px)`;
    ref.current.style.animation = 'none';
  };
  const onUp = () => {
    if (!drag.current || !ref.current) {
      return;
    }
    const { dy } = drag.current;
    drag.current = null;
    if (dy > 90) {
      onClose();
      ref.current.style.transition = 'transform .2s ease-in';
      ref.current.style.transform = 'translateY(100%)';
    } else {
      ref.current.style.transition = 'transform .25s cubic-bezier(.2,.9,.3,1.2)';
      ref.current.style.transform = '';
    }
  };

  return createPortal(
    <>
      <div className={`backdrop ${closing ? 'closing' : ''}`} onClick={onClose} />
      <div
        ref={ref}
        className={`sheet ${closing ? 'closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}>
        <div className="sheet__grabber" />
        {children}
      </div>
    </>,
    document.body,
  );
}

export function Dialog({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) {
    return null;
  }
  return createPortal(
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </>,
    document.body,
  );
}
