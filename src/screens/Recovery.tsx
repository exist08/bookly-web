import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '../components/Icon';
import { Button, Em, TextField, TopBar, useCountdown } from '../components/ui';
import { toast } from '../state/toast';
import { requestPasswordReset, resetPassword } from '../data/api';
import { go } from '../navigation/transition';
import { AuthLayout } from './AuthLayout';

export function ForgotPassword() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const send = useMutation({ mutationFn: requestPasswordReset });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate(email, { onSuccess: () => go(`/check-email?email=${encodeURIComponent(email.trim())}`) });
  };
  return (
    <AuthLayout>
      <main className="page page--plain">
        <TopBar fallback="/auth" />
        <form className="content stack gap-10" style={{ maxWidth: 480, padding: '12px 24px 32px' }} onSubmit={submit} noValidate>
          <span style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon name="lock" size={26} />
          </span>
          <h1 className="t-display">
            Forgot your <Em>password?</Em>
          </h1>
          <p className="t-body c-muted" style={{ marginBottom: 18 }}>
            Happens to the best readers. Enter your email and we’ll send you a link to set a new one.
          </p>
          <TextField label="Email" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" error={send.error ? (send.error as Error).message : null} />
          <Button type="submit" label="Send reset link" block loading={send.isPending} style={{ marginTop: 14 }} />
          <p className="row gap-4 t-small c-muted" style={{ justifyContent: 'center', marginTop: 12 }}>
            Signed up with Google?
            <button type="button" className="link" onClick={() => go('/welcome', { dir: 'pop' })}>
              Use Google instead
            </button>
          </p>
        </form>
      </main>
    </AuthLayout>
  );
}

export function CheckEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const [left, restart] = useCountdown(45);
  const resend = async () => {
    await requestPasswordReset(email);
    toast.success('Sent another link');
    restart();
  };
  return (
    <AuthLayout>
      <main className="page page--plain">
        <TopBar fallback="/forgot" />
        <div className="content stack" style={{ flex: 1, maxWidth: 480 }}>
          <div className="stack gap-24" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', minHeight: 420 }}>
            <div className="rise" style={{ position: 'relative', width: 168, height: 128 }} aria-hidden="true">
              <div className="card stack gap-8" style={{ position: 'absolute', left: 14, top: 0, width: 140, height: 96, padding: 16, transform: 'rotate(-6deg)', borderRadius: 8 }}>
                <span className="sk" style={{ width: '70%', height: 6, background: 'var(--border-strong)' }} />
                <span className="sk" style={{ width: '90%', height: 6, background: 'var(--border)' }} />
                <span style={{ width: '50%', height: 18, borderRadius: 9, background: 'var(--inverse)', marginTop: 6 }} />
              </div>
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: 168, height: 84, borderRadius: 10, background: '#D9B26A' }} />
            </div>
            <div className="stack gap-14 rise d1">
              <h1 className="t-display">
                Check your <Em>inbox.</Em>
              </h1>
              <p className="t-body c-muted">
                We sent a reset link to
                <br />
                <b style={{ color: 'var(--text)' }}>{email}</b>. It expires in 30 minutes.
              </p>
            </div>
          </div>
          <div className="stack gap-6" style={{ padding: '0 24px 12px' }}>
            <a className="btn btn--primary btn--block press" href="mailto:">
              <Icon name="mail" size={20} />
              Open email app
            </a>
            {left > 0 ? (
              <p className="t-small c-subtle center" style={{ padding: 12 }}>
                Didn’t get it? Resend in 0:{String(left).padStart(2, '0')}
              </p>
            ) : (
              <button type="button" className="link" style={{ alignSelf: 'center' }} onClick={resend}>
                Resend link
              </button>
            )}
            <Button label="Open reset link (demo)" variant="ghost" size="sm" onClick={() => go(`/reset?email=${encodeURIComponent(email)}`)} />
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}

const strength = (pw: string) => [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw) || /[^a-zA-Z0-9]/.test(pw), pw.length >= 12].filter(Boolean).length;

export function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const reset = useMutation({ mutationFn: () => resetPassword(email, pw) });
  const s = strength(pw);
  const ok = pw.length >= 8 && confirm === pw;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    reset.mutate(undefined, {
      onSuccess: () => {
        toast.success('Password updated. Sign in with your new one.');
        go('/auth?mode=signin', { dir: 'pop', replace: true });
      },
      onError: er => toast.error((er as Error).message),
    });
  };
  return (
    <AuthLayout>
      <main className="page page--plain">
        <TopBar fallback="/auth" />
        <form className="content stack gap-12" style={{ maxWidth: 480, padding: '12px 24px 32px' }} onSubmit={submit} noValidate>
          <h1 className="t-display">
            Set a new <Em>password.</Em>
          </h1>
          <p className="t-body c-muted" style={{ marginBottom: 14 }}>
            For {email}. You’ll be signed out on your other devices.
          </p>
          <TextField label="New password" secureToggle value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
          <div className="stack gap-8" style={{ marginBottom: 6 }}>
            <div className="row gap-4">
              {[0, 1, 2, 3].map(i => (
                <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < s ? 'var(--success)' : 'var(--border)', transition: 'background .2s' }} />
              ))}
            </div>
            {pw ? (
              <span className={`row gap-6 t-label ${s >= 3 ? 'c-success' : 'c-subtle'}`}>
                {s >= 3 ? <Icon name="check" size={16} strokeWidth={2} /> : null}
                {['Too short', 'Weak', 'Okay', 'Strong', 'Very strong'][s]} · 8+ characters with a number
              </span>
            ) : null}
          </div>
          <TextField label="Confirm password" secureToggle value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" error={confirm && confirm !== pw ? 'Passwords don’t match.' : null} />
          <Button type="submit" label="Update password" block disabled={!ok} loading={reset.isPending} style={{ marginTop: 14 }} />
        </form>
      </main>
    </AuthLayout>
  );
}
