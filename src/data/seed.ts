import type { Post, User } from '../types/models';

const daysAgo = (d: number, h = 0) =>
  new Date(Date.now() - (d * 24 + h) * 3600 * 1000).toISOString();

export const PALETTES = {
  middlemarch: { bg: '#2F4A3A', fg: '#F1E4C3' },
  moby: { bg: '#1F3A5F', fg: '#F3EBDD' },
  frank: { bg: '#E8DCC4', fg: '#7A1F1F' },
  walden: { bg: '#C9A24A', fg: '#1B1814' },
  eyre: { bg: '#6B2E3A', fg: '#F4E6D8' },
  odyssey: { bg: '#C8553A', fg: '#FBF3E4' },
  wuthering: { bg: '#34332F', fg: '#E9DFC9' },
  little: { bg: '#EFD8CF', fg: '#6B2E3A' },
  gatsby: { bg: '#0F2D2A', fg: '#D9B26A' },
  dracula: { bg: '#5A1E24', fg: '#EFD9C4' },
  persuasion: { bg: '#DCE3DA', fg: '#2F4A3A' },
  karenina: { bg: '#2B2440', fg: '#E8D9B8' },
};

/** Palettes handed out to posts created without a picked cover. */
export const COVER_PALETTES = Object.values(PALETTES);
export const AVATAR_COLORS = ['#2F4A3A', '#8C5F12', '#6B2E3A', '#3D5A80', '#C8553A', '#34332F'];

export const DEMO_EMAIL = 'aarav@example.com';
export const DEMO_PASSWORD = 'bookly123';

export const seedUsers: User[] = [
  { id: 'u_aarav', email: DEMO_EMAIL, username: 'aarav.reads', displayName: 'Aarav Mehta', bio: 'Reading my way through the classics I pretended to read in college.', avatarUri: null, avatarColor: '#3D5A80', provider: 'password', profileComplete: true, createdAt: daysAgo(210) },
  { id: 'u_mira', email: 'mira@example.com', username: 'mirareads', displayName: 'Mira Okafor', bio: 'Slow reader, loud annotator. Mostly Victorian novels and whatever my book club lost an argument about.', avatarUri: null, avatarColor: '#2F4A3A', provider: 'password', profileComplete: true, createdAt: daysAgo(420) },
  { id: 'u_kabir', email: 'kabir@example.com', username: 'kabirsethi', displayName: 'Kabir Sethi', bio: 'Long books on short commutes.', avatarUri: null, avatarColor: '#8C5F12', provider: 'google', profileComplete: true, createdAt: daysAgo(300) },
  { id: 'u_ines', email: 'ines@example.com', username: 'ines.l', displayName: 'Ines Laurent', bio: 'Gothic fiction, strong tea, stronger opinions.', avatarUri: null, avatarColor: '#6B2E3A', provider: 'password', profileComplete: true, createdAt: daysAgo(160) },
  { id: 'u_tomas', email: 'tomas@example.com', username: 'tomasreads', displayName: 'Tomás Ruiz', bio: 'I finish every book I start. Mostly out of spite.', avatarUri: null, avatarColor: '#C8553A', provider: 'google', profileComplete: true, createdAt: daysAgo(90) },
];

type SeedPost = Omit<Post, 'upvotes' | 'downvotes' | 'updatedAt' | 'coverUri'> & { up: number; down: number };

