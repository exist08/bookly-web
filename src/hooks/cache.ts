import type { QueryClient } from '@tanstack/react-query';
import { qk } from './queries';
import type { PostView } from '../types/models';

type Pages = { pages: { items: PostView[] }[] };

/** Finds a post already loaded by the feed or a shelf so detail/edit pages render instantly. */
export function findCachedPost(qc: QueryClient, id: string): PostView | undefined {
  const direct = qc.getQueryData<PostView>(qk.post(id));
  if (direct) {
    return direct;
  }
  for (const key of [qk.feed, ['userPosts']]) {
    for (const [, data] of qc.getQueriesData<Pages>({ queryKey: key })) {
      const hit = data?.pages.flatMap(p => p.items).find(p => p.id === id);
      if (hit) {
        return hit;
      }
    }
  }
  return undefined;
}
