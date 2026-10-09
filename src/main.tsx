import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { store } from './state/store';
import { splashSeenAtom, userIdAtom } from './state/session';
import { applyTheme, isDarkAtom } from './state/theme';
import { Toaster } from './components/Toast';
import { Splash } from './screens/Splash';
import { router } from './router';
import { bindRouter, installPopDirection } from './navigation/transition';
import { useMe } from './hooks/queries';
import './styles/global.css';

/**
 * Data flow at a glance
 *   Client state (who's signed in, theme, toasts, open sheet) → Jotai atoms in src/state/
 *   Server state (feed, posts, profiles)                        → TanStack Query hooks in src/hooks/queries.ts
 *   Data source                                                → src/data/api.ts (mock DB today, the API later)
 */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

bindRouter(router);
installPopDirection();

/** Keeps <html data-theme> in step with isDarkAtom. */
function ThemeSync() {
  const isDark = useAtomValue(isDarkAtom);
  useEffect(() => applyTheme(isDark), [isDark]);
  return null;
}

/** A saved session whose user no longer exists signs out quietly. */
function SessionGuard() {
  const userId = useAtomValue(userIdAtom);
  const setUserId = useSetAtom(userIdAtom);
  const me = useMe();
  useEffect(() => {
    if (userId && me.isError) setUserId(null);
  }, [userId, me.isError, setUserId]);
  return null;
}

function App() {
  const [splashSeen, setSplashSeen] = useAtom(splashSeenAtom);
  return (
    <>
      <ThemeSync />
      <SessionGuard />
      <RouterProvider router={router} />
      <Toaster />
      {splashSeen ? null : <Splash onDone={() => setSplashSeen(true)} />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