const raw: SeedPost[] = [
  { id: 'p_middlemarch', authorId: 'u_mira', bookTitle: 'Middlemarch', bookAuthor: 'George Eliot', coverPalette: PALETTES.middlemarch, up: 221, down: 8, createdAt: daysAgo(0, 2),
    review: 'Took me a whole monsoon to finish and I would do it again. Dorothea reads less naïve at thirty than she did at nineteen — this is a book about the quiet cost of choosing well, over and over, when nobody is watching.\n\nCome for the town gossip, stay for the last paragraph. I underlined it twice.' },
  { id: 'p_moby', authorId: 'u_kabir', bookTitle: 'Moby-Dick', bookAuthor: 'Herman Melville', coverPalette: PALETTES.moby, up: 104, down: 6, createdAt: daysAgo(0, 5),
    review: 'Skip nothing. The whaling chapters everyone warns you about are where the book is funniest, and Ishmael is the best company in American fiction.' },
  { id: 'p_frank', authorId: 'u_ines', bookTitle: 'Frankenstein', bookAuthor: 'Mary Shelley', coverPalette: PALETTES.frank, up: 340, down: 9, createdAt: daysAgo(1, 1),
    review: 'Not a monster story. A story about a parent who runs from the room. Read it in one sitting and then sat very still for a while.' },
  { id: 'p_odyssey', authorId: 'u_tomas', bookTitle: 'The Odyssey', bookAuthor: 'Homer', coverPalette: PALETTES.odyssey, up: 88, down: 4, createdAt: daysAgo(1, 7),
    review: 'Ten years to get home and he still stops to brag to a cyclops. The most human hero ever written, which is to say: a bit of a mess.' },
  { id: 'p_eyre', authorId: 'u_mira', bookTitle: 'Jane Eyre', bookAuthor: 'Charlotte Brontë', coverPalette: PALETTES.eyre, up: 167, down: 5, createdAt: daysAgo(2, 3),
    review: '“I am no bird” still lands like a slammed door. Jane is stubborn in all the right places and the book never apologises for her.' },
  { id: 'p_gatsby', authorId: 'u_aarav', bookTitle: 'The Great Gatsby', bookAuthor: 'F. Scott Fitzgerald', coverPalette: PALETTES.gatsby, up: 66, down: 2, createdAt: daysAgo(3, 0),
    review: 'Shorter than I remembered and sadder than I was ready for. Read it once for the parties, then again for Nick, who is lying to you the whole time.' },
  { id: 'p_walden', authorId: 'u_kabir', bookTitle: 'Walden', bookAuthor: 'H. D. Thoreau', coverPalette: PALETTES.walden, up: 43, down: 11, createdAt: daysAgo(3, 6),
    review: 'Two years in a cabin, and somehow it is about my phone. Half of it is sermon, the other half is the best description of a pond you will ever read.' },
  { id: 'p_dracula', authorId: 'u_ines', bookTitle: 'Dracula', bookAuthor: 'Bram Stoker', coverPalette: PALETTES.dracula, up: 129, down: 7, createdAt: daysAgo(4, 2),
    review: 'Told entirely in letters and diary entries, which makes it feel like a true-crime group chat. The first fifty pages in the castle are perfect.' },
  { id: 'p_little', authorId: 'u_mira', bookTitle: 'Little Women', bookAuthor: 'Louisa May Alcott', coverPalette: PALETTES.little, up: 120, down: 3, createdAt: daysAgo(5, 4),
    review: 'Read it for Jo, cried for Beth, came round to Amy by the end. A book about four people learning that ambition and kindness can share a house.' },
  { id: 'p_wuthering', authorId: 'u_aarav', bookTitle: 'Wuthering Heights', bookAuthor: 'Emily Brontë', coverPalette: PALETTES.wuthering, up: 31, down: 12, createdAt: daysAgo(6, 1),
    review: 'Everyone in this book is awful and I could not stop reading. Less a love story than a weather report for two families.' },
  { id: 'p_persuasion', authorId: 'u_tomas', bookTitle: 'Persuasion', bookAuthor: 'Jane Austen', coverPalette: PALETTES.persuasion, up: 97, down: 1, createdAt: daysAgo(7, 3),
    review: 'Austen at her gentlest. The letter scene earns every page before it. Quietly the most romantic book I have read this year.' },
  { id: 'p_karenina', authorId: 'u_kabir', bookTitle: 'Anna Karenina', bookAuthor: 'Leo Tolstoy', coverPalette: PALETTES.karenina, up: 150, down: 6, createdAt: daysAgo(9, 0),
    review: 'Came for Anna, stayed for Levin mowing a field. Eight hundred pages and not one of them wasted.' },
  { id: 'p_odyssey_aarav', authorId: 'u_aarav', bookTitle: 'Frankenstein', bookAuthor: 'Mary Shelley', coverPalette: PALETTES.frank, up: 114, down: 2, createdAt: daysAgo(12, 0),
    review: 'Read it in October, which is the only correct month. The creature is the most articulate person in the book.' },
];

export const seedPosts: Post[] = raw.map(({ up, down, ...p }) => ({
  ...p,
  coverUri: null,
  upvotes: up,
  downvotes: down,
  updatedAt: p.createdAt,
}));
