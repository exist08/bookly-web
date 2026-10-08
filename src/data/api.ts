/**
 * Mock API. Every function mirrors an endpoint on the architecture sheet
 * (/v1/...), returns a Promise and adds network-like latency, so screens and
 * TanStack Query hooks are written exactly as they will be against the real
 * Fastify service.
 */
import type {
  Page,
  Post,
  PostInput,
  PostView,
  ProfileInput,
  ProfileView,
  User,
  VoteValue,
} from '../types/models';
import { commit, getDb } from './mockDb';
import { decodeIdToken, googleSignOut } from '../auth/google';
import { AVATAR_COLORS, COVER_PALETTES } from './seed';
import { session } from '../store/session';

export class ApiError extends Error {
  constructor(message: string, public code: string, public field?: string) {
    super(message);
  }
}

const wait = (min = 250, max = 650) =>
  new Promise<void>(r => setTimeout(r, min + Math.random() * (max - min)));

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const USERNAME_RE = /^[a-z0-9._]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function me(): User {
  const id = session.get().userId;
  const user = id ? getDb().users.find(u => u.id === id) : undefined;
  if (!user) {
    throw new ApiError('Your session has expired. Please sign in again.', 'unauthorized');
  }
  return user;
}

function view(post: Post, viewerId: string | null): PostView {
  const db = getDb();
  const author = db.users.find(u => u.id === post.authorId)!;
  const myVote = viewerId ? db.votes[`${post.id}:${viewerId}`] ?? 0 : 0;
  return { ...post, author, myVote, score: post.upvotes - post.downvotes };
}

const newestFirst = (a: Post, b: Post) => b.createdAt.localeCompare(a.createdAt);

function paginate<T>(all: T[], cursor: string | null | undefined, size: number): Page<T> {
  const start = cursor ? Number(cursor) : 0;
  const items = all.slice(start, start + size);
  const next = start + size < all.length ? String(start + size) : null;
  return { items, nextCursor: next };
}

// ---------- auth ----------

export async function signIn(email: string, password: string): Promise<User> {
  await wait();
  const db = getDb();
  const key = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === key);
  if (!user || db.passwords[key] !== password) {
    throw new ApiError('That email and password don’t match.', 'invalid_credentials', 'password');
  }
  return user;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  await wait();
  const db = getDb();
  const key = email.trim().toLowerCase();
  if (!EMAIL_RE.test(key)) {
    throw new ApiError('Enter a valid email address.', 'invalid_email', 'email');
  }
  if (password.length < 8) {
    throw new ApiError('Use at least 8 characters.', 'weak_password', 'password');
  }
  if (db.users.some(u => u.email.toLowerCase() === key)) {
    throw new ApiError('An account with this email already exists.', 'email_taken', 'email');
  }
  const user: User = {
    id: uid('u'),
    email: key,
    username: '',
    displayName: name.trim(),
    bio: '',
    avatarUri: null,
    avatarColor: AVATAR_COLORS[db.users.length % AVATAR_COLORS.length],
    provider: 'password',
    profileComplete: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.passwords[key] = password;
  commit();
  return user;
}

/**
 * Signs in with the ID token ("credential") from Google Identity Services.
 *
 * Backend hookup: POST { idToken: credential } to /v1/auth/google — the API verifies
 * the signature + audience and returns the user and tokens. Until the web app talks
 * to the API, the local mock DB stands in, using the (unverified) token payload.
 */
export async function signInWithGoogle(credential: string): Promise<User> {
  const profile = decodeIdToken(credential);
  if (!profile.email) {
    throw new ApiError('Google didn’t share an email address for this account.', 'google_no_email');
  }
  await wait(200, 400);
  const db = getDb();
  const email = profile.email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === email);
  if (!user) {
    user = {
      id: uid('u'),
      email,
      username: '',
      displayName: (profile.name ?? [profile.given_name, profile.family_name].filter(Boolean).join(' ')) || email.split('@')[0],
      bio: '',
      avatarUri: profile.picture ?? null,
      avatarColor: AVATAR_COLORS[db.users.length % AVATAR_COLORS.length],
      provider: 'google',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    commit();
  }
  return { ...user };
}

