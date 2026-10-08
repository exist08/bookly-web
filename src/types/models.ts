export type AuthProvider = 'password' | 'google';
export type VoteValue = -1 | 0 | 1;

export interface CoverPalette {
  bg: string;
  fg: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUri: string | null;
  avatarColor: string;
  provider: AuthProvider;
  /** false until the user has picked a username after sign-up */
  profileComplete: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  bookTitle: string;
  bookAuthor: string | null;
  review: string;
  coverUri: string | null;
  coverPalette: CoverPalette;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

/** A post as the API returns it: joined with its author and the viewer's vote. */
export interface PostView extends Post {
  author: User;
  myVote: VoteValue;
  score: number;
}

export interface UserStats {
  books: number;
  upvotes: number;
}

export interface ProfileView {
  user: User;
  stats: UserStats;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PostInput {
  bookTitle: string;
  bookAuthor: string | null;
  review: string;
  coverUri: string | null;
  /** Colours for the typographic cover; the web composer previews one and sends it. */
  coverPalette?: CoverPalette;
}

export interface ProfileInput {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUri?: string | null;
}
