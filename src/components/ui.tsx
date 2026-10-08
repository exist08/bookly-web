import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { GoogleMark, Icon, type IconName } from './Icon';
import { back } from '../store/transition';
import { initials } from '../utils/format';
import type { User } from '../types/models';

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'danger-outline';

export function Button({
  label,
  icon,
  variant = 'primary',
  size = 'lg',
  block,
  loading,
  className = '',
  ...rest
}: { label: string; icon?: IconName; variant?: BtnVariant; size?: 'lg' | 'md' | 'sm'; block?: boolean; loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={`btn press btn--${variant} ${size !== 'lg' ? `btn--${size}` : ''} ${block ? 'btn--block' : ''} ${className}`}>
      {loading ? <span className="spinner" /> : icon ? <Icon name={icon} size={size === 'sm' ? 18 : 20} strokeWidth={2} /> : null}
      {loading ? <span className="sr-only">{label}</span> : label}
    </button>
  );
}

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button type="button" className="btn btn--secondary btn--block press" onClick={onClick} disabled={loading}>
      {loading ? <span className="spinner" /> : <GoogleMark />}
      Continue with Google
    </button>
  );
}

export function IconButton({ icon, label, onClick, glass, filled, color, size = 22 }: { icon: IconName; label: string; onClick?: () => void; glass?: boolean; filled?: boolean; color?: string; size?: number }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`icon-btn press ${glass ? 'icon-btn--glass' : ''}`} style={color ? { color } : undefined}>
      <Icon name={icon} size={size} filled={filled} />
    </button>
  );
}

export function Em({ children }: { children: ReactNode }) {
  return <span className="em">{children}</span>;
}

export function Wordmark({ size = 30, color, dot }: { size?: number; color?: string; dot?: string }) {
  const d = Math.max(6, Math.round(size / 5));
  return (
    <span className="row" style={{ alignItems: 'flex-end', gap: 5 }} aria-label="Bookly">
      <span className="em" style={{ fontSize: size, lineHeight: 1.1, color: color ?? 'var(--text)' }}>
        Bookly
      </span>
      <span style={{ width: d, height: d, borderRadius: '50%', background: dot ?? 'var(--accent)', marginBottom: size * 0.22 }} />
    </span>
  );
}

export function Avatar({ user, size = 38 }: { user: Pick<User, 'displayName' | 'avatarUri' | 'avatarColor'>; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: user.avatarColor, fontSize: size * 0.42 }}>
      {user.avatarUri ? <img src={user.avatarUri} alt="" /> : initials(user.displayName)}
    </span>
  );
}

/** Translucent sticky navigation bar with a back button, like a native stack header. */
export function TopBar({ title, right, onBack, border, fallback }: { title?: string; right?: ReactNode; onBack?: () => void; border?: boolean; fallback?: string }) {
  return (
    <header className={`topbar ${border ? 'topbar--border' : ''}`}>
      <IconButton icon="back" label="Back" size={24} onClick={onBack ?? (() => back(fallback))} />
      <span className="topbar__title">{title}</span>
      <span className="topbar__side">{right}</span>
    </header>
  );
}

