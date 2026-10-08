/**
 * In-memory database persisted to localStorage. It stands in for the Node/Postgres
 * backend: the shape mirrors the tables on the architecture sheet
 * (users, posts, votes) so swapping in the real API only touches api.ts.
 */
import type { Post, User, VoteValue } from '../types/models';
import { readJSON, writeJSON } from '../store/storage';
import { DEMO_PASSWORD, seedPosts, seedUsers } from './seed';

interface DbShape {
  version: number;
  users: User[];
  posts: Post[];
  /** key: `${postId}:${userId}` */
  votes: Record<string, VoteValue>;
  /** email (lowercase) -> password. Never do this for real: the API hashes with argon2id. */
  passwords: Record<string, string>;
}

const KEY = 'mockdb';
const VERSION = 1;

function fresh(): DbShape {
  return {
    version: VERSION,
    users: seedUsers.map(u => ({ ...u })),
    posts: seedPosts.map(p => ({ ...p })),
    votes: { 'p_middlemarch:u_aarav': 1, 'p_frank:u_aarav': 1 },
    passwords: Object.fromEntries(seedUsers.map(u => [u.email.toLowerCase(), DEMO_PASSWORD])),
  };
}

let db: DbShape = (() => {
  const saved = readJSON<DbShape>(KEY);
  return saved && saved.version === VERSION ? saved : fresh();
})();

export function getDb() {
  return db;
}

/** Persists the db. Returns false when localStorage is full (large cover photos). */
export function commit(): boolean {
  return writeJSON(KEY, db);
}

export function resetDb() {
  db = fresh();
  commit();
}
