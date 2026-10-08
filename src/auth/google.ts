/**
 * Google Sign-In for the web — Google Identity Services (GIS).
 * https://developers.google.com/identity/gsi/web
 *
 * Uses the same Web client ID as the mobile app's `webClientId`, so the ID token's
 * audience is one the backend already accepts (GOOGLE_CLIENT_IDS) in POST /v1/auth/google.
 * Requires this site's origin under "Authorized JavaScript origins" for that client
 * in Google Cloud Console (e.g. http://localhost:5173).
 */

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  '153004524173-79farmg2350m8opb24ehebbfvb589kut.apps.googleusercontent.com';

// --- minimal GIS typings (only what we use) ---
type CredentialResponse = { credential: string; select_by?: string };
type GsiButtonOptions = {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
};
type GoogleAccountsId = {
  initialize(config: {
    client_id: string;
    callback: (res: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    ux_mode?: 'popup' | 'redirect';
    use_fedcm_for_button?: boolean;
    itp_support?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GsiButtonOptions): void;
  disableAutoSelect(): void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let loading: Promise<GoogleAccountsId> | null = null;

/** Every rendered button shares one GIS client; the most recently mounted button receives the credential. */
let currentHandler: ((credential: string) => void) | null = null;

/** Loads the GIS script once and initializes it. Rejects if the script can't load (offline, blocked). */
export function loadGoogle(): Promise<GoogleAccountsId> {
  if (loading) return loading;
  loading = new Promise<GoogleAccountsId>((resolve, reject) => {
    const ready = () => {
      const id = window.google?.accounts?.id;
      if (!id) {
        reject(new Error('Google sign-in failed to load.'));
        return;
      }
      id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: res => currentHandler?.(res.credential),
        ux_mode: 'popup',
        use_fedcm_for_button: true,
        itp_support: true,
      });
      resolve(id);
    };
    if (window.google?.accounts?.id) {
      ready();
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = ready;
    script.onerror = () => reject(new Error('Google sign-in couldn’t load. Check your connection.'));
    document.head.appendChild(script);
  }).catch(err => {
    loading = null; // allow a retry on the next mount
    throw err;
  });
  return loading;
}

export function setGoogleCredentialHandler(handler: ((credential: string) => void) | null) {
  currentHandler = handler;
}

/** Fields we read from Google's ID token (a JWT). */
export type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  aud: string;
  exp: number;
};

/**
 * Decodes (does NOT verify) the ID token payload. Fine for the mock DB / UI only —
 * the backend verifies the signature and audience before trusting anything in it.
 */
export function decodeIdToken(credential: string): GoogleIdTokenPayload {
  const part = credential.split('.')[1];
  if (!part) throw new Error('Google returned an invalid credential.');
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as GoogleIdTokenPayload;
}

/** Stops One Tap / FedCM from silently re-selecting the account after sign-out. */
export function googleSignOut() {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* script not loaded — nothing to do */
  }
}