export async function signOut() {
  googleSignOut();
  await wait(100, 200);
}

export async function requestPasswordReset(email: string) {
  await wait();
  if (!EMAIL_RE.test(email.trim())) {
    throw new ApiError('Enter a valid email address.', 'invalid_email', 'email');
  }
  // Always succeeds so the endpoint never reveals which emails have accounts.
  return { ok: true as const };
}

export async function resetPassword(email: string, password: string) {
  await wait();
  if (password.length < 8) {
    throw new ApiError('Use at least 8 characters.', 'weak_password', 'password');
  }
  const db = getDb();
  const key = email.trim().toLowerCase();
  if (db.passwords[key] !== undefined) {
    db.passwords[key] = password;
    commit();
  }
  return { ok: true as const };
}

// ---------- me ----------

export async function getMe(): Promise<User> {
  await wait(80, 160);
  return me();
}

export async function checkUsername(username: string): Promise<boolean> {
  await wait(150, 300);
  const u = username.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    return false;
  }
  const current = session.get().userId;
  return !getDb().users.some(x => x.username === u && x.id !== current);
}

export async function updateMe(input: ProfileInput): Promise<User> {
  await wait();
  const db = getDb();
  const user = me();
  if (input.username !== undefined) {
    const u = input.username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) {
      throw new ApiError('3–24 characters: letters, numbers, dots and underscores.', 'invalid_username', 'username');
    }
    if (db.users.some(x => x.username === u && x.id !== user.id)) {
      throw new ApiError('That username is taken.', 'username_taken', 'username');
    }
    user.username = u;
  }
  if (input.displayName !== undefined) {
    if (!input.displayName.trim()) {
      throw new ApiError('Add your name.', 'invalid_name', 'displayName');
    }
    user.displayName = input.displayName.trim();
  }
  if (input.bio !== undefined) {
    user.bio = input.bio.trim().slice(0, 160);
  }
  if (input.avatarUri !== undefined) {
    user.avatarUri = input.avatarUri;
  }
  if (user.username) {
    user.profileComplete = true;
  }
  commit();
  return { ...user };
}

export async function deleteMe(): Promise<void> {
  await wait(500, 900);
  const db = getDb();
  const user = me();
  const mine = new Set(db.posts.filter(p => p.authorId === user.id).map(p => p.id));
  // Undo this user's votes on other people's posts, then cascade.
  for (const [key, value] of Object.entries(db.votes)) {
    const [postId, userId] = key.split(':');
    if (userId === user.id || mine.has(postId)) {
      const post = db.posts.find(p => p.id === postId);
      if (post && userId === user.id && !mine.has(postId)) {
        if (value === 1) {
          post.upvotes -= 1;
        } else if (value === -1) {
          post.downvotes -= 1;
        }
      }
      delete db.votes[key];
    }
  }
  db.posts = db.posts.filter(p => p.authorId !== user.id);
  db.users = db.users.filter(u => u.id !== user.id);
  delete db.passwords[user.email.toLowerCase()];
  commit();
}

// ---------- feed & posts ----------

export async function getFeed(cursor?: string | null): Promise<Page<PostView>> {
  await wait(350, 800);
  const viewer = session.get().userId;
  const all = [...getDb().posts].sort(newestFirst);
  const page = paginate(all, cursor, 5);
  return { items: page.items.map(p => view(p, viewer)), nextCursor: page.nextCursor };
}

export async function getPost(id: string): Promise<PostView> {
  await wait(150, 350);
  const post = getDb().posts.find(p => p.id === id);
  if (!post) {
    throw new ApiError('This post was deleted.', 'not_found');
  }
  return view(post, session.get().userId);
}

