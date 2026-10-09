import { Navigate, Outlet, createBrowserRouter } from 'react-router';
import { AppShell } from './components/AppShell';
import { PostActionsSheet } from './components/PostActions';
import { useMe } from './hooks/queries';
import { useAtomValue } from 'jotai';
import { hasOnboardedAtom, userIdAtom } from './state/session';
import { Onboarding } from './screens/Onboarding';
import { Welcome } from './screens/Welcome';
import { Auth } from './screens/Auth';
import { CheckEmail, ForgotPassword, ResetPassword } from './screens/Recovery';
import { ProfileSetup } from './screens/ProfileSetup';
import { Feed } from './screens/Feed';
import { PostDetail } from './screens/PostDetail';
import { Shelf, UserProfile } from './screens/Profiles';
import { Compose } from './screens/Compose';
import { DeleteAccount, Settings } from './screens/Settings';
import { NotFound } from './screens/NotFound';

/** Where a visitor belongs right now: onboarding → welcome → profile setup → feed. */
function useHome(): string | null {
  const userId = useAtomValue(userIdAtom);
  const hasOnboarded = useAtomValue(hasOnboardedAtom);
  const me = useMe();
  if (!userId) {
    return hasOnboarded ? '/welcome' : '/onboarding';
  }
  if (!me.data) {
    return me.isError ? '/welcome' : null; // still loading
  }
  return me.data.profileComplete ? '/feed' : '/setup';
}

function Root() {
  const home = useHome();
  return home ? <Navigate to={home} replace /> : null;
}

/** Onboarding / sign-in screens: signed-in readers are sent on. */
function PublicOnly() {
  const home = useHome();
  if (home === null) {
    return null;
  }
  return home === '/feed' || home === '/setup' ? <Navigate to={home} replace /> : <Outlet />;
}

function RequireSetup() {
  const home = useHome();
  if (home === null) {
    return null;
  }
  return home === '/setup' ? <Outlet /> : <Navigate to={home} replace />;
}

function RequireUser() {
  const home = useHome();
  if (home === null) {
    return null;
  }
  if (home !== '/feed') {
    return <Navigate to={home} replace />;
  }
  return (
    <>
      <AppShell />
      <PostActionsSheet />
    </>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  {
    element: <PublicOnly />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/welcome', element: <Welcome /> },
      { path: '/auth', element: <Auth /> },
      { path: '/forgot', element: <ForgotPassword /> },
      { path: '/check-email', element: <CheckEmail /> },
      { path: '/reset', element: <ResetPassword /> },
    ],
  },
  { element: <RequireSetup />, children: [{ path: '/setup', element: <ProfileSetup /> }] },
  {
    element: <RequireUser />,
    children: [
      { path: '/feed', element: <Feed /> },
      { path: '/shelf', element: <Shelf /> },
      { path: '/p/:id', element: <PostDetail /> },
      { path: '/p/:id/edit', element: <Compose /> },
      { path: '/u/:userId', element: <UserProfile /> },
      { path: '/share', element: <Compose /> },
      { path: '/settings', element: <Settings /> },
      { path: '/settings/delete', element: <DeleteAccount /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
