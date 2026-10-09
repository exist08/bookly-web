import { toast } from '../state/toast';
import type { PostView, User } from '../types/models';

const origin = () => window.location.origin;

/** Native share sheet where the browser has one (phones, Safari, Edge); otherwise copy the link. */
async function shareOrCopy(data: { title: string; text: string; url: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') {
        return;
      }
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    toast.success('Link copied');
  } catch {
    toast(data.url);
  }
}

export const sharePost = (post: PostView) =>
  shareOrCopy({
    title: post.bookTitle,
    text: `${post.author.displayName} on ${post.bookTitle}${post.bookAuthor ? ` by ${post.bookAuthor}` : ''}`,
    url: `${origin()}/p/${post.id}`,
  });

export const shareProfile = (user: User) =>
  shareOrCopy({ title: user.displayName, text: `${user.displayName}'s shelf on Bookly`, url: `${origin()}/u/${user.id}` });