/** Modal-style header: Cancel · Title · primary action. */
export function ModalBar({ title, onCancel, actionLabel, onAction, disabled, loading, textAction }: { title: string; onCancel: () => void; actionLabel: string; onAction: () => void; disabled?: boolean; loading?: boolean; textAction?: boolean }) {
  const off = disabled || loading;
  return (
    <header className="topbar topbar--border" style={{ padding: 'var(--safe-top) 12px 0' }}>
      <button type="button" className="press" style={{ minWidth: 72, height: 44, textAlign: 'left', color: 'var(--text-2)' }} onClick={onCancel}>
        Cancel
      </button>
      <span className="topbar__title" style={{ fontSize: 16, fontWeight: 700 }}>
        {title}
      </span>
      {textAction ? (
        <button type="button" className="press" disabled={off} onClick={onAction} style={{ minWidth: 72, height: 44, textAlign: 'right', fontWeight: 700, color: off ? 'var(--subtle)' : 'var(--accent-text)' }}>
          {loading ? 'Saving…' : actionLabel}
        </button>
      ) : (
        <button
          type="button"
          className="press"
          disabled={off}
          onClick={onAction}
          style={{ height: 38, minWidth: 72, padding: '0 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, background: off ? 'var(--surface-alt)' : 'var(--inverse)', color: off ? 'var(--subtle)' : 'var(--on-inverse)' }}>
          {loading ? 'Saving…' : actionLabel}
        </button>
      )}
    </header>
  );
}

export function TextField({
  label,
  error,
  hint,
  prefix,
  right,
  labelRight,
  secureToggle,
  multiline,
  ...rest
}: {
  label: string;
  error?: string | null;
  hint?: string;
  prefix?: string;
  right?: ReactNode;
  labelRight?: ReactNode;
  secureToggle?: boolean;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [hidden, setHidden] = useState(true);
  const id = `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        <span>{label}</span>
        {labelRight}
      </label>
      <div className={`field__box ${error ? 'field__box--error' : ''}`}>
        {prefix ? <span className="field__prefix">{prefix}</span> : null}
        {multiline ? (
          <textarea id={id} aria-invalid={!!error} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : (
          <input id={id} aria-invalid={!!error} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} type={secureToggle ? (hidden ? 'password' : 'text') : rest.type} />
        )}
        {secureToggle ? (
          <button type="button" className="icon-btn" aria-label={hidden ? 'Show password' : 'Hide password'} onClick={() => setHidden(h => !h)} style={{ color: 'var(--muted)' }}>
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} />
          </button>
        ) : (
          right
        )}
      </div>
      {error ? (
        <span className="field__msg c-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field__msg c-subtle">{hint}</span>
      ) : null}
    </div>
  );
}

export function SkeletonBlock({ w, h, r = 6, alt }: { w: number | string; h: number; r?: number; alt?: boolean }) {
  return <div className={`sk ${alt ? 'sk--alt' : ''}`} style={{ width: w, height: h, borderRadius: r }} />;
}

export function PostCardSkeleton() {
  return (
    <div className="post pulse" aria-hidden="true">
      <div className="row gap-12 pad">
        <SkeletonBlock w={38} h={38} r={19} />
        <div className="stack gap-6">
          <SkeletonBlock w={120} h={12} />
          <SkeletonBlock w={80} h={10} alt />
        </div>
      </div>
      <div className="post__stage" style={{ background: 'var(--skeleton-alt)' }}>
        <SkeletonBlock w={180} h={270} r={4} />
      </div>
      <div className="row between pad">
        <SkeletonBlock w={136} h={44} r={22} />
        <SkeletonBlock w={96} h={44} r={22} />
      </div>
      <div className="stack gap-8 pad">
        <SkeletonBlock w="60%" h={24} />
        <SkeletonBlock w="100%" h={12} alt />
        <SkeletonBlock w="80%" h={12} alt />
      </div>
    </div>
  );
}

export function EmptyShelf({ title, message, actionLabel, onAction }: { title: ReactNode; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="stack gap-14 center" style={{ alignItems: 'center', padding: '28px 32px' }}>
      <div className="ghosts" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div key={i} className="ghost" style={{ background: i === 0 ? 'var(--surface-sunken)' : 'transparent' }} />
        ))}
      </div>
      <h2 className="t-title">{title}</h2>
      <p className="t-small c-muted" style={{ maxWidth: 300 }}>
        {message}
      </p>
      {actionLabel && onAction ? <Button label={actionLabel} icon="plus" variant="outline" size="md" onClick={onAction} /> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="stack gap-14 center" style={{ alignItems: 'center', padding: '40px 32px' }}>
      <h2 className="t-heading">Something went sideways.</h2>
      <p className="t-small c-muted">{message}</p>
      <Button label="Try again" variant="secondary" size="md" onClick={onRetry} />
    </div>
  );
}

/** Counts down once per second; used for "Resend in 0:42". */
export function useCountdown(from: number) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    if (left <= 0) {
      return;
    }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, () => setLeft(from)] as const;
}
