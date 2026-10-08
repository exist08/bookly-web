import { useState } from 'react';
import { Icon } from './Icon';
import { Avatar, Button } from './ui';
import { Sheet } from './Sheet';
import { pickImage } from '../utils/image';

/** Avatar with a camera badge; tapping opens a small sheet: take photo, choose, remove. */
export function AvatarPicker({ name, color, uri, onChange, size = 104 }: { name: string; color: string; uri: string | null; onChange: (u: string | null) => void; size?: number }) {
  const [open, setOpen] = useState(false);
  const empty = !uri && !name.trim();
  const pick = async (camera: boolean) => {
    setOpen(false);
    const u = await pickImage('avatar', camera);
    if (u) {
      onChange(u);
    }
  };
  return (
    <>
      <button type="button" className="press" style={{ position: 'relative', width: size, height: size }} onClick={() => setOpen(true)} aria-label={uri ? 'Change profile photo' : 'Add profile photo'}>
        {empty ? (
          <span style={{ width: size, height: size, borderRadius: '50%', border: '1.5px dashed var(--border-dashed)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <Icon name="user" size={size * 0.36} strokeWidth={1.5} />
          </span>
        ) : (
          <Avatar user={{ displayName: name || '?', avatarUri: uri, avatarColor: color }} size={size} />
        )}
        <span style={{ position: 'absolute', right: -4, bottom: -4, width: 40, height: 40, borderRadius: 20, border: '3px solid var(--bg)', background: 'var(--inverse)', color: 'var(--on-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={17} />
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label="Profile photo">
        <div className="stack gap-10">
          <h2 className="t-heading center" style={{ marginBottom: 6 }}>
            Profile photo
          </h2>
          <Button label="Take photo" icon="camera" variant="secondary" size="md" onClick={() => pick(true)} />
          <Button label="Choose from library" icon="image" variant="secondary" size="md" onClick={() => pick(false)} />
          {uri ? (
            <Button
              label="Remove photo"
              icon="trash"
              variant="danger-outline"
              size="md"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            />
          ) : null}
          <Button label="Cancel" variant="soft" size="md" onClick={() => setOpen(false)} />
        </div>
      </Sheet>
    </>
  );
}
