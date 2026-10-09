import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import * as api from '../data/api';
import type { Page, PostInput, PostView, ProfileInput, User, VoteValue } from '../types/models';
import { useAtomValue, useSetAtom } from 'jotai';
import { userIdAtom } from '../state/session';

export const qk = {
  me: ['me'] as const,
  feed: ['feed'] as const,
  post: (id: string) => ['post', id] as const,
  profile: (userId: string) => ['profile', userId] as const,
  userPosts: (userId: string) => ['userPosts', userId] as const,
};

type PostPages = InfiniteData<Page<PostView>, string | null>;

/** Apply a change to a post wherever it is cached: feed, shelves and detail. */
function patchPost(qc: QueryClient, id: string, fn: (p: PostView) => PostView | null) {
  const patchPages = (data: PostPages | undefined) =>
    data && {
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.flatMap(p => {
          if (p.id !== id) {
            return [p];
          }
          const next = fn(p);
          return next ? [next] : [];
        }),
      })),
    };
  qc.setQueriesData<PostPages>({ queryKey: qk.feed }, patchPages);
  qc.setQueriesData<PostPages>({ queryKey: ['userPosts'] }, patchPages);
  qc.setQueryData<PostView>(qk.post(id), p => (p ? fn(p) ?? undefined : p));
}

export function useMe() {
  const userId = useAtomValue(userIdAtom);
  return useQuery({ queryKey: qk.me, queryFn: api.getMe, enabled: !!userId });
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: qk.feed,
    queryFn: ({ pageParam }) => api.getFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: last => last.nextCursor,
  });
}

export function usePost(id: string, initial?: PostView) {
  return useQuery({
    queryKey: qk.post(id),
    queryFn: () => api.getPost(id),
    initialData: initial,
    initialDataUpdatedAt: initial ? Date.now() - 60_000 : undefined,
  });
}

export function useProfile(userId: string) {
  return useQuery({ queryKey: qk.profile(userId), queryFn: () => api.getProfile(userId) });
}

export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: qk.userPosts(userId ?? ''),
    queryFn: ({ pageParam }) => api.getUserPosts(userId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: last => last.nextCursor,
    enabled: !!userId,
  });
}

/** Optimistic, idempotent vote. Tapping the active arrow again clears the vote. */
export function useVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ post, value }: { post: PostView; value: VoteValue }) => api.vote(post.id, value),
    onMutate: async ({ post, value }) => {
      await qc.cancelQueries({ queryKey: qk.post(post.id) });
      const apply = (p: PostView): PostView => {
        let { upvotes, downvotes } = p;
        if (p.myVote === 1) {
          upvotes -= 1;
        } else if (p.myVote === -1) {
          downvotes -= 1;
        }
        if (value === 1) {
          upvotes += 1;
        } else if (value === -1) {
          downvotes += 1;
        }
        return { ...p, upvotes, downvotes, myVote: value, score: upvotes - downvotes };
      };
      patchPost(qc, post.id, apply);
      return { previous: post };
    },
    onError: (_e, { post }, ctx) => {
      const prev = ctx?.previous ?? post;
      patchPost(qc, post.id, () => prev);
    },
    onSuccess: fresh => {
      patchPost(qc, fresh.id, () => fresh);
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => api.createPost(input),
    onSuccess: post => {
      qc.setQueryData(qk.post(post.id), post);
      qc.invalidateQueries({ queryKey: qk.feed });
      qc.invalidateQueries({ queryKey: qk.userPosts(post.authorId) });
      qc.invalidateQueries({ queryKey: qk.profile(post.authorId) });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostInput }) => api.updatePost(id, input),
    onSuccess: post => patchPost(qc, post.id, () => post),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: PostView) => api.deletePost(post.id),
    onSuccess: (_d, post) => {
      patchPost(qc, post.id, () => null);
      qc.removeQueries({ queryKey: qk.post(post.id) });
      qc.invalidateQueries({ queryKey: qk.profile(post.authorId) });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => api.updateMe(input),
    onSuccess: (user: User) => {
      qc.setQueryData(qk.me, user);
      qc.invalidateQueries({ queryKey: qk.profile(user.id) });
      // Author details are embedded in posts; refresh them.
      qc.invalidateQueries({ queryKey: qk.feed });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
      qc.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  const setUserId = useSetAtom(userIdAtom);
  return useMutation({
    mutationFn: api.deleteMe,
    onSuccess: () => {
      setUserId(null);
      qc.clear();
    },
  });
}

/** Auth mutations. The API returns the user; we prime the cache, then flip the session so the navigator swaps stacks without a loading flash. */
export function useAuth() {
  const qc = useQueryClient();
  const setUserId = useSetAtom(userIdAtom);
  const finish = (user: User) => {
    qc.setQueryData(qk.me, user);
    setUserId(user.id);
  };
  return {
    signIn: useMutation({ mutationFn: (v: { email: string; password: string }) => api.signIn(v.email, v.password), onSuccess: finish }),
    signUp: useMutation({ mutationFn: (v: { name: string; email: string; password: string }) => api.signUp(v.name, v.email, v.password), onSuccess: finish }),
    google: useMutation({ mutationFn: (credential: string) => api.signInWithGoogle(credential), onSuccess: finish }),
    signOut: useMutation({
      mutationFn: api.signOut,
      onSuccess: () => {
        setUserId(null);
        qc.clear();
      },
    }),
  };
}