export async function getProfile(userId: string): Promise<ProfileView> {
  await wait(150, 350);
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    throw new ApiError('This reader no longer has an account.', 'not_found');
  }
  const posts = db.posts.filter(p => p.authorId === userId);
  return {
    user: { ...user },
    stats: { books: posts.length, upvotes: posts.reduce((n, p) => n + p.upvotes, 0) },
  };
}

export async function getUserPosts(userId: string, cursor?: string | null): Promise<Page<PostView>> {
  await wait(200, 450);
  const viewer = session.get().userId;
  const all = getDb().posts.filter(p => p.authorId === userId).sort(newestFirst);
  const page = paginate(all, cursor, 30);
  return { items: page.items.map(p => view(p, viewer)), nextCursor: page.nextCursor };
}

function validatePost(input: PostInput) {
  if (!input.bookTitle.trim()) {
    throw new ApiError('Add the book’s title.', 'invalid_title', 'bookTitle');
  }
  if (!input.review.trim()) {
    throw new ApiError('Say a few words about it.', 'invalid_review', 'review');
  }
  if (input.review.length > 500) {
    throw new ApiError('Keep it under 500 characters.', 'review_too_long', 'review');
  }
}

export async function createPost(input: PostInput): Promise<PostView> {
  await wait(600, 1100);
  validatePost(input);
  const db = getDb();
  const user = me();
  const now = new Date().toISOString();
  const post: Post = {
    id: uid('p'),
    authorId: user.id,
    bookTitle: input.bookTitle.trim(),
    bookAuthor: input.bookAuthor?.trim() || null,
    review: input.review.trim(),
    coverUri: input.coverUri,
    coverPalette: input.coverPalette ?? COVER_PALETTES[db.posts.length % COVER_PALETTES.length],
    upvotes: 0,
    downvotes: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.posts.push(post);
  if (!commit()) {
    db.posts.pop();
    throw new ApiError('This browser is out of space for photos. Try a smaller cover, or remove an old post.', 'storage_full');
  }
  return view(post, user.id);
}

function ownPost(id: string) {
  const user = me();
  const post = getDb().posts.find(p => p.id === id);
  if (!post) {
    throw new ApiError('This post was deleted.', 'not_found');
  }
  if (post.authorId !== user.id) {
    throw new ApiError('You can only change your own posts.', 'forbidden');
  }
  return { user, post };
}

export async function updatePost(id: string, input: PostInput): Promise<PostView> {
  await wait(400, 800);
  validatePost(input);
  const { user, post } = ownPost(id);
  post.bookTitle = input.bookTitle.trim();
  post.bookAuthor = input.bookAuthor?.trim() || null;
  post.review = input.review.trim();
  post.coverUri = input.coverUri;
  post.updatedAt = new Date().toISOString();
  commit();
  return view(post, user.id);
}

export async function deletePost(id: string): Promise<void> {
  await wait(300, 600);
  ownPost(id);
  const db = getDb();
  db.posts = db.posts.filter(p => p.id !== id);
  for (const key of Object.keys(db.votes)) {
    if (key.startsWith(`${id}:`)) {
      delete db.votes[key];
    }
  }
  commit();
}

/** PUT /v1/posts/:id/vote — idempotent; 0 clears the vote. */
export async function vote(postId: string, value: VoteValue): Promise<PostView> {
  await wait(150, 400);
  const db = getDb();
  const user = me();
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    throw new ApiError('This post was deleted.', 'not_found');
  }
  const key = `${postId}:${user.id}`;
  const prev = db.votes[key] ?? 0;
  if (prev === 1) {
    post.upvotes -= 1;
  } else if (prev === -1) {
    post.downvotes -= 1;
  }
  if (value === 1) {
    post.upvotes += 1;
  } else if (value === -1) {
    post.downvotes += 1;
  }
  if (value === 0) {
    delete db.votes[key];
  } else {
    db.votes[key] = value;
  }
  commit();
  return view(post, user.id);
}
