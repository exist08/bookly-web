import { Button, Em, Wordmark } from '../components/ui';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { toast } from '../state/toast';
import { useAuth } from '../hooks/queries';
import { go } from '../navigation/transition';
import { AuthLayout, CoverFan } from './AuthLayout';

export function Welcome() {
  const { google } = useAuth();
  return (
    <AuthLayout>
      <main className="page page--plain">
        <div className="content stack welcome-main" style={{ flex: 1, maxWidth: 480 }}>
          <div style={{ padding: '14px 28px 0' }}>
            <Wordmark size={30} />
          </div>
          <div className="welcome-art">
            <CoverFan />
          </div>
          <div className="stack gap-14 rise d2" style={{ padding: '8px 28px 0' }}>
            <h1 className="t-hero">
              Books are better <Em>passed hand to hand.</Em>
            </h1>
            <p className="t-body c-muted">Share what you finished, find your next read through people whose taste you trust.</p>
          </div>
          <div className="stack gap-12 welcome-actions" style={{ padding: '28px 24px 12px' }}>
            <GoogleSignInButton
              loading={google.isPending}
              onCredential={credential =>
                google.mutate(credential, {
                  onSuccess: u => go(u.profileComplete ? '/feed' : '/setup', { dir: 'fade', replace: true }),
                  onError: e => toast.error((e as Error).message),
                })
              }
            />
            <Button label="Continue with email" icon="mail" block onClick={() => go('/auth?mode=signup')} />
            <p className="row gap-4 t-small c-muted" style={{ justifyContent: 'center' }}>
              Already a member?
              <button type="button" className="link" onClick={() => go('/auth?mode=signin')}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
