import { useState, type ReactNode } from 'react';
import { AvatarPicker } from '../components/AvatarPicker';
import { GoogleMark, Icon, type IconName } from '../components/Icon';
import { Button, Em, ModalBar, TextField, TopBar } from '../components/ui';
import { toast } from '../state/toast';
import { useAuth, useDeleteAccount, useMe, useProfile, useUpdateProfile } from '../hooks/queries';
import { usernameMessage, useUsernameCheck } from '../hooks/useUsernameCheck';
import { ApiError, requestPasswordReset } from '../data/api';
import { useAtom } from 'jotai';
import { themeModeAtom, type ThemeMode } from '../state/theme';
import { back, go } from '../navigation/transition';
import { compactNumber } from '../utils/format';

const MODES: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'System', icon: 'monitor' },
  { mode: 'light', label: 'Light', icon: 'sun' },
  { mode: 'dark', label: 'Dark', icon: 'moon' },
];

/** Edit profile + appearance + account, like the app's settings modal. */
export function Settings() {
  const { data: me } = useMe();
  const [mode, setMode] = useAtom(themeModeAtom);
  const update = useUpdateProfile();
  const { signOut } = useAuth();
  const [name, setName] = useState(me?.displayName ?? '');
  const [username, setUsername] = useState(me?.username ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [avatar, setAvatar] = useState<string | null>(me?.avatarUri ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const status = useUsernameCheck(username, me?.username);
  if (!me) {
    return null;
  }
  const dirty = name !== me.displayName || username !== me.username || bio !== me.bio || avatar !== me.avatarUri;
  const blocked = status === 'taken' || status === 'invalid' || status === 'checking' || !name.trim();

  const save = () =>
    update.mutate(
      { displayName: name, username, bio, avatarUri: avatar },
      {
        onSuccess: () => {
          toast.success('Profile saved');
          back('/shelf');
        },
        onError: e => (e instanceof ApiError && e.field ? setErrors({ [e.field]: e.message }) : toast.error((e as Error).message)),
      },
    );

  return (
    <main className="page page--plain">
      <ModalBar title="Edit profile" onCancel={() => back('/shelf')} actionLabel="Save" textAction onAction={save} disabled={!dirty || blocked} loading={update.isPending} />
      <div className="content stack" style={{ padding: '26px 16px 48px', maxWidth: 600 }}>
        <div style={{ alignSelf: 'center', marginBottom: 26 }}>
          <AvatarPicker name={name} color={me.avatarColor} uri={avatar} onChange={setAvatar} size={108} />
        </div>
        <div className="stack gap-16" style={{ padding: '0 8px' }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} error={errors.displayName} />
          <TextField
            label="Username"
            prefix="@"
            value={username}
            autoCapitalize="none"
            spellCheck={false}
            onChange={e => (setUsername(e.target.value.replace(/\s/g, '').toLowerCase()), setErrors({}))}
            error={errors.username ?? (status === 'taken' || status === 'invalid' ? usernameMessage[status] : null)}
            hint={status === 'available' ? `@${username} is available` : undefined}
            right={status === 'checking' ? <span className="spinner" style={{ margin: '0 12px', color: 'var(--muted)' }} /> : status === 'available' ? <span style={{ width: 44, display: 'flex', justifyContent: 'center', color: 'var(--success)' }}><Icon name="check" size={20} strokeWidth={2} /></span> : null}
          />
          <TextField label="Bio" multiline placeholder="What do you like to read?" value={bio} onChange={e => setBio(e.target.value.slice(0, 160))} labelRight={<span className="t-caption c-subtle">{bio.length} / 160</span>} />
        </div>

        <h2 className="t-overline c-subtle" style={{ margin: '30px 8px 10px' }}>
          Appearance
        </h2>
        <div className="segment" role="radiogroup" aria-label="Appearance">
          {MODES.map(m => (
            <button key={m.mode} type="button" role="radio" aria-checked={mode === m.mode} aria-pressed={mode === m.mode} onClick={() => setMode(m.mode)} style={{ height: 44 }}>
              <Icon name={m.icon} size={18} />
              {m.label}
            </button>
          ))}
        </div>

        <h2 className="t-overline c-subtle" style={{ margin: '30px 8px 10px' }}>
          Account
        </h2>
        <div className="list-group">
          <Row label="Email">
            <span className="t-small c-subtle" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {me.email}
            </span>
          </Row>
          <Row label="Signed in with">
            <span className="row gap-8 t-small c-subtle">
              {me.provider === 'google' ? <GoogleMark size={16} /> : <Icon name="mail" size={16} />}
              {me.provider === 'google' ? 'Google' : 'Email & password'}
            </span>
          </Row>
          {me.provider === 'password' ? (
            <Row
              label="Change password"
              chevron
              onClick={async () => {
                await requestPasswordReset(me.email);
                toast.success(`We sent a reset link to ${me.email}`);
              }}
            />
          ) : null}
          <Row label="Sign out" icon="signOut" onClick={() => signOut.mutate(undefined, { onSuccess: () => go('/welcome', { dir: 'fade', replace: true }) })} />
        </div>

        <div className="stack gap-10" style={{ marginTop: 26, padding: 18, borderRadius: 18, border: '1px solid var(--danger-border)', background: 'var(--danger-soft)' }}>
          <span className="t-strong c-danger">Delete account</span>
          <p className="t-small c-2">Removes your profile, all your posts and your votes. This can’t be undone.</p>
          <Button label="Delete my account" variant="danger-outline" size="sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => go('/settings/delete')} />
        </div>
      </div>
    </main>
  );
}

function Row({ label, children, onClick, chevron, icon }: { label: string; children?: ReactNode; onClick?: () => void; chevron?: boolean; icon?: IconName }) {
  const body = (
    <>
      <span className="row gap-10">
        {icon ? <Icon name={icon} size={18} /> : null}
        {label}
      </span>
      <span className="row gap-6" style={{ minWidth: 0 }}>
        {children}
        {chevron ? <Icon name="chevronRight" size={18} color="var(--subtle)" /> : null}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" className="list-row" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="list-row">{body}</div>
  );
}

export function DeleteAccount() {
  const { data: me } = useMe();
  const { data: profile } = useProfile(me?.id ?? '');
  const del = useDeleteAccount();
  const [typed, setTyped] = useState('');
  if (!me) {
    return null;
  }
  const ok = typed.trim().toUpperCase() === 'DELETE';
  const items = [
    { t: 'Your profile, photo and username', d: `@${me.username} becomes available to others.` },
    { t: `All ${profile?.stats.books ?? 0} of your book posts`, d: `Including their covers and the ${compactNumber(profile?.stats.upvotes ?? 0)} upvotes they earned.` },
    { t: 'Every vote you have cast', d: 'Scores on other readers’ posts update.' },
  ];
  return (
    <main className="page page--plain">
      <TopBar title="Delete account" fallback="/settings" />
      <div className="content stack gap-12" style={{ padding: '12px 24px 40px', maxWidth: 560 }}>
        <h1 className="t-display">
          Before you <Em>go.</Em>
        </h1>
        <p className="t-body c-muted">Deleting your account permanently removes:</p>
        <ul className="card stack gap-16" style={{ listStyle: 'none', margin: '8px 0 12px', padding: 20 }}>
          {items.map(i => (
            <li key={i.t} className="row gap-12" style={{ alignItems: 'flex-start' }}>
              <span style={{ marginTop: 2, width: 22, height: 22, borderRadius: 11, background: 'var(--danger-soft)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="close" size={12} strokeWidth={2.5} />
              </span>
              <span className="stack gap-4">
                <span className="t-strong">{i.t}</span>
                <span className="t-caption c-muted">{i.d}</span>
              </span>
            </li>
          ))}
        </ul>
        <TextField label="Type DELETE to confirm" value={typed} placeholder="DELETE" autoCapitalize="characters" autoComplete="off" onChange={e => setTyped(e.target.value)} />
        <div className="stack gap-6" style={{ marginTop: 24 }}>
          <Button
            label="Delete my account"
            icon="trash"
            variant="danger"
            block
            disabled={!ok}
            loading={del.isPending}
            onClick={() =>
              del.mutate(undefined, {
                onSuccess: () => {
                  toast('Your account was deleted. Thanks for reading with us.');
                  go('/welcome', { dir: 'fade', replace: true });
                },
                onError: e => toast.error((e as Error).message),
              })
            }
          />
          <Button label="Keep my account" variant="ghost" block onClick={() => back('/settings')} />
        </div>
      </div>
    </main>
  );
}
