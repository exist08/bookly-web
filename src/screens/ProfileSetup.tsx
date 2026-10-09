import { useState, type FormEvent } from 'react';
import { AvatarPicker } from '../components/AvatarPicker';
import { Icon } from '../components/Icon';
import { Button, Em, TextField } from '../components/ui';
import { toast } from '../state/toast';
import { useAuth, useMe, useUpdateProfile } from '../hooks/queries';
import { usernameMessage, useUsernameCheck } from '../hooks/useUsernameCheck';
import { ApiError } from '../data/api';
import { go } from '../navigation/transition';

const suggest = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 18);

/** After sign-up: pick a username (required), photo and bio (optional). */
export function ProfileSetup() {
  const { data: me } = useMe();
  const update = useUpdateProfile();
  const { signOut } = useAuth();
  const [name, setName] = useState(me?.displayName ?? '');
  const [username, setUsername] = useState(() => (me ? suggest(me.displayName) : ''));
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(me?.avatarUri ?? null);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(username);
  const ready = !!name.trim() && username.length >= 3 && (status === 'available' || status === 'idle');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { displayName: name, username, bio, avatarUri: avatar },
      {
        onSuccess: () => {
          toast.success('Welcome to Bookly');
          go('/feed', { dir: 'fade', replace: true });
        },
        onError: er => (er instanceof ApiError && er.field === 'username' ? setError(er.message) : toast.error((er as Error).message)),
      },
    );
  };

  return (
    <main className="page page--plain">
      <form className="content stack gap-10" style={{ maxWidth: 520, padding: '16px 24px 32px' }} onSubmit={submit} noValidate>
        <div className="row gap-6">
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--text)' }} />
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--text)' }} />
        </div>
        <span className="t-label c-subtle">Step 2 of 2 · Your profile</span>
        <div className="stack gap-10 rise" style={{ marginTop: 18 }}>
          <h1 className="t-display">
            Make the shelf <Em>yours.</Em>
          </h1>
          <p className="t-body c-muted">This is how other readers will find you and your books.</p>
        </div>
        <div className="row gap-16 rise d1" style={{ marginTop: 20 }}>
          <AvatarPicker name={name} color={me?.avatarColor ?? '#3D5A80'} uri={avatar} onChange={setAvatar} size={96} />
          <div className="stack gap-4 grow">
            <span className="t-strong">{avatar ? 'Looking good' : 'Add a photo'}</span>
            <span className="t-small c-muted">Optional. Your initials show until you add one.</span>
          </div>
        </div>
        <div className="stack gap-16 rise d2" style={{ marginTop: 24 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
          <TextField
            label="Username"
            prefix="@"
            value={username}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={e => {
              setUsername(e.target.value.replace(/\s/g, '').toLowerCase());
              setError(null);
            }}
            error={error ?? (status === 'taken' || status === 'invalid' ? usernameMessage[status] : null)}
            hint={status === 'available' ? `@${username} is available` : undefined}
            right={
              status === 'checking' ? (
                <span className="spinner" style={{ margin: '0 12px', color: 'var(--muted)' }} />
              ) : status === 'available' ? (
                <span style={{ width: 44, display: 'flex', justifyContent: 'center', color: 'var(--success)' }}>
                  <Icon name="check" size={20} strokeWidth={2} />
                </span>
              ) : null
            }
          />
          <TextField
            label="Bio"
            multiline
            placeholder="What do you like to read?"
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 160))}
            labelRight={<span className="t-caption c-subtle">{bio.length} / 160</span>}
          />
        </div>
        <Button type="submit" label="Start reading" block disabled={!ready} loading={update.isPending} style={{ marginTop: 22 }} />
        <Button label="Use a different account" variant="ghost" size="sm" onClick={() => signOut.mutate(undefined, { onSuccess: () => go('/welcome', { dir: 'fade', replace: true }) })} />
      </form>
    </main>
  );
}
