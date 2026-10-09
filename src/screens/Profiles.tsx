import { useParams } from 'react-router';
import { ProfileView } from '../components/ProfileView';
import { IconButton, TopBar } from '../components/ui';
import { useMe, useProfile } from '../hooks/queries';
import { useAtomValue } from 'jotai';
import { userIdAtom } from '../state/session';
import { go } from '../navigation/transition';
import { shareProfile } from '../utils/share';

export function Shelf() {
  const { data: me } = useMe();
  if (!me) {
    return null;
  }
  return (
    <main className="page page--tabbed">
      <ProfileView
        userId={me.id}
        isMe
        scope="shelf"
        header={
          <header className="row between content" style={{ height: 56, padding: '0 12px 0 24px' }}>
            <span className="t-strong">@{me.username}</span>
            <IconButton icon="sliders" label="Settings" onClick={() => go('/settings', { dir: 'up' })} />
          </header>
        }
      />
    </main>
  );
}

export function UserProfile() {
  const { userId = '' } = useParams();
  const meId = useAtomValue(userIdAtom);
  const { data } = useProfile(userId);
  return (
    <main className="page page--plain">
      <ProfileView
        userId={userId}
        isMe={userId === meId}
        scope={`profile-${userId}`}
        header={<TopBar title={data ? `@${data.user.username}` : ''} right={data ? <IconButton icon="share" label="Share profile" onClick={() => shareProfile(data.user)} /> : null} />}
      />
    </main>
  );
}
