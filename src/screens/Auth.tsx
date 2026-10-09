import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button, TextField, TopBar } from '../components/ui';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { toast } from '../state/toast';
import { useAuth } from '../hooks/queries';
import { ApiError } from '../data/api';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../data/seed';
import { go } from '../navigation/transition';
import { AuthLayout } from './AuthLayout';

type Mode = 'signin' | 'signup';
type Errors = Partial<Record<'name' | 'email' | 'password', string>>;

export function Auth() {
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(mode === 'signin' ? DEMO_EMAIL : '');
  const [password, setPassword] = useState(mode === 'signin' ? DEMO_PASSWORD : '');
  const [errors, setErrors] = useState<Errors>({});
  const signIn = mode === 'signin';

  const onError = (e: unknown) => (e instanceof ApiError && e.field ? setErrors({ [e.field]: e.message }) : toast.error((e as Error).message));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!signIn && !name.trim()) {
      next.name = 'Add your name.';
    }
    if (!email.trim()) {
      next.email = 'Enter your email.';
    }
    if (!password) {
      next.password = 'Enter a password.';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    if (signIn) {
      auth.signIn.mutate({ email, password }, { onSuccess: u => go(u.profileComplete ? '/feed' : '/setup', { dir: 'fade', replace: true }), onError });
    } else {
      auth.signUp.mutate({ name, email, password }, { onSuccess: () => go('/setup', { dir: 'push', replace: true }), onError });
    }
  };

  const setMode = (m: Mode) => {
    setErrors({});
    setParams({ mode: m }, { replace: true });
  };

  return (
    <AuthLayout>
      <main className="page page--plain">
        <TopBar fallback="/welcome" />
        <form className="content stack gap-16" style={{ maxWidth: 480, padding: '4px 24px 32px' }} onSubmit={submit} noValidate>
          <div className="stack gap-8" style={{ margin: '8px 0 10px' }}>
            <h1 className="t-display">{signIn ? 'Welcome back.' : 'Start your shelf.'}</h1>
            <p className="t-body c-muted">{signIn ? 'Pick up where your reading left off.' : 'Takes a minute. Your first post takes two.'}</p>
          </div>
          <div className="segment" role="tablist" style={{ marginBottom: 8 }}>
            <button type="button" role="tab" aria-selected={signIn} onClick={() => setMode('signin')}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={!signIn} onClick={() => setMode('signup')}>
              Create account
            </button>
          </div>
          {!signIn ? <TextField label="Your name" placeholder="How other readers will see you" value={name} onChange={e => setName(e.target.value)} autoComplete="name" error={errors.name} /> : null}
          <TextField label="Email" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" error={errors.email} />
          <TextField
            label="Password"
            secureToggle
            placeholder={signIn ? 'Your password' : 'At least 8 characters'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={signIn ? 'current-password' : 'new-password'}
            error={errors.password}
            labelRight={
              signIn ? (
                <button type="button" className="c-accent t-label" onClick={() => go(`/forgot?email=${encodeURIComponent(email)}`)}>
                  Forgot password?
                </button>
              ) : undefined
            }
          />
          <Button type="submit" label={signIn ? 'Sign in' : 'Create account'} block loading={auth.signIn.isPending || auth.signUp.isPending} style={{ marginTop: 8 }} />
          <div className="row gap-12 c-subtle t-caption" style={{ margin: '8px 0' }}>
            <span className="divider grow" />
            or
            <span className="divider grow" />
          </div>
          <GoogleSignInButton
            loading={auth.google.isPending}
            onCredential={credential =>
              auth.google.mutate(credential, {
                onSuccess: u => go(u.profileComplete ? '/feed' : '/setup', { dir: 'fade', replace: true }),
                onError: e => toast.error((e as Error).message),
              })
            }
          />
          <p className="t-caption c-subtle center" style={{ marginTop: 16 }}>
            By continuing you agree to Bookly’s Terms and Privacy Policy.
          </p>
        </form>
      </main>
    </AuthLayout>
  );
}
