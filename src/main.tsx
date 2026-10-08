import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toaster } from './components/Toast';
import { Splash } from './screens/Splash';
import { router } from './router';
import { bindRouter, installPopDirection } from './store/transition';
import { session, useSession } from './store/session';
import { useMe } from './hooks/queries';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

bindRouter(router);
installPopDirection();

function App() {
  // Splash once per browser session, like a cold start.
  const [splash, setSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('bookly.splashed');
    } catch {
      return false;
    }
  });
  const done = useCallback(() => {
    try {
      sessionStorage.setItem('bookly.splashed', '1');
    } catch {
      // ignore
    }
    setSplash(false);
  }, []);

  // A stored session whose user no longer exists signs out quietly.
  const { userId } = useSession();
  const me = useMe();
  useEffect(() => {
    if (userId && me.isError) {
      session.setUser(null);
    }
  }, [userId, me.isError]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      {splash ? <Splash onDone={done} /> : null}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
